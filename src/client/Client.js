const { SocketManager } = require("../managers/SocketManager");
const { defaultify } = require("stuffs");
const { EventEmitter2 } = require("eventemitter2");
const UserManager = require("../managers/UserManager");
const TrackManager = require("../managers/TrackManager");

/**
 * @typedef {Partial<Omit<import("@lib/quick-lru").QuickLRUOptions<string, any>, "onEviction">>} LRUOptions
 */

/**
 * @typedef {Object} ManagerOptions
 * @property {{ LRU: LRUOptions, Cache: { Listeners: boolean } }} Track
 * @property {{ LRU: LRUOptions, Cache: { Listeners: boolean } }} Album
 * @property {{ LRU: LRUOptions, Cache: { Listeners: boolean } }} Artist
 * @property {{ LRU: LRUOptions, Cache: { Genres: boolean } }} User
 */

/**
 * @typedef {Object} ClientOptions
 * @property {ManagerOptions} Managers
 * @property {{Token: string}} Authorization
 * @property {Partial<import("socket.io-client").ManagerOptions & import("socket.io-client").SocketOptions>} Socket
 */

class Client extends EventEmitter2 {
  /**
   * @param {ClientOptions} clientOptions 
   */
  constructor (clientOptions = {}) {
    super({ignoreErrors: true, verboseMemoryLeak: true});
    /** @type {ClientOptions} */
    this.Options = defaultify(clientOptions, {
      Managers: {
        Track: {
          LRU: {
            maxAge: 21600000,
            maxSize: 16000
          },
          Cache: {
            Listeners: true
          }
        },
        Album: {
          LRU: {
            maxAge: 21600000,
            maxSize: 16000
          },
          Cache: {
            Listeners: true
          }
        },
        Artist: {
          LRU: {
            maxAge: 21600000,
            maxSize: 16000
          },
          Cache: {
            Listeners: true
          }
        },
        User: {
          LRU: {
            maxAge: 21600000,
            maxSize: 16000
          },
          Cache: {
            Genres: true
          }
        }
      },
      Socket: {
        extraHeaders: {
          "User-Agent": `Matchify.js/${require("../../package.json").version} (API Wrapper)`
        },
        hostname: "matchify.org"
      }
    }, true);

    this.SocketManager = new SocketManager(this);
    this.UserManager = new UserManager(this);
    this.TrackManager = new TrackManager(this);
  }

  Connect() {
    if (this.SocketManager.Socket.connected) throw new Error("Already connected to the socket!");
    return this.SocketManager.Socket.connect();
  }

  Destroy() {
    this.SocketManager.Destroy();
  }

}

module.exports = { Client };