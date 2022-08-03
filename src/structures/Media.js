module.exports = class Media {
  constructor (data) {
    if (data) this._Patch(data);
  }

  _Patch(data = {}) {
    /** @type {string} */
    this.Id = data.Id ?? this.Id;
    /** @type {string} */
    this.Name = data.Name ?? this.Name;
    /** @type {import("./User")} */
    this.Owner = data.Owner ?? this.Owner;
    /** @type {Date} */
    this.At = data.At ?? this.At;
    /** @type {string} */
    this.ContentType = data.ContentType ?? this.ContentType;
    /** @type {number} */
    this.Size = data.Size ?? this.Size;
    /** @type {number?} */
    this.Width = data.Width ?? this.Width;
    /** @type {number?} */
    this.Height = data.Height ?? this.Height;
  }
}