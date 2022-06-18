export = Guild;
declare class Guild {
    constructor(data: any);
    _Patch(data?: {}): void;
    /** @type {string} */
    Id: string;
    /** @type {string} */
    Name: string;
    /** @type {string} */
    Icon: string;
    /** @type {string} */
    OwnerId: string;
    /** @type {string} */
    Banner: string;
    /** @type {string} */
    InviteCode: string;
    /** @type {number} */
    MemberCount: number;
    /** @type {boolean} */
    IsActive: boolean;
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
