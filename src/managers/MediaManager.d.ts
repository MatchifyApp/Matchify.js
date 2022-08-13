export = MediaManager;
declare class MediaManager {
    /**
     *
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    Cache: QuickLRU<any, any>;
    /**
     * @param {string} Id
     * @returns {Promise<Media>}
     */
    Fetch(Id: string): Promise<Media>;
    /**
     * @param {*} media
     * @returns {Promise<Media>}
     */
    Upload(media: any): Promise<Media>;
    Destroy(): void;
}
import QuickLRU = require("@lib/quick-lru");
import Media = require("../structures/Media");
