export = UserManager;
declare class UserManager {
    /**
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    Cache: LRUCache<string, any>;
    Fetch(userId: any): Promise<any>;
    /**
     * @param {string} id
     * @param {number} offset
     * @param {number} limit
     *
     * @returns {Promise<{User: import("../structures/User"), Track: import("../structures/Track"), Distance: number, At: Date, Id: string}[]>}
     */
    FetchHistory(id: string, offset?: number, limit?: number): Promise<{
        User: import("../structures/User");
        Track: import("../structures/Track");
        Distance: number;
        At: Date;
        Id: string;
    }[]>;
    /**
     * @returns {number}
     */
    FetchActiveListenersCount(): number;
    /**
     * @returns {number}
     */
    FetchActiveUsersCount(): number;
    /**
     * @param {string} id
     *
     * @returns {Promise<any>}
     */
    DeleteHistoryItem(id: string): Promise<any>;
    /**
     * @param {string} Id
     * @param {number} Offset
     * @param {number} Limit
     * @returns {Promise<{ Track: import("../structures/Track"), ListenedCount: number }[]>}
     */
    FetchTopTracks(Id: string, Offset?: number, Limit?: number): Promise<{
        Track: import("../structures/Track");
        ListenedCount: number;
    }[]>;
    /**
     * @param {string} Id
     * @param {number} Offset
     * @param {number} Limit
     * @returns {Promise<User[]>}
     */
    FetchTopUsers(Offset?: number, Limit?: number): Promise<User[]>;
    /**
    * @param {string} Id
    * @param {number} Offset
    * @param {number} Limit
    * @returns {Promise<{ User: import("../structures/User"), TargetUser: import("../structures/User"), At: Date, Id: string }[]>}
    */
    FetchLikes(Id: string, Offset?: number, Limit?: number): Promise<{
        User: import("../structures/User");
        TargetUser: import("../structures/User");
        At: Date;
        Id: string;
    }[]>;
    /**
     * @param {string} id
     */
    FetchCurrentPlaying(id: string): Promise<{
        Track: any;
        At: Date;
    }>;
    /**
     * @param {string} search
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<import("../structures/User")[]>}
     */
    Search(search: string, offset?: number, limit?: number): Promise<import("../structures/User")[]>;
    /**
     * @param {string} id
     * @param {string} search
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<{User: import("../structures/User"), Track: import("../structures/Track"), Distance: number, At: Date, Id: string}[]>}
     */
    SearchHistory(id: string, search: string, offset?: number, limit?: number): Promise<{
        User: import("../structures/User");
        Track: import("../structures/Track");
        Distance: number;
        At: Date;
        Id: string;
    }[]>;
    /**
     * @param {string} id
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<{Guild: import("../structures/Guild"), User: import("../structures/User"), DisplayName: number}[]>}
     */
    FetchMembers(id: string, offset?: number, limit?: number): Promise<{
        Guild: import("../structures/Guild");
        User: import("../structures/User");
        DisplayName: number;
    }[]>;
    /**
     * @param {string} id
     * @returns {Promise<{Name:string,Until:Date,At:Date}[]>}
     */
    FetchFeatures(id: string): Promise<{
        Name: string;
        Until: Date;
        At: Date;
    }[]>;
    Destroy(): void;
}
import LRUCache = require("lru-cache");
import User = require("../structures/User");
