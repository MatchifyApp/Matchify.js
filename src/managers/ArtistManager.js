const QuickLRU = require("@lib/quick-lru");
const { quickForEach } = require("async-and-quick");
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
        this.Client.SocketManager.SubscriptionManager.Unsubscribe([
          `Artist:${key}:Listener`
        ]);
      }
    });

    if (this.Client.Options.Managers.Artist.Cache.Listeners) {
      this.Client.SocketManager.Socket.on("Artist:Listener", async data => { 
        this._HandleListener(data);
      });
    }
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
    return this.Import(data);
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