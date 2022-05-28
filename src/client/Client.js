const { SocketManager } = require("../managers/SocketManager");
const defaultify = require("stuffs/lib/defaultify");
const UserManager = require("../managers/UserManager");
const TrackManager = require("../managers/TrackManager");
const ArtistManager = require("../managers/ArtistManager");
const AlbumManager = require("../managers/AlbumManager");
const GenreManager = require("../managers/GenreManager");
const HTTPManager = require("../managers/HTTPManager");

/**
 * @typedef {Partial<Omit<import("@lib/quick-lru").QuickLRUOptions<string, any>, "onEviction">>} LRUOptions
 */

/**
 * @typedef {Object} ManagerOptions
 * @property {{ LRU?: LRUOptions, Cache?: { Listeners?: boolean } }} [Track]
 * @property {{ LRU?: LRUOptions, Cache?: { Listeners?: boolean } }} [Album]
 * @property {{ LRU?: LRUOptions, Cache?: { Listeners?: boolean } }} [Artist]
 * @property {{ LRU?: LRUOptions, Cache?: { Genres?: boolean } }} [User]
 * @property {{ LRU?: LRUOptions, Cache?: { Listeners?: boolean } }} [Genre]
 */

/**
 * @typedef {Object} ClientOptions
 * @property {ManagerOptions} [Managers]
 * @property {{Token: string}} [Authorization]
 * @property {Partial<import("socket.io-client").ManagerOptions & import("socket.io-client").SocketOptions & {url:string}>} [Socket]
 */

class Client {
  /**
   * @param {ClientOptions} [clientOptions]
   */
  constructor (clientOptions = {}) {
    super({ ignoreErrors: true, verboseMemoryLeak: true });
    this._UserAgent = `Matchify.js/${require("../../package.json").version} (API Wrapper)`;
    /** @type {ClientOptions} */
    this.Options = defaultify(clientOptions, {
      Managers: {
        Track: {
          LRU: {
            maxAge: 3600000,
            maxSize: 16384
          },
          Cache: {
            Listeners: false
          }
        },
        Album: {
          LRU: {
            maxAge: 3600000,
            maxSize: 16384
          },
          Cache: {
            Listeners: false
          }
        },
        Artist: {
          LRU: {
            maxAge: 3600000,
            maxSize: 16384
          },
          Cache: {
            Listeners: false
          }
        },
        User: {
          LRU: {
            maxAge: 3600000,
            maxSize: 16384
          },
          Cache: {
            Genres: false
          }
        },
        Genre: {
          LRU: {
            maxAge: 3600000,
            maxSize: 16384
          },
          Cache: {
            Listeners: false
          }
        }
      },
      Socket: {
        extraHeaders: {
          ...(globalThis.navigator ? {} : { "User-Agent": this._UserAgent })
        },
        url: "https://matchify.org/",
      }
    }, true);

    if (this.Options.Socket.url.endsWith("/"))
      this.Options.Socket.url = this.Options.Socket.url.slice(0, -1);

    this.SocketManager = new SocketManager(this);
    this.UserManager = new UserManager(this);
    this.TrackManager = new TrackManager(this);
    this.ArtistManager = new ArtistManager(this);
    this.AlbumManager = new AlbumManager(this);
    this.GenreManager = new GenreManager(this);
    this.HTTPManager = new HTTPManager(this);
  }
  Connect() {
    if (this.SocketManager.Socket.connected) throw new Error("Already connected to the socket!");
    this.SocketManager.Socket.connect()
    return;
  }

  /**
   * @param {string} eventName 
   * @param {{[key:string]:any}?} data
   * @returns {Promise<any>} 
   */
  async AwaitResponse(eventName, data = {}, useHttp=true) {
    return await this[useHttp ? "HTTPManager" : "SocketManager"].AwaitResponse(eventName, data);
  }

  Destroy() {
    this.SocketManager.Destroy();
    this.UserManager.Destroy();
    this.TrackManager.Destroy();
    this.ArtistManager.Destroy();
    this.AlbumManager.Destroy();
    this.GenreManager.Destroy();
  }

}

module.exports = { Client };