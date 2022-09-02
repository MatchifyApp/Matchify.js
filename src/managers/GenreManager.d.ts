export = GenreManager;
declare class GenreManager {
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
    * @param {string} Id
    * @param {number} Offset
    * @param {number} Limit
    * @returns {Promise<{ User: import("../structures/User"), Track: import("../structures/Genre"), At: Date, Id: string }[]>}
    */
    FetchLikes(Id: string, Offset?: number, Limit?: number): Promise<{
        User: import("../structures/User");
        Track: import("../structures/Genre");
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
   * @param {number} offset
   * @param {number} limit
   * @returns {Promise<{Genre: Genre, ListenersCount: number}[]>}
   */
    FetchPopular(offset?: number, limit?: number): Promise<{
        Genre: Genre;
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
    * @param {string} id
    * @returns {Promise<number>}
    */
    FetchListenersCount(id: string): Promise<number>;
    /**
     * @param {string} search
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<import("../structures/Genre")[]>}
     */
    Search(search: string, offset?: number, limit?: number): Promise<import("../structures/Genre")[]>;
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
    * @returns {Promise<number>}
    */
    FetchTrackCount(id: string): Promise<number>;
    /**
    * @param {string} id
    * @returns {Promise<number>}
    */
    FetchAlbumCount(id: string): Promise<number>;
    /**
    * @param {string} id
    * @returns {Promise<number>}
    */
    FetchArtistCount(id: string): Promise<number>;
    /**
    * @param {string} id
    * @returns {Promise<import("../structures/Artist")>}
    */
    FetchRandomArtist(id: string): Promise<import("../structures/Artist")>;
    Destroy(): void;
}
import LRUCache = require("lru-cache");
import Genre = require("../structures/Genre");
