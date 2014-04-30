var redisBinder = require("../api/redisBind.js");
var redis = require("redis");
var util  = require('swarmutil');
var uuid = require('node-uuid');
var stringUtils = require('string-utils');
var md5 = require('MD5');
var geoip = require('geoip-lite');
var Q = require('Q');
Q.longStackSupport = true;


getLocation = function(ip, callBack){
    console.log("My ip " + ip);
    var location = geoip.lookup(ip);

    return callBack(location);
}


thisAdapter = util.createAdapter("UsersRepo");
globalVerbosity = false;

//var client = redis.createClient(thisAdapter.redisPort,thisAdapter.redisHost);
redisContext = redisBinder.bindAll(redisClient);
var client = redisClient;


function getcountUserIdKey(){
    return util.mkUri("users", "countUserId");
}

function getUserKey(userId){
    return util.mkUri("users", userId);
}

validateFbResponse = function(tokenAuthFb, callBack){
    var dataFB;
    var crypto = require('crypto');
       var key = '8a8342a56e78f409d2437a0e058c3ed5'   // app secret from facebook

    var appSecret_proof = crypto.createHmac('sha256', key).update(tokenAuthFb).digest('hex')
    var https = require('https');
    var url = 'https://graph.facebook.com/me?access_token='+tokenAuthFb+'&appsecret_proof='+appSecret_proof;

    var rest = require('restler');

    rest.get(url).on('complete', function(result) {
        //console.log("result ",result);
        if (result instanceof Error) {
            console.log('Error:', result.message);
            this.retry(5000); // try again after 5 sec
            return callBack(undefined,null);
        } else {
            dataFB = result;
            if(dataFB ){      //&& dataFB.verified == true
                console.log("logat");
                return callBack(undefined,dataFB);
            }else{
                console.log("nu este logat");
                return callBack(undefined,null);
            }

        }

    });




}

function doSave(key, userInfo){
    userInfo.lastUpdate = new Date().getTime();
    client.set(key, J(userInfo));
}




//new function

getUserIdFromEmailOrPhone = function(userEmailOrPhone,callBack){
    var hashKey = userEmailOrPhone;
    var getUserId = redisContext.hget.async("indexEmailUserId", hashKey);
    (function(getUserId){
         return callBack(undefined, getUserId)
    }).swait(getUserId);


}

generateUserId = function(callBack){
    var counterUserId = getcountUserIdKey();
    var userIndex = redisContext.incr.async(counterUserId);
    (function(userIndex){
        var newUserId = null;
        newUserId = stringUtils.padLeft(userIndex, "0", 15);
        newUserId = "S"+newUserId;
        return callBack(undefined,newUserId);
    }).swait(userIndex)


}

createHashForUserId = function(userEmailOrPhone,newUserId,callBack){
    var hashUserId = redisContext.hset.async("indexEmailUserId",userEmailOrPhone, newUserId);
    (function(hashUserId){
        return callBack(undefined, hashUserId);
    }).swait(hashUserId)


}


setHashsForUserId = function(userEmail,userPhone,callBack){
    var hashkeyArray = [];
    if(userEmail && userEmail !=""){
        hashkeyArray.push(userEmail);
    }
    if(userPhone && userPhone != ""){
        hashkeyArray.push(userPhone);
    }
    var newUserId = generateUserId.async();
    (function(newUserId){
        var hashKey;
        if(hashkeyArray.length != 0){
            for(var i=0; i<hashkeyArray.length; i++){
                hashKey = hashkeyArray[i];
                var newHashId = createHashForUserId.async(hashKey,newUserId);
            }
            callBack(undefined,newUserId);
        } else{
            redisContext.decr.async(counterUserId);
            callBack(undefined,null);
        }
    }).swait(newUserId)


}

authenticateUser = function(userKey,token,callBack){
    var key = getUserKey(userKey);
    var getUserInfo = redisContext.get.async(key);
    (function(getUserInfo){
        if(getUserInfo){
            var userInfo = JSON.parse(getUserInfo);
            if(userInfo.token == token || userInfo.resetToken == token) {
                userInfo.lastLogin =  new Date().getTime() / 1000;
                doSave(key, userInfo);
                //console.log("Authentication ok: " + userId);
                var enableCause = "validateAuth";
                return callBack(undefined,userInfo,enableCause);
            }else{
                console.log("getUserInfo exist")
                return callBack(undefined,null);
            }
        }else{
            return callBack(undefined,null,true);
        }
    }).swait(getUserInfo);
}

