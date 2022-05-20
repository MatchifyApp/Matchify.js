const QuickLRU = require("@lib/quick-lru");
const { quickForEach, quickMap } = require("async-and-quick");
const Album = require("../structures/Album");

module.exports = class AlbumManager {
  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;

    /** @type {import("@lib/quick-lru").QuickLRU<string, Album>} */
    this.Cache = new QuickLRU({
      ...client.Options.Managers.Album.LRU,
      onEviction(key) {
        client.SocketManager.SubscriptionManager.Unsubscribe([
          `Album:${key}:Listener`
        ]);
      }
    });

    if (this.Client.Options.Managers.Album.Cache.Listeners) {
      this.Client.SocketManager.Socket.on("Album:Listener", async data => {
        this._HandleListener(data);
      });
    }
  }

  async _HandleListener(data) {
    let album = this.Cache.get(data.Id);
    if (!album) return;
    let user = await this.Client.UserManager.Fetch(data.UserId);
    if (data.Listening) {
      album.Listeners.set(data.UserId, user);
      album._Patch({ ListenedCount: album.ListenedCount + 1 });
    } else {
      album.Listeners.delete(data.UserId);
    }
    this.Client.emit("Album:Listener", {
      Album: album,
      User: user,
      Listening: data.Listening
    });
  }

  async _SubscribeToListeners(albumId) {
    if (!this.Client.Options.Managers.Album.Cache.Listeners) return;

    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `Album:${albumId}:Listener`
    ]);
    let data = await this.Client.SocketManager.AwaitResponse(`Albums:Get:Listeners`, {
      Id: albumId,
      Offset: 0,
      Limit: Number.MAX_SAFE_INTEGER
    });
    await quickForEach(data, async Listener => {
      await this._HandleListener({
        Id: albumId,
        UserId: Listener.UserId,
        Listening: true
      });
    });
  }

  async Fetch(albumId) {
    let album = this.Cache.get(albumId);
    if (album) return album;
    const data = await this.Client.SocketManager.AwaitResponse(`Albums:Get`, {
      Id: albumId
    });
    return this.Import(data);
  }

  async Import(data) {
    let album = this.Cache.get(data.Id);
    if (album) return album;
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

    album = new Album({
      ...data,
      Artists: artistsMap,
      Genres: genresMap
    });
    this.Cache.set(album.Id, album);
    await this._SubscribeToListeners(album.Id);
    return album;
  }

  /**
 * @param {string} id 
 * @param {number} offset 
 * @param {number} limit 
 * @returns {Promise<{User: import("../structures/User"), LastUpdated: Date, Track: import("../structures/Track")}[]>}
 */
  async FetchListeners(id, offset = 0, limit = Number.MAX_VALUE) {
    const data = await this.Client.SocketManager.AwaitResponse(`Albums:Get:Listeners`, {
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
 * @returns {Promise<{Album: Album, ListenersCount: number}[]>}
 */
  async FetchPopular(offset = 0, limit = 50) {
    const data = await this.Client.SocketManager.AwaitResponse(`Albums:Get:Popular`, {
      Offset: offset,
      Limit: limit
    });
    return await quickMap(data, async data => {
      return {
        Album: await this.Fetch(data.Id),
        ListenersCount: data.ListenersCount
      };
    });
  }

  Destroy() { 
    this.Cache.clear();
  }
}