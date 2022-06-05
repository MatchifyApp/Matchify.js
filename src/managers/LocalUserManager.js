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
  async FetchMatches(Offset, Limit, Sorted=false, LowerPoint = 0.49) {
    let data = await this.Client.AwaitResponse("LocalUser:Get:Matches", {
      Offset,
      Limit,
      Sorted,
      LowerPoint
    }, false);

    return await quickMap(data, async i => {
      return {
        User: await this.Client.UserManager.Fetch(i.UserId),
        MatchPercent: i.MatchPercent
      };
    });
  }

  /**
   * @returns {Promise<{Track:import("../structures/Track"), Genre:import("../structures/Genre")}>}
   */
  async FetchSongSuggestion() {
    let data = await this.Client.AwaitResponse("LocalUser:Get:SongSuggestion", {}, false);
    return {
      Track: await this.Client.TrackManager.Fetch(data.TrackId),
      Genre: await this.Client.GenreManager.Fetch(data.GenreId)
    }
  }

  /**
   * @param {boolean} ClearData 
   */
  async SelfBlock(ClearData = false) {
    await this.Client.AwaitResponse("LocalUser:SelfBlock", { ClearData }, false);
    this.Client.LocalUser = null;
    return true;
  }
  
}