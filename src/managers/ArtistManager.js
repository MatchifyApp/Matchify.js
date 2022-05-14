const QuickLRU = require("@lib/quick-lru");
const { quickForEach } = require("async-and-quick");
const Artist = require("../structures/Artist");

module.exports = class ArtistManager { 
  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) { 
    this.Client = client;

    /** @type {import("@lib/quick-lru").QuickLRU<string, Artist>} */
    this.Cache = new QuickLRU({
      ...client.Options.Managers.Artist.LRU,
      onEviction(key) {
        this.Client.SocketManager.SubscriptionManager.Unsubscribe([
          `Artist:${key}:Listener`
        ]);
      }
    });

    if (this.Client.Options.Managers.Artist.Cache.Listeners) {
      this.Client.SocketManager.Socket.on("Artist:Listener", async data => { 
        this.#HandleListener(data);
      });
    }
  }

  async #HandleListener(data) {
    let artist = this.Cache.get(data.Id);
    if (!artist) return;
    if (data.Listening) {
      let user = await this.Client.UserManager.Fetch(data.UserId);
      artist.Listeners.set(data.UserId, user);
    } else {
      artist.Listeners.delete(data.UserId);
    }
    this.Client.emit("Artist:Listener", {
      Artist: artist,
      User: user,
      Listening: data.Listening
    });
  }

  async #SubscribeToListeners(artistId) {
    if (!this.Client.Options.Managers.Artist.Cache.Listeners) return;
    if (this.Cache.has(artistId)) return;
    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `Artist:${artistId}:Listener`
    ]);
    let data = await this.Client.SocketManager.AwaitResponse(`Artists:Get:Listeners`, {
      Id: artistId,
      Offset: 0,
      Limit: Number.MAX_SAFE_INTEGER
    });
    await quickForEach(data, async Listener => {
      await this.#HandleListener({
        Id: artistId,
        UserId: Listener.UserId,
        Listening: true
      });
    });
  }

  async Fetch(artistId) {
    let artist = this.Cache.get(artistId);
    if (artist) return artist;
    const data = await this.Client.SocketManager.AwaitResponse(`Artists:Get`, {
      Id: artistId
    });
    return this.Import(data);
  }

  async Import(data) {
    let artist = this.Cache.get(data.Id);
    if (artist) return artist;
    artist = new Artist(data);
    this.Cache.set(artist.Id, artist);
    await this.#SubscribeToListeners(artist.Id);
    return artist;
  }
}