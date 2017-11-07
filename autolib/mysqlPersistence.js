var mysql = require('mysql');
var container = require('safebox').container;
var apersistence = require('apersistence');

var connectionSettings = {
	"host": "localhost",
	"port": "3306",
	"user": "root",
	"password": "",
	"database": "swarm",
	"connectionLimit": 2
};

if(thisAdapter.config.Core && thisAdapter.config.Core.mysqlConfig){
	connectionSettings = thisAdapter.config.Core.mysqlConfig;
}

var mysqlConnection = mysql.createPool(connectionSettings);
container.resolve('mysqlConnection', mysqlConnection);

container.declareDependency("mysqlPersistence", ['mysqlConnection'], function (outOfService, mysqlConnection) {
	if (outOfService) {
		console.log("MySQL persistence failed");
	} else {
		console.log("Initialising MySQL persistence");
		return apersistence.createMySqlPersistence(mysqlConnection);
	}
});
