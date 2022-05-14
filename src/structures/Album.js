module.exports = class Album { 
  constructor (data) { 
    if (data) this._Patch(data);
  }

  _Patch(data = {}) { 
    this.Id = data.Id ?? this.Id;
    this.Name = data.Name ?? this.Name;
    this.Artwork = data.Artwork ?? this.Artwork;
    this.LikeCount = data.LikeCount ?? this.LikeCount ?? 0;
    this.FollowCount = data.FollowCount ?? this.FollowCount ?? 0;
    this.ShareCount = data.ShareCount ?? this.ShareCount ?? 0;
    this.CommentCount = data.CommentCount ?? this.CommentCount ?? 0;
    this.ListenedCount = data.ListenedCount ?? this.ListenedCount ?? 0;
    /** @type {Map<string, import("./Genre")>} */
    this.Genres = data.Genres ?? this.Genres ?? new Map();
    /** @type {Map<string, import("./User")>} */
    this.Listeners = data.Listeners ?? this.Listeners ?? new Map();
  }
}