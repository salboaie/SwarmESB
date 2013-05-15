/**********************************************************************************************
 * Init
 **********************************************************************************************/
thisAdaptor = require('swarmutil').createAdapter("DbPersistence");


/**********************************************************************************************
 * Vars
 **********************************************************************************************/
var config;
var dbFactory = require("./DbFactory.js");
var fileWatcher = require("./FileWatcher.js").init();
var tableWatcher = require("./TableWatcher.js").init();
var fs = require('fs');
var schema = {};
var dao = {};
var isDaoRequest = false;


/**********************************************************************************************
 * Functions
 **********************************************************************************************/
init();

function init() {
    config = getMyConfig();
    dbAdaptor = dbFactory.getDbAdapter(config);
    tableWatcher.init(dbAdaptor);
    fileWatcher.on('changes', schemaChanges);
    fileWatcher.on('allFilesDone', allFilesDone);
    fileWatcher.init(thisAdaptor.nodeName);
    //fileWatcher.deleteCache();
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
        }
    });
}

function registerDbModel(name, config) {
    if (isDaoRequest === false) {
        tableWatcher.compareModel(name, config);
    }
    registerDAO(name, config);
}

function registerDAO(name, config) {
    dao[name] = tableWatcher.getDAO(name, config);
}

function getSchema(name) {
    if (dao[name]) {
        schema[name] = dbAdaptor.define(name, dao[name],
            {timestamps: true,
                paranoid: true,
                underscored: false,
                freezeTableName: true,
                tableName: name});
        delete dao[name];
    }
    //var dao = dbAdaptor.daoFactoryManager.getDAO(name);
    return schema[name];
}

processDbRequest = function (request, callback) {
    var model = getSchema(request.className);
    switch (request.type) {
        case "DELETE":
            break;
        case "UPDATE":
            model.find(request.id).success(function (result) {
                var key;
                for (key in request.data) {
                    result[key] = request.data[key];
                }
                result.save();
                callback(result);
            });
            break;
        case "PUT":
            model.build(request.data).save().success(function (result) {
                model.find(result.id).success(function (result) {
                    callback(result);
                });
            });
            break;
        case "GET":
            model.find(request.id).success(function (result) {
                callback(result);
            });
            break;
    }
}


/**********************************************************************************************
 * Hack for compatibility
 **********************************************************************************************/
shape = {
    registerModel: function (name, config) {
        registerDbModel(name, config);
    }
};