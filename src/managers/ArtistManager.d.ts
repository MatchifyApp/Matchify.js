export = ArtistManager;
declare class ArtistManager {
    /**
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    Cache: LRUCache<string, any>;
    _HandleListener(data: any): Promise<void>;
    _SubscribeToListeners(artistId: any): Promise<void>;
    Fetch(artistId: any): Promise<any>;
    Import(data: any): Promise<any>;
    /**
  * @param {string} Id
  * @param {number} Offset
  * @param {number} Limit
  * @returns {Promise<{ User: import("../structures/User"), Artist: import("../structures/Artist"), At: Date, Id: string }[]>}
  */
    FetchLikes(Id: string, Offset?: number, Limit?: number): Promise<{
        User: import("../structures/User");
        Artist: import("../structures/Artist");
        At: Date;
        Id: string;
    }[]>;
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
     * @returns {Promise<{Artist: Artist, ListenersCount: number}[]>}
     */
    FetchPopular(offset?: number, limit?: number): Promise<{
        Artist: Artist;
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
     * @returns {Promise<import("../structures/Artist")[]>}
     */
    Search(search: string, offset?: number, limit?: number): Promise<import("../structures/Artist")[]>;
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
    /**
     * @param {string} id
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<import("../structures/Track")[]>}
     */
    FetchTracks(id: string, offset?: number, limit?: number): Promise<import("../structures/Track")[]>;
    /**
     * @param {string} id
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<import("../structures/Album")[]>}
     */
    FetchAlbums(id: string, offset?: number, limit?: number): Promise<import("../structures/Album")[]>;
    Destroy(): void;
}
import LRUCache = require("lru-cache");
import Artist = require("../structures/Artist");
