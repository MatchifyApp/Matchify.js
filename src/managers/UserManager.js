const QuickLRU = require('@lib/quick-lru');
const { quickForEach, quickMap } = require("async-and-quick");
const User = require("../structures/User");

module.exports = class UserManager {

  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;
    /** @type {import("@lib/quick-lru").QuickLRU<string, User>} */
    this.Cache = new QuickLRU({
      ...client.Options.Managers.User.LRU,
      onEviction(key) {
        client.SocketManager.SubscriptionManager.Unsubscribe([
          `User:${key}:Track`,
          `User:${key}:Update`
        ]);
      }
    });

    client.SocketManager.Socket.on("User:Update", data => {
      let user = this.Cache.get(data.Id);
      if (user) user._Patch(data);
    });

    client.SocketManager.Socket.on("User:Track", async data => {
      let user = this.Cache.get(data.Id);
      if (!user) return;
      let track = data.TrackId ? await client.TrackManager.Fetch(data.TrackId) : null;
      user._Patch({ CurrentPlaying: { Track: track, At: new Date() }, ListenedCount: user.ListenedCount + (data.TrackId ? 1 : 0) });

      if (track && this.Client.Options.Managers.User.Cache.Genres) {
        track.Genres.forEach(genre => { 
          let ug = user.Genres.get(genre.Id);
          if (ug) {
            ug.Count += 1;
          } else {
            user.Genres.set(genre.Id, {
              Genre: genre,
              Count: 1
            });
          }
        });
        track._Patch({ Genres: new Map([...track.Genres.entries()].sort((a, b) => b[1].Count - a[1].Count)) });
      }
    });
  }

  async Fetch(userId) {
    let user = this.Cache.get(userId);
    if (user) return user;
    const data = await this.Client.AwaitResponse(`Users:Get`, {
      Id: userId
    });
    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `User:${userId}:Track`,
      `User:${userId}:Update`
    ]);
    let currentTrackData = await this.Client.AwaitResponse(`Users:Get:Current`, {
      Id: userId
    });
    let genresMap = new Map();

    if (this.Client.Options.Managers.User.Cache.Genres) { 
      let userGenres = await this.Client.AwaitResponse(`Users:Get:Genres`, {
        Id: userId
      });
      await quickForEach(userGenres, async genre => { 
        genresMap.set(genre.Id, {
          Genre: await this.Client.GenreManager.Fetch(genre.Id),
          Count: genre.Count
        });
      });
      userGenres = new Map([...userGenres.entries()].sort((a, b) => b[1].Count - a[1].Count));
    }

    user = new User({
      ...data,
      CurrentPlaying: {
        Track: currentTrackData?.TrackId ? await this.Client.TrackManager.Fetch(currentTrackData.TrackId) : null,
        At: new Date(currentTrackData?.LastUpdated || Date.now())
      },
      Genres: genresMap
    });
    this.Cache.set(userId, user);
    return user;
  }

  /**
   * @param {string} id 
   * @param {number} offset 
   * @param {number} limit 
   * 
   * @returns {Promise<{User: import("../structures/User"), Track: import("../structures/Track"), Distance: number, At: Date}[]>}
   */
  async FetchHistory(id, offset=0, limit=50) { 
    const data = await this.Client.AwaitResponse(`Users:Get:History`, {
      Id: id,
      Offset: offset,
      Limit: limit
    });
    return await quickMap(data, async data => {
      return {
        User: await this.Client.UserManager.Fetch(data.UserId),
        Track: await this.Client.TrackManager.Fetch(data.TrackId),
        Distance: data.Distance,
        At: new Date(data.InsertedAt)
      };
    });
  }

  /**
   * @param {string} Id 
   * @param {number} Offset 
   * @param {number} Limit 
   * @returns {Promise<{ Track: import("../structures/Track"), ListenedCount: number }[]>}
   */
  async FetchTopTracks(Id, Offset=0, Limit=50) { 
    const data = await this.Client.AwaitResponse(`Users:Get:Top:Tracks`, {
      Id,
      Offset,
      Limit
    });

    return await quickMap(data, async i => { 
      return {
        Track: await this.Client.TrackManager.Fetch(i.Id),
        ListenedCount: i.ListenedCount
      }
    });
  }

  /**
   * @param {string} id 
   */
  async FetchCurrentPlaying(id) {
    let User = await this.Client.UserManager.Fetch(id);
    if (!User) return;
    let data = await this.Client.AwaitResponse(`Users:Get:Current`, {
      Id: id
    });
    let Track = data?.TrackId ? await this.Client.TrackManager.Fetch(data.TrackId) : null;
    let r = {
      Track,
      At: new Date(data?.LastUpdated || Date.now())
    };
    User._Patch({ CurrentPlaying: r });
    return r;
  }

  /**
   * @param {string} search 
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<import("../structures/User")[]>}
   */
  async Search(search, offset=0, limit=50) {
    let data = await this.Client.AwaitResponse(`Users:Search`, {
      Search: search,
      Offset: offset,
      Limit: limit
    });

    return await quickMap(data, async id => { 
      return await this.Fetch(id);
    });
  }

  /**
   * @param {string} id
   * @param {string} search 
   * @param {number} offset 
   * @param {number} limit 
   * @returns {Promise<{User: import("../structures/User"), Track: import("../structures/Track"), Distance: number, At: Date}[]>}
   */
  async SearchHistory(id, search, offset = 0, limit = 50) {
    let data = await this.Client.AwaitResponse(`Users:Search:History`, {
      Id: id,
      Search: search,
      Offset: offset,
      Limit: limit
    });

    return await quickMap(data, async i => {
      return {
        User: await this.Client.UserManager.Fetch(i.UserId),
        Track: await this.Client.TrackManager.Fetch(i.TrackId),
        Distance: i.Distance,
        At: new Date(i.InsertedAt)
      };
    });
  }

  Destroy() {
    this.Cache.clear();
  }
}