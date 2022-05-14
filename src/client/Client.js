const { SocketManager } = require("../managers/SocketManager");
const { defaultify } = require("stuffs");
const { EventEmitter2 } = require("eventemitter2");
const UserManager = require("../managers/UserManager");
const TrackManager = require("../managers/TrackManager");
const chillout = require("chillout");
const ArtistManager = require("../managers/ArtistManager");
const AlbumManager = require("../managers/AlbumManager");
const GenreManager = require("../managers/GenreManager");

/**
 * @typedef {Partial<Omit<import("@lib/quick-lru").QuickLRUOptions<string, any>, "onEviction">>} LRUOptions
 */

/**
 * @typedef {Object} ManagerOptions
 * @property {{ LRU: LRUOptions, Cache: { Listeners: boolean } }} Track
 * @property {{ LRU: LRUOptions, Cache: { Listeners: boolean } }} Album
 * @property {{ LRU: LRUOptions, Cache: { Listeners: boolean } }} Artist
 * @property {{ LRU: LRUOptions, Cache: { Genres: boolean } }} User
 * @property {{ LRU: LRUOptions, Cache: { Listeners: boolean } }} Genre
 */

/**
 * @typedef {Object} ClientOptions
 * @property {ManagerOptions} Managers
 * @property {{Token: string}} Authorization
 * @property {Partial<import("socket.io-client").ManagerOptions & import("socket.io-client").SocketOptions & {url:string}>} Socket
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
            maxAge: 3600000,
            maxSize: 16384
          },
          Cache: {
            Listeners: true
          }
        },
        Album: {
          LRU: {
            maxAge: 3600000,
            maxSize: 16384
          },
          Cache: {
            Listeners: true
          }
        },
        Artist: {
          LRU: {
            maxAge: 3600000,
            maxSize: 16384
          },
          Cache: {
            Listeners: true
          }
        },
        User: {
          LRU: {
            maxAge: 3600000,
            maxSize: 16384
          },
          Cache: {
            Genres: true
          }
        },
        Genre: {
          LRU: {
            maxAge: 3600000,
            maxSize: 16384
          },
          Cache: {
            Listeners: true
          }
        }
      },
      Socket: {
        extraHeaders: {
          "User-Agent": `Matchify.js/${require("../../package.json").version} (API Wrapper)`
        },
        url: "https://matchify.org/",
      }
    }, true);

    this.SocketManager = new SocketManager(this);
    this.UserManager = new UserManager(this);
    this.TrackManager = new TrackManager(this);
    this.ArtistManager = new ArtistManager(this);
    this.AlbumManager = new AlbumManager(this);
    this.GenreManager = new GenreManager(this);
  }
  Connect() {
    if (this.SocketManager.Socket.connected) throw new Error("Already connected to the socket!");
    this.SocketManager.Socket.connect()
    return;
  }

  Destroy() {
    this.SocketManager.Destroy();
  }

}

module.exports = { Client };