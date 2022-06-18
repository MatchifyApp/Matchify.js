export = AlbumManager;
declare class AlbumManager {
    /**
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    /** @type {import("@lib/quick-lru").QuickLRU<string, Album>} */
    Cache: import("@lib/quick-lru").QuickLRU<string, Album>;
    _HandleListener(data: any): Promise<void>;
    _SubscribeToListeners(albumId: any): Promise<void>;
    Fetch(albumId: any): Promise<Album>;
    Import(data: any): Promise<Album>;
    /**
   * @param {string} id
   * @param {number} offset
   * @param {number} limit
   * @returns {Promise<{User: import("../structures/User"), LastUpdated: Date, Track: import("../structures/Track")}[]>}
   */
    FetchListeners(id: string, offset?: number, limit?: number): Promise<{
        User: import("../structures/User");
        LastUpdated: Date;
        Track: import("../structures/Track");
    }[]>;
    /**
    * @param {string} id
    * @returns {Promise<number>}
    */
    FetchListenersCount(id: string): Promise<number>;
    /**
   * @param {number} offset
   * @param {number} limit
   * @returns {Promise<{Album: Album, ListenersCount: number}[]>}
   */
    FetchPopular(offset?: number, limit?: number): Promise<{
        Album: Album;
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
     * @param {string} search
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<import("../structures/Album")[]>}
     */
    Search(search: string, offset?: number, limit?: number): Promise<import("../structures/Album")[]>;
    /**
     * @param {string} id
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<import("../structures/Track")[]>}
     */
    FetchTracks(id: string, offset?: number, limit?: number): Promise<import("../structures/Track")[]>;
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
import Album = require("../structures/Album");
