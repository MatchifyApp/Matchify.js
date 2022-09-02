export = GuildManager;
declare class GuildManager {
    /**
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    Cache: LRUCache<string, any>;
    _HandleListener(data: any): Promise<void>;
    _SubscribeToListeners(genreId: any): Promise<void>;
    Fetch(genreId: any): Promise<any>;
    Import(data: any): Promise<any>;
    /**
    * @param {string} id
    * @param {number} offset
    * @param {number} limit
    * @returns {Promise<{User: import("../structures/User"), LastUpdated: Date, Track: import("../structures/Track"), DisplayName: string}[]>}
    */
    FetchListeners(id: string, offset?: number, limit?: number): Promise<{
        User: import("../structures/User");
        LastUpdated: Date;
        Track: import("../structures/Track");
        DisplayName: string;
    }[]>;
    /**
  * @param {string} Id
  * @param {number} Offset
  * @param {number} Limit
  * @returns {Promise<{ User: import("../structures/User"), Guild: import("../structures/Guild"), At: Date, Id: string }[]>}
  */
    FetchLikes(Id: string, Offset?: number, Limit?: number): Promise<{
        User: import("../structures/User");
        Guild: import("../structures/Guild");
        At: Date;
        Id: string;
    }[]>;
    /**
    * @param {string} id
    * @returns {Promise<number>}
    */
    FetchListenersCount(id: string): Promise<number>;
    /**
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<{Guild: Guild, ListenersCount: number}[]>}
     */
    FetchPopular(offset?: number, limit?: number): Promise<{
        Guild: Guild;
        ListenersCount: number;
    }[]>;
    /**
     * @param {string} search
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<import("../structures/Guild")[]>}
     */
    Search(search: string, offset?: number, limit?: number): Promise<import("../structures/Guild")[]>;
    Destroy(): void;
}
import LRUCache = require("lru-cache");
import Guild = require("../structures/Guild");
