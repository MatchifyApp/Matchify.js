const QuickLRU = require("@lib/quick-lru");
const { quickForEach, quickMap } = require("async-and-quick");
const Track = require("../structures/Track");

module.exports = class TrackManager { 
  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;

    /** @type {import("@lib/quick-lru").QuickLRU<string, Track>} */
    this.Cache = new QuickLRU({
      ...client.Options.Managers.Track.LRU,
      onEviction(key) {
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

  Destroy() {
    this.Cache.clear();
  }
}