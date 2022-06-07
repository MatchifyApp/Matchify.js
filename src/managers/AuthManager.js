module.exports = class AuthManager {
  /** @param {import("../client/Client").Client} client */
  constructor (client) {
    this.Client = client;
  }

  /**
   * @param {string} Host 
   * @param {boolean} Desktop 
   * @returns {string}
   */
  async GetAuthURL(Host, Desktop=false) {
    return await this.Client.AwaitResponse("LocalUser:Auth:Get:Url", {
      Host,
      Desktop
    }, true);
  }
  /**
   * @param {string} Code 
   * @param {string} State 
   * @returns {{Token: string, Email: string, User: import("../structures/User"), IsSelfBlocked: boolean}}
   */
  async Callback(Code, State) {
    let data = await this.Client.AwaitResponse("LocalUser:Auth:Callback", {
      Code,
      State
    }, false);

    return {
      Token: data.User.Token,
      Email: data.User.Email,
      IsSelfBlocked: data.IsSelfBlocked,
      User: await this.Client.UserManager.Fetch(data.User.Id)
    }
  }

  /**
   * 
   * @param {string} Token 
   * @returns {{Token: string, Email: string, User: import("../structures/User")}}
   */
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