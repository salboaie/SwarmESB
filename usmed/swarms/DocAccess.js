/*
    - Launched when a node is started to make sure that only one adapter is executing commands
    - Launched also to make active a redundant node

 */
var SearchUserDocs = {
    vars:{
        userId:null,
        debug:null
    },
    start:function (userId, docId){
        this.userId = userId;
        this.docId = docId;
        this.swarm("getAccess");
    },
    getAccess:{
        node:"MetaSearch",
        code:function () {
            var pair = rememberPairForUser(this.userId, this.docId);
            var uuid = pair.key;
            this.swarm("sendKey");
            var uuid = pair.content;
            this.swarm("sendURI");
        }
    },
    sendKey: {
        node: "CryptoKeyRepo",
        code: function () {
            this.key = getKey(this.uuid);
            this.home("key");
        }
    },
    sendURI: {
        node: "EncryptedDataRepo",
        code: function () {
            this.url = getUrl(this.uuid);
            this.home("urls");
        }
    }
}

SearchUserDocs;