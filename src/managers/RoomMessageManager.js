const QuickLRU = require("@lib/quick-lru");
const { quickMap } = require("async-and-quick");
const BasicEventEmitter = require("../lib/BasicEventEmitter");
const Room = require("../structures/Room");
const RoomMessage = require("../structures/RoomMessage");

module.exports = class RoomMessageManager {
  /**
   * 
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;
    this.Socket = client.SocketManager.Socket;

    this.Events = new BasicEventEmitter();

    this.Cache = new QuickLRU({
      ...client.Options.Managers.RoomMessage.LRU,
    });

    this.Socket.on("Room:Message:Create", async (data) => {
      let msg = await this.Import(data);
      msg.Room.LastMessageAt = new Date(data.InsertedAt);
      this.Events.emit("Create", msg);
    });

    this.Socket.on("Room:Message:Typing", async (data) => {
      this.Events.emit("Typing", {
        Owner: await this.Client.UserManager.Fetch(data.OwnerId),
        Room: await this.Client.RoomManager.Fetch(data.RoomId),
      });
    });
  }

  /**
   * 
   * @param {*} data 
   * @returns {Promise<RoomMessage>}
   */
  async Import(data) {
    let item = this.Cache.get(data.Id);
    if (item) return item;

    item = new RoomMessage({
      Id: data.Id,
      Content: data.Content,
      Media: data.MediaId ? await this.Client.MediaManager.Fetch(data.MediaId) : null,
      At: new Date(data.InsertedAt),
      Owner: await this.Client.UserManager.Fetch(data.OwnerId),
      Room: await this.Client.RoomManager.Fetch(data.RoomId)
    });
    this.Cache.set(data.Id, item);
    return item;
  }

  /**
   * @param {string} roomId 
   * @param {number} Offset 
   * @param {number} Limit 
   * 
   * @returns {Promise<RoomMessage[]>}
   */
  async FetchAll(roomId, Offset = 0, Limit = 100) {
    let data = await this.Client.AwaitResponse(
      "LocalUser:Rooms:Get:Messages",
      {
        Id: roomId,
        Offset,
        Limit
      },
      false
    );
    return await quickMap(data, async (i) => await this.Import(i));
  }

  /**
   * 
   * @param {string} roomId 
   * @param {string?} Content 
   * @param {string?} MediaId 
   */
  async Send(roomId, Content, MediaId) {
    let data = await this.Client.AwaitResponse(
      "LocalUser:Rooms:Send",
      {
        Id: roomId,
        Content,
        MediaId
      },
      false
    );

    return await this.Import(data);
  }

  Destroy() {
    this.Cache.clear();
  }
}