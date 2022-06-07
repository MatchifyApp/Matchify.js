const axios = require('axios').default;
const _ = require("lodash");

module.exports = class HTTPManager {
  
  /**
   * @param {import("../client/Client").Client} client 
   */
  constructor (client) {
    this.Client = client;
    
    this.RequestCache = [];

    this._Throttle = _.throttle(function() {
      let gonnaProcess = this.RequestCache.slice(0, this.RequestCache.length);
      let Methods = gonnaProcess.map((j, i) => ({Id: `${i}`, Name: j[0][0], Body: j[0][1] }));
      let response = await axios({
        method: "POST",
        url: `${this.Client.Options.Socket.url}/api/v1/methods`,
        headers: {
          "Content-Type": "application/json",
          ...(globalThis.navigator ? {} : { "User-Agent": this.Client._UserAgent })
        },
        data: JSON.stringify({
          Methods
        })
      });
      Object.entries(response.data.data.executed).forEach(([Id, Response]) => {
        let [resolve, reject] = gonnaProcess[Number(Id)][1];
        if (!Response.ok) return reject(new Error("API Error: " + Response.error));
        resolve(Response.data);
      });
    }, 200);
  }

  /**
   * @param {string} methodName 
   * @param {{[key:string]:any}?} data
   * @returns {Promise<any>} 
   */
  AwaitResponse(methodName, data = {}) {
    return new Promise((resolve, reject) => {
      this.RequestCache.push([[methodName, data], [resolve, reject]]);
      this._Throttle();
    });
  }
}