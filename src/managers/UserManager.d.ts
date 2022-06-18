export = UserManager;
declare class UserManager {
    /**
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    /** @type {import("@lib/quick-lru").QuickLRU<string, User>} */
    Cache: import("@lib/quick-lru").QuickLRU<string, User>;
    Fetch(userId: any): Promise<User>;
    /**
     * @param {string} id
     * @param {number} offset
     * @param {number} limit
     *
     * @returns {Promise<{User: import("../structures/User"), Track: import("../structures/Track"), Distance: number, At: Date}[]>}
     */
    FetchHistory(id: string, offset?: number, limit?: number): Promise<{
        User: import("../structures/User");
        Track: import("../structures/Track");
        Distance: number;
        At: Date;
    }[]>;
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
     * @param {string} id
     */
    FetchCurrentPlaying(id: string): Promise<{
        Track: import("../structures/Track");
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
     * @returns {Promise<{User: import("../structures/User"), Track: import("../structures/Track"), Distance: number, At: Date}[]>}
     */
    SearchHistory(id: string, search: string, offset?: number, limit?: number): Promise<{
        User: import("../structures/User");
        Track: import("../structures/Track");
        Distance: number;
        At: Date;
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
    Destroy(): void;
}
import User = require("../structures/User");
