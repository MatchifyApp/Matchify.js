const LRUCache = require("lru-cache");

const { quickForEach, quickMap } = require("async-and-quick");
const Track = require("../structures/Track");

module.exports = class TrackManager { 
  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;

    this.Cache = new LRUCache({
      ...client.Options.Managers.Track.LRU,
      dispose(value, key) {
        client.SocketManager.SubscriptionManager.Unsubscribe([
          `Track:${key}:Listener`
        ]);
      }
    });

    if (this.Client.Options.Managers.Track.Cache.Listeners) {
      this.Client.SocketManager.Socket.on("Track:Listener", async data => { 
        this._HandleListener(data);
      });
    }
    
    this.Client.SocketManager.Socket.on("Track:Increment", async data => {
      let item = this.Cache.get(data.Id);
      if (!item) return;
      item._Patch({
        [data.What]: item[data.What] + data.Count
      });
    });
  }

  async _HandleListener(data) { 
    let track = this.Cache.get(data.Id);
    if (!track) return;
    let user = await this.Client.UserManager.Fetch(data.UserId);
    if (data.Listening) {
      track.Listeners.set(data.UserId, user);
      track._Patch({ ListenedCount: track.ListenedCount + 1 });
    } else {
      track.Listeners.delete(data.UserId);
    }
  }
  
  async _SubscribeToListeners(trackId) { 
    if (!this.Client.Options.Managers.Track.Cache.Listeners) return;

    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `Track:${trackId}:Listener`
    ]);
    let data = await this.Client.AwaitResponse(`Tracks:Get:Listeners`, {
      Id: trackId,
      Offset: 0,
      Limit: Number.MAX_SAFE_INTEGER
    });
    await quickForEach(data, async Listener => {
      await this._HandleListener({
        Id: trackId,
        UserId: Listener.UserId,
        Listening: true
      });
    });
  }
  
  async Fetch(trackId) {
    let track = this.Cache.get(trackId);
    if (track) return track;
    const data = await this.Client.AwaitResponse(`Tracks:Get`, {
      Id: trackId
    });
    if (data) {
      this.Client.SocketManager.SubscriptionManager.Subscribe([
        `Track:${trackId}:Increment`
      ]);
      return this.Import(data);
    }
  }

  async Import(data) {
    let track = this.Cache.get(data.Id);
    if (track) return track;

    let artistsMap = new Map();
    await quickForEach(data.Artists, async data => { 
      let artist = await this.Client.ArtistManager.Import(data);
      artistsMap.set(artist.Id, artist);
    });


    let genresMap = new Map();
    await quickForEach(data.Genres, async data => { 
      let genre = await this.Client.GenreManager.Import(data);
      genresMap.set(genre.Id, genre);
    });

    let album = await this.Client.AlbumManager.Import(data.Album);
    
    track = new Track({
      ...data,
      Artists: artistsMap,
      Genres: genresMap,
      Album: album
    });
    this.Cache.set(track.Id, track);
    await this._SubscribeToListeners(track.Id);
    return track;
  }

  /**
  * @param {string} Id 
  * @param {number} Offset 
  * @param {number} Limit 
  * @returns {Promise<{ User: import("../structures/User"), Track: import("../structures/Track"), At: Date, Id: string }[]>}
  */
  async FetchLikes(Id, Offset = 0, Limit = 50) {
    const data = await this.Client.AwaitResponse(`Tracks:Get:Likes`, {
      Id,
      Offset,
      Limit
    });

    return await quickMap(data, async i => {
      return {
        User: await this.Client.UserManager.Fetch(i.UserId),
        Track: await this.Fetch(i.TrackId),
        At: new Date(i.InsertedAt),
        Id: i.Id
      }
    });
  }

  /**
   * @param {string} id 
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<{User: import("../structures/User"), LastUpdated: Date}[]>}
   */
  async FetchListeners(id, offset = 0, limit = Number.MAX_SAFE_INTEGER) { 
    const data = await this.Client.AwaitResponse(`Tracks:Get:Listeners`, {
      Id: id,
      Offset: offset,
      Limit: limit
    });
    return await quickMap(data, async data => {
      return {
        User: await this.Client.UserManager.Fetch(data.UserId),
        LastUpdated: new Date(data.LastUpdated)
      };
    });
  }

  /**
  * @param {string} id 
  * @returns {Promise<number>}
  */
  async FetchListenersCount(id) {
    const data = await this.Client.AwaitResponse(`Tracks:Get:Listeners:Count`, {
      Id: id
    });
    return data;
  }

  /**
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<{Track: Track, ListenersCount: number}[]>}
   */
  async FetchPopular(offset = 0, limit = 50) {
    const data = await this.Client.AwaitResponse(`Tracks:Get:Popular`, {
      Offset: offset,
      Limit: limit
    });
    return await quickMap(data, async data => {
      return {
        Track: await this.Fetch(data.Id),
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
    const data = await this.Client.AwaitResponse(`Tracks:Get:History`, {
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
   * @param {number} Amount 
   * @returns {Promise<{Track: import("../structures/Track"), ListenersCount:number}[]>}
   */
  async FetchRandomActive(Amount = 50) {
    const data = await this.Client.AwaitResponse(`Tracks:Get:Active:Random`, {
      Amount
    });

    return await quickMap(data, async i => {
      return {
        Track: await this.Client.TrackManager.Fetch(i.Id),
        ListenersCount: i.ListenersCount
      };
    });
  }

  /**
   * @param {string} search 
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<import("../structures/Track")[]>}
   */
  async Search(search, offset = 0, limit = 50) {
    let data = await this.Client.AwaitResponse(`Tracks:Search`, {
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
    let data = await this.Client.AwaitResponse(`Tracks:Search:History`, {
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

  Destroy() {
    this.Cache.clear();
  }
}