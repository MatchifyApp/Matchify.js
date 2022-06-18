export = Genre;
declare class Genre {
    constructor(data: any);
    _Patch(data?: {}): void;
    /** @type {string} */
    Id: string;
    /** @type {string} */
    Name: string;
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
    /** @type {Map<string, import("./User")>} */
    Listeners: Map<string, import("./User")>;
}
