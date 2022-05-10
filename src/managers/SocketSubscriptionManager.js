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

  Subscribe(eventNames = []) {
    let e = [];
    eventNames.forEach(eventName => {
      if (this.Subscriptions.has(eventName)) return;
      this.Subscriptions.add(eventName);
      e.push(eventName);
    });
    this.Socket.emit("Subscriptions:Subscribe", {
      Subscriptions: e
    });
    return true;
  }

  Unsubscribe(eventNames = []) {
    let e = [];
    eventNames.forEach(eventName => {
      if (!this.Subscriptions.has(eventName)) return;
      this.Subscriptions.delete(eventName);
      e.push(eventName);
    });
    this.Socket.emit("Subscriptions:Unsubscribe", {
      Subscriptions: e
    });
    return true;
  }

  Destroy() {
    this.Subscriptions.clear();
  }
}

module.exports = { SocketSubscriptionManager };