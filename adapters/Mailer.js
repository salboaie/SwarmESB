


var util  = require('swarmutil');
var nodemailer = require('nodemailer');
var fs = require('fs');
thisAdapter = util.createAdapter("Mailer");


var transport;

/**********************************************************************************************
 * Functions
 **********************************************************************************************/


// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "testaxio@gmail.com",
        pass: "r2jkevaxio"
    }
});

mailWithAttachments = function(to, userInfo,tagName,channelId, callBack){
    // setup e-mail data with unicode symbols
    var html ="<p>Hello "+userInfo.name+",</p><p>This email contain a excel file with info about users from tag "+tagName+".</p>";
    var mailOptions = {
        from: "suportSGChannels <suportsecondglobechannels@gmail.com>", // sender address
        to: to, // list of receivers
        subject: "File with info about users from tag "+tagName+".", // Subject line
        text: "", // plaintext body
        html: html, // html body
        attachments:[
            {filePath:'./excelExports/'+channelId+'_'+userInfo.userId+'_'+tagName+'.xlsx'}
        ]
    }

    sendNewMail(mailOptions,function(undefined,message){
         if(message){
             callBack(undefined,message);
            fs.unlink('./excelExports/'+channelId+'_'+userInfo.userId+'_'+tagName+'.xlsx',function(err){
                if(err){
                  console.log("unlink file throw this error ",err);
                }
            })
         }

    });
}


mailForResetPassword = function(to, userInfo, newPass,callBack){
    // setup e-mail data with unicode symbols
    var html ="<p>Hello "+userInfo.name+",</p><p>This email contain a reset password for your account in Second Globe Channels. We strongly recommend to change this password.</p>" +
        "<p>Password:<b>"+newPass+"</b></p><br /><p>Suport Second Globe Channels</p><p>E-mail:suportsecondglobechannels@gmail.com</p>";
    var mailOptions = {
        from: "suportSGChannels <suportsecondglobechannels@gmail.com>", // sender address
        to: to, // list of receivers
        subject: "Your password is reset.", // Subject line
        text: "", // plaintext body
        html: html // html body
    }

    sendNewMail(mailOptions,callBack);
}
mailForFollowUnfollowChannel = function(to, userName,channelId,isFollow,callBack){
    // setup e-mail data with unicode symbols
    if(isFollow){
        var subject = "You follow a new channel";
        var html ="<p>Hello "+userName+",</p><p>You follow this channel "+channelId+".</p>" +
            "<br /><p>Suport Second Globe Channels</p><p>E-mail:suportsecondglobechannels@gmail.com</p>";
    }else{
        var subject = "You unfollow a channel";
        var html ="<p>Hello "+userName+",</p><p>You unfollow this channel "+channelId+".</p>" +
            "<br /><p>Suport Second Globe Channels</p><p>E-mail:suportsecondglobechannels@gmail.com</p>";

    }
    var mailOptions = {
        from: "suportSGChannels <suportsecondglobechannels@gmail.com>", // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: "", // plaintext body
        html: html // html body
    }
    sendNewMail(mailOptions,callBack);
}
sendNewMail = function(mailOptions, callBack){
      var mailOptions = mailOptions;

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
            callBack(undefined,response.message)
        }

        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });
}