const { quickMap } = require("async-and-quick");
const BasicEventEmitter = require("../lib/BasicEventEmitter");
const { SocketSubscriptionManager } = require("./SocketSubscriptionManager");
const io = require("socket.io-client").io;

class SocketManager {

  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;
    this.Socket = io(client.Options.Socket.url, {
      ...client.Options.Socket,
      autoConnect: false
    });
    this.SubscriptionManager = new SocketSubscriptionManager(this);
    this.Events = new BasicEventEmitter();
    if (this.Client.LocalUser?.Token) {
      this.Client.LoginInProcess = true;
    }
    this.Socket.on("connect", async () => { 
      this.Events.emit("connect");
      if (!this.Client.LocalUser?.Token) return;
      try {
        let u = await this.Client.AuthManager.Login(this.Client.LocalUser.Token);
        this.Client.LocalUser = u;
        this.Events.emit("login", u);
      } catch (e) {
        this.Events.emit("login_error", e);
      }
      this.Client.LoginInProcess = false;
    });

    this.Socket.on("disconnect", () => {
      this.Client.LocalUser = null;
    });

    let sseListenersMap = [
      ["SSE:PopularArtists", "ArtistManager", "Artist"],
      ["SSE:PopularAlbums", "AlbumManager", "Album"],
      ["SSE:PopularTracks", "TrackManager", "Track"],
      ["SSE:RandomActiveTracks", "TrackManager", "Track"],
    ]

    sseListenersMap.forEach(([eventName, managerName, prop]) => { 
      this.Socket.on(eventName, async (l) => {
        this.Events.emit(eventName, await quickMap(l, async (d) => {
          return {
            [prop]: await this.Client[managerName].Fetch(d.Id),
            ListenersCount: d.ListenersCount
          }
        }));
      });
    });
  }

  /**
   * @param {string} eventName 
   * @param {{[key:string]:any}?} data
   * @returns {Promise<any>} 
   */
  AwaitResponse(eventName, data = {}) {
    return new Promise((resolve, reject) => {
      this.Socket.emit(eventName, data, (x) => x.ok ? resolve(x.data) : reject(new Error("API Error: " + x.error)))
    })
  }

  Destroy() {
    this.Socket.disconnect();
    this.SubscriptionManager.Destroy();
  }

}

module.exports = { SocketManager };