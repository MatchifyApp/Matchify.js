export = TrackManager;
declare class TrackManager {
    /**
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    /** @type {import("@lib/quick-lru").QuickLRU<string, Track>} */
    Cache: import("@lib/quick-lru").QuickLRU<string, Track>;
    _HandleListener(data: any): Promise<void>;
    _SubscribeToListeners(trackId: any): Promise<void>;
    Fetch(trackId: any): Promise<Track>;
    Import(data: any): Promise<Track>;
    /**
    * @param {string} Id
    * @param {number} Offset
    * @param {number} Limit
    * @returns {Promise<{ User: import("../structures/User"), Track: import("../structures/Track"), At: Date, Id: string }[]>}
    */
    FetchLikes(Id: string, Offset?: number, Limit?: number): Promise<{
        User: import("../structures/User");
        Track: import("../structures/Track");
        At: Date;
        Id: string;
    }[]>;
    /**
     * @param {string} id
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<{User: import("../structures/User"), LastUpdated: Date}[]>}
     */
    FetchListeners(id: string, offset?: number, limit?: number): Promise<{
        User: import("../structures/User");
        LastUpdated: Date;
    }[]>;
    /**
    * @param {string} id
    * @returns {Promise<number>}
    */
    FetchListenersCount(id: string): Promise<number>;
    /**
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<{Track: Track, ListenersCount: number}[]>}
     */
    FetchPopular(offset?: number, limit?: number): Promise<{
        Track: Track;
        ListenersCount: number;
    }[]>;
    /**
     * @param {string} id
     * @param {number} offset
     * @param {number} limit
     *
     * @returns {Promise<{User:import("../structures/User"),ListenedCount:number}[]>}
     */
    FetchHistory(id: string, offset?: number, limit?: number): Promise<{
        User: import("../structures/User");
        ListenedCount: number;
    }[]>;
    /**
     * @param {number} Amount
     * @returns {Promise<{Track: import("../structures/Track"), ListenerCount:number}[]>}
     */
    FetchRandomActive(Amount?: number): Promise<{
        Track: import("../structures/Track");
        ListenerCount: number;
    }[]>;
    /**
     * @param {string} search
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<import("../structures/Track")[]>}
     */
    Search(search: string, offset?: number, limit?: number): Promise<import("../structures/Track")[]>;
    /**
     * @param {string} id
     * @param {string} search
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<{User: import("../structures/User"), ListenedCount: number}[]>}
     */
    SearchHistory(id: string, search: string, offset?: number, limit?: number): Promise<{
        User: import("../structures/User");
        ListenedCount: number;
    }[]>;
    Destroy(): void;
}
import Track = require("../structures/Track");
