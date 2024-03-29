const LRUCache = require("lru-cache");

const { quickForEach, quickMap } = require("async-and-quick");
const Guild = require("../structures/Guild");

module.exports = class GuildManager {

  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;

    this.Cache = new LRUCache({
      ...client.Options.Managers.Guild.LRU,
      dispose(value, key) {
        client.SocketManager.SubscriptionManager.Unsubscribe([
          `Guild:${key}:Listener`
        ]);
      }
    });

    if (this.Client.Options.Managers.Guild.Cache.Listeners) {
      this.Client.SocketManager.Socket.on("Guild:Listener", async data => {
        this._HandleListener(data);
      });
    }

    this.Client.SocketManager.Socket.on("Guild:Increment", async data => {
      let item = this.Cache.get(data.Id);
      if (!item) return;
      item._Patch({
        [data.What]: item[data.What] + data.Count
      });
    });
  }

  async _HandleListener(data) {
    let guild = this.Cache.get(data.Id);
    if (!guild) return;
    let user = await this.Client.UserManager.Fetch(data.UserId);
    if (data.Listening) {
      guild.Listeners.set(data.UserId, user);
      guild._Patch({ ListenedCount: guild.ListenedCount + 1 });
    } else {
      guild.Listeners.delete(data.UserId);
    }
  }

  async _SubscribeToListeners(genreId) {
    if (!this.Client.Options.Managers.Guild.Cache.Listeners) return;

    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `Guild:${genreId}:Listener`
    ]);
    let data = await this.Client.AwaitResponse(`Guilds:Get:Listeners`, {
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
    let data = await this.Client.AwaitResponse(`Guilds:Get`, {
      Id: genreId
    });
    if (data) {
      this.Client.SocketManager.SubscriptionManager.Subscribe([
        `Guild:${genreId}:Increment`
      ]);
      return this.Import(data);
    }
  }

  async Import(data) {
    let guild = this.Cache.get(data.Id);
    if (guild) return guild;
    guild = new Guild({
      Owner: await this.Client.UserManager.Fetch(data.OwnerId),
      ...data
    });
    this.Cache.set(guild.Id, guild);
    await this._SubscribeToListeners(guild.Id);
    return guild;
  }

  /**
  * @param {string} id 
  * @param {number} offset 
  * @param {number} limit 
  * @returns {Promise<{User: import("../structures/User"), LastUpdated: Date, Track: import("../structures/Track"), DisplayName: string}[]>}
  */
  async FetchListeners(id, offset = 0, limit = Number.MAX_SAFE_INTEGER) {
    const data = await this.Client.AwaitResponse(`Guilds:Get:Listeners`, {
      Id: id,
      Offset: offset,
      Limit: limit
    });
    return await quickMap(data, async i => {
      return {
        User: await this.Client.UserManager.Fetch(i.UserId),
        LastUpdated: new Date(i.LastUpdated),
        Track: await this.Client.TrackManager.Fetch(i.TrackId),
        DisplayName: i.DisplayName
      };
    });
  }

  /**
* @param {string} Id 
* @param {number} Offset 
* @param {number} Limit 
* @returns {Promise<{ User: import("../structures/User"), Guild: import("../structures/Guild"), At: Date, Id: string }[]>}
*/
  async FetchLikes(Id, Offset = 0, Limit = 50) {
    const data = await this.Client.AwaitResponse(`Guilds:Get:Likes`, {
      Id,
      Offset,
      Limit
    });

    return await quickMap(data, async i => {
      return {
        User: await this.Client.UserManager.Fetch(i.UserId),
        Guild: await this.Fetch(i.GuildId),
        At: new Date(i.InsertedAt),
        Id: i.Id
      }
    });
  }

  /**
  * @param {string} id 
  * @returns {Promise<number>}
  */
  async FetchListenersCount(id) {
    const data = await this.Client.AwaitResponse(`Guilds:Get:Listeners:Count`, {
      Id: id
    });
    return data;
  }

  /**
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<{Guild: Guild, ListenersCount: number}[]>}
   */
  async FetchPopular(offset = 0, limit = 50) {
    const data = await this.Client.AwaitResponse(`Guilds:Get:Popular`, {
      Offset: offset,
      Limit: limit
    });
    return await quickMap(data, async data => {
      return {
        Guild: await this.Fetch(data.Id),
        ListenersCount: data.ListenersCount
      };
    });
  }

  /**
   * @param {string} search 
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<import("../structures/Guild")[]>}
   */
  async Search(search, offset = 0, limit = 50) {
    let data = await this.Client.AwaitResponse(`Guilds:Search`, {
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