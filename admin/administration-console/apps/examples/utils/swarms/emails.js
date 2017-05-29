var emailsSwarming = {
    registerConversation: function(sender,receiver){
        this['sender'] = sender;
        this['receiver'] = receiver;
        this.swarm('register');
    },
    register: {
        node: "EmailAdapter",
        code: function () {
            var self = this;
            registerConversation(self.sender,self.receiver,S(function(err,newConversationUUID){
                if(err){
                    self.error = err;
                    console.log("Could not register conversation from "+self.sender+" to "+self.receiver+"\n",err);
                    self.home("Failed");
                }else{
                    self.conversationUUID = newConversationUUID;
                    self.home('conversationRegistered');
                }
            }))
        }
    },

    getConversation:function(conversationUUID){
        this['conversationUUID'] = conversationUUID;
        this.swarm('get');
    },
    get: {
        node: "EmailAdapter",
        code: function () {
            var self = this;
            getConversation(self.conversationUUID,S(function(err,requestedConversation){
                if(err ){
                    self.error = err;
                    self.home("Failed")
                }else if (!requestedConversation.sender || !requestedConversation.receiver){
                    self.error = new Error("Conversation "+self.conversationUUID+" does not exist");
                    self.home("Failed")
                } else
                {
                    self.conversation = requestedConversation;
                    self.swarm('getEmailsForConversation');
                }
            }))
        }
    },
    getEmailsForConversation:{
        node:"UsersManager",
        code:function(){
            var self = this;
            getUserEmail(self.conversation.receiver,S(function(err,email){
                if(err){
                    self.error = err;
                    console.log("User with id "+self.conversation.receiver+" could not be retrieved\n",err);
                    self.home("Failed");
                }else{
                    self.conversation.receiver = email;
                    getUserEmail(self.conversation.sender,S(function(err,email){
                        if(err){
                            self.error = err;
                            console.log("User with id "+self.conversation.sender+" could not be retrieved\n",err);
                            self.home("Failed");
                        }else{
                            self.conversation.sender = email;
                            self.home("gotConversation");
                        }}))
                }}));

            function getUserEmail(id,callback){
                /*
                 The conversation contains either an id or an email in both conversation.sender and conversation.receiver;
                 If it is an email, use the email;
                 If it is an id, use the associated email address (the email address of the user)
                 */
                var emailRegularExpression = "@";
                if(id.match(emailRegularExpression)){
                    callback(null,id);
                }else{
                    getUserInfo(id,S(function(err,user){
                        if(err){
                            callback(err);
                        }else{
                            callback(err,user.email)
                        }
                    }))
                }
            }
        }
    },

    removeConversation:function(conversationUUID){
        this['conversationUUID'] = conversationUUID;
        this.swarm('remove');
    },
    remove: {
        node: "EmailAdapter",
        code: function () {
            var self = this;
            removeConversation(self.conversationUUID,S(function(err,removalResult){
                if(err){
                    self.error = err;
                    self.home('Failed')
                }else{
                    self.result = removalResult;
                    self.home('conversationRemoved');
                }
            }))
        }
    },

    sendEmail:function(from,to,subject,content,swarmId){
        this['from'] = from;
        this['to'] = to;
        this['subject'] = subject;
        this['content'] = content;
        //Temporary until Sanica deals with the swarms
        if(swarmId) {
            this.meta['swarmId'] = swarmId;
        }
        this.swarm('prepareEmailDelivery');
    },
    prepareEmailDelivery:{
        node:"UsersManager",
        code:function(){
            var self = this;
            filterUsers({"email":self.to},S(function(err,users){
                if(err ){
                    self.error = err.message;
                    self.home("emailDeliveryUnsuccessful")
                }else if(users.length===0){
                    self['receiverId'] = self.to; //if sending emails to non-users
                }else{
                    self['receiverId'] = users[0].userId;
                }
                self.swarm("deliverEmail");
            }))
        }
    },
    deliverEmail:{
        node: "EmailAdapter",
        code: function () {
            var self = this;
            registerConversation(self.from,self.receiverId,S(function(err,conversationUUID) {
                if(err){
                    self.error = err.message;
                    self.home("emailDeliveryUnsuccessful");
                }else{
                    sendEmail(self['from'], conversationUUID+"@"+thisAdapter.config.Core.operandoHost, self['subject'], self['content'], S(function (err, deliveryResult) {
                        delete self['from'];
                        delete self['to'];
                        delete self['subject'];
                        delete self['content'];
                        delete self['receiverId'];
                        
                        if (err) {
                            self.error = err.message;
                            self.home('emailDeliveryUnsuccessful');
                        } else {
                            self.deliveryResult = deliveryResult;
                            self.home('emailDeliverySuccessful');
                        }
                    }))
                }
            }))
        }
    }
};

emailsSwarming;
