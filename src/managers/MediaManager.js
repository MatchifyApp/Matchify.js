const QuickLRU = require("@lib/quick-lru");
const Media = require("../structures/Media");
const FormData = require("form-data");

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

  /**
   * @param {string} Id 
   * @returns {Promise<Media>}
   */
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

  /**
   * @param {*} media 
   * @returns {Promise<Media>}
   */
  async Upload(media) {
    let data = new FormData({
      maxDataSize: 7999999
    });
    data.append("media", media);
    let res = await this.Client.HTTPManager.Axios.post(
      `/v1/media/upload`,
      data,
      {
        responseType: "json"
      }
    );
    if (!res.data.ok) throw new Error(res.data.error);

    return await this.Fetch(res.data.data.Id);
  }

  Destroy() {
    this.Cache.clear();
  }
}