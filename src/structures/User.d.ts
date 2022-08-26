export = User;
declare class User {
    constructor(data: any);
    _Patch(data?: {}): void;
    /** @type {{Track: import("./Track")?, At: Date}?} */
    CurrentPlaying: {
        Track: import("./Track") | null;
        At: Date;
    };
    /** @type {string} */
    Id: string;
    /** @type {string} */
    Tag: string;
    /** @type {string} */
    Avatar: string;
    /** @type {string} */
    Banner: string;
    /** @type {number} */
    LikeCount: number;
    /** @type {number} */
    FollowCount: number;
    /** @type {number} */
    ShareCount: number;
    /** @type {number} */
    CommentCount: number;
    /** @type {number} */
    ListenedCount: number;
    /** @type {number} */
    OnlineDevicesCount: number;
    /** @type {Map<string, { Count: number, Genre: import("./Genre") }>} */
    Genres: Map<string, {
        Count: number;
        Genre: import("./Genre");
    }>;
    /** @type {Map<string, { Name:string, Until:Date, At:Date }>} */
    Features: Map<string, {
        Name: string;
        Until: Date;
        At: Date;
    }>;
}
