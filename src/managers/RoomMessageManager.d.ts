export = RoomMessageManager;
declare class RoomMessageManager {
    /**
     *
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    Socket: import("socket.io-client").Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
    Events: BasicEventEmitter;
    Cache: LRUCache<string, any>;
    /**
     *
     * @param {*} data
     * @returns {Promise<RoomMessage>}
     */
    Import(data: any): Promise<RoomMessage>;
    /**
     * @param {string} roomId
     * @param {number} Offset
     * @param {number} Limit
     *
     * @returns {Promise<RoomMessage[]>}
     */
    FetchAll(roomId: string, Offset?: number, Limit?: number): Promise<RoomMessage[]>;
    /**
     * @param {string} roomId
     * @param {string?} Content
     * @param {string?} MediaId
     * @returns {Promise<RoomMessage>}
     */
    Send(roomId: string, Content: string | null, MediaId: string | null): Promise<RoomMessage>;
    /**
     * @param {string} roomId d
     */
    SendTyping(roomId: string): Promise<any>;
    Destroy(): void;
}
import BasicEventEmitter = require("../lib/BasicEventEmitter");
import LRUCache = require("lru-cache");
import RoomMessage = require("../structures/RoomMessage");
