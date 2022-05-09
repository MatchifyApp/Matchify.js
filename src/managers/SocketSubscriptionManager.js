class SocketSubscriptionManager {
  
  /**
   * @param {import("./SocketManager").SocketManager} socketManager 
   */
  constructor (socketManager) {
    this.SocketManager = socketManager;
    this.Client = socketManager.Client;
    this.Socket = socketManager.Socket;
    /** @type {Set<string>} */
    this.Subscriptions = new Set();

    this.Socket.on("connect", () => {
      this.Socket.emit("Subscriptions:Subscribe", {
        Subscriptions: [...this.Subscriptions.values()]
      });
    });
  }

  Subscribe(eventName) {
    if (this.Subscriptions.has(eventName)) return false;
    this.Subscriptions.add(eventName);
    this.Socket.emit("Subscriptions:Subscribe", {
      Subscriptions: [eventName]
    });
    return true;
  }

  Unsubscribe(eventName) {
    if (!this.Subscriptions.has(eventName)) return false;
    this.Subscriptions.delete(eventName);
    this.Socket.emit("Subscriptions:Unsubscribe", {
      Subscriptions: [eventName]
    });
    return true;
  }

  Destroy() {
    this.Subscriptions.clear();
  }
}

module.exports = { SocketSubscriptionManager };