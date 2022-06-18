export = AuthManager;
declare class AuthManager {
    /** @param {import("../client/Client").Client} client */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    /**
     * @param {string} Host
     * @param {boolean} Desktop
     * @returns {string}
     */
    FetchAuthURL(Host: string, Desktop?: boolean): string;
    /**
     * @param {string} Code
     * @param {string} State
     * @returns {{Token: string, Email: string, User: import("../structures/User"), IsSelfBlocked: boolean}}
     */
    Callback(Code: string, State: string): {
        Token: string;
        Email: string;
        User: import("../structures/User");
        IsSelfBlocked: boolean;
    };
    /**
     *
     * @param {string} Token
     * @returns {{Token: string, Email: string, User: import("../structures/User")}}
     */
    Login(Token: string): {
        Token: string;
        Email: string;
        User: import("../structures/User");
    };
    Logout(): Promise<void>;
}
