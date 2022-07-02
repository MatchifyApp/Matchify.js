export = LocalUserManager;
declare class LocalUserManager {
    /**
     * @param {import("../client/Client").Client} client
     */
    constructor(client: import("../client/Client").Client);
    Client: import("../client/Client").Client;
    LikeManager: LocalUserLikeManager;
    /**
     * @param {number} Offset
     * @param {number} Limit
     * @param {boolean} Sorted
     * @param {number} TopGenreLimit
     *
     * @returns {Promise<{MatchPercents: number, User: import("../structures/User")}[]>}
     */
    FetchMatches(Offset: number, Limit: number, Sorted?: boolean, LowerPoint?: number, TopGenreLimit?: number): Promise<{
        MatchPercents: number;
        User: import("../structures/User");
    }[]>;
    /**
     * @param {string} Id
     * @param {number} TopGenreLimit
     * @returns {Promise<number>}
     */
    FetchMatchPercent(Id: string, TopGenreLimit?: number): Promise<number>;
    /**
     * @param {string} Id
     * @param {string} Code
     * @returns {Promise<any>}
     */
    SetGuildInviteCode(Id: string, Code: string): Promise<any>;
    /**
    * @returns {Promise<import("../structures/Guild")[]>}
    */
    FetchOwnedGuilds(): Promise<import("../structures/Guild")[]>;
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
import LocalUserLikeManager = require("./LocalUserLikeManager");
