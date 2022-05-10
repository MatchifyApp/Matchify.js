module.exports = class Artist { 
  constructor (data) { 
    if (data) this._Patch(data);
  }

  _Patch(data = {}) {
    this.Id = data.Id ?? this.Id;
    this.Name = data.Name ?? this.Name;
    this.Image = data.Image ?? this.Image;
    this.Banner = data.Banner ?? this.Banner;
    this.LikeCount = data.LikeCount ?? this.LikeCount ?? 0;
    this.FollowCount = data.FollowCount ?? this.FollowCount ?? 0;
    this.ShareCount = data.ShareCount ?? this.ShareCount ?? 0;
    this.CommentCount = data.CommentCount ?? this.CommentCount ?? 0;
    this.ListenedCount = data.ListenedCount ?? this.ListenedCount ?? 0;
    this.Genres = data.Genres ?? this.Genres ?? [];
    this.Listeners = data.Listeners ?? this.Listeners ?? [];
  }
}