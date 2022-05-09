module.exports = class User {
  constructor (data) {
    this.CurrentPlaying = null;
    if (data) this._Patch(data);
  }

  _Patch(data = {}) {
    this.Id = data.Id;
    this.Tag = data.Tag;
    this.Avatar = data.Avatar;
    this.Banner = data.Banner;
    this.LikeCount = data.LikeCount;
    this.FollowCount = data.FollowCount;
    this.ShareCount = data.ShareCount;
    this.CommentCount = data.CommentCount;
    this.ListenedCount = data.ListenedCount;
  }

}

module.exports = { User };