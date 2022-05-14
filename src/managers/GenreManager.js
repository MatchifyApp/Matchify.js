const QuickLRU = require("@lib/quick-lru");
const { quickForEach } = require("async-and-quick");
const Genre = require("../structures/Genre");

module.exports = class GenreManager {

  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;

    /** @type {import("@lib/quick-lru").QuickLRU<string, Genre>} */
    this.Cache = new QuickLRU({
      ...client.Options.Managers.Genre.LRU,
      onEviction(key) {
        this.Client.SocketManager.SubscriptionManager.Unsubscribe([
          `Genre:${key}:Listener`
        ]);
      }
    });

    if (this.Client.Options.Managers.Genre.Cache.Listeners) {
      this.Client.SocketManager.Socket.on("Genre:Listener", async data => {
        this.#HandleListener(data);
      });
    }
  }

  async #HandleListener(data) {
    let genre = this.Cache.get(data.Id);
    if (!genre) return;
    let user = await this.Client.UserManager.Fetch(data.UserId);
    if (data.Listening) {
      genre.Listeners.set(data.UserId, user);
      genre._Patch({ ListenedCount: genre.ListenedCount + 1 });
    } else {
      genre.Listeners.delete(data.UserId);
    }
    this.Client.emit("Genre:Listener", {
      Genre: genre,
      User: user,
      Listening: data.Listening
    });
  }

  async #SubscribeToListeners(genreId) {
    if (!this.Client.Options.Managers.Genre.Cache.Listeners) return;

    this.Client.SocketManager.SubscriptionManager.Subscribe([
      `Genre:${genreId}:Listener`
    ]);
    let data = await this.Client.SocketManager.AwaitResponse(`Genres:Get:Listeners`, {
      Id: genreId,
      Offset: 0,
      Limit: Number.MAX_SAFE_INTEGER
    });
    await quickForEach(data, async Listener => {
      await this.#HandleListener({
        Id: genreId,
        UserId: Listener.UserId,
        Listening: true
      });
    });
  }

  async Fetch(genreId) {
    if (this.Cache.has(genreId)) return this.Cache.get(genreId);
    let data = await this.Client.SocketManager.AwaitResponse(`Genres:Get`, {
      Id: genreId
    });
    return this.Import(data);
  }

  async Import(data) {
    let genre = this.Cache.get(data.Id);
    if (genre) return genre;
    genre = new Genre(data);
    this.Cache.set(genre.Id, genre);
    await this.#SubscribeToListeners(genre.Id);
    return genre;
  }
}