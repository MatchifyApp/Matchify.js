module.exports = class Guild {
  constructor (data) {
    if (data) this._Patch(data);
  }

  _Patch(data = {}) {
    /** @type {string} */
    this.Id = data.Id ?? this.Id;
    /** @type {string} */
    this.Name = data.Name ?? this.Name;
    /** @type {string} */
    this.Icon = data.Icon ?? this.Icon;
    /** @type {import("./User")} */
    this.Owner = data.Owner ?? this.Owner;
    /** @type {string} */
    this.Banner = data.Banner ?? this.Banner;
    /** @type {string} */
    this.InviteCode = data.InviteCode ?? this.InviteCode;
    /** @type {number} */
    this.MemberCount = data.MemberCount ?? this.MemberCount ?? 0;
    /** @type {boolean} */
    this.IsActive = data.IsActive ?? this.IsActive ?? false;
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
    /** @type {Map<string, import("./User")>} */
    this.Listeners = data.Listeners ?? this.Listeners ?? new Map();
  }
}