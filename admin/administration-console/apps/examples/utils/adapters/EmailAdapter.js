var mysql      = require('mysql');
var core = require("swarmcore");
thisAdapter = core.createAdapter("EmailAdapter");

var mysqlConnection = mysql.createPool({
    connectionLimit:10,
    host     : thisAdapter.config.Core.mysqlHost,
    port     : thisAdapter.config.Core.mysqlPort,
    user     : 'root',
    password : thisAdapter.config.Core.mysqlDatabasePassword,
    database : thisAdapter.config.Core.mysqlDatabaseName
});

var uuid = require('node-uuid');
var apersistence = require('apersistence');
var persistence = apersistence.createMySqlPersistence(mysqlConnection);
var conversationModel = {
    id:{
        type:"string",
        pk:true,
        length:512
    },
    sender:{
        type:'string',
        length:254
    },
    receiver:{
        type:'string',
        length:254
    }
};
/*
Initialize the database connection then
Start Haraka
 */

persistence.registerModel("conversation",conversationModel,function(err,result){
    if(err){
        console.log(err);
    }else {
        //startHaraka();
    }
});


registerConversation = function(sender,receiver,callback){

    var splitReceiver = receiver.split("@");
    var newConversationUUID = "anonymized_reply_to_"+splitReceiver[0];
    if(splitReceiver.length>1){
        newConversationUUID +="_at_"+splitReceiver[1];
    }
    newConversationUUID+="_"+uuid.v1().split("-").join("")
    newConversationUUID = newConversationUUID.toLowerCase();

    var conversation = apersistence.createRawObject('conversation',newConversationUUID);
    conversation['sender'] = sender;
    conversation['receiver'] = receiver;
    persistence.save(conversation,function(err,res){
        if(err){
            callback(err);
        }else{
            callback(undefined,newConversationUUID)
        }
    });
};

getConversation = function(uuid,callback){
    persistence.findById('conversation',uuid,function(err,conversation){
        if(err){
            callback(err);
            return;
        }
        if(conversation===null){
            callback(new Error("Conversation "+uuid+" does not exist"));
            return;
        }
        callback(err,conversation);
    })
};

removeConversation = function(conversationUUID,callback){
    persistence.deleteById('conversation',conversationUUID,callback);
};

var emailPort = process.argv.indexOf("-port");
if(emailPort===-1){
    emailPort = 25;
}else{
    emailPort = process.argv[emailPort+1];
}

var emailHost = process.argv.indexOf("-host");
if(emailPort===-1){
    emailHost = "localhost";
}else{
    emailHost = process.argv[emailHost+1];
}

const mailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = mailer.createTransport(smtpTransport({host:emailHost, port: emailPort, ignoreTLS:true}));

sendEmail = function(from,to,subject,text,callback){
    transporter.sendMail({
        "from": from,
        "to": to,
        "subject": subject,
        "text": text
    }, callback)

};