//swarm to add followers or to un-follow a user for a room

var roomFollow = {
    vars:{
        roomId:null,
        userId:null,
        debug:true
    },
    follow:function (roomId, userId) {
        this.roomId = roomId;
        this.userId = userId;
        this.swarm("doFollow");
    },
    unfollow:function (roomId, userId) {
        this.roomId = roomId;
        this.userId = userId;
        this.swarm("doUnfollow");
    },
    clean:function (roomId) {
        this.roomId = roomId;
        this.swarm("doClean");
    },
    doFollow:{
        node:"ChatServices",
        code:function () {
            follow(this.roomId, this.userId);
        }
    },
    doUnfollow: {
        node: "ChatServices",
        code: function () {
            unfollow(this.roomId, this.userId);
        }
    },
    doClean: {
        node: "ChatServices",
        code: function () {
            cleanFollowers(this.roomId);
        }
    }
}

roomFollow;