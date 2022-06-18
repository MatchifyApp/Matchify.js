export type LRUOptions = Partial<Omit<import("@lib/quick-lru").QuickLRUOptions<string, any>, "onEviction">>;
export type ManagerOptions = {
    Track?: {
        LRU?: LRUOptions;
        Cache?: {
            Listeners?: boolean;
        };
    };
    Album?: {
        LRU?: LRUOptions;
        Cache?: {
            Listeners?: boolean;
        };
    };
    Artist?: {
        LRU?: LRUOptions;
        Cache?: {
            Listeners?: boolean;
        };
    };
    User?: {
        LRU?: LRUOptions;
        Cache?: {
            Genres?: boolean;
        };
    };
    Genre?: {
        LRU?: LRUOptions;
        Cache?: {
            Listeners?: boolean;
        };
    };
    Guild?: {
        LRU?: LRUOptions;
        Cache?: {
            Listeners?: boolean;
        };
    };
};
export type ClientOptions = {
    Managers?: ManagerOptions;
    Socket?: Partial<import("socket.io-client").ManagerOptions & import("socket.io-client").SocketOptions & {
        url: string;
    }>;
    UseHTTP: boolean;
};
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
 * @property {{ LRU?: LRUOptions, Cache?: { Listeners?: boolean } }} [Guild]
 */
/**
 * @typedef {Object} ClientOptions
 * @property {ManagerOptions} [Managers]
 * @property {Partial<import("socket.io-client").ManagerOptions & import("socket.io-client").SocketOptions & {url:string}>} [Socket]
 * @property {boolean} UseHTTP
 */
export class Client {
    /**
     * @param {ClientOptions} [clientOptions]
     */
    constructor(clientOptions?: ClientOptions);
    _UserAgent: string;
    /** @type {ClientOptions} */
    Options: ClientOptions;
    SocketManager: SocketManager;
    UserManager: UserManager;
    TrackManager: TrackManager;
    ArtistManager: ArtistManager;
    AlbumManager: AlbumManager;
    GenreManager: GenreManager;
    HTTPManager: HTTPManager;
    AuthManager: AuthManager;
    LocalUserManager: LocalUserManager;
    GuildManager: GuildManager;
    /** @type {{Token:string,Email:string,User:import("../structures/User")}?} */
    LocalUser: {
        Token: string;
        Email: string;
        User: import("../structures/User");
    };
    LoginInProcess: boolean;
    /**
     * @param {string?} Token
     */
    Connect(Token: string | null): Promise<void>;
    /**
     * @param {string} Token
     */
    Login(Token: string): Promise<void>;
    /**
     * @param {string} eventName
     * @param {{[key:string]:any}?} data
     * @returns {Promise<any>}
     */
    AwaitResponse(eventName: string, data: {
        [key: string]: any;
    }, useHttp: any): Promise<any>;
    Destroy(): void;
}
import { SocketManager } from "../managers/SocketManager";
import UserManager = require("../managers/UserManager");
import TrackManager = require("../managers/TrackManager");
import ArtistManager = require("../managers/ArtistManager");
import AlbumManager = require("../managers/AlbumManager");
import GenreManager = require("../managers/GenreManager");
import HTTPManager = require("../managers/HTTPManager");
import AuthManager = require("../managers/AuthManager");
import LocalUserManager = require("../managers/LocalUserManager");
import GuildManager = require("../managers/GuildManager");
