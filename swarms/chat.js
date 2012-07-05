
var addChatMsgSwarming =
{
    vars:{
        /*userId:false,
        date:null,
        message:null,
        roomId:null,
        */
        debug:"swarm1",
        action:null
    },
    ctorSave:function(roomId,userId,date,message,userFriendlyRoomName){
        this.userFriendlyRoomName = userFriendlyRoomName;
        this.roomId     = roomId;
        this.userId     = userId;
        this.date       = date;
        this.message    = message;
        this.swarm("recordMsg");
    },
    ctorGetPage:function(requester, roomId, pageNumber, pageSize){
        this.roomId     = roomId;
        this.pageNumber = pageNumber;
        this.pageSize   = pageSize;
        this.requester  = requester;
        this.swarm("getPage");
    },
    recordMsg:{
        node:"ChatPersistence",
        code : function (){
            saveChat(this.roomId,this.userId,this.date,this.message);
            this.swarm("notifyAll");
        }
    },
    getPage:{
        node:"ChatPersistence",
        code : function (){
            getPage(this.roomId,this.pageNumber,this.pageSize,function(pageArray){
                this.pageArray = pageArray;
                this.swarm("pageAnswer",this.requester);
            }.bind(this);
        }
    },
    notifyAll:{   //phase
        node:"FollowerListService",
        code : function (){
            var followers = getFollowers(this.roomId);
            for (var i in followers){
                this.currentTargetUser = i;
                if(i != this.userId){
                    this.swarm("directNotification",i);
                }
            }
        }
    },
    directNotification:{   //notify connected clients
        node:"ClientAdaptor",
        code : function (){
            var clientNodeName = this.findConnectedClientByUserId(this.currentTargetUser);
            if(clientNodeName){
                this.swarm("notifyChatMessage",clientNodeName);
            }
            /*else {
                this.swarm("mailNotification");
            }*/
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