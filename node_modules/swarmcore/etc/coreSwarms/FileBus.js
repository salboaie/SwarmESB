/**
 *
 * Obsolete! use the newest file bus mechanism implemenetd with RedisRelay. This files is planed to be deleted soon...
 *
 */
var FileBus = {
    vars:{
        debug:true
    },
    register:function(storageName, protocol, server, port, connectionString)  {
        this.storageName        = storageName;
        this.protocol           = protocol;
        this.server             = server;
        this.port               = port;
        this.connectionString   = connectionString;
        this.adapterName           = thisAdapter.nodeName;
        this.broadcast("notifyAll");
    },
    waitTransfer:function(transferId, swarm, phaseName, target){
        /*this.transferId = transferId;
        this.swarm      = swarm;
        this.phaseName  = phaseName;
        this.target     = target;*/
        console.log("waitTransfer:", transferId, swarm, phaseName, target);
        thisAdapter.observeGlobal(transferId, swarm, phaseName, target);
    },
    notifyAll:{
        node:"All",
        code : function (){
            if(thisAdapter.fileBus){
                thisAdapter.fileBus.acknowledgeNewSwarmFileTransferNode(this.storageName, this.protocol, this.server, this.port, this.connectionString, this.adapterName);
                var target = this.adapterName;
                if(target != thisAdapter.nodeName){
                    var myInfo = thisAdapter.fileBus.myInfo;
                    this.storageName    = myInfo.storageName;
                    this.protocol       = myInfo.protocol;
                    this.server         = myInfo.server;
                    this.port           = myInfo.port;
                    this.connectionString = myInfo.connectionString;
                    this.adapterName    = myInfo.adapterName;
                    //console.log("My info:",myInfo )
                    this.swarm("notifySource", target);
                }
            }
        }
    },
    notifySource:{
        node:"initial node name",
        code : function (){
            //if(thisAdapter.fileBus) {
                console.log("Acknowledging remote storage node: ", this.storageName, this.protocol+"://" + this.server+":"+ this.port, this.connectionString, this.adapterName);
                thisAdapter.fileBus.acknowledgeNewSwarmFileTransferNode(this.storageName, this.protocol, this.server, this.port, this.connectionString, this.adapterName);
            //}
        }
    }



};

FileBus;