const QuickLRU = require("@lib/quick-lru");
const { quickForEach, quickMap } = require("async-and-quick");
const Artist = require("../structures/Artist");

module.exports = class ArtistManager { 
  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) { 
    this.Client = client;

    /** @type {import("@lib/quick-lru").QuickLRU<string, Artist>} */
    this.Cache = new QuickLRU({
      ...client.Options.Managers.Artist.LRU,
      onEviction(key) {
        client.SocketManager.SubscriptionManager.Unsubscribe([
          `Artist:${key}:Listener`
        ]);
      }
    });

    if (this.Client.Options.Managers.Artist.Cache.Listeners) {
      this.Client.SocketManager.Socket.on("Artist:Listener", async data => { 
        this._HandleListener(data);
      });
    }

    this.Client.SocketManager.Socket.on("Artist:Increment", async data => {
      let item = this.Cache.get(data.Id);
      if (!item) return;
      item._Patch({
        [data.What]: item[data.What] + data.Count
      });
    });
  }

  async _HandleListener(data) {
    let artist = this.Cache.get(data.Id);
    if (!artist) return;
    let user = await this.Client.UserManager.Fetch(data.UserId);
    if (data.Listening) {
      artist.Listeners.set(data.UserId, user);
      artist._Patch({ ListenedCount: artist.ListenedCount + 1 });
    } else {
      artist.Listeners.delete(data.UserId);
    }
    this.Client.emit("Artist:Listener", {
      Artist: artist,
      User: user,
      Listening: data.Listening
    });
  }

  async _SubscribeToListeners(artistId) {
    if (!this.Client.Options.Managers.Artist.Cache.Listeners) return;

    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `Artist:${artistId}:Listener`
    ]);
    let data = await this.Client.SocketManager.AwaitResponse(`Artists:Get:Listeners`, {
      Id: artistId,
      Offset: 0,
      Limit: Number.MAX_SAFE_INTEGER
    });
    await quickForEach(data, async Listener => {
      await this._HandleListener({
        Id: artistId,
        UserId: Listener.UserId,
        Listening: true
      });
    });
  }

  async Fetch(artistId) {
    let artist = this.Cache.get(artistId);
    if (artist) return artist;
    const data = await this.Client.SocketManager.AwaitResponse(`Artists:Get`, {
      Id: artistId
    });
    if (data) {
      this.Client.SocketManager.SubscriptionManager.Subscribe([
        `Artist:${artistId}:Increment`
      ]);
      return this.Import(data);
    }
  }

  async Import(data) {
    let artist = this.Cache.get(data.Id);
    if (artist) return artist;

    let genresMap = new Map();
    await quickForEach(data.Genres, async data => {
      let genre = await this.Client.GenreManager.Import(data);
      genresMap.set(genre.Id, genre);
    });

    artist = new Artist({
      ...data,
      Genres: genresMap
    });
    this.Cache.set(artist.Id, artist);
    await this._SubscribeToListeners(artist.Id);
    return artist;
  }

  /**
* @param {string} id 
* @param {number} offset 
* @param {number} limit 
* @returns {Promise<{User: import("../structures/User"), LastUpdated: Date, Track: import("../structures/Track")}[]>}
*/
  async FetchListeners(id, offset = 0, limit = Number.MAX_SAFE_INTEGER) {
    const data = await this.Client.SocketManager.AwaitResponse(`Artists:Get:Listeners`, {
      Id: id,
      Offset: offset,
      Limit: limit
    });
    return await quickMap(data, async data => {
      return {
        User: await this.Client.UserManager.Fetch(data.UserId),
        LastUpdated: new Date(data.LastUpdated),
        Track: await this.Client.TrackManager.Fetch(data.TrackId)
      };
    });
  }

  /**
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<{Artist: Artist, ListenersCount: number}[]>}
   */
  async FetchPopular(offset = 0, limit = 50) {
    const data = await this.Client.SocketManager.AwaitResponse(`Artists:Get:Popular`, {
      Offset: offset,
      Limit: limit
    });
    return await quickMap(data, async data => {
      return {
        Artist: await this.Fetch(data.Id),
        ListenersCount: data.ListenersCount
      };
    });
  }

  Destroy() {
    this.Cache.clear();
  }
}