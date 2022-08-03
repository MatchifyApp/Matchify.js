const QuickLRU = require("@lib/quick-lru");
const { quickMap } = require("async-and-quick");
const Media = require("../structures/Media");

module.exports = class MediaManager {
  /**
   * 
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;

    this.Cache = new QuickLRU({
      ...client.Options.Managers.Media.LRU,
    });

    this.Client.SocketManager.Socket.on("Media:Delete", async (Id) => {
      this.Cache.delete(Id);
    });

  }

  async Fetch(Id) {
    if (this.Cache.has(Id)) return this.Cache.get(Id);

    let res = await this.Client.HTTPManager.Axios.get(
      `/v1/media/${Id}/data.json`,
      {
        responseType: "json"
      }
    );
    if (!res.data.ok) throw new Error(res.data.error);

    let media = new Media({
      Id,
      Owner: await this.Client.UserManager.Fetch(res.data.data.OwnerId),
      At: new Date(res.data.data.InsertedAt),
      ...res.data.data
    });
    this.Cache.set(Id, media);
    return media;
  }
}