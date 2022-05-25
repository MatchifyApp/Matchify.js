module.exports = class Album { 
  constructor (data) { 
    if (data) this._Patch(data);
  }

  _Patch(data = {}) { 
    /** @type {string} */
    this.Id = data.Id ?? this.Id;
    /** @type {string} */
    this.Name = data.Name ?? this.Name;
    /** @type {string} */
    this.Artwork = data.Artwork ?? this.Artwork;
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
    /** @type {Map<string, import("./Genre")>} */
    this.Genres = data.Genres ?? this.Genres ?? new Map();
    /** @type {Map<string, import("./User")>} */
    this.Listeners = data.Listeners ?? this.Listeners ?? new Map();
    /** @type {Map<string, import("./Artist")>} */
    this.Artists = data.Artists ?? this.Artists ?? new Map();
  }
}