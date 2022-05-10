module.exports = class Track {
  constructor (data) {
    if (data) this._Patch(data);
  }

  _Patch(data = {}) { 
    this.Id = data.Id ?? this.Id;
    this.Name = data.Name ?? this.Name;
    this.Duration = data.Duration ?? this.Duration ?? -1;
    this.Album = data.Album ?? this.Album;
    this.Artists = data.Artists ?? this.Artists ?? [];
    this.LikeCount = data.LikeCount ?? this.LikeCount ?? 0;
    this.FollowCount = data.FollowCount ?? this.FollowCount ?? 0;
    this.ShareCount = data.ShareCount ?? this.ShareCount ?? 0;
    this.CommentCount = data.CommentCount ?? this.CommentCount ?? 0;
    this.ListenedCount = data.ListenedCount ?? this.ListenedCount ?? 0;
    this.Genres = data.Genres ?? this.Genres ?? [];
    this.Listeners = data.Listeners ?? this.Listeners ?? [];
  }
}