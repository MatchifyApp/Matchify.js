export = Room;
declare class Room {
    constructor(data: any);
    _Patch(data?: {}): void;
    /** @type {string} */
    Id: string;
    /** @type {string} */
    Name: string;
    /** @type {Date} */
    At: Date;
    /** @type {Date} */
    LastMessageAt: Date;
    /** @type {Map<string, import("./User")>} */
    Members: Map<string, import("./User")>;
}
