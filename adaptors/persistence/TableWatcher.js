/**********************************************************************************************
 * Vars
 **********************************************************************************************/
//var util = require('util');
//var events = require('events');
//var os = require('os');
var fs = require('fs');

/*
 Sequelize.STRING  // VARCHAR(255)
 Sequelize.TEXT    // TEXT
 Sequelize.INTEGER // INTEGER
 Sequelize.BIGINT  // BIGINT
 Sequelize.DATE    // DATETIME
 Sequelize.BOOLEAN // TINYINT(1)
 Sequelize.FLOAT   // FLOAT

 Sequelize.ENUM('value 1', 'value 2') // An ENUM with allowed values 'value 1' and 'value 2'
 Sequelize.DECIMAL(10, 2)             // DECIMAL(10,2)
 Sequelize.ARRAY(Sequelize.TEXT)      // Defines an array. PostgreSQL only.
 */

// 'client':'server'
var dataTypes = {
    'string': 'VARCHAR(255)',
    'text': 'TEXT',
    'int': 'INTEGER',
    'number': 'BIGINT',
    'date': 'DATETIME',
    'boolean': 'TINYINT(1)',
    'float': 'FLOAT',
    'collection': 'TEXT'
};

// 'client':'server'
var keywords = {
    'value': 'defaultValue',
    'allowNull': 'allowNull',
    'unique': 'unique',
    'autoIncrement': 'autoIncrement',
    'primaryKey': 'primaryKey'
};


/**********************************************************************************************
 * Functions
 **********************************************************************************************/
var TableWatcher = function () {
    var dbAdapter;
    var queryAdapter;
    var compareQueue = {};

    this.init = function (dataBaseAdapter) {
        dbAdapter = dataBaseAdapter;
        queryAdapter = dataBaseAdapter.getQueryInterface();
    }

    this.compareModel = function (name, config) {
        queryAdapter.describeTable(name).success(
            function (data) {
                compareQueue[name] = {db: data, config: config};
                compareTables();
            }).error(function (error) {
                if (error.code == 'ER_NO_SUCH_TABLE') {
                    console.log(name + ' not exists.');
                    compareQueue[name] = { db: null, config: config};
                    compareTables();
                }
            });
    }

    function compareTables() {
        for (var key in compareQueue) {
            var result = compareQueue[key];
            delete compareQueue[key];
            compareTable(key, result);

        }
    }

    this.getDAO = function (modelName, config) {
        var changes = {};
        var column;
        var key;

        for (key  in config) {
            column = config[key];
            if (!isColumnValid(key, column)) {
                continue;
            }
            changes[key] = addColumn(key, column);
            changes[key].tableName = modelName;
        }

        if (!changes['id']) {
            changes['id'] = createIdColumn('id', {});
        }

        var newCmds = {};
        for (var key in changes) {
            var c = changes[key];
            newCmds[c.name] = c.data;
        }

        return newCmds;
    }

    function compareTable(modelName, config) {
        var changes = {};
        var dbConfig = config.db;
        var clientConfig = config.config;
        var isNew = !!(config.db == null);
        var key;

        if (isNew) {
            dbConfig = {};
        }

        for (key  in clientConfig) {
            if (!isColumnValid(key, clientConfig[key])) {
                continue;
            }
            if (!dbConfig[key]) {
                changes[key] = addColumn(key, clientConfig[key]);
                changes[key].tableName = modelName;
            }
            else if (isColumnDifferent(dbConfig[key], clientConfig[key])) {
                changes[key] = changeColumn(key, clientConfig[key], dbConfig[key]);
                changes[key].tableName = modelName;
            }
        }

        if (!changes['id'] && !dbConfig['id']) {
            changes['id'] = createIdColumn('id', {});
            changes['id'].tableName = modelName;
        }

        if (isNew) {
            var newCmds = {};
            for (var key in changes) {
                var c = changes[key];
                newCmds[c.name] = c.data;
            }
            runCommands([
                {command: "CREATE_TABLE", name: modelName, columns: newCmds}
            ]);
        }
        else {
            var newCmds = [];
            for (var key in changes) {
                var c = changes[key];
                newCmds.push(c);
            }
            runCommands(newCmds);
        }
    }

    function runCommands(cmds) {
        var i, len, cmd;

        for (i = 0; len = cmds.length, i < len; i++) {
            cmd = cmds[i];
            switch (cmd.command) {
                case "CREATE_TABLE":
                    queryAdapter.createTable(cmd.name, cmd.columns).success(function () {
                        console.log("model ok.")
                    }).error(function (error) {
                            console.log("model err : " + error);
                        });
                    break;


                case "CHANGE_COLUMN":
                    queryAdapter.changeColumn(cmd.tableName, cmd.name, cmd.data).success(function () {
                        console.log("change ok.")
                    }).error(function (error) {
                            console.log("change err : " + error);
                        });
                    break;


                case "ADD_COLUMN":
                    queryAdapter.addColumn(cmd.tableName, cmd.name, cmd.data).success(function () {
                        console.log("add ok.")
                    }).error(function (error) {
                            console.log("add err : " + error);
                        });
                    break;
            }
        }

    }

    function isColumnValid(columnName, columnConfig) {
        if (columnName == 'meta' || columnName == 'id') {
            return false;
        }
        if (columnConfig && !columnConfig.type) {
            return false;
        }
        if (columnConfig && (columnConfig.code || columnConfig.transient)) {
            return false;
        }
        if (typeof  columnConfig == 'function') {
            return false;
        }
        return true;
    }

    function isColumnDifferent(dbColumn, clientColumn) {
        var key;
        if (dataTypes[clientColumn.type] != dbColumn.type) {
            return true;
        }
        for (key in keywords) {
            if (clientColumn.hasOwnProperty(key) && clientColumn[key] != dbColumn[keywords[key]]) {
                return true;
            }
        }
        return false;
    }

    function addColumn(columnName, clientColumn) {
        var key;
        var result = createDefaultColumn();
        if (dataTypes[clientColumn.type]) {
            result.type = dataTypes[clientColumn.type];
        }
        else {
            result.type = dataTypes.int;
        }

        for (key in keywords) {
            if (clientColumn[key]) {
                result[keywords[key]] = clientColumn[key];
            }
        }

        return {name: columnName, command: 'ADD_COLUMN', data: result};
    }

    function changeColumn(columnName, clientColumn, dbColumn) {
        var result = addColumn(columnName, clientColumn);
        result.command = 'CHANGE_COLUMN';
        return result;
    }

    function createIdColumn(columnName, columnConfig) {
        return {
            name: 'id',
            command: "ADD_COLUMN",
            data: {
                type: dataTypes.int,
                allowNull: false,
                unique: true,
                autoIncrement: true,
                primaryKey: true }
        };
    }

    function createDefaultColumn() {
        return {
            type: dataTypes.string,
            defaultValue: null,
            allowNull: true,
            unique: false,
            autoIncrement: false,
            primaryKey: false
        };
    }
}


/**********************************************************************************************
 * Export
 **********************************************************************************************/
exports.init = function () {
    return new TableWatcher();
}