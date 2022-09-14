const LRUCache = require("lru-cache");
const Notification = require("../structures/Notification");

module.exports = class NotificationManager {
  /**
   * 
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;

    this.Cache = new LRUCache({
      ...client.Options.Managers.Notification.LRU,
    });

  }

  async Fetch(Id) {
    let item = this.Cache.get(Id);
    if (item) return item;

    return this.Import(
      await this.Client.AwaitResponse("LocalUser:Get:Notification", { Id })
    );
  }

  async Import(data) {
    let item = this.Cache.get(data.Id);
    if (item) return item;

    item = new Notification({
      ...data,
      User: await this.Client.UserManager.Fetch(data.UserId),
      At: new Date(data.InsertedAt)
    });

    this.Cache.set(data.Id, data);

    return data;
  }
}