genericValidateUser = function(userId, token, isFbUser, userInfoClient, callBack){

    if(!userId){
        //good for preventing fake updates that escaped other security checks...
        console.log("No userId!? " + " token " + token );
        return null;
    }
    if(userId == "SGuest" && userInfoClient == ""){
        var userInfoGuest = {"userId": "SGuest", "name": "Guest", "isGuest": true};
        userInfoGuest.token = uuid.v4();
        var enableCause = "validateGuest";
        return callBack(undefined,userInfoGuest,enableCause);
    }
    var userKey;
    if(!isFbUser){
        var userEmailOrPhone;
        if(userId.email || userId.telephone){
            if(userId.email){
                userEmailOrPhone = userId.email;
            }else if(userId.telephone){
                userEmailOrPhone = userId.telephone;
            }
            var authUser;
            userKey = getUserIdFromEmailOrPhone.async(userEmailOrPhone);
            (function(userKey){
                console.log("userId ",userKey,userId);
                authenticateUser(userKey,token,callBack);
            }).swait(userKey)
        }else{
            userKey = userId;
            authenticateUser(userKey,token,callBack);
        }


    }else{
        userKey = userId;
        var key = getUserKey(userKey);
        var getUserInfoFb = redisContext.get.async(key);
        (function(getUserInfoFb){
            if(getUserInfoFb){
                var userInfo = JSON.parse(getUserInfoFb);
                if(isFbUser && userInfo.isFbUser){
                    userInfo.lastLogin =  new Date().getTime() / 1000;
                    doSave(key, userInfo);
                    return callBack(undefined, userInfo);
                }else{
                    console.log("getUserInfo exist")
                    return callBack(undefined,null);
                }

            }else{
                if(isFbUser){
                    if(userInfoClient.email){
//                        var createHashForUserIdFb = createHashForUserId.async(userInfoClient.email,userId);
                        createNewUserFB(userId, token,  userInfoClient, false, callBack);
                    }
                }else{
                    console.log("no getUserInfo")
                    return callBack(undefined,null);
                }
            }
        }).swait(getUserInfoFb);

    }
}

onSignup = function(userEmail, userPhone, token, isFbUser, userInfoClient, callBack){

    if((!userEmail || userEmail == "" ) && (!userPhone || userPhone == "")){
         return null;
    }
    var userIdFromEmail = getUserIdFromEmailOrPhone.async(userEmail);
    var userIdFromPhone = getUserIdFromEmailOrPhone.async(userPhone);
    (function(userIdFromEmail,userIdFromPhone){
         if(userIdFromEmail || userIdFromPhone){
             return callBack(undefined,null,true);
         }else{
             var userIdHash = setHashsForUserId.async(userEmail,userPhone);
             (function(userIdHash){
                 if(userIdHash){
                     createNewUser(userIdHash, token, userInfoClient, false, callBack);
                 }else{
                     return callBack(undefined,null);
                 }

             }).swait(userIdHash)
         }
    }).swait(userIdFromEmail,userIdFromPhone)

}


addNewUserFromChan = function(userEmail, userPhone, userName, callBack){

  if(!userEmail){
      return null;
  }
    if(!userName){
        return callBack(undefined,null,null);
    }
   var userIdFromPhone = getUserIdFromEmailOrPhone.async(userPhone);

    (function(userIdFromPhone){

            if(userIdFromPhone){
              callBack(undefined, null,null,true)
            }else{
                console.log("addNewUserFromChan ",userEmail,userPhone);
                var userIdHash = setHashsForUserId.async(userEmail,userPhone);
                (function(userIdHash){
                  if(userIdHash){
                      var randomPassword = Math.random().toString(36).slice(-8);
                      var randomToken = md5(randomPassword);
                      var userInfo = {"email": userEmail, "telephone": userPhone, "phoneCountryCode": "", "telephoneNumber": userPhone, "name": userName, "webSite":""};
                      createNewUser(userIdHash, randomToken, userInfo, false, function(userInfo){
                          if(userInfo){
                              return callBack(undefined, userInfo,randomPassword);
                          }
                      });
                  }
                }).swait(userIdHash);

            }
    }).swait(userIdFromPhone)

}

