/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */

/*
 Cod Preluat din proiectul open source swam monitor. Nu e folosit momentan de
 */

var core = require ("swarmcore");
var os = require('os');
var winCPU = require('windows-cpu');

core.createAdapter("SystemAdapter");

var config = getMyConfig("SystemAdapter");

/**
 * System identification value.
 */
systemId = function() {
    return thisAdapter.systemId;
};

/**
 * Returns the hostname of the operating system.
 */
hostName = function() {
    return os.hostname();
};

/**
 * Returns the operating system name.
 */
systemType = function() {
    return os.type();
};

/**
 * Returns the operating system platform.
 */
platform = function() {
    return os.platform();
};

/**
 * Returns the operating system CPU architecture.
 */
architecture = function() {
    return os.arch();
};

/**
 * Returns the system uptime in seconds.
 */
uptime = function() {
    return os.uptime();
};

/**
 * Returns the total amount of system memory in bytes.
 */
totalMemory = function() {
    return os.totalmem();
};

/**
 * Returns the amount of free system memory in bytes.
 */
freeMemory = function() {
    return os.freemem();
};

/**
 * Returns an array of objects containing information about each CPU/core installed: 
 * model, speed (in MHz), and times (an object containing the number of milliseconds 
 * the CPU/core spent in: user, nice, sys, idle, and irq)
 */
cpus = function() {
    return os.cpus(); 
};


/**
 * Returns the list of cpu load in percent.
 * function(error, results) {}
 */
cpuLoad = function(callback) {
    if (os.platform() === 'win32') {
        winCPU.totalLoad(callback);
    } else {
        callback(null,100);
        //callback(new Error('OS Not supported.'),[]);
    }
};
