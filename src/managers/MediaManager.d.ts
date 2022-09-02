export = MediaManager;
declare class MediaManager {
    /**
     *
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    Cache: LRUCache<string, any>;
    /**
     * @param {string} Id
     * @returns {Promise<Media>}
     */
    Fetch(Id: string): Promise<Media>;
    /**
     * @param {string} Id
     * @returns {Promise<true>}
     */
    Delete(Id: string): Promise<true>;
    /**
     * @param {*} media
     * @returns {Promise<Media>}
     */
    Upload(media: any): Promise<Media>;
    Destroy(): void;
}
import LRUCache = require("lru-cache");
import Media = require("../structures/Media");
