
var documentConvertorSwarming =
{
    vars:{
        debug:"true1",
        debugSwarm:"true1",
        message:"",
        path:""
    },
    ctorConvertDocument:function(path)
    {
        this.path = path;
        this.swarm("convertDocument");
    },
    convertDocument:{
        node:"DocumentConvertor",
        code : function (){

            console.log("converting started..");

            var progressHandler = function(message)
            {
                this.message = message;
                this.swarm("onClient",this.sessionId);
            }.bind(this);

            var completeHandler = function(message)
            {
                this.message = message;
                this.swarm("convertComplete");
            }.bind(this);

            convertDocument(this.path,progressHandler,completeHandler);
        }
    },
    convertComplete:{
        node:"DocumentConvertor",
        code : function ()
        {
            console.log("document generated");
            this.message = "done";
            this.swarm("onClient",this.sessionId());
        }
    },
    onClient:{ //phase
        node:"$client",
        code : null
    }
};

documentConvertorSwarming;