/**********************************************************************************************
 * Vars
 **********************************************************************************************/
var fs = require('fs');

/*
 Sequelize.STRING                     // VARCHAR(255)
 Sequelize.TEXT                       // TEXT
 Sequelize.INTEGER                    // INTEGER
 Sequelize.BIGINT                     // BIGINT
 Sequelize.DATE                       // DATETIME
 Sequelize.BOOLEAN                    // TINYINT(1)
 Sequelize.FLOAT                      // FLOAT
 Sequelize.ENUM('value 1', 'value 2') // An ENUM with allowed values 'value 1' and 'value 2'
 Sequelize.DECIMAL(10, 2)             // DECIMAL(10,2)
 Sequelize.ARRAY(Sequelize.TEXT)      // Defines an array. PostgreSQL only.
 */

// 'client':'server'
var dataTypes = {
    'string': 'VARCHAR(255)',
    'text': 'TEXT',
    'int': 'INTEGER',
    'number': 'FLOAT',
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
var TableWatcher = function (dataBaseAdapter) {
    var queryAdapter = dataBaseAdapter.getQueryInterface();


    this.createOrUpdateTable = function (name, config, callback) {
        var self = this;
        this.describeTable(name, function (result, error) {
            if (error && !error.code == 'ER_NO_SUCH_TABLE') {
                callback(null, error);
                return;
            }

            var func = !result ? self['createTable'] : self['updateTable'];
            var params = !result ? [name, config, callback] : [name, config, result, callback];
            func.apply(self, params);
        });
    }


    this.createTable = function (name, config, callback) {
        var columns = convertToTableColumns(config);
        if (!columns['id']) {
            columns['id'] = getIdColumnConfig();
        }
        queryAdapterCall('createTable', [name, columns], callback);
    }


    this.updateTable = function (name, config, dbConfig, callback) {
        var commands = [];
        var cmd;
        for (var key  in config) {
            if (!isColumnValid(key, config[key])) {
                continue;
            }
            cmd = null;
            if (!dbConfig[key]) {
                cmd = [this.addColumn, name, key, getAddColumnConfig(key, config[key])];
            }
            else if (isColumnDifferent(dbConfig[key], config[key])) {
                cmd = [this.changeColumn, name, key, getChangeColumnConfig(key, config[key], dbConfig[key])];
            }
            if (cmd) {
                commands.push(cmd);
            }
        }
        if (!dbConfig['id']) {
            commands.push([this.addColumn, name, 'id', getIdColumnConfig()]);
        }
        runCommands(this, commands, callback);
    }

    this.describeTable = function (name, callback) {
        queryAdapterCall('describeTable', arguments, callback);
    }


    this.dropTable = function (name, callback) {
        queryAdapterCall('dropTable', arguments, callback);
    }


    this.addColumn = function (tableName, columnName, config, callback) {
        queryAdapterCall('addColumn', arguments, callback);
    }


    this.removeColumn = function (tableName, columnName, callback) {
        queryAdapterCall('removeColumn', arguments, callback);
    }


    this.changeColumn = function (tableName, columnName, config, callback) {
        queryAdapterCall('changeColumn', arguments, callback);
    }


    this.getDaoColumns = function (config) {
        return convertToTableColumns(config);
    }


    function queryAdapterCall(name, params, callback) {
        queryAdapter[name].apply(queryAdapter, params).success(function (result) {
            if (callback) {
                callback(result, null);
            }
        }).error(function (error) {
                if (callback) {
                    callback(null, error);
                }
            });
    }

    function runCommands(context, commands, callback, errors) {
        var cmd = commands.pop();
        if (!cmd) {
            callback(null, errors);
        }
        else {
            var funct = cmd.shift();
            cmd.push(function (result, err) {
                if (err) {
                    if (!errors) {
                        errors = [];
                    }
                    errors.push(err);
                }
                runCommands(context, commands, callback, errors);
            });
            funct.apply(context, cmd);
        }
    }


    function convertToTableColumns(config) {
        var columns = {};
        for (var key  in config) {
            if (!isColumnValid(key, config[key])) {
                continue;
            }
            columns[ key] = getAddColumnConfig(key, config[key]);
        }

        return columns;
    }


    function isColumnValid(columnName, columnConfig) {
        if (columnName == 'meta' ||
            columnName == 'id' ||
            (columnConfig && (typeof  columnConfig == 'function' || !columnConfig.type ||
                columnConfig.code ||
                columnConfig.transient))) {
            return false;
        }
        return true;
    }


    function isColumnDifferent(dbColumn, clientColumn) {
        if (dataTypes[clientColumn.type] != dbColumn.type) {
            return true;
        }
        for (var key in keywords) {
            if (clientColumn.hasOwnProperty(key) && clientColumn[key] != dbColumn[keywords[key]]) {
                return true;
            }
        }
        return false;
    }


    function getAddColumnConfig(name, column) {
        var result = getDefaultColumnConfig();
        if (dataTypes[column.type]) {
            result.type = dataTypes[column.type];
        }
        else {
            result.type = dataTypes.int;
        }

        for (var key in keywords) {
            if (column[key]) {
                result[keywords[key]] = column[key];
            }
        }
        return result;
    }


    function getChangeColumnConfig(name, column, dbColumn) {
        return getAddColumnConfig(name, column);
    }


    function getIdColumnConfig(columnName, columnConfig) {
        return {
            type: dataTypes.int,
            allowNull: false,
            unique: true,
            autoIncrement: true,
            primaryKey: true
        };
    }


    function getDefaultColumnConfig() {
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
module.exports = TableWatcher;