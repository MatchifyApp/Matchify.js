const QuickLRU = require('@lib/quick-lru');
const { quickForEach } = require("async-and-quick");
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
      user._Patch({ CurrentPlaying: track, ListenedCount: user.ListenedCount + (data.TrackId ? 1 : 0) });

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
      }

      client.emit("User:Track", {
        User: user,
        Track: track
      });
    });
  }

  async Fetch(userId) {
    let user = this.Cache.get(userId);
    if (user) return user;
    const data = await this.Client.SocketManager.AwaitResponse(`Users:Get`, {
      Id: userId
    });
    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `User:${userId}:Track`,
      `User:${userId}:Update`
    ]);
    let currentTrackData = await this.Client.SocketManager.AwaitResponse(`Users:Get:Current`, {
      Id: userId
    });
    let genresMap = new Map();

    if (this.Client.Options.Managers.User.Cache.Genres) { 
      let userGenres = await this.Client.SocketManager.AwaitResponse(`Users:Get:Genres`, {
        Id: userId
      });
      await quickForEach(userGenres, async genre => { 
        genresMap.set(genre.Id, {
          Genre: await this.Client.GenreManager.Fetch(genre.Id),
          Count: genre.Count
        });
      });
    }

    user = new User({
      ...data,
      CurrentPlaying: currentTrackData?.TrackId ? await this.Client.TrackManager.Fetch(currentTrackData.TrackId) : null,
      Genres: genresMap
    });
    this.Cache.set(userId, user);
    return user;
  }

  Destroy() {
    this.Cache.clear();
  }
}
