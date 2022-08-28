module.exports = class User {
  constructor (data) {
    if (data) this._Patch(data);
  }

  _Patch(data = {}) {
    /** @type {{Track: import("./Track")?, At: Date}?} */
    this.CurrentPlaying = data.CurrentPlaying ?? this.CurrentPlaying ?? null;
    /** @type {string} */
    this.Id = data.Id ?? this.Id;
    /** @type {string} */
    this.Tag = data.Tag ?? this.Tag;
    /** @type {string} */
    this.Avatar = data.Avatar ?? this.Avatar;
    /** @type {string} */
    this.Banner = data.Banner ?? this.Banner;
    /** @type {number} */
    this.LikeCount = data.LikeCount ?? this.LikeCount ?? 0;
    /** @type {number} */
    this.FollowCount = data.FollowCount ?? this.FollowCount ?? 0;
    /** @type {number} */
    this.ShareCount = data.ShareCount ?? this.ShareCount ?? 0;
    /** @type {number} */
    this.CommentCount = data.CommentCount ?? this.CommentCount ?? 0;
    /** @type {number} */
    this.ListenedCount = data.ListenedCount ?? this.ListenedCount ?? 0;
    /** @type {number} */
    this.ActiveDevicesCount = data.ActiveDevicesCount ?? this.ActiveDevicesCount ?? 0;
    /** @type {Map<string, { Count: number, Genre: import("./Genre") }>} */
    this.Genres = data.Genres ?? this.Genres ?? new Map();
    /** @type {Map<string, { Name:string, Until:Date, At:Date }>} */
    this.Features = data.Features ?? this.Features ?? new Map();
  }

}