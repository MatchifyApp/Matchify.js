const { SocketManager } = require("../managers/SocketManager");
const defaultify = require("stuffs/lib/defaultify");
const UserManager = require("../managers/UserManager");
const TrackManager = require("../managers/TrackManager");
const ArtistManager = require("../managers/ArtistManager");
const AlbumManager = require("../managers/AlbumManager");
const GenreManager = require("../managers/GenreManager");
const HTTPManager = require("../managers/HTTPManager");
const AuthManager = require("../managers/AuthManager");
const LocalUserManager = require("../managers/LocalUserManager");
const GuildManager = require("../managers/GuildManager");
const MediaManager = require("../managers/MediaManager");
const RoomManager = require("../managers/RoomManager");

/**
 * @typedef {import("lru-cache/index").Options<string, any>} LRUOptions
 */

/**
 * @typedef {Object} ManagerOptions
 * @property {{ LRU?: LRUOptions, Cache?: { Listeners?: boolean } }} [Track]
 * @property {{ LRU?: LRUOptions, Cache?: { Listeners?: boolean } }} [Album]
 * @property {{ LRU?: LRUOptions, Cache?: { Listeners?: boolean } }} [Artist]
 * @property {{ LRU?: LRUOptions, Cache?: { Genres?: boolean, Features?: boolean } }} [User]
 * @property {{ LRU?: LRUOptions, Cache?: { Listeners?: boolean } }} [Genre]
 * @property {{ LRU?: LRUOptions, Cache?: { Listeners?: boolean } }} [Guild]
 * @property {{ LRU?: LRUOptions }} [Room]
 * @property {{ LRU?: LRUOptions }} [RoomMessage]
 * @property {{ LRU?: LRUOptions }} [Media]
 * @property {{ Axios?: import("axios").AxiosRequestConfig }} [HTTP]
 */

/**
 * @typedef {Object} ClientOptions
 * @property {ManagerOptions} [Managers]
 * @property {Partial<import("socket.io-client").ManagerOptions & import("socket.io-client").SocketOptions & {url:string}>} [Socket]
 * @property {boolean} UseHTTP
 */

class Client {
  /**
   * @param {ClientOptions} [clientOptions]
   */
  constructor (clientOptions = {}) {
    this._UserAgent = `Matchify.js/${require("../../package.json").version} (API Wrapper)`;
    /** @type {LRUOptions} */
    const DefaultLRU = {
      max: 4096
    };
    /** @type {ClientOptions} */
    this.Options = defaultify(clientOptions, {
      Managers: {
        Track: {
          LRU: DefaultLRU,
          Cache: {
            Listeners: false
          }
        },
        Album: {
          LRU: DefaultLRU,
          Cache: {
            Listeners: false
          }
        },
        Artist: {
          LRU: DefaultLRU,
          Cache: {
            Listeners: false
          }
        },
        User: {
          LRU: DefaultLRU,
          Cache: {
            Genres: false,
            Features: false
          }
        },
        Genre: {
          LRU: DefaultLRU,
          Cache: {
            Listeners: false
          }
        },
        Guild: {
          LRU: DefaultLRU,
          Cache: {
            Listeners: false
          }
        },
        Room: {
          LRU: DefaultLRU,
        },
        RoomMessage: {
          LRU: DefaultLRU,
        },
        Media: {
          LRU: DefaultLRU
        },
        HTTP: {
          Axios: {
            baseURL: "https://matchify.org/api",
            headers: {
              ...(globalThis.navigator ? {} : { "User-Agent": this._UserAgent })
            }
          }
        }
      },
      UseHTTP: false,
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
    this.AuthManager = new AuthManager(this);
    this.LocalUserManager = new LocalUserManager(this);
    this.GuildManager = new GuildManager(this);
    this.MediaManager = new MediaManager(this);
    this.RoomManager = new RoomManager(this);

    /** @type {{Token:string,Email:string,User:import("../structures/User")}?} */
    this.LocalUser = null;

    this.LoginInProcess = false;
  }
  /**
   * @param {string?} Token
   */
  async Connect(Token) {
    if (this.SocketManager.Socket.connected) throw new Error("Already connected to the socket!");
    this.LocalUser = { Token, Email: "", User: null };
    this.SocketManager.Socket.connect();
    return;
  }

  /**
   * @param {string} Token
   */
  async Login(Token) {
    if (this.LocalUser) throw new Error("Already logged in!");
    this.LoginInProcess = true;
    let u = await this.AuthManager.Login(Token);
    this.LocalUser = u;
    this.LoginInProcess = false;
  }

  /**
   * @param {string} eventName 
   * @param {{[key:string]:any}?} data
   * @returns {Promise<any>} 
   */
  async AwaitResponse(eventName, data = {}, useHttp) {
    useHttp = useHttp ?? this.Options.UseHTTP;
    return await this[useHttp ? "HTTPManager" : "SocketManager"].AwaitResponse(eventName, data);
  }

  Destroy() {
    this.SocketManager.Destroy();
    this.UserManager.Destroy();
    this.TrackManager.Destroy();
    this.ArtistManager.Destroy();
    this.AlbumManager.Destroy();
    this.GenreManager.Destroy();
    this.MediaManager.Destroy();
    this.RoomManager.Destroy();
    this.RoomMessageManager.Destroy();
    this.LocalUser = null;
  }

}

module.exports = { Client };