
var categorySwarm =
{
    vars:{
        debug:false
    },
    getSubCategories:function(categoryUid){
        this.categoryUid = categoryUid;
        this.swarm("doSubCategories");
    },
    doSubCategories:{
        node:"PortalAdapter",
        code : function (){
            var regPattern = new RegExp(/^(.*):(.*)$/);
            var arrMatches = strText.match(rePattern);
            var ret = [];

            function onSubdomains(arr){
                ret.concat(arr);
            }

            function onWDSubFolders(arr){
                ret.concat(arr);
            }

            if(arrMatches[0] == "domain"){
                getPortalSubDomains(this.categoryUid,onSubdomains);
                getWebDavSubfolders(this.categoryUid,onWDSubFolders);
            }else{
                getWebDavSubfolders(this.categoryUid,onWDSubFolders);
            }
            this.swarm("returnCategory",this.sessionId);
        }
    }
};

categorySwarm;