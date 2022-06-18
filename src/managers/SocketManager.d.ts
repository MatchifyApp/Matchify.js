export class SocketManager {
    /**
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    Socket: import("socket.io-client").Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
    SubscriptionManager: SocketSubscriptionManager;
    Events: BasicEventEmitter;
    /**
     * @param {string} eventName
     * @param {{[key:string]:any}?} data
     * @returns {Promise<any>}
     */
    AwaitResponse(eventName: string, data?: {
        [key: string]: any;
    }): Promise<any>;
    Destroy(): void;
}
import { SocketSubscriptionManager } from "./SocketSubscriptionManager";
import BasicEventEmitter = require("../lib/BasicEventEmitter");
