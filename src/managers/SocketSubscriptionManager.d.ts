export class SocketSubscriptionManager {
    /**
     * @param {import("./SocketManager").SocketManager} socketManager
     */
    constructor(socketManager: import("./SocketManager").SocketManager);
    SocketManager: import("./SocketManager").SocketManager;
    Client: import("../client/Client").Client;
    Socket: import("socket.io-client").Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
    /** @type {Set<string>} */
    Subscriptions: Set<string>;
    Subscribe(eventNames?: any[]): boolean;
    Unsubscribe(eventNames?: any[]): boolean;
    Destroy(): void;
}
