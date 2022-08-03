const { Axios } = require('axios');

module.exports = class HTTPManager {

  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;
    this.Axios = new Axios(client.Options.Managers.HTTP.Axios);
  }

  /**
   * @param {string} methodName 
   * @param {{[key:string]:any}?} data
   * @returns {Promise<any>} 
   */
  async AwaitResponse(methodName, data = {}) {
    let response = await this.Axios.post(
      `/v1/methods/${methodName}`,
      JSON.stringify(data),
      {
        headers: {
        "Content-Type": "application/json",
        "Authorization": this.Client.LocalUser?.Token
      },
    })
    if (!response.data.ok) throw new Error(`API Error: ${response.data.error} (${methodName}, ${JSON.stringify(data)})`);
    return response.data.data;
  }
}