const QuickLRU = require("@lib/quick-lru");
const { quickForEach, quickMap } = require("async-and-quick");
const Genre = require("../structures/Genre");

module.exports = class GenreManager {

  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;

    /** @type {import("@lib/quick-lru").QuickLRU<string, Genre>} */
    this.Cache = new QuickLRU({
      ...client.Options.Managers.Genre.LRU,
      onEviction(key) {
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
    this.Client.emit("Genre:Listener", {
      Genre: genre,
      User: user,
      Listening: data.Listening
    });
  }

  async _SubscribeToListeners(genreId) {
    if (!this.Client.Options.Managers.Genre.Cache.Listeners) return;

    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `Genre:${genreId}:Listener`
    ]);
    let data = await this.Client.SocketManager.AwaitResponse(`Genres:Get:Listeners`, {
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
    let data = await this.Client.SocketManager.AwaitResponse(`Genres:Get`, {
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
* @param {string} id 
* @param {number} offset 
* @param {number} limit 
* @returns {Promise<{User: import("../structures/User"), LastUpdated: Date, Track: import("../structures/Track")}[]>}
*/
  async FetchListeners(id, offset = 0, limit = Number.MAX_SAFE_INTEGER) {
    const data = await this.Client.SocketManager.AwaitResponse(`Genres:Get:Listeners`, {
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
    const data = await this.Client.SocketManager.AwaitResponse(`Genres:Get:Popular`, {
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

  Destroy() {
    this.Cache.clear();
  }
}