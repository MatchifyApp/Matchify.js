module.exports = class RoomMessage {
  constructor (data) {
    if (data) this._Patch(data);
  }

  _Patch(data = {}) {
    /** @type {string} */
    this.Id = data.Id ?? this.Id;
    /** @type {string?} */
    this.Content = data.Content ?? this.Content;
    /** @type {import("./Media")?} */
    this.Media = data.Media ?? this.Media;
    /** @type {Date} */
    this.At = data.At ?? this.At;
    /** @type {import("./User")} */
    this.Owner = data.Owner ?? this.Owner;
    /** @type {import("./Room")} */
    this.Room = data.Room ?? this.Room;
  }
}