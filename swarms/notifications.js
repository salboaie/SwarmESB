var notificationsSwarming =
{
    meta:{
        name:"notifications.js"
    },
    vars:{
        debug:true
    },
    recordMessage:function(roomId,userId,date,message,objectId)
    {
        this.roomId     = roomId;
        this.userId     = userId;
        this.date       = date;
        this.message    = message;
        this.objectId   = objectId;
        this.swarm("recordMsg");
    },
    sendMessage:function(roomId,userId,date,message,objectId)
    {
        this.roomId     = roomId;
        this.userId     = userId;
        this.date       = date;
        this.message    = message;
        this.objectId   = objectId;
        this.swarm("sendMsg");
    },
    getPage:function(roomId, pageNumber, pageSize)
    {
        this.roomId     = roomId;
        this.pageNumber = pageNumber;
        this.pageSize   = pageSize;
        this.swarm("returnPage");
    },
    deleteRoomMessages:function(roomId)
    {
        this.roomId     = roomId;
        this.swarm("doClean");
    },
    deleteMessageById:function(roomId,objectId)
    {
        this.roomId     = roomId;
        this.objectId   = objectId;
        this.swarm("deleteMessage");
    },
    follow:function (roomId, userId)
    {
        this.roomId = roomId;
        this.userId = userId;
        this.swarm("doFollow");
    },
    doFollow:
    {
        node:"NotificationServices",
        code:function ()
        {
            follow(this.roomId, this.userId);
        }
    },
    recordMsg:{
        node:"NotificationServices",
        code : function ()
        {
            saveChatMessage(this.roomId,this.userId,this.date,this.message,this.objectId);
            this.swarm("notifyAll");
        }
    },
    sendMsg:{
        node:"NotificationServices",
        code : function ()
        {
            this.swarm("notifyAll");
        }
    },
    doClean:
    {
        node:"NotificationServices",
        code : function ()
        {
            cleanRoom(this.roomId);
        }
    },
    deleteMessage:
    {
        node:"NotificationServices",
        code : function ()
        {
            deleteMessageById(this.roomId,this.objectId);
            this.action = "deleteMessage";
            this.swarm("notifyAll");
        }
    },
    returnPage:
    {
        node:"NotificationServices",
        code : function ()
        {
            var resultHandler = function(pageArray){
                this.pageArray = pageArray;
                this.home("pageAnswer");
            }.bind(this);
            getPage(this.roomId,this.pageNumber,this.pageSize,resultHandler);
        }
    },
    notifyAll:
    {
        node:"NotificationServices",
        code : function (){
            cprint("notifyAll start");
            getFollowers(this.roomId, function(reply)
            {
                cprint("getFollowers start");
                for(var i=0;i<reply.length;i++)
                {
                    this.currentTargetUser = reply[i];
                    console.log("TO USER : "+this.currentTargetUser);
                    console.log(JSON.stringify(this));
                    this.toUser(this.currentTargetUser);
                }
                cprint("getFollowers end");
                this.home("notify");
            }.bind(this) );
            cprint("notifyAll end");
        }
    },
    notifyChatMessage:
    {
        node:"$client",
        code : null
    },
    pageAnswer:
    {
        node:"$client",
        code : null
    }
};

notificationsSwarming;