/**
 * Created by ciprian on 07.02.2017.
 */


require("acl-magic").enableACLChecker();

var container = require('safebox').container;

/*
 This file enables the global function checkAccess. The function has the following params:
 -contextType
 -contextValue
 -subcontextType
 -subcontextValue  ---- these 4 params indicate the resource to access (e.g. swarm/swarm1/ctor/ctor1)

 -action  ----- indicates the intended usage (e.g. read,write,execution)
 -zone    ----- the user that intends to access it ( or one of the user-zones he belongs to)
 -callback ----- is called with (err,hasRights) where hasRights is a boolean
 */

var useCheckAccess = global_swarmSystem_config.Core.checkAccess===true;
checkAccess = function () {
    var callback = arguments[arguments.length-1];
    callback(null,!useCheckAccess); //always return true if not using checkAccess
};


if(useCheckAccess) {
    container.declareDependency("checkAccess", ["aclChecker"], function (outOfService, aclChecker) {
        /*
         ACL CHECKER is a 'safe' dependency meaning that even if the database connection fails, one can still issue
         check calls which will be resolved once the connection reestablishes or will return error.
         */
        if(aclChecker) {
            checkAccess = function () {
                aclChecker.apply({}, arguments);
            }
        }
    });
}

