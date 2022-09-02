const LRUCache = require("lru-cache");

const Media = require("../structures/Media");
const FormData = require("form-data");

module.exports = class MediaManager {
  /**
   * 
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;

    this.Cache = new LRUCache({
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

    let res = await this.Client.HTTPManager.Axios.get(`/v1/media/${Id}/data.json`);
    let json = JSON.parse(res.data);
    if (!json.ok) throw new Error(json.error);

    let media = new Media({
      Id,
      Owner: await this.Client.UserManager.Fetch(json.data.OwnerId),
      At: new Date(json.data.InsertedAt),
      ...json.data
    });
    this.Cache.set(Id, media);
    return media;
  }

  /**
   * @param {string} Id 
   * @returns {Promise<true>}
   */
  async Delete(Id) {
    let res = await this.Client.HTTPManager.Axios.delete(`/v1/media/${Id}`);
    let json = JSON.parse(res.data);
    if (!json.ok) throw new Error(json.error);
    return json.ok;
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
        headers: {
          ...(this.Client.LocalUser?.Token ? { "Authorization": this.Client.LocalUser?.Token } : {})
        }
      }
    );
    let json = JSON.parse(res.data);
    if (!json.ok) throw new Error(json.error);

    return await this.Fetch(json.data.Id);
  }

  Destroy() {
    this.Cache.clear();
  }
}