// end new function



createNewUser = function(userId, token, userInfoClient, isGuest, callBack){

        var key = getUserKey(userId);
        var newUser={"userId":userId, "name":userInfoClient.name, "email":userInfoClient.email, "telephone": userInfoClient.telephone, "phoneCountryCode":userInfoClient.phoneCountryCode, "telephoneNumber": userInfoClient.telephoneNumber, "webSite":userInfoClient.webSite, "resetToken":"", "token":token, "isFbUser":false, "isGuest":isGuest};
        newUser.lastLogin =  new Date().getTime() / 1000;
        //newUser.token = uuid.v4();
        doSave(key, newUser);
       return callBack(undefined,newUser);

}

createNewUserFB = function(userId, token, userFbInfo, isGuest, callBack){
    var counterUserId = getcountUserIdKey();
    var key = getUserKey(userId);
    var newUser={"userId":userId, "token":token, "isFbUser":true, "isGuest":isGuest};
        if(userFbInfo.name){
            newUser.name = userFbInfo.name;
        }
        if(userFbInfo.email){
            newUser.email = userFbInfo.email;
        }
        if(userFbInfo.website){
            newUser.webSite = userFbInfo.website;
        }
        if(userFbInfo.work){
            if(userFbInfo.work[0].employer){
                newUser.workPlace = userFbInfo.work[0].employer.name;
            }
            if(userFbInfo.work[0].location){
                newUser.workCity = userFbInfo.work[0].location.name;
            }
            if(userFbInfo.work[0].position){
                newUser.positionWork = userFbInfo.work[0].position.name;
            }

            var now = new Date();
            var currentYear = now.getFullYear();
            if(userFbInfo.work[0].start_date){
                var yearStartWork = userFbInfo.work[0].start_date.substr(0,4);
                if(yearStartWork != "0000"){
                    var diff = currentYear - yearStartWork;
                    console.log("year: "+yearStartWork,currentYear,diff);
                    if(diff < 1){
                        newUser.experience = "less than 1 year";
                    }else if(diff >= 1 && diff < 5){
                        newUser.experience = "1-5 years";
                    }else if(diff >= 5 && diff < 10){
                        newUser.experience = "5-10 years";
                    }else if(diff >= 10 && diff < 20){
                        newUser.experience = "10-20 years";
                    }else if(diff >= 20){
                        newUser.experience = "more than 20 years";
                    }
                }
            }
        }

        if(userFbInfo.education){
            for(i=0;userFbInfo.education.length;i++) {
                if(userFbInfo.education[i]){
                    if(userFbInfo.education[i].type == "College"){
                        if(userFbInfo.education[i].school){
                            if(userFbInfo.education[i].school.name){
                                newUser.college = userFbInfo.education[i].school.name;
                            }
                            if(userFbInfo.education[i].year){
                                if(userFbInfo.education[i].year.name){
                                    newUser.timePeriodCollege = userFbInfo.education[i].year.name;
                                }

                            }

                        }

                    }
                }else{
                    break;
                }

            }
        }
    newUser.lastLogin =  new Date().getTime() / 1000;
    newUser.token = uuid.v4();
    doSave(key, newUser);
    return callBack(undefined,newUser);
}



//new code

updateUser = function(userInfo, existingToken, callBack){
    var key = getUserKey(userInfo.userId);
     var userPublicInfo = getUserPublicInfo.async(userInfo.userId);
    (function(userPublicInfo){
       if(userPublicInfo){
           var oldUserDate = userPublicInfo;
           if(!userPublicInfo.isFbUser){
               var userTokenValid = validateUserToken.async(oldUserDate,userInfo,existingToken);
               (function(userTokenValid){
                   if(userTokenValid){
                       if(userTokenValid != "existingHashKey"){
                           doSave(key, userInfo);
                           //console.log("update complete")
                           return callBack(undefined,oldUserDate,userInfo);
                       }else{
                           //console.log("existingHashKey")
                           return callBack(undefined,oldUserDate,null,true);
                       }
                   }else{
                       //console.log("update failed")
                       return callBack(undefined,oldUserDate,null);
                   }
               }).wait(userTokenValid);
           }else{
               doSave(key, userInfo);
               return callBack(undefined,oldUserDate,userInfo);
           }
       }
    }).swait(userPublicInfo)
}

