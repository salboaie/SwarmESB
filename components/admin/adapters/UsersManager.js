/**
 * Created by salboaie on 3/24/15.
 */

/*
    Default UsersManager adapter. Punct de integrare cu alte sisteme, gen casa de sanatate.
*/
var core = require ("swarmcore");
/*
    usersmanager este un adaptor swarm care gestioneaza organizatiile si utilizatorii

 */

core.createAdapter("UsersManager");


var apersistence = require('apersistence');


var  container = require("safebox").container;

/*
 Default User model
 */

apersistence.registerModel("DefaultUser","Redis", {
    ctor: function () {
    },
    userId: {
        type: "string",
        pk: true,
        index:true
    },
    userName: {
        type: "string"
    },
    organisationId:{
        type:"string",
        index :"true"
    },
    password: {
        type: "string"
    },
    birthYear: {
        type: "string"
    },
    birthMonth: {
        type: "string"
    },
    birthDay: {
        type: "string"
    },
    sex: {
        type: "string"
    },
    phone: {
        type: "string"
    },
    email: {
        type: "string"
    },
    address: {
        type: "string"
    },
    city: {
        type: "string"
    },
    zip_code: {
        type: "string"
    }
});


/*
    Model de date pentru organizatie

 */

apersistence.registerModel("Organisation","Redis", {
    ctor: function () {
    },
    organisationId: {
        type: "string",
        pk: true,
        index:true
    },
    displayName: {
        type: "string"
    },
    agent:{             /* numele de grup al agentului */
        type:"string"
    }
});


/*
     Creeaza un utilizator
 */

createUser = function(userData, callback){
    if(!userData.userId){
        callback(new Error('Empty userId'));
        return;
    }
    var user = redisPersistence.lookup.async("DefaultUser", userData.userId);
    (function(user){
        if(!redisPersistence.isFresh(user)){
            callback(new Error("User with identical id " + userData.userId + " already exists"), null);
            return ;
        }
        for(var v in userData){
            user[v] =  userData[v];
        }
        redisPersistence.externalUpdate(user, userData);
        redisPersistence.save(user);
        if(callback)  {
            callback(null, user);
        }
    }).wait(user);
}

/*
    Sterge un utilizator
 */

deleteUser = function(userData){
    redisPersistence.deleteById("DefaultUser", userData.userId);
}

/*
    Sterge o organizatie
 */


deleteOrganisation = function(organisationId){
    redisPersistence.deleteById("Organisation", organisationId);
}

/*
    Updateaza informatiile unui utilizator
*/

updateUser = function(userJsonObj, callback){
    var user = redisPersistence.lookup.async("DefaultUser", userJsonObj.userId);
    (function(user){
        redisPersistence.externalUpdate(user, userJsonObj);
        redisPersistence.save(user);
        callback(null, user);
    }).swait(user);
}

/*
    queryUsers returneaza lista utilizatorilor apartinind de o organizatie
 */

queryUsers = function(organisationId, callback){
    var list  = redisPersistence.filter.async("DefaultUser", {"organisationId": organisationId});

    (function(list){
        callback(null,list);
    }).wait(list);
}

/*
    Creeaza o organizatie
 */

createOrganisation = function(organisationDump, callback){
    var organisation = redisPersistence.lookup.async("Organisation", organisationDump.organisationId);
    (function(organisation){
        if(!redisPersistence.isFresh(organisation)){
            callback(new Error("Organisation with identical id already exists"), null);
            return ;
        }
        redisPersistence.externalUpdate(organisation, organisationDump);
        redisPersistence.save(organisation);
        callback(null, organisation);
    }).swait(organisation);
}

/*
    Realizeaza salvarea datelor despre o organizatie
*/
updateOrganisation = function(organisationDump, callback){
    var organisation = redisPersistence.lookup.async("Organisation", organisationDump.organisationId);
    (function(organisation){
        redisPersistence.externalUpdate(organisation, organisationDump);
        redisPersistence.save(organisation);
        callback(null, organisation);
    }).swait(organisation);
}

/*
    Returneaza lista de organizatii
*/
getOrganisations = function(callback){
    var list  = redisPersistence.filter.async("Organisation", null);

    (function(list){
        callback(null,list);
    }).wait(list);
}



/*
    Returneaza informatii despre un utilizator
 */
getUserInfo = function(userId, callback){
    var user = redisPersistence.findById.nasync("DefaultUser", userId);
    (function(user){
            if(user){
                user.password = null;
            }
            callback(null, user);
    }).wait(user);
}


validPassword = function(userId, pass, callback){
    var user = redisPersistence.findById.async("DefaultUser", userId);
    (function(user){
        if(user && user.password  == pass){
            callback(null, true);
        } else {
            callback(null, false);
        }
    }).wait(user);
}

/*
    initialisation
 */
function bootSystem(){
    var organisation = redisPersistence.lookup.async("Organisation", "SystemAdministrators");
    (function(organisation){
        if(redisPersistence.isFresh(organisation)){
            organisation.displayName = "System Administrators";
            redisPersistence.save(organisation);
            createUser({userId:"admin", "password":"swarm"});
        }
    }).wait(organisation);
}


container.declareDependency("UsersManagerAdapter", ["redisPersistence"], function(outOfService, redisPersistence){
    if(!outOfService){
        console.log("Enabling persistence...", redisPersistence);
        bootSystem();
    } else {
        console.log("Disabling persistence...");
    }
})

