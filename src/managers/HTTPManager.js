const axios = require('axios').default;

module.exports = class HTTPManager {
  
  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;
  }

  /**
   * @param {string} methodName 
   * @param {{[key:string]:any}?} data
   * @returns {Promise<any>} 
   */
  async AwaitResponse(methodName, data = {}) {
    let response = await axios({
      method: "POST",
      url: `${this.Client.Options.Socket.url}/api/v1/methods/${methodName}`,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": this.Client._UserAgent
      },
      data: JSON.stringify(data)
    })
    if (!response.data.ok) throw data.error;
    return x.data;
  }
}