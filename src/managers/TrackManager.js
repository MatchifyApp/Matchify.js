const QuickLRU = require("@lib/quick-lru");
const { quickForEach } = require("async-and-quick");
const Track = require("../structures/Track");

module.exports = class TrackManager { 
  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;

    /** @type {import("@lib/quick-lru").QuickLRU<string, Track>} */
    this.Cache = new QuickLRU({
      ...client.Options.Managers.Track.LRU,
      onEviction(key) {
        this.Client.SocketManager.SubscriptionManager.Unsubscribe([
          `Track:${key}:Listener`
        ]);
      }
    });

    if (this.Client.Options.Managers.Track.Cache.Listeners) {
      this.Client.SocketManager.Socket.on("Track:Listener", async data => { 
        this.#HandleListener(data);
      });
    }
  }

  async #HandleListener(data) { 
    let track = this.Cache.get(data.Id);
    if (!track) return;
    if (data.Listening) {
      let user = await this.Client.UserManager.Fetch(data.UserId);
      track.Listeners.set(data.UserId, user);
    } else {
      track.Listeners.delete(data.UserId);
    }
    this.Client.emit("Track:Listener", {
      Track: track,
      User: user,
      Listening: data.Listening
    });
  }
  
  async #SubscribeToListeners(trackId) { 
    if (!this.Client.Options.Managers.Track.Cache.Listeners) return;
    if (this.Cache.has(trackId)) return;
    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `Track:${trackId}:Listener`
    ]);
    let data = await this.Client.SocketManager.AwaitResponse(`Tracks:Get:Listeners`, {
      Id: trackId,
      Offset: 0,
      Limit: Number.MAX_SAFE_INTEGER
    });
    await quickForEach(data, async Listener => {
      await this.#HandleListener({
        Id: trackId,
        UserId: Listener.UserId,
        Listening: true
      });
    });
  }
  
  async Fetch(trackId) {
    let track = this.Cache.get(trackId);
    if (track) return track;
    const data = await this.Client.SocketManager.AwaitResponse(`Tracks:Get`, {
      Id: trackId
    });
    return this.Import(data);
  }

  async Import(data) {
    let track = this.Cache.get(data.Id);
    if (track) return track;

    let artistsMap = new Map();
    await quickForEach(data.Artists, async data => { 
      let artist = await this.Client.ArtistManager.Import(data);
      artistsMap.set(artist.Id, artist);
    });
    // TODO: Handle Genres
    track = new Track({
      ...data,
      Artists: artistsMap
    });
    this.Cache.set(track.Id, track);
    await this.#SubscribeToListeners(track.Id);
    return track;
  }
}