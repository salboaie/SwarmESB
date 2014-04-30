var versionManagerSwarming =
{
    meta:{
        name:"VersionManager.js"
    },
    vars:{
        debug:false
    },
    updateApplicationVersion:function(applicationId,applicationVersion,tenantId,tenantVersion)
    {
        this.applicationId      = applicationId;
        this.applicationVersion = applicationVersion;
        this.tenantId           = tenantId;
        this.tenantVersion      = tenantVersion;
        this.swarm("updateAppVersion");
    },
    getApplicationVersion:function(applicationId, tenantId)
    {
        this.applicationId  = applicationId;
        this.tenantId       = tenantId;
        this.swarm("returnAppVersion");
    },
    subscribe:function (applicationId, tenantId, userId)
    {
        this.applicationId = applicationId;
        this.tenantId = tenantId;
        this.userId = userId;
        this.swarm("doSubscribe");
    },
    doSubscribe:
    {
        node:"VersionManager",
        code:function ()
        {
            subscribe(this.applicationId, this.tenantId, this.userId);
        }
    },
    updateAppVersion:{
        node:"VersionManager",
        code : function ()
        {
            this.version = updateApplicationVersion(this.applicationId,this.applicationVersion,this.tenantId,this.tenantVersion);
            this.swarm("notifyAll");
        }
    },
    notifyAll:
    {
        node:"VersionManager",
        code : function (){
            getFollowers(this.applicationId,this.tenantId, function(reply)
            {
                for(var i=0;i<reply.length;i++)
                {
                    this.currentTargetUser = reply[i];
                    this.toUser(this.currentTargetUser);
                }
                this.home("notify");
            }.bind(this) );
        }
    },
    returnAppVersion:
    {
        node:"VersionManager",
        code : function ()
        {
            var resultHandler = function(result){
                this.version = result;
                this.home("pageAnswer");
            }.bind(this);
            getApplicationVersion(this.applicationId,this.tenantId,resultHandler);
        }
    },
    pageAnswer:
    {
        node:"$client",
        code : null
    }

};
versionManagerSwarming;