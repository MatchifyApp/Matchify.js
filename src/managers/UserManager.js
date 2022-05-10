const QuickLRU = require('@lib/quick-lru');
const User = require("../structures/User");

class UserManager {

  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;
    /** @type {import("@lib/quick-lru").QuickLRU<string, User>} */
    this.Cache = new QuickLRU({
      ...client.Options.Managers.User.LRU,
      onEviction(key) {
        client.SocketManager.SubscriptionManager.Unsubscribe([
          `User:${key}:Track`,
          `User:${key}:Update`
        ]);
      }
    });

    client.SocketManager.Socket.on("User:Update", data => {
      let user = this.Cache.get(data.Id);
      if (user) user._Patch(data);
    });

    client.SocketManager.Socket.on("User:Track", async data => {
      let user = this.Cache.get(data.Id);
      if (!user) return;
      let track = await client.TrackManager.Fetch(data.TrackId);
      user._Patch({ CurrentPlaying: track });
    });
  }

  async Fetch(userId) {
    let user = this.Cache.get(userId);
    if (user) return user;
    const data = await this.Client.SocketManager.AwaitResponse(`Users:Get`, {
      Id: userId
    });
    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `User:${userId}:Track`,
      `User:${userId}:Update`
    ]);
    user = new User(data);
    this.Cache.set(userId, user);
    return user;
  }

  Destroy() {
    this.Cache.clear();
  }
}

module.exports = UserManager;