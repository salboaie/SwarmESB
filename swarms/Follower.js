var follower = {
    vars:{
        resourceId:null,
        userId:null
    },
    follow:function (resourceId, userId) {
        this.resourceId = resourceId;
        this.userId = userId;
        this.swarm("doFollow");
    },
    unfollow:function (resourceId, userId) {
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
            unfollow(this.resourceId, this.userId);
        }
    }
}

follower;