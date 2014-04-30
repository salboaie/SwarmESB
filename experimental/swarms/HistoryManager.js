var historyManagerSwarming =
{
    meta:{
        name:"HistoryManager.js"
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
    getPage:function(roomId, start, end)
    {
        this.roomId     = roomId;
        this.start      = start;
        this.end        = end;
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
        node:"HistoryManager",
        code:function ()
        {
            follow(this.roomId, this.userId);
        }
    },
    recordMsg:{
        node:"HistoryManager",
        code : function ()
        {
            saveChatMessage(this.roomId,this.userId,this.date,this.message,this.objectId);
            this.swarm("notifyAll");
        }
    },
    sendMsg:{
        node:"HistoryManager",
        code : function ()
        {
            this.swarm("notifyAll");
        }
    },
    doClean:
    {
        node:"HistoryManager",
        code : function ()
        {
            cleanRoom(this.roomId);
        }
    },
    returnPage:
    {
        node:"HistoryManager",
        code : function ()
        {
            var resultHandler = function(pageArray){
                this.pageArray = pageArray;
                this.home("pageAnswer");
            }.bind(this);
            getPage(this.roomId,this.start,this.end,resultHandler);
        }
    },
    notifyAll:
    {
        node:"HistoryManager",
        code : function (){
            getFollowers(this.roomId, function(reply)
            {
                for(var i=0;i<reply.length;i++)
                {
                    this.currentTargetUser = reply[i];
                    this.toUser(this.currentTargetUser);
                }
                this.home("notify");
            }.bind(this) );
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

historyManagerSwarming;