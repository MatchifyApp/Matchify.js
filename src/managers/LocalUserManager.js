const { quickMap } = require("async-and-quick");

module.exports = class LocalUserManager {
  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) { 
    this.Client = client;
  }

  /**
   * @param {number} Offset 
   * @param {number} Limit 
   * 
   * @returns {Promise<{MatchPercents: number, User: import("../structures/User")}[]>}
   */
  async FetchMatches(Offset, Limit) {
    let data = await this.Client.AwaitResponse("LocalUser:Get:Matches", {
      Offset,
      Limit
    }, false);

    return await quickMap(data, async i => {
      return {
        User: await this.Client.UserManager.Fetch(i.UserId),
        MatchPercent: i.MatchPercent
      };
    });
  }
  
}