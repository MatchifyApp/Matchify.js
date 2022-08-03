module.exports = class Room {
  constructor (data) {
    if (data) this._Patch(data);
  }

  _Patch(data = {}) {
    /** @type {string} */
    this.Id = data.Id ?? this.Id;
    /** @type {string} */
    this.Name = data.Name ?? this.Name;
    /** @type {Date} */
    this.At = data.At ?? this.At;
    /** @type {Date} */
    this.LastMessageAt = data.LastMessageAt ?? this.LastMessageAt;
    /** @type {Map<string, import("./User")>} */
    this.Members = data.Members ?? this.Members ?? new Map();
  }
}