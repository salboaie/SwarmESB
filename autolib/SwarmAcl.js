/*
    Provides an implementation for ACLs in swarms regarding:
    - permissions for an user to execute a specific swarm (ctor or phase)
    - permission for a specific user to read or modify a resources
    - roles

     Each resource identification (a string) can have one or more resourceGroups
     Each user can have one or more groups
     Each group can have one or more other groups


    Api:
        attachResourceGroup(resourceId, resourceGroup)
        allow(group, resourceGroup)

 */

var acl = require("acl-magic");



function SwarmACL(redisClient){

    var cache = acl.createCache(5*60*100); //5 minutes cache
    var persistence =  acl.createRedisPersistence(redisClient, cache);


    var defaultAllow = false;
    persistence.getProperty("defaultAllow", function(err, value){
        defaultAllow = value;
    }) ;

    var forbiddenExecution = acl.createConcern("SwarmExecutionControl");

    /*
        by default allow
     */
    var execution = acl.createConcern("SwarmExecutionControl",persistence,
        function(zone, resource, callback){
            dprint("Checking permissions for ", zone, resource);
        },
        function(zone, resource, callback){
            //if forbidden return false else return true
            forbiddenExecution.allow(zone, resource, function(err,res){
                if(res){
                    callback(null, false);
                } else {
                    callback(null, defaultAllow);
                }
            });
        }
    )

        function mkResourceKey(swarmName, phaseName){
            return swarmName+"/"+phaseName;
        }
        /*

         */
        this.allow = function(swarmName,ctorOrPhase, callback){
            var userId = getCurrentuser();
            return execution.allow(userId, mkResourceKey(swarmName, ctorOrPhase));
        }

        this.grant = function(role, swarmName, list){
            list.forall(function(element){
                execution.grant(role,mkResourceKey(swarmName, element))
            })
        }

        this.forbidden = function(role, swarmName, ctorList, list){
            forbiddenExecution.forall(function(element){
                execution.grant(role,mkResourceKey(swarmName, element))
            })
        }


        this.addRole = function(user, role){
            persistence.addZoneParent(user, role);
        }

        this.delRole = function(user, role){
            persistence.delZoneParent(user, role);
        }
}


registerResetCallback(function(){
    thisAdapter.nativeMiddleware.swarmACL = new SwarmACL(redisClient());
})

