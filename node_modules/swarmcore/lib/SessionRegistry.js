
function SessionsRegistry(){
    var sessionsToOutlets   = {};
    var outletsToSessions   = {};
    var usersToOutlets      = {};

    this.registerOutlet = function (outlet){
        var sessionId   = outlet.getSessionId();
        var userId      = outlet.getUserId();
        var outletId    = outlet.getOutletId();

        if(!sessionId || !outletId){
            logger.logError("Wrong outlet trying to be registered " + J(outlet) + "\n sessionId, userId and outletId are mandatory not null");
            return ;
        }
        if(!sessionsToOutlets[sessionId]){
            sessionsToOutlets[sessionId] = {};
        }
        sessionsToOutlets[sessionId][outletId] = outlet;

        if(!outletsToSessions[outletId]){
            sessionsToOutlets[outletId] = sessionId;
        } else {
            logger.logError("Outlet " + outletId + " hijacked by another session?... What happens?");
        }

        if(userId){
            if(!usersToOutlets[userId]){
                usersToOutlets[userId] = {};
            }
            usersToOutlets[userId][outletId] = outlet;
        }
    }

    this.findOutlet = function(sessionId, outletId){
        if(sessionsToOutlets[sessionId]){
            return sessionsToOutlets[sessionId][outletId];
        }
        return null;
    }


    this.findOutletsForSession = function(sessionId){
        if(sessionsToOutlets[sessionId]){
            return sessionsToOutlets[sessionId];
        }
        return null;
    }

    this.findOutletsForUser = function(userId){
        if(usersToOutlets[userId]){
            return usersToOutlets[userId];
        }
        return null;
    }

    this.disableOutlet = function(outletId){
        var outlet = this.findOutletById(outletId);
        forDeletion[outletId] = outlet;
    }

    var temporarily = {};
    var forDeletion = {};



    this.findOutletById = function(outletId){
        var outlet = temporarily[outletId];
        if(!outlet){
            var sessionId = outletsToSessions[outletId];
            if(sessionId){
                outlet = sessionsToOutlets[sessionId][outletId];
            }
        }
        return outlet;
    }




    this.getTemporarily = function(outletId){
        return temporarily[outletId];
    }

    this.addTemporarily  = function(outlet){
        temporarily[outlet.getOutletId()] = outlet;
    }
}

var currentRegistry = new SessionsRegistry();

exports.getRegistry = function(){
    return currentRegistry;
}