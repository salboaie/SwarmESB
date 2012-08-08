
var addChatMsgSwarming =
{
    vars:{
        userId:false,
        date:null,
        message:null,
        roomId:null,
        debug:"true1",
        debugSwarm:"true1",
        action:null
    },
    ctorNewMessage:function(roomId,userId,date,message,userFriendlyRoomName){
        this.userFriendlyRoomName = userFriendlyRoomName;
        this.roomId     = roomId;
        this.userId     = userId;
        this.date       = date;
        this.message    = message;
        this.swarm("recordMsg");
    },
    ctorGetPage:function(roomId, pageNumber, pageSize){
        this.roomId     = roomId;
        this.pageNumber = pageNumber;
        this.pageSize   = pageSize;
        this.swarm("getPage");
    },
    recordMsg:{
        node:"ChatPersistence",
        code : function (){
            saveChatMessage(this.roomId,this.userId,this.date,this.message);
            this.swarm("notifyAll");
        }
    },
    getPage:{
        node:"ChatPersistence",
        code : function (){
            var f = function(pageArray){
                this.pageArray = pageArray;
                this.swarm("pageAnswer",this.sessionId);
            }.bind(this);
            getPage(this.roomId,this.pageNumber,this.pageSize,f);
        }
    },
    notifyAll:{   //phase
        node:"FollowerListService",
        code : function (){
            getFollowers(this.roomId, function(reply)
            {
                for(var i=0;i<reply.length;i++) {
                    this.currentTargetUser = reply[i];
                        this.swarm("directNotification");
                }
            }.bind(this) );
        }
    },
    directNotification:{   //notify connected clients
        node:"ClientAdapter",
        code : function (){
            var clientSessionId = findConnectedClientByUserId(this.currentTargetUser);
            this.swarm("notifyChatMessage",clientSessionId);
        }
    },
    notifyChatMessage:{ //notify different clients about a new chat message
        node:"$client",
        code : null
    },
    pageAnswer:{        //return a page on a client
        node:"$client",
        code : null
    },
    mailNotification:{   //phase executed on connected clients that are following a room and should get notified about a new chat message
        node:"mailNotificator",
        code : function (){
            //this.scheduleNotification("1d",this.roomId,"New chat message for " + this.userFriendlyRoomName);
        }
    }
};

addChatMsgSwarming;