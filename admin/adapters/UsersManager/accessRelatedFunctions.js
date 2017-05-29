/**
 * Created by ciprian on 3/23/17.
 */
var container = require('safebox').container;
var flow = require('callflow');
var fundamentalRules = [
    {
        "contextType": "swarm",
        "context": "login.js",
        "zone": "NO_USER",
        "action": "execution",
        "type":"white_list"
    },
    {
        "contextType": "swarm",
        "context": "acl.js",
        "zone": "NO_USER",
        "action": "execution",
        "type":"white_list"
    },
    {
        "contextType": "swarm",
        "context": "UserInfo.js",
        "subcontextType":"ctor",
        "subcontextValue":"resetPassword",
        "zone": "NO_USER",
        "action": "execution",
        "type":"white_list"
    },
    {
        "contextType": "swarm",
        "context": "emails.js",
        "zone": "emailServer",
        "action": "execution",
        "type":"white_list"
    },
    {
        "contextType": "swarm",
        "context": "identity.js",
        "zone": "emailServer",
        "subcontextType":"ctor",
        "subcontextValue":"getRealEmail",
        "action": "execution",
        "type":"white_list"
    }
];

require('acl-magic').enableACLConfigurator();



container.declareDependency("accessFunctionality",['aclConfigurator','userRelatedTypes'],function(outOfService,aclConfigurator,types){
    if(!outOfService){
        exports.addRule = aclConfigurator.addRule;
        exports.removeRule = aclConfigurator.removeRule;
        exports.getRules = function(callback){
            aclConfigurator.getRules(function(err,rules){
                if(err){
                    callback(err);
                }else{
                    callback(undefined,fundamentalRules.concat(rules));
                }
            })
        };
        exports.addZoneParent = aclConfigurator.addZoneParent;
        exports.delZoneParent = aclConfigurator.delZoneParent;
        exports.getRuleById = aclConfigurator.getRuleById;


        aclConfigurator.flushExistingRules(function(err,result) {
            if(err){
                console.log("WARNING:An error occurred while flushing the existing acl rules!");
                console.log(err.message);
            }

            init(function (err, result) {
                if (err) {
                    console.log("Could not provide access-related functionality");
                    container.outOfService("AccessAdapter");
                } else {
                    console.log("Access-related functionality is available in UsersManager");
                    container.resolve("accessFunctionality",exports);
                }
            });
        })
        return null;

    }else{
        console.log("AccessAdapter is not available");
    }
});


function init(callback){
    flow.createFlow('initAccessFunctionality',{
        begin:function(){
            this.errs = [];
            exports.getRules(this.continue('gotAllRules'))
        },
        gotAllRules:function(err,persistedRules){
            if(err){
                callback(err);
            }else{
                var self = this;

                fundamentalRules.forEach(function(rule){
                    exports.addRule(rule,false,self.continue('ruleLoaded'));
                });
                persistedRules.forEach(function(rule){
                    exports.addRule(rule,false,self.continue('ruleLoaded'));
                });
            }
        },
        ruleLoaded:function(err,res){
            if(err){
                this.errs.push(err);
            }
        },
        end:{
            join:"ruleLoaded",
            code:function(){
                if(this.errs.length>0){
                    callback(this.errs);
                }else{
                    callback();
                }
            }
        }
    })()
}