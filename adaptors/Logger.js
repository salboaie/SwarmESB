/**
 * Created with JetBrains WebStorm.
 * User: sinica
 * Date: 6/8/12
 * Time: 10:52 PM
 * To change this template use File | Settings | File Templates.
 */

var thisAdaptor;

thisAdaptor = require('swarmutil').createAdaptor("Logger","localhost", 6379, "2214997C-D258-11E1-9F72-B01D6288709B");
/*
process.on('message', function(m){
     redisPort       = m.redisPort;
    thisAdaptor = require('swarmutil').createAdaptor("Logger",m.redisHost, m.redisPort, m.shardId);

});

*/
