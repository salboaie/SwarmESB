/**
 * Created by salboaie on 22/10/2014.
 * Index a new document or update a document
 */


var indexDoc = {
    vars: {
        userId: null,
        debug: null
    },
    newDoc:function(userId, docId, sourceDocUrl){
        this.docURL = sourceDocUrl;
        this.userId = userId;
        this.docId  = docId;
        this.swarm("registerDoc");
    },
    updateDoc:function(userId,  docId, sourceDocUrl){
        this.docURL = sourceDocUrl;
        this.userId = userId;
        this.docId  = docId;
        this.swarm("registerDoc");
    },
    registerDoc:{
        node:"MetaSearch",
        code:function(){
            var keyUIID     = generateUIID();
            var contentUIID = generateUIID();

            this.uuid = keyUIID;
            this.swarm("saveData");
            this.docURL = null;

            this.uuid = contentUIID;
            this.swarm("registerKey");

            rememberPairForUser(this.userId, this.docId, keyUIID, contentUIID );
        }
    },
    registerKey: {
        node:"EncryptedDataRepo",
        code: function () {
            var key = generateEncryptionKey();
            registerKey(this.uuid, key);
        }
    },
    registerURL: {
        node:"EncryptedDataRepo",
        code: function () {
            var key = generateURL(this.docURL);
            registerURL(this.uuid, key);
        }
    }
}


indexDoc;