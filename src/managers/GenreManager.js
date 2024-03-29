const LRUCache = require("lru-cache");
const { quickForEach, quickMap } = require("async-and-quick");
const Genre = require("../structures/Genre");

module.exports = class GenreManager {

  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;

    this.Cache = new LRUCache({
      ...client.Options.Managers.Genre.LRU,
      dispose(value, key) {
        client.SocketManager.SubscriptionManager.Unsubscribe([
          `Genre:${key}:Listener`
        ]);
      }
    });

    if (this.Client.Options.Managers.Genre.Cache.Listeners) {
      this.Client.SocketManager.Socket.on("Genre:Listener", async data => {
        this._HandleListener(data);
      });
    }

    this.Client.SocketManager.Socket.on("Genre:Increment", async data => {
      let item = this.Cache.get(data.Id);
      if (!item) return;
      item._Patch({
        [data.What]: item[data.What] + data.Count
      });
    });
  }

  async _HandleListener(data) {
    let genre = this.Cache.get(data.Id);
    if (!genre) return;
    let user = await this.Client.UserManager.Fetch(data.UserId);
    if (data.Listening) {
      genre.Listeners.set(data.UserId, user);
      genre._Patch({ ListenedCount: genre.ListenedCount + 1 });
    } else {
      genre.Listeners.delete(data.UserId);
    }
  }

  async _SubscribeToListeners(genreId) {
    if (!this.Client.Options.Managers.Genre.Cache.Listeners) return;

    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `Genre:${genreId}:Listener`
    ]);
    let data = await this.Client.AwaitResponse(`Genres:Get:Listeners`, {
      Id: genreId,
      Offset: 0,
      Limit: Number.MAX_SAFE_INTEGER
    });
    await quickForEach(data, async Listener => {
      await this._HandleListener({
        Id: genreId,
        UserId: Listener.UserId,
        Listening: true
      });
    });
  }

  async Fetch(genreId) {
    if (this.Cache.has(genreId)) return this.Cache.get(genreId);
    let data = await this.Client.AwaitResponse(`Genres:Get`, {
      Id: genreId
    });
    if (data) {
      this.Client.SocketManager.SubscriptionManager.Subscribe([
        `Genre:${genreId}:Increment`
      ]);
      return this.Import(data);
    }
  }

  async Import(data) {
    let genre = this.Cache.get(data.Id);
    if (genre) return genre;
    genre = new Genre(data);
    this.Cache.set(genre.Id, genre);
    await this._SubscribeToListeners(genre.Id);
    return genre;
  }

  /**
  * @param {string} Id 
  * @param {number} Offset 
  * @param {number} Limit 
  * @returns {Promise<{ User: import("../structures/User"), Track: import("../structures/Genre"), At: Date, Id: string }[]>}
  */
  async FetchLikes(Id, Offset = 0, Limit = 50) {
    const data = await this.Client.AwaitResponse(`Genres:Get:Likes`, {
      Id,
      Offset,
      Limit
    });

    return await quickMap(data, async i => {
      return {
        User: await this.Client.UserManager.Fetch(i.UserId),
        Genre: await this.Fetch(i.GenreId),
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
    const data = await this.Client.AwaitResponse(`Genres:Get:Listeners`, {
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
 * @returns {Promise<{Genre: Genre, ListenersCount: number}[]>}
 */
  async FetchPopular(offset = 0, limit = 50) {
    const data = await this.Client.AwaitResponse(`Genres:Get:Popular`, {
      Offset: offset,
      Limit: limit
    });
    return await quickMap(data, async data => {
      return {
        Genre: data.Id ? await this.Fetch(data.Id) : null,
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
    const data = await this.Client.AwaitResponse(`Genres:Get:History`, {
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
  * @param {string} id 
  * @returns {Promise<number>}
  */
  async FetchListenersCount(id) {
    const data = await this.Client.AwaitResponse(`Genres:Get:Listeners:Count`, {
      Id: id
    });
    return data;
  }

  /**
   * @param {string} search 
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<import("../structures/Genre")[]>}
   */
  async Search(search, offset = 0, limit = 50) {
    let data = await this.Client.AwaitResponse(`Genres:Search`, {
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
    let data = await this.Client.AwaitResponse(`Genres:Search:History`, {
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
  * @returns {Promise<number>}
  */
  async FetchTrackCount(id) {
    let data = await this.Client.AwaitResponse(`Genres:Get:Count:Track`, {
      Id: id
    });

    return data;
  }

  /**
  * @param {string} id 
  * @returns {Promise<number>}
  */
  async FetchAlbumCount(id) {
    let data = await this.Client.AwaitResponse(`Genres:Get:Count:Album`, {
      Id: id
    });

    return data;
  }


  /**
  * @param {string} id 
  * @returns {Promise<number>}
  */
  async FetchArtistCount(id) {
    let data = await this.Client.AwaitResponse(`Genres:Get:Count:Track`, {
      Id: id
    });

    return data;
  }

  /**
  * @param {string} id 
  * @returns {Promise<import("../structures/Artist")>}
  */
  async FetchRandomArtist(id) {
    let data = await this.Client.AwaitResponse(`Genres:Get:Random:Artist`, {
      Id: id
    });

    return this.Client.ArtistManager.Fetch(data);
  }

  Destroy() {
    this.Cache.clear();
  }
}