export = Track;
declare class Track {
    constructor(data: any);
    _Patch(data?: {}): void;
    /** @type {string} */
    Id: string;
    /** @type {string} */
    Name: string;
    /** @type {number} */
    Duration: number;
    /** @type {import("./Album")} */
    Album: import("./Album");
    /** @type {Map<string, import("./Artist")>} */
    Artists: Map<string, import("./Artist")>;
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
    /** @type {Map<string, import("./Genre")>} */
    Genres: Map<string, import("./Genre")>;
    /** @type {Map<string, import("./User")>} */
    Listeners: Map<string, import("./User")>;
}
