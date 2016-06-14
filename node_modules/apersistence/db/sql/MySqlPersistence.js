/**
 * Created by ctalmacel on 12/8/15.
 */

var Q = require('q');
var createRawObject = require("../../lib/abstractPersistence.js").createRawObject;
var modelUtil = require("../../lib/ModelDescription.js");
var mysqlUtils = require("./mysqlUtils.js");

function sqlPersistenceStrategy(mysql_connection) {

    var self = this;
    var runQuery = Q.nbind(mysql_connection.query,mysql_connection);

    this.validateModel = function(typeName,description,callback){
        function createValidatindQuery(){
            return "DESCRIBE "+typeName;
        }

        function validate(tableStructure){

            var validModel = true;
            var model = new modelUtil.ModelDescription(typeName,description,self);

            tableStructure[0].forEach(function(column){
                column['Type'] = column['Type'].split('(')[0];   //ignore size specifications such as INT(10)
            });
            model.persistentProperties.some(function(modelProperty){
                var expectedDbType = self.getDatabaseType(model.getFieldType(modelProperty));


                if(expectedDbType === undefined){
                    validModel = false;
                    return true;
                }

                var validProperty = false;
                var dbType;
                tableStructure[0].some(function(column){
                    if(column['Field'] === modelProperty){
                       validProperty = true;
                       var dbType = column['Type'];

                        if(dbType.indexOf(')')!==-1){
                            dbType = dbType.slice(dbType.indexOf('('));
                        }

                        if(dbType !== expectedDbType) {
                            validProperty = false;
                        }

                        if(column['Key']==='PRI') {
                            if (column['Field'] !== model.getPKField()) {
                                validProperty = false;
                            }
                        }

                        return true; // arry.some(callback) breaks when the callback returns true
                    }
                });

                if(validProperty === false){
                    validModel = false;
                    return true; // same motivation
                }
            });
            return validModel;
        }

        runQuery(createValidatindQuery()).
        then(validate).
        then(function(isValid){callback(null,isValid)}).
        catch(callback);
    };

    this.findById = function (typeName, id, callback) {
        self.getObject(typeName,id,function(err,o){
            if (self.isFresh(o)) {
                callback(null, null);
            }
            else {
                callback(null, o);
            }
        })
    };

    this.getObject = function (typeName, id, callback) {
        function createQuery(){
            return 'SELECT * from ' + typeName + ' WHERE ' + modelUtil.getPKField(typeName) + " = " + id;
        }
        function createObjectFromQueryResult(result){

            var retObj = createRawObject(typeName, id);
            if (result[0][0]) {
                modelUtil.load(retObj, result[0][0], self);
            }
            return retObj;
        };

        runQuery(createQuery()).
        then(createObjectFromQueryResult).
        then(function(retObj){
            self.cache[id] = retObj;
            callback(null,retObj);}).
        catch(callback);
    };

    this.updateFields = function(obj,fields,values,callback){

        var typeName = obj.__meta.typeName;
        var id = obj.__meta.getPK();
        var model = modelUtil.getModel(typeName);

        function createUpdateQuery() {
            var query = 'UPDATE '+typeName+ " SET ";
            var length = fields.length;


            fields.forEach(function(field,index) {
                var update = field+"=" +values[index];
                update += (index == length-1) ? " " : ", ";
                query +=update;
            });

            var pkFieldType = model.getFieldType(modelUtil.getPKField(typeName));

            query+="WHERE "+modelUtil.getPKField(typeName)+"="+self.getConverterTo(pkFieldType)(obj.__meta.getPK())+";";
            return query;
        }




        var query;
        if(obj.__meta.savedValues.hasOwnProperty(obj.__meta.getPKField()))
            query = createUpdateQuery();
        else{
            var data = {};
            fields.forEach(function(field,index){
                data[field] = values[index];
            })
            query = mysqlUtils.insertRow(mysql_connection,self,typeName,data,modelUtil.getModel(typeName));
        }
        runQuery(query).
            then(function(updatedObject){
                self.cache[id] = updatedObject;
                callback(null,updatedObject);}).
            catch(callback);
    }

    this.filter = function(typeName,filter,callback){
        function createFilterQuery(typeName,filter){
            var query = "SELECT * from "+typeName+" ";

            if(filter == undefined){
                return query+";";
            }
            query +="WHERE ";
            for(var field in filter){
                query += field + "="+filter[field]+" AND ";
            }
            query = query.slice(0,-4);
            query+=";";
            return query;
        }

        function createObjectsFromData(queryResponse){
            var results = queryResponse[0];
            var objects = [];
            results.forEach(function(rawData){
                var newObject = createRawObject(typeName,rawData[modelUtil.getPKField(typeName)]);
                modelUtil.load(newObject,rawData,self);
                objects.push(newObject);
            })
            return objects;
        }

        runQuery(createFilterQuery(typeName,filter)).
        then(createObjectsFromData).
        then(function(objectsArray){callback(null,objectsArray);}).
        catch(callback);
    }

    this.deleteObject = function(typeName,id,callback){

        var query = "DELETE from "+typeName+ " WHERE "+modelUtil.getPKField(typeName)+" = '"+id+"';";
        runQuery(query).
        then(function(result){
            delete self.cache[id];
            callback(null,result)}).
        catch(function(err){
            delete self.cache[id];
            callback(err);
        });
    }

    /*
    function addPropertyToType(typeName,propertyName,propertyType){

        function createAlteringQuery() {
            return "ALTER TABLE " + typeName + " ADD " + propertyName + " " + self.getConverterFrom(propertyType);
        }
        function updateInternalState(){
            modelUtil[typeName].persistentProperties.push(propertyName);
            console.log('Property '+propertyName+' added to '+typeName);
        }

        return startTransaction().
            then(createAlteringQuery).
            then(runQuery).
            then(commitTransaction).
            then(updateInternalState).
            catch(treatTransactionError)
    }*/
}

sqlPersistenceStrategy.prototype = require('../../lib/BasicStrategy.js').createBasicStrategy();

exports.createMySqlStrategy = function (mysqlConnection){
    return new sqlPersistenceStrategy(mysqlConnection);
}

