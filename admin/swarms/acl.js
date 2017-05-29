/**
 * Created by ciprian on 30.01.2017.
 */


var aclSwarm = {
    add:function(rule){
        this.rule = rule;
        this.swarm('addNewRule');
    },
    addNewRule:{
        node:"UsersManager",
        code : function (){
            var self = this;
            addRule(this.rule,true,S(function(err,result){
                if(err){
                    self.err = err.message;
                    self.home("failed");
                }else{
                    self.result = result;
                    self.home("ruleAdded");
                }

            }));
        }
    },
    remove:function(rule){
        this.rule = rule;
        this.swarm('removeRule');
    },
    removeRule:{
        node:"UsersManager",
        code: function() {
            var self = this;
            removeRule(this.rule,true,S(function(err,result){
                if(err){
                    self.err = err.message;
                    self.home("failed");
                }else{
                    self.result = result;
                    self.home("ruleRemoved");
                }

            }));
        }
    },
    update:function(rule){
        this.rule = rule;
        this.swarm('updateRule');
    },

    getAllRules:function(){
        this.swarm('getRules');
    },
    updateRule:{
        node:"UsersManager",
        code : function (){
            var self = this;
            getRuleById(self.rule.id,S(function(err,oldRule){
                if(err){
                    self.err = err.message;
                    self.home('failed');
                }
                removeRule(oldRule,true,S(function(err,result){
                    if(err){
                        self.err = err.message;
                        self.home("failed");
                    }else{
                        addRule(self.rule,true,S(function(err,result){
                            if(err){
                                self.err = err.message;
                                self.home("failed");
                            }else{
                                self.result = result;
                                self.home("ruleUpdated");
                            }
                        }));
                    }
                }));
            }))
        }
    },
    getRules:{
        node:"UsersManager",
        code : function (){
            var self = this;
            getRules(S(function(err,result){
                if(err){
                    self.err = err.message;
                    self.home("failed");
                }else{
                    self.result = result;
                    self.home("gotRules");
                }

            }));
        }
    },

    addNewUserZone:function(userId,zone){
        this.userId = userId;
        this.zone = zone;
        this.swarm('addUserZone')
    },
    addUserZone:{
        node:"UsersManager",
        code:function(){
            addZoneParent(this.userId,this.zone);
            self.home("userZoneAdded")
        }
    },

    delUserZone:function(userId,zone){
        this.userId = userId;
        this.zone = zone;
        this.swarm('removeZone');

    },
    delZone:{
        node:"UsersManager",
        code:function(){
            delZoneParent(this.userId,this.zone);
            self.home("userZoneDeleted")
        }
    }
};

aclSwarm;
