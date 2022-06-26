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
  }

  async _SubscribeToListeners(artistId) {
    if (!this.Client.Options.Managers.Artist.Cache.Listeners) return;

    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `Artist:${artistId}:Listener`
    ]);
    let data = await this.Client.AwaitResponse(`Artists:Get:Listeners`, {
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
    const data = await this.Client.AwaitResponse(`Artists:Get`, {
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
* @param {string} Id 
* @param {number} Offset 
* @param {number} Limit 
* @returns {Promise<{ User: import("../structures/User"), Artist: import("../structures/Artist"), At: Date, Id: string }[]>}
*/
  async FetchLikes(Id, Offset = 0, Limit = 50) {
    const data = await this.Client.AwaitResponse(`Artists:Get:Likes`, {
      Id,
      Offset,
      Limit
    });

    return await quickMap(data, async i => {
      return {
        User: await this.Fetch(i.UserId),
        Artist: await this.Fetch(i.ArtistId),
        At: new Date(i.InsertedAt),
        Id: i.Id
      }
    });
  }

  /**
* @param {string} id 
* @param {number} offset 
* @param {number} limit 
* @returns {Promise<{User: import("../structures/User"), LastUpdated: Date, Track: import("../structures/Track")}[]>}
*/
  async FetchListeners(id, offset = 0, limit = Number.MAX_SAFE_INTEGER) {
    const data = await this.Client.AwaitResponse(`Artists:Get:Listeners`, {
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
    * @param {string} id 
    * @returns {Promise<number>}
    */
    async FetchListenersCount(id) {
      const data = await this.Client.AwaitResponse(`Artists:Get:Listeners:Count`, {
        Id: id
      });
      return data;
    }

  /**
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<{Artist: Artist, ListenersCount: number}[]>}
   */
  async FetchPopular(offset = 0, limit = 50) {
    const data = await this.Client.AwaitResponse(`Artists:Get:Popular`, {
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

  /**
   * @param {string} id 
   * @param {number} offset 
   * @param {number} limit
   * 
   * @returns {Promise<{User:import("../structures/User"),ListenedCount:number}[]>}
   */
  async FetchHistory(id, offset = 0, limit = 50) {
    const data = await this.Client.AwaitResponse(`Artists:Get:History`, {
      Id: id,
      Offset: offset,
      Limit: limit
    });
    return await quickMap(data, async data => {
      return {
        User: await this.Client.UserManager.Fetch(data.Id),
        ListenedCount: data.ListenedCount
      };
    });
  }

  /**
   * @param {string} search 
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<import("../structures/Artist")[]>}
   */
  async Search(search, offset = 0, limit = 50) {
    let data = await this.Client.AwaitResponse(`Artists:Search`, {
      Search: search,
      Offset: offset,
      Limit: limit
    });

    return await quickMap(data, async id => {
      return await this.Fetch(id);
    });
  }

  /**
   * @param {string} id 
   * @param {string} search 
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<{User: import("../structures/User"), ListenedCount: number}[]>}
   */
  async SearchHistory(id, search, offset = 0, limit = 50) {
    let data = await this.Client.AwaitResponse(`Artists:Search:History`, {
      Id: id,
      Search: search,
      Offset: offset,
      Limit: limit
    });

    return await quickMap(data, async i => {
      return {
        User: await this.Client.UserManager.Fetch(i.Id),
        ListenedCount: i.ListenedCount
      }
    });
  }

  /**
   * @param {string} id 
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<import("../structures/Track")[]>}
   */
  async FetchTracks(id, offset = 0, limit = 50) {
    let data = await this.Client.AwaitResponse(`Artists:Get:Tracks`, {
      Id: id,
      Offset: offset,
      Limit: limit
    });

    return await quickMap(data, async i => {
      return await this.Client.TrackManager.Fetch(i);
    });
  }

  /**
   * @param {string} id 
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<import("../structures/Album")[]>}
   */
  async FetchAlbums(id, offset = 0, limit = 50) {
    let data = await this.Client.AwaitResponse(`Artists:Get:Albums`, {
      Id: id,
      Offset: offset,
      Limit: limit
    });

    return await quickMap(data, async i => {
      return await this.Client.AlbumManager.Fetch(i);
    });
  }

  Destroy() {
    this.Cache.clear();
  }
}