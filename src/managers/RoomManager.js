const LRUCache = require("lru-cache");

const { quickMap } = require("async-and-quick");
const BasicEventEmitter = require("../lib/BasicEventEmitter");
const Room = require("../structures/Room");
const RoomMessageManager = require("./RoomMessageManager");

module.exports = class RoomManager {
  /**
   * 
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;
    this.Socket = client.SocketManager.Socket;

    this.Events = new BasicEventEmitter();

    this.Cache = new LRUCache({
      ...client.Options.Managers.Room.LRU,
    });

    this.Socket.on("Room:Create", async (data) => {
      this.Events.emit("Create", await this.Import(data));
    });

    this.Socket.on("Room:Delete", (roomId) => {
      this.Events.emit("Delete", roomId);
      this.Cache.delete(roomId);
    });

    this.MessageManager = new RoomMessageManager(client);
  }

  /**
   * @param {string} Id 
   * @returns {Promise<Room>}
   */
  async Fetch(Id) {
    let data = await this.Client.AwaitResponse("LocalUser:Rooms:Get", { Id });
    return await this.Import(data);
  }

  /**
   * @param {string} Id 
   * @param {number} Offset 
   * @param {number} Limit 
   * @returns {Promise<Room[]>}
   */
  async FetchByMember(Id, Offset=0, Limit=50) {
    let data = await this.Client.AwaitResponse("LocalUser:Rooms:Get:By:Member", {
      Id,
      Offset,
      Limit
    });
    return await quickMap(data, async (i) => await this.Import(i));
  }

  /**
   * @returns {Promise<Room[]>}
   */
  async FetchAll(Offset = 0, Limit = 50) {
    let data = await this.Client.AwaitResponse("LocalUser:Rooms:Get:All", { 
      Offset,
      Limit
    });
    return await quickMap(data, async (i) => await this.Import(i));
  }

  async Import(data) {
    let item = this.Cache.get(data.Id);
    if (item) return item;

    item = new Room({
      Name: data.Name,
      Id: data.Id,
      Members: new Map(
        (await quickMap(data.Members, async (i) => await this.Client.UserManager.Fetch(i)))
          .map(j => [j.Id, j])
      ),
      LastMessageAt: new Date(data.LastMessageAt),
      At: new Date(data.InsertedAt)
    });

    this.Cache.set(data.Id, item);
    return item;
  }

  /**
   * @param {string} withWhoId
   * @param {Promise<Room>}
   */
  async Create(withWhoId) {
    let data = await this.Client.AwaitResponse("LocalUser:Rooms:Create", {
      Id: withWhoId
    });
    return await this.Fetch(data.Id);
  }

  /**
   * @param {string} roomId
   * @param {Promise<Room>}
   */
  async Delete(roomId) {
    let data = await this.Client.AwaitResponse("LocalUser:Rooms:Delete", {
      Id: roomId
    });
    return data;
  }

  Destroy() {
    this.Cache.clear();
    this.MessageManager.Destroy();
  }
}