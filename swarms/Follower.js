var follower = {
    vars:{
        resourceId:null,
        userId:null
    },
    ctorFollow:function (resourceId, userId) {
        this.resourceId = resourceId;
        this.userId = userId;
        this.swarm("doFollow");
    },
    ctorUnfollow:function (resourceId, userId) {
        this.resourceId = resourceId;
        this.userId = userId;
        this.swarm("doUnfollow");
    },
    doFollow:{
        node:"FollowerListService",
        code:function () {
            follow(this.resourceId, this.userId);
        }
    },
    doUnfollow: {
        node: "FollowerListService",
        code: function () {
            unFollow(this.resourceId, this.userId);
        }
    }
}

follower;