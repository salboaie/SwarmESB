
var documentConvertorSwarming =
{
    vars:{
        debug:"true1",
        debugSwarm:"true1",
        message:""
    },
    ctorConvertDocument:function()
    {
        this.swarm("convertDocument");
    },
    convertDocument:{
        node:"DocumentConvertor",
        code : function (){

            console.log("converting started..");

            var f = function(message){
                this.message = message;
                this.swarm("onClient",this.sessionId);
            }.bind(this);

            var end = function(message){
                this.message = message;
                this.swarm("convertDone");
            }.bind(this);

            convertDocument("C:/Users/Mac/Desktop/test.pdf",f,end);
        }
    },
    convertDone:{
        node:"DocumentConvertor",
        code : function (){
            console.log("document generated");
            this.swarm("onClient",this.sessionId);
        }
    },
    onClient:{ //phase
        node:"$client",
        code : null
    }
};

documentConvertorSwarming;