validateUserToken = function(userExistingInfo,userClientInfo,existingToken,callBack){

    if(userClientInfo.userId == userExistingInfo.userId && (userExistingInfo.token == existingToken || userExistingInfo.resetToken == existingToken)){
        var hashKey = decideHashKey.async(userClientInfo);
        (function(hashKey){
            if(hashKey){
                //console.log("after decide");
              var newHashIndex = addNewHashIndex.async(hashKey,userClientInfo.userId);
              return callBack(undefined,true)
            }else{
                return callBack(undefined,"existingHashKey")
            }
        }).swait(hashKey);
    }else{
      return callBack(undefined,null);
    }

}

decideHashKey = function(userClientInfo,callBack){
    var email;
    var telephone;
    var arrayKeys = [];
    var arrayNewKeys = [];
    if(userClientInfo.email){
      email = userClientInfo.email;
        arrayKeys.push(email);
    }
    if(userClientInfo.telephone){
        telephone = userClientInfo.telephone;
        arrayKeys.push(telephone);
    }
    for(var i=0;i<arrayKeys.length;i++){
        var hashKey = arrayKeys[i];
        if(hashKey){
            var index = 0;
          var existHashKey = checkForExistingHashKey.async(hashKey,userClientInfo.userId);
              (function(existHashKey){
//                  console.log("hashKey ",existHashKey);
                  if(existHashKey){
                      if(existHashKey != "existForThisUser"){
                          return callBack(undefined,null);
                      }
                  }else{
                      arrayNewKeys.push(hashKey);
                  }
                  index++;
                  if(index == arrayKeys.length){
                      return callBack(undefined,arrayNewKeys);
                  }
              }).swait(existHashKey);
        }
    }
}
checkForExistingHashKey = function(hashKey,userId ,callBack){
    var hashKeyExist = redisContext.hget.async("indexEmailUserId", hashKey);
    (function(hashKeyExist){
           if(hashKeyExist){
               if(hashKeyExist != userId){
                  return callBack(undefined,true);
               }else{
                   return callBack(undefined,"existForThisUser");
               }
           }else{
               return callBack(undefined,null);
           }
    }).swait(hashKeyExist)
}
addNewHashIndex = function(arrayHashKeys,userId,callBack){

      if(arrayHashKeys.length > 0){
          for(var i=0;i<arrayHashKeys.length;i++){
              var hashKey = arrayHashKeys[i];
              redisContext.hset.async("indexEmailUserId",hashKey,userId);
          }
      }
}

getUserPublicInfo = function(userId, callBack){
    var key = getUserKey(userId);
    var userPublicInfo = redisContext.get.async(key);
    (function(userPublicInfo){
        if(userPublicInfo){
            var userInfo = JSON.parse(userPublicInfo);
            callBack(undefined, userInfo);
        }
    }).swait(userPublicInfo);

    (function(err){
        callBack(err);
    }).fail(userPublicInfo);
}

validateEmail = function(email, callBack){
    if(email == undefined || email == ""){
         return null;
    }
        var hashKey = email;
        var userId = redisContext.hget.async("indexEmailUserId", hashKey);

        (function(userId){
            if(userId){
                var publicUserInfo = getUserPublicInfo.async(userId);
                (function(publicUserInfo){
                    if(publicUserInfo){
                        callBack(undefined, publicUserInfo);
                    }else{
                        callBack(undefined,null);
                    }
                }).wait(publicUserInfo);
            }else{
                callBack(undefined,null);
            }
        }).swait(userId);
}
//end new code

resetPassword = function(userId, callBack){
    var randomPassword = Math.random().toString(36).slice(-8);
    var randomToken = md5(randomPassword);
    var key = getUserKey(userId);
    client.get(key,
        function (err, value) {
            var user = null;
            if(!err){
                user = JSON.parse(value);
            } else{
                console.log("user: " + err)
            }
            if(user){
                user.resetToken = randomToken;
                //user.token = randomToken;
                doSave(key, user);
                return callBack(user,randomPassword,randomToken);
            }else{
                return callBack(null);
            }
        });
}




