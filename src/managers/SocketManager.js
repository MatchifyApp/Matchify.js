const { SocketSubscriptionManager } = require("./SocketSubscriptionManager");
const io = require("socket.io-client").io;

class SocketManager {

  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;
    this.Socket = io({
      ...client.Options.Socket,
      autoConnect: false
    });
    this.SubscriptionManager = new SocketSubscriptionManager(this);
  }

  /**
   * @param {string} eventName 
   * @param {{[key:string]:any}?} data
   * @returns {Promise<any>} 
   */
  AwaitResponse(eventName, data = {}) {
    return new Promise((resolve, reject) => {
      this.Socket.emit(eventName, data, (x) => x.ok ? resolve(x.data) : reject(x.error))
    })
  }

  Destroy() {
    this.Socket.disconnect();
    this.SubscriptionManager.Destroy();
  }

}

module.exports = { SocketManager };