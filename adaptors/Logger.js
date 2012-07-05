/**
 * Created with JetBrains WebStorm.
 * User: sinica
 * Date: 6/8/12
 * Time: 10:52 PM
 * To change this template use File | Settings | File Templates.
 */

var thisAdaptor;

process.on('message', function(m){
     redisPort       = m.redisPort;
    thisAdaptor = require('swarmutil').createAdaptor("Logger",m.redisHost, m.redisPort);
});


