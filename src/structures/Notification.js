module.exports = class Notification {
  constructor (data) {
    if (data) this._Patch(data);
  }

  _Patch(data = {}) {
    /** @type {string} */
    this.Id = data.Id ?? this.Id;
    /** @type {string} */
    this.Type = data.Type ?? this.Type;
    /** @type {object} */
    this.Data = data.Data ?? this.Data;
    /** @type {import("./User")} */
    this.User = data.User ?? this.User;
    /** @type {Date} */
    this.At = data.At ?? this.At;
    /** @type {boolean} */
    this.Seen = data.Seen ?? this.Seen;
    /** @type {boolean} */
    this.Silent = data.Silent ?? this.Silent;
  }
}