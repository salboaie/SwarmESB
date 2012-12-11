var notificationsSwarming =
{
    meta:{
        name:"notifications.js"
    },
    vars:{
        debug:false
    },
    recordMessage:function(roomId,userId,date,message)
    {
        this.roomId     = roomId;
        this.userId     = userId;
        this.date       = date;
        this.message    = message;
        this.swarm("recordMsg");
        this.honey("notify");
    },
    sendMessage:function(roomId,userId,date,message)
    {
        this.roomId     = roomId;
        this.userId     = userId;
        this.date       = date;
        this.message    = message;
        this.swarm("sendMsg");
        this.honey("notify");
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
            saveChatMessage(this.roomId,this.userId,this.date,this.message);
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
    returnPage:
    {
        node:"NotificationServices",
        code : function ()
        {
            var resultHandler = function(pageArray){
                this.pageArray = pageArray;
                this.swarm("pageAnswer",this.currentSession());
            }.bind(this);
            getPage(this.roomId,this.pageNumber,this.pageSize,resultHandler);
        }
    },
    notifyAll:
    {
        node:"NotificationServices",
        code : function (){
            getFollowers(this.roomId, function(reply)
            {
                for(var i=0;i<reply.length;i++)
                {
                    this.currentTargetUser = reply[i];
                    this.swarm("directNotification");
                }
            }.bind(this) );
        }
    },
    directNotification:
    {
        node:"ClientAdapter",
        code : function ()
        {
            var clientSessionId = findConnectedClientByUserId(this.currentTargetUser);
            this.swarm("notifyChatMessage",clientSessionId);
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