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
        
      }
    });
  }
  
  async Fetch(trackId) {

  }
}