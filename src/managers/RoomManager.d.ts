export = RoomManager;
declare class RoomManager {
    /**
     *
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    Socket: import("socket.io-client").Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
    Events: BasicEventEmitter;
    Cache: LRUCache<string, any>;
    MessageManager: RoomMessageManager;
    /**
     * @param {string} Id
     * @returns {Promise<Room>}
     */
    Fetch(Id: string): Promise<Room>;
    /**
     * @param {string} Id
     * @param {number} Offset
     * @param {number} Limit
     * @returns {Promise<Room[]>}
     */
    FetchByMember(Id: string, Offset?: number, Limit?: number): Promise<Room[]>;
    /**
     * @returns {Promise<Room[]>}
     */
    FetchAll(Offset?: number, Limit?: number): Promise<Room[]>;
    Import(data: any): Promise<any>;
    /**
     * @param {string} withWhoId
     * @param {Promise<Room>}
     */
    Create(withWhoId: string): Promise<Room>;
    Destroy(): void;
}
import BasicEventEmitter = require("../lib/BasicEventEmitter");
import LRUCache = require("lru-cache");
import RoomMessageManager = require("./RoomMessageManager");
import Room = require("../structures/Room");
