export = RoomMessage;
declare class RoomMessage {
    constructor(data: any);
    _Patch(data?: {}): void;
    /** @type {string} */
    Id: string;
    /** @type {string?} */
    Content: string | null;
    /** @type {import("./Media")?} */
    Media: import("./Media") | null;
    /** @type {Date} */
    At: Date;
    /** @type {import("./User")} */
    Owner: import("./User");
    /** @type {import("./Room")} */
    Room: import("./Room");
}
