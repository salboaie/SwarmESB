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
        schema[name] = dbAdaptor.define(name, dao[name],
            {
                timestamps: false,
                paranoid: false,
                underscored: false,
                freezeTableName: true,
                tableName: name
            });
        delete dao[name];
    }
    //var dao = dbAdaptor.daoFactoryManager.getDAO(name);
    return schema[name];
}

processDbRequest = function (request, callback) {
    var schema = getSchema(request.className);
    var functionCall = global[request.type.toLowerCase() + "Call"];

    //TODO : return error callback
    if (!schema) {
        console.error("No schema found for " + request.className);
        //return;
    }
    if (!functionCall) {
        console.error("No function call found for " + request.type);
        //return;
    }

    try {
        functionCall(schema, request, callback);
    }
    catch (e) {
        console.error("Function call " + request.type + " error : " + e.toString());
        //TODO : return result
    }
}


/**********************************************************************************************
 * CRUD Functions : functionName.toLowerCase()+"Call"
 **********************************************************************************************/
getCall = function (schema, request, callback) {
    schema.find(request.id).success(function (result) {
        callback(result);
    });
}


putCall = function (schema, request, callback) {
    schema.build(request.data).save().success(function (result) {
        callback(result);
    });
}


updateCall = function (schema, request, callback) {
    //TODO:update object without getting from DB first
    schema.find(request.id).success(function (result) {
        for (var key in request.data) {
            result[key] = request.data[key];
        }
        result.save();
        callback(result);
    });
}


deleteCall = function (schema, request, callback) {
}


refreshCall = function (schema, request, callback) {
}


/**********************************************************************************************
 * Table Functions : functionName.toLowerCase()+"Call"
 **********************************************************************************************/


createCall = function (schema, request, callback) {
    isDaoRequest = false;
    registerDbModel(request.name, request.description, function (result, err) {
        callback(result, err);
    });
}


dropCall = function (schema, request, callback) {
    tableWatcher.dropTable(request.name, function (result, err) {
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