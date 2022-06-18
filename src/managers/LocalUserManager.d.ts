export = LocalUserManager;
declare class LocalUserManager {
    /**
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    /**
     * @param {number} Offset
     * @param {number} Limit
     * @param {boolean} Sorted
     *
     * @returns {Promise<{MatchPercents: number, User: import("../structures/User")}[]>}
     */
    FetchMatches(Offset: number, Limit: number, Sorted?: boolean, LowerPoint?: number): Promise<{
        MatchPercents: number;
        User: import("../structures/User");
    }[]>;
    /**
     * @param {string} Id
     * @returns {Promise<number>}
     */
    FetchMatchPercent(Id: string): Promise<number>;
    /**
     * @returns {Promise<{Track:import("../structures/Track"), Genre:import("../structures/Genre")}>}
     */
    FetchSongSuggestion(): Promise<{
        Track: import("../structures/Track");
        Genre: import("../structures/Genre");
    }>;
    /**
     * @param {boolean} ClearData
     */
    SelfBlock(ClearData?: boolean): Promise<boolean>;
    /**
     * @param {string} Token
     */
    UnSelfBlock(Token: string): Promise<boolean>;
}
