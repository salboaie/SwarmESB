/**
 * Standard logging infrastructure
 *
 */
var coreConfig = {
    getConfig:function(orgId){
        this.orgId   = orgId;
        this.swarm("doGetConfig");
    },

    doGetConfig:{
        node:"Logger",
        code : function (){


        }
    }
};

coreConfig;