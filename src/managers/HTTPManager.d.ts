export = HTTPManager;
declare class HTTPManager {
    /**
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    /**
     * @param {string} methodName
     * @param {{[key:string]:any}?} data
     * @returns {Promise<any>}
     */
    AwaitResponse(methodName: string, data?: {
        [key: string]: any;
    }): Promise<any>;
}
