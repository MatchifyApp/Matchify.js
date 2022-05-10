const QuickLRU = require('@lib/quick-lru');

class UserManager {

  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;
    this.Cache = new QuickLRU({
      ...client.Options.Managers.User.LRU,
      onEviction(key) {
        client.SocketManager.SubscriptionManager.Unsubscribe(`User:${key}:Listeners`);
        client.SocketManager.SubscriptionManager.Unsubscribe(`User:${key}:Listeners`);
      }
    })
  }

  Destroy() {

  }
}