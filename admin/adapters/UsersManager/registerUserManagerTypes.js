/**
 * Created by ciprian on 3/23/17.
 */


var container = require("safebox").container;
var flow = require('callflow');
var saltLength = 48;
var persistence = undefined;

container.declareDependency('userRelatedTypes',['mysqlPersistence'],function(outOfService,mysqlPersistence){
    persistence = mysqlPersistence;
    var models = [
        {
            modelName:"DefaultUser",
            structure:{
                userId: {
                    type: "string",
                    pk: true,
                    index: true,
                    length:255
                },
                organisationId: {
                    type: "string",
                    index: true
                },
                password: {
                    type: "string",
                    length:1024
                },

                email: {
                    type: "string",
                    index:true,
                    length:255
                },
                is_active: {
                    type: "boolean",
                    default:true
                },
                zones:{
                    type:"array:UserZoneMapping",
                    relation:"userId:userId"
                },
                salt:{
                    type:"string",
                    length:saltLength*2

                },
                activationCode:{
                    type: "string",
                    index:true,
                    length:255,
                    default:"0"
                }
            }
        },
        {
            modelName:"Organisation",
            structure:{
                organisationId: {
                    type: "string",
                    pk: true,
                    index: true
                },
                displayName: {
                    type: "string"
                },
                agent: {
                    type: "string"
                }
            }
        },
        {
            modelName:"UserZoneMapping",
            structure:{
                user:{
                    type:"DefaultUser",
                    relation:"userId:userId",
                },
                zone:{
                    type:"Zone",
                    relation:"zoneName:zoneName"
                },
                userId:{
                    type:"string",
                    index:true,
                    length:254
                },
                zoneName:{
                    type:"string",
                    index:true
                },
                mappingId:{
                    type:"string",
                    pk:true,
                    length:254
                }
            }
        },
        {
            modelName:"Zone",
            structure:{
                zoneName:{
                    type:"string",
                    pk:true,
                    index:true
                },
                users:{
                    type:"array:UserZoneMapping",
                    relation:"zoneName:zoneName"
                }
            }
        }
    ];
    
    flow.create("registerModels",{
        begin:function(){
            this.errs = [];
            var self = this;
            models.forEach(function(model){
                persistence.registerModel(model.modelName,model.structure,self.continue('registerDone'))
            })
        },
        registerDone:function(err,result){
            if(err){
                this.errs.push(err);
            }
        },
        end:{
            join:"registerDone",
            code:function(){
                if(this.errs.length===0){
                    console.log("User-related database types were registered");
                    container.resolve("userRelatedTypes","typesResolver");
                }else{
                    container.outOfService('userRelatedTypes');
                    console.error("The following errors occured while registering the database types:",this.errs);
                }
            }
        }
    })();

    return null;

});