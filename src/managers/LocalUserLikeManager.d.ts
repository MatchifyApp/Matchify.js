export = LocalUserLikeManager;
declare class LocalUserLikeManager {
    /**
     * @param {import("./LocalUserManager")} localUserManager
     */
    constructor(localUserManager: import("./LocalUserManager"));
    LocalUserManager: import("./LocalUserManager");
    Client: import("../client/Client").Client;
    /**
     * @param {string} Id
     * @param {boolean} State
     * @returns {boolean}
     */
    SetArtistLike(Id: string, State: boolean): boolean;
    /**
   * @param {string} Id
   * @param {boolean} State
   * @returns {boolean}
   */
    SetAlbumLike(Id: string, State: boolean): boolean;
    /**
   * @param {string} Id
   * @param {boolean} State
   * @returns {boolean}
   */
    SetTrackLike(Id: string, State: boolean): boolean;
    /**
   * @param {string} Id
   * @param {boolean} State
   * @returns {boolean}
   */
    SetGuildLike(Id: string, State: boolean): boolean;
    /**
   * @param {string} Id
   * @param {boolean} State
   * @returns {boolean}
   */
    SetGenreLike(Id: string, State: boolean): boolean;
    /**
   * @param {string} Id
   * @param {boolean} State
   * @returns {boolean}
   */
    SetUserLike(Id: string, State: boolean): boolean;
    /**
     * @param {string} Id
     * @returns {boolean}
     */
    FetchArtistLike(Id: string): boolean;
    /**
   * @param {string} Id
   * @returns {boolean}
   */
    FetchAlbumLike(Id: string): boolean;
    /**
   * @param {string} Id
   * @returns {boolean}
   */
    FetchTrackLike(Id: string): boolean;
    /**
   * @param {string} Id
   * @returns {boolean}
   */
    FetchGuildLike(Id: string): boolean;
    /**
   * @param {string} Id
   * @returns {boolean}
   */
    FetchGenreLike(Id: string): boolean;
    /**
   * @param {string} Id
   * @returns {boolean}
   */
    FetchUserLike(Id: string): boolean;
}
