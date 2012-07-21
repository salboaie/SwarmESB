
var logSwarming =
{
    vars:{
    },
    update:function(){
        this.swarm("dispatchRestart");
    },
    register:function(adaptorName){
        this.adaptorName = adaptorName;
        this.swarm("register");
    },
    doRegister:{ //phase that should be replaced. Use your own logging logic
        node:"Core",
        code : function (){
            rememberAdaptor(this.adaptorName);
        }
    },
    dispatchRestart:{ //phase that should be replaced. Use your own logging logic
    node:"Core",
        code : function (){
//         var adaptors = geAllAdaptors();
//            for(var i=0;i<adaptors;i++)
        }
    },
    restart:{ //phase that should be replaced. Use your own logging logic
        node:"",
        code : function (){
            thisAdaptor.restart();
        }
    }
};

logSwarming;