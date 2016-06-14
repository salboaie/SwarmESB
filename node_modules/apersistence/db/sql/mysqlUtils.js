/**
 * Created by ctalmacel on 12/21/15.
 */


var Q = require('q');



exports.createTable= function(mysqlConnection,persistence,tableName,model){
    var runQuery = Q.nbind(mysqlConnection.query,mysqlConnection);
    var query = 'CREATE TABLE IF NOT EXISTS '+tableName+'(';

    for(field in model){
        query+=field+' ';
        var dbType = persistence.persistenceStrategy.getDatabaseType(model[field].type);

        if(dbType === 'varchar'){
            dbType+='(30) ';
        }

        if(dbType === 'int'){
            dbType+='(10)';
        }

        query+=dbType;

        if(field.hasOwnProperty('default')){
            query+=' DEFAULT'+field.default;
        }

        if(field.pk === true){
            query+=', PRIMARY KEY ('+field+')';
        }

        query+=',';

    }
    query = query.slice(0,-1);
    query+=');';
    return runQuery(query);
}



exports.insertRow = function(mysqlConnection,persistence,tableName,serializedData){
    var query="INSERT IGNORE INTO "+tableName+" (";
    for (field in serializedData) {
        query += field + ",";
    }
    query = query.slice(0, -1);
    query += ") VALUES (";


    for(var field in serializedData){
        query+=' '+serializedData[field]+',';
    }

    query = query.slice(0, -1);
    query+=');';
    return query;
}



exports.insertDataIntoTable = function(mysqlConnection,persistence,tableName,serializedData){
    var result = [];
    var runQuery = Q.nbind(mysqlConnection.query,mysqlConnection);
    serializedData.forEach(function(row,index){
        result.push(runQuery(exports.insertRow(mysqlConnection,persistence,tableName,row)));
    });
    return Q.all(result);
}

exports.createAndPopulateNewTable = function(mysqlConnection,persistence,tableName,model,serializedData){

    return exports.createNewTable(mysqlConnection,persistence,tableName,model).
    then(function(){return exports.insertDataIntoTable(mysqlConnection,persistence,tableName,serializedData,model)}).
    catch(function(err){console.log(err.stack);});
}

exports.createNewTable = function(mysqlConnection,persistence,tableName,model){

    return exports.dropTable(mysqlConnection,tableName).
    then(function(){return exports.createTable(mysqlConnection,persistence,tableName,model)}).
    catch(function(err){console.log(err.stack);});
}

exports.dropTable =function(mysqlConnection,tableName){
    var runQuery = Q.nbind(mysqlConnection.query,mysqlConnection);
    var query = "DROP TABLE IF EXISTS " +tableName+";";
    return runQuery(query);
}