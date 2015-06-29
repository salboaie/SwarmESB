var acl = require("../lib/acl.js");

var assert  = require('assert');

/*
    create persistence to store relations between resources and between security zones
*/
var persistence =  acl.createMemoryPersistence();
/*
 - create an concern regarding write rights on some resources
 - zone  "root" have full access everywhere by default. A zone can be a user, a role, a group... your choise
*/
var writeConcern = acl.createConcern("write", persistence, function(zoneId, resourceId, callback){
    if(zoneId == "root"){
        callback(null, true);
    } else {
        callback(null, false);
    }
});

var counter = 0 ;

/*
    add persistently  role_1 to user_1
*/
persistence.addZoneParent("user_1", "role_1");

persistence.loadZoneParents("user_1", function(err, res){
    assert.equal(res[0], "user_1");
    assert.equal(res[1], "role_1");
    counter++;
});


/*
    add persistently  role_2 to user_2
*/
persistence.addZoneParent("user_2", "role_2");

/*
    make admin zone as parent to  role_1. 
    role_1 should inherit all the rights from admin zone 
*/
persistence.addZoneParent("role_1", "admin");

/*
  retrive all access zones for  user_1. Normally you don't use this function
*/
persistence.loadZoneParents("user_1", function(err, res){
    assert.equal(res[0], "user_1");
    assert.equal(res[1], "role_1");
    assert.equal(res[2], "admin");
    counter++;
});

/* make zone role_2 a subzone in user zone*/
persistence.addZoneParent("role_2", "user");

/* ..add more parents */
persistence.addResourceParent("r_1", "m_1");
persistence.addResourceParent("r_1", "f_1");
persistence.addResourceParent("r_2", "m_1");
persistence.addResourceParent("r_2", "m_2");

/*
  grant in the write concern, rights for m_1 to zone "admin"
*/
writeConcern.grant("admin", "m_1");

writeConcern.allow("user_1", "r_1", function(err, res){
        assert.equal(res, true);
        counter++;
});

writeConcern.allow("user_2", "r_2", function(err, res){
    assert.equal(res, false);
    counter++;

    persistence.addResourceParent("m_2", "g_x");
    writeConcern.grant("user", "g_x");

    writeConcern.allow("user_2", "r_2", function(err, res){
        assert.equal(res, true);
        counter++;
    });
});

writeConcern.grant("user_1", "ggf");
writeConcern.allow("user_1", "ggf", function(err, res){
    assert.equal(res, true);
    counter++;
});

/*
 readConcern is modeled to also check for write acces. if you got write, automatically you get also read access
*/
var readConcern = acl.createConcern("read", persistence, null, function(zoneId, resourceId, callback){
    var allow = writeConcern.allow.async(zoneId,resourceId);
    (function(allow){
        callback(null, allow);
    }).wait(allow);
});


readConcern.allow("root", "ggm", function(err, res){
    assert.equal(res, true);
    counter++;
});


readConcern.allow("user_1", "ggm", function(err, res){
    assert.equal(res, false);
    counter++;
    /* grant to write concern wand should allow access also to read concern*/
    writeConcern.grant("user_1", "ggm");
    readConcern.allow("user_1", "ggm", function(err, res) {
        assert.equal(res, true);
        counter++;
    });
});


setTimeout(function(){
    assert.equal(counter, 9);
    console.log("Success!");
}, 1000);
