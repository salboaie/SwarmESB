/**
 * Created by salboaie on 8/14/15.
 * A redis relay allows executable choreographies between organisations
 * A relay is capable to
 *  - send messages between relays (organisations)
 *  - share files between relays (organisations)
 *
 *  All the communication inside of an organisations is still made using Redis pub/sub channels.
 *  The Redis server should not be made available outside of the organisations boundaries (and actually should be firewalled except from adapters)
 */



var psc = require("pubsubshare");
var transformations = require("transrest");

var program = require('commander');
var ha = require('https-auto');
var core = require("../../lib/SwarmCore.js");

program
    .version('1.0.1')
    .usage('[options] ')
    .option('-r,-redisHost <redis>', 'redis host name')
    .option('-p,-redisPort <port>', 'redis port')
    .option('-o,-relayPort <publicPort>', 'publicPort ex: 9000')
    .option('-f,-folder <folder>', 'keys folder')
    .option('-s,-share <share>', 'share folder')
    .option('-w,-passWord <passWord>', 'redis password')
    .option('-n,-orgName <orgName>', 'organization name')
    .parse(process.argv);


if (!program.RedisHost) {
    program.RedisHost = "127.0.0.1";
}

if (!program.RedisPort) {
    program.RedisPort = 6379;
}

if (!program.RelayPort) {
    program.RelayPort = 9000;
}

var swarmRedisConfig = process.env.SWARM_REDIS;
if (swarmRedisConfig) {
    var a = swarmRedisConfig.split(":");
    if (a.length == 2) {
        program.RedisHost = a[0];
        program.RedisPort = a[1];
    } else {
        console.log("Invalid SWARM_REDIS environment variable ", swarmRedisConfig);
    }
}

var code = process.env['HTTPS_AUTOCONFIG_CODE'];
if (!code && !program.OrgName) {
    //console.log(program);
    program.help();
    process.exit();
}

var baseFolder = process.env.SWARM_PATH;
if (!baseFolder) {
    baseFolder = "./";
}

var keysFolder = core.getSecretFolder();
var shareFolder = baseFolder + '/sharedFolder';
var organizationName = "OrganizationNotConfigured";
var httpsEnabled = true;
if (program.OrgName) {
    organizationName = program.OrgName;
    //httpsEnabled = false;
}
else {
    organizationName = ha.getOrganizationName(keysFolder);
}

console.log("Starting a redis relay for swarm communication between nodes. Relay port is: ", program.RelayPort);
var relay = psc.createRelay(httpsEnabled, organizationName, program.RedisHost, program.RedisPort, program.PassWord, '0.0.0.0', program.RelayPort, keysFolder, shareFolder, function (err, relay) {
    if (err) {
        console.log("Redis Relay error:", err);
        return;
    }


    thisAdapter = core.createAdapter("RedisChoreographyRelay");

    relay.doDispatch = function (redis, channel, message, callback) {
        console.log("Dispatching for", channel);
        try {
            thisAdapter.nativeMiddleware.dispatch(channel, JSON.parse(message), callback);
        } catch (err) {
            console.log("Invalid message from https server:", err.stack, message);
        }

        //redis.publish(channel, message, callback);
    }


    transformations.restAPI({
        getConfig: {
            method: 'get',
            params: ['tenantId', "configName"],
            path: '/getConfig/$tenantId/$configName',
            code: function (tenantId, configName) {
                return "Not Implemented yet..." + tenantId + configName;
            }
        },
        updateConfig: {
            method: 'put',
            params: ['tenantId', "configName",  "securityToken" , "__body"],
            path: '/updateConfig/$tenantId/$configName',
            code: function (tenantId, configName, securityToken, __body) {
                return "Not Implemented yet..." + tenantId + configName;
            }
        },
        getConfig: {
            method: 'get',
            params: ['tenantId', "configName"],
            path: '/getConfig/$tenantId/$configName',
            code: function (tenantId, configName) {
                return "Not Implemented yet..." + tenantId + configName;
            }
        },
        updateConfig: {
            method: 'put',
            params: ['tenantId', "configName",  "securityToken" , "__body"],
            path: '/updateConfig/$tenantId/$configName',
            code: function (tenantId, configName, securityToken, __body) {
                return "Not Implemented yet..." + tenantId + configName;
            }
        },
        getSignedFolder: {
            method: 'get',
            params: ['folderId'],
            path: '/getSignedFolder/$folderId',
            code: function (folderId) {
                return "Not Implemented yet..." + folderId;
            }
        },
        registerSignedFolder: {
            method: 'get',
            params: ['folderId', "securityToken"],
            path: '/registerSignedFolder/$folderId',
            code: function (path) {
                //..
                return folderId;
            }
        },
        registerGitRepositorySignedFolder: {
            method: 'post',
            params: ['gitUrl', "subFolder", "user", "password","securityToken"],
            path: '/registerGitRepositorySignedFolder/$gitUrl/$subFolder/$user$/$password/$securityToken',
            code: function (gitUrl, subFolder, user, password,securityToken) {
                //..
                return folderId;
            }
        }
    }, relay.server);
});

