const { quickMap } = require("async-and-quick");
const LocalUserLikeManager = require("./LocalUserLikeManager");

module.exports = class LocalUserManager {
  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) { 
    this.Client = client;

    this.LikeManager = new LocalUserLikeManager(this);
  }

  /**
   * @param {number} Offset 
   * @param {number} Limit 
   * @param {boolean} Sorted
   * @param {number} TopGenreLimit
   * 
   * @returns {Promise<{MatchPercents: number, User: import("../structures/User")}[]>}
   */
  async FetchMatches(Offset, Limit, Sorted = false, LowerPoint = 0.49, TopGenreLimit = 5) {
    let data = await this.Client.AwaitResponse("LocalUser:Get:Matches", {
      Offset,
      Limit,
      Sorted,
      LowerPoint,
      TopGenreLimit
    }, false);

    return await quickMap(data, async i => {
      return {
        User: await this.Client.UserManager.Fetch(i.UserId),
        MatchPercent: i.MatchPercent
      };
    });
  }

  /**
   * @param {string} Id
   * @param {number} TopGenreLimit
   * @returns {Promise<number>}
   */
  async FetchMatchPercent(Id, TopGenreLimit=5) {
    let data = await this.Client.AwaitResponse("LocalUser:Get:MatchPercent", {
      Id,
      TopGenreLimit
    }, false);

    return data;
  }

  /**
   * @param {string} mediaId
   * @returns {Promise<any>}
   */
  async SetCustomAvatar(mediaId) {
    let data = await this.Client.AwaitResponse("LocalUser:Set:Avatar", {
      Id: mediaId
    }, false);

    return data;
  }

  /**
   * @param {string} code
   * @returns {Promise<null|{Name: string, Until:Date, At:Date}>}
   */
  async RedeemFeature(code) {
    let data = await this.Client.AwaitResponse("LocalUser:Features:Redeem", {
      Code: code
    }, false);

    return data ? {
      At: new Date(data.InsertedAt),
      Until: new Date(data.Until),
      Name: i.FeatureName
    } : false;
  }

  /**
   * @param {string} Id
   * @param {string} Code
   * @returns {Promise<any>}
   */
  async SetGuildInviteCode(Id, Code) {
    let data = await this.Client.AwaitResponse("LocalUser:Set:Guild:InviteCode", {
      Id,
      Code
    }, false);

    let cachedGuild = this.Client.GuildManager.Cache.get(Id);
    if (cachedGuild) cachedGuild._Patch({ InviteCode: Code });

    return data;
  }

  /**
   * @param {string} Id
   * @param {string} Content
   * @returns {Promise<any>}
   */
  async SetUserNote(Id, Content) {
    let data = await this.Client.AwaitResponse("LocalUser:Set:Note:User", {
      Id,
      Content
    }, false);
    return data;
  }

  /**
   * @param {string} Id
   * @returns {Promise<string>}
   */
  async FetchUserNote(Id) {
    let data = await this.Client.AwaitResponse("LocalUser:Get:Note:User", {
      Id
    }, false);
    
    return data;
  }

  /**
  * @returns {Promise<import("../structures/Guild")[]>}
  */
  async FetchOwnedGuilds() {
    let data = await this.Client.AwaitResponse("LocalUser:Get:OwnedGuilds", {}, false);

    return await quickMap(data, async (id) => {
      return await this.Client.GuildManager.Fetch(id);
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
  
  /**
   * @param {string} Token 
   */
  async UnSelfBlock(Token) {
    await this.Client.AwaitResponse("LocalUser:UnSelfBlock", { Token }, false);
    return true;
  }
}