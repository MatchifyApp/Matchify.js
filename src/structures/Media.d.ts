export = Media;
declare class Media {
    constructor(data: any);
    _Patch(data?: {}): void;
    /** @type {string} */
    Id: string;
    /** @type {string} */
    Name: string;
    /** @type {import("./User")} */
    Owner: import("./User");
    /** @type {Date} */
    At: Date;
    /** @type {string} */
    ContentType: string;
    /** @type {number} */
    Size: number;
    /** @type {number?} */
    Width: number | null;
    /** @type {number?} */
    Height: number | null;
}
