module.exports = class AuthManager {
  /** @param {import("../client/Client").Client} client */
  constructor (client) {
    this.Client = client;
  }

  /**
   * @param {string} Host 
   * @returns {string}
   */
  async GetAuthURL(Host) {
    return await this.Client.AwaitResponse("LocalUser:Auth:Get:Url", {
      Host
    }, true);
  }
  /**
   * @param {string} Code 
   * @param {string} State 
   * @returns {Token: string, Email: string, User: import("../structures/User")}
   */
  async Callback(Code, State) {
    let resUser = await this.Client.AwaitResponse("LocalUser:Auth:Callback", {
      Code,
      State
    }, false);

    return {
      Token: resUser.Token,
      Email: resUser.Email,
      User: await this.Client.UserManager.Fetch(resUser.Id)
    }
  }

  async Login(Token) {
    let resUser = await this.Client.AwaitResponse("LocalUser:Auth:Login", {
      Token
    }, false);

    return {
      Token: resUser.Token,
      Email: resUser.Email,
      User: await this.Client.UserManager.Fetch(resUser.Id)
    }
  }

  async Logout() {
    await this.Client.AwaitResponse("LocalUser:Auth:Logout", {}, false);
  }
}