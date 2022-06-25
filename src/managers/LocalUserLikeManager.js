module.exports = class LocalUserLikeManager {

  /**
   * @param {import("./LocalUserManager")} localUserManager 
   */
  constructor (localUserManager) {
    this.LocalUserManager = localUserManager;
    this.Client = localUserManager.Client;
  }

  /**
   * @param {string} Id 
   * @param {boolean} State 
   * @returns {boolean}
   */
  async SetArtistLike(Id, State) {
    let response = this.Client.AwaitResponse(
      "LocalUser:Set:Like:Artist",
      {
        Id,
        State
      }
    );
    return response;
  }

  /**
 * @param {string} Id 
 * @param {boolean} State 
 * @returns {boolean}
 */
  async SetAlbumLike(Id, State) {
    let response = this.Client.AwaitResponse(
      "LocalUser:Set:Like:Album",
      {
        Id,
        State
      }
    );
    return response;
  }

  /**
 * @param {string} Id 
 * @param {boolean} State 
 * @returns {boolean}
 */
  async SetTrackLike(Id, State) {
    let response = this.Client.AwaitResponse(
      "LocalUser:Set:Like:Track",
      {
        Id,
        State
      }
    );
    return response;
  }

  /**
 * @param {string} Id 
 * @param {boolean} State 
 * @returns {boolean}
 */
  async SetGuildLike(Id, State) {
    let response = this.Client.AwaitResponse(
      "LocalUser:Set:Like:Guild",
      {
        Id,
        State
      }
    );
    return response;
  }

  /**
 * @param {string} Id 
 * @param {boolean} State 
 * @returns {boolean}
 */
  async SetGenreLike(Id, State) {
    let response = this.Client.AwaitResponse(
      "LocalUser:Set:Like:Genre",
      {
        Id,
        State
      }
    );
    return response;
  }

  /**
 * @param {string} Id 
 * @param {boolean} State 
 * @returns {boolean}
 */
  async SetUserLike(Id, State) {
    let response = this.Client.AwaitResponse(
      "LocalUser:Set:Like:User",
      {
        Id,
        State
      }
    );
    return response;
  }

  /**
   * @param {string} Id 
   * @returns {boolean}
   */
  async FetchArtistLike(Id) {
    let response = await this.Client.AwaitResponse(
      "LocalUser:Get:Like:Artist",
      {
        Id
      }
    );
    return response;
  }

  /**
 * @param {string} Id 
 * @returns {boolean}
 */
  async FetchAlbumLike(Id) {
    let response = await this.Client.AwaitResponse(
      "LocalUser:Get:Like:Album",
      {
        Id
      }
    );
    return response;
  }

  /**
 * @param {string} Id 
 * @returns {boolean}
 */
  async FetchTrackLike(Id) {
    let response = await this.Client.AwaitResponse(
      "LocalUser:Get:Like:Track",
      {
        Id
      }
    );
    return response;
  }

  /**
 * @param {string} Id 
 * @returns {boolean}
 */
  async FetchGuildLike(Id) {
    let response = await this.Client.AwaitResponse(
      "LocalUser:Get:Like:Guild",
      {
        Id
      }
    );
    return response;
  }

  /**
 * @param {string} Id 
 * @returns {boolean}
 */
  async FetchGenreLike(Id) {
    let response = await this.Client.AwaitResponse(
      "LocalUser:Get:Like:Genre",
      {
        Id
      }
    );
    return response;
  }

  /**
 * @param {string} Id 
 * @returns {boolean}
 */
  async FetchUserLike(Id) {
    let response = await this.Client.AwaitResponse(
      "LocalUser:Get:Like:User",
      {
        Id
      }
    );
    return response;
  }
}