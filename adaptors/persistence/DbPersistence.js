/**********************************************************************************************
 * Init
 **********************************************************************************************/
thisAdaptor = require('swarmutil').createAdapter("DbPersistence");


/**********************************************************************************************
 * Vars
 **********************************************************************************************/
var fs = require('fs');
var FileWatcher = require("./FileWatcher.js");
var TableWatcher = require("./TableWatcher.js");
var dbFactory = require("./DbFactory.js");
var schema = {};
var dao = {};
var config;
var isDaoRequest = false;
var fileWatcher, tableWatcher;


/**********************************************************************************************
 * Functions
 **********************************************************************************************/
init();

function init() {
    config = getMyConfig();
    dbAdaptor = dbFactory.getDbAdapter(config);
    tableWatcher = new TableWatcher(dbAdaptor);
    fileWatcher = new FileWatcher(thisAdaptor.nodeName);
    //TODO : compact changes from scanComplete with on runtime changes
    fileWatcher.on('changes', schemaChanges);
    fileWatcher.on('scanComplete', allFilesDone);
    fileWatcher.run(config.schema);
}

function schemaChanges(files) {
    loadFiles(files, false);
}

function allFilesDone(files) {
    loadFiles(files, true);
}

function loadFiles(files, isDAO) {
    var key, file;
    for (key in files) {
        file = files[key];
        loadFile(file.path, isDAO)
    }
}

function loadFile(path, isDAO) {
    fs.readFile(path, function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        try {
            isDaoRequest = isDAO;
            eval(data.toString());
            isDaoRequest = false;
        }
        catch (e) {
            isDaoRequest = false;
        }
    });
}

function registerDbModel(name, modelConfig, callback) {
    if (isDaoRequest === false) {
        tableWatcher.createOrUpdateTable(name, modelConfig, function (result, err) {
            if (err) {
                console.log('Error updating table :' + name);
            }
            callback(result, err);
        });
    }
    registerDAO(name, modelConfig);
}

function registerDAO(name, config) {
    dao[name] = tableWatcher.getDaoColumns(config);
}

function getSchema(name) {
    if (dao[name]) {
        var tableDao = dao[name];
        dao[name] = null;
        delete dao[name];
        schema[name] = dbAdaptor.define(name, tableDao,
            {
                timestamps: false,
                paranoid: false,
                underscored: false,
                freezeTableName: true,
                tableName: name
            });
    }
    //var dao = dbAdaptor.daoFactoryManager.getDAO(name);
    return schema[name];
}


/**********************************************************************************************
 * CRUD Functions : functionName.toLowerCase()+"Call"
 **********************************************************************************************/
getCall = function (tableName, id, callback) {
    var schema = getSchema(tableName);
    schema.find(id).success(function (result) {
        callback(result);
    });
}


putCall = function (tableName, data, callback) {
    var schema = getSchema(tableName);
    schema.build(data).save().success(function (result) {
        callback(result);
    });
}


updateCall = function (tableName, id, data, callback) {
    var schema = getSchema(tableName);
    //TODO:update object without getting from DB first
    schema.find(id).success(function (result) {
        for (var key in data) {
            result[key] = data[key];
        }
        callback(result);
        result.save();
    });
}


deleteCall = function (tableName, id, callback) {
}


refreshCall = function (tableName, id, callback) {
}


queryCall = function (tableName, query, callback) {
    dbAdaptor.query(query).success(function (result) {
        callback(result);
    });
}


/**********************************************************************************************
 * Table Functions : functionName.toLowerCase()+"Call"
 **********************************************************************************************/
createCall = function (tableName, data, callback) {
    isDaoRequest = false;
    registerDbModel(tableName, data, function (result, err) {
        callback(result, err);
    });
}


dropCall = function (tableName, callback) {
    tableWatcher.dropTable(tableName, function (result, err) {
        callback(result, err);
    });
}


/**********************************************************************************************
 * Hack for compatibility with SwarmShape framework
 **********************************************************************************************/
shape = {
    registerModel: function (name, config) {
        registerDbModel(name, config, function (result, err) {
        });
    }
};