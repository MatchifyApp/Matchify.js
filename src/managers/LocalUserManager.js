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
   * @param {boolean} Sorted
   * 
   * @returns {Promise<{MatchPercents: number, User: import("../structures/User")}[]>}
   */
  async FetchMatches(Offset, Limit, Sorted=false, LowerLimit = 0.49) {
    let data = await this.Client.AwaitResponse("LocalUser:Get:Matches", {
      Offset,
      Limit,
      Sorted,
      LowerLimit
    }, false);

    return await quickMap(data, async i => {
      return {
        User: await this.Client.UserManager.Fetch(i.UserId),
        MatchPercent: i.MatchPercent
      };
    });
  }
  
}