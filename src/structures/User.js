module.exports = class User {
  constructor (data) {
    if (data) this._Patch(data);
  }

  _Patch(data = {}) {
    this.CurrentPlaying = data.CurrentPlaying ?? this.CurrentPlaying ?? null;
    this.Id = data.Id ?? this.Id;
    this.Tag = data.Tag ?? this.Tag;
    this.Avatar = data.Avatar ?? this.Avatar;
    this.Banner = data.Banner ?? this.Banner;
    this.LikeCount = data.LikeCount ?? this.LikeCount ?? 0;
    this.FollowCount = data.FollowCount ?? this.FollowCount ?? 0;
    this.ShareCount = data.ShareCount ?? this.ShareCount ?? 0;
    this.CommentCount = data.CommentCount ?? this.CommentCount ?? 0;
    this.ListenedCount = data.ListenedCount ?? this.ListenedCount ?? 0;
    /** @type {Map<string, { Count: number, Genre: import("./Genre") }>} */
    this.Genres = data.Genres ?? this.Genres ?? new Map();
  }

}