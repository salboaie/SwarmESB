/*
    - Launched when a node is started to make sure that only one adapter is executing commands
    - Launched also to make active a redundant node

 */
var SearchUserDocs = {
    vars:{
        userId:null,
        debug:null
    },
    start:function (userId){
        this.userId = userId;
        this.swarm("search");
    },
    doSearch:{
        node:"MetaSearch",
        code:function () {
            this.list = getDocumentsForUser(this.userId);
            this.home("documentsList");
        }
    },
    sendKeys: {
        node: "CryptoKeyRepo",
        code: function () {
            this.home("keys");
        }
    },
    sendDocumentURIs: {
        node: "EncryptedDataRepo",
        code: function () {
            this.urlList = this.list.map(function(doc){
                return getUrlForDoc(doc);
            });
            this.home("urls");
        }
    }
}

SearchUserDocs;