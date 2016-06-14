# pubsubshare 
Pub Sub server for implementing  executable choreographies (for SwarmESB or other projects). PubSubChor creates a network of nodes that can securely relay messages between organisations

#Dependecies:
  - NodePKi server for relay SSL autoconfiguration
  

##Ideea
Each organisation will start one or more relays. Internal organisation nodes will use those relays as normal sub channels. 
Subscribe (sub) operations to an relay are allowed only for internal nodes. Normally, internal nodes stays behind a firewall (and NAT) and will get access only from a PubSubChor relay.   
 
##Features
  PubSubChor allows controlled and secure 
        - message communication between arbitrary nodes  belonging to any distinct organisations
        - secure file transfers between nodes belonging to any two organisations.  
        - code signing service: at signing a list of organisations is specified and the code should be approved by a fixed number of organisations
 
 
##Main Concepts

  Relay: a node in internet that can communicate with other relays servers belonging to other organisations. Relay servers can pass messages between them.
  
  Internal node: 
      Arbitrary number of pub/sub clients can pass messages inside and outside the organisation. Inside messages will go directly in redis, outside messages will be realied between Relay nodes.   
      
  Node addresses: 
     The system allow publish (pub) operations to go over organisation boundaries. Each internal node has an address in the form "pubsub://ORG1/test" where ORG1 is the name of another organisation
     
  Name lookup   
    The actual host adress and pot of an organisation is taken from an NodePKi server
    
  Organisation name: a short name for an organisation ( upper case word usually). It should be configured in the NodePKi server

##Pub Sub communication examples:
    var client = psc.createClient( "localhost", 6379);

    client.subscribe("test",function(res){
        assert.equal(res.type, "testMessage");
        end();
    });
    
    
    client.subscribe("local", function(res){
            assert.equal(res.type, "testLocalMessage");
            end();
        });
        
    client.publish("local", {type:"testLocalMessage"});
    client.publish("pubsub://ORG1/test", {type:"testMessage"});

  
##File transfers examples:

    //Any nodes that want to share a file will upload that file in the relay and communicate the a transferID by messages. Anybody having a transferId can download the shared file. 
    
     var cl = pss.createClient( "localhost", 6379);
     
     cl.shareFile("tmp/testFile", function(err, transferId){                                  
          if(!err){
              cl.download(transferId, "tmp2/testFile_dnld", function(err, result){
                  //now we have tmp2/testFile_dnld downloaded                                            
              })
          }
     });
      
## Internal communication API:

  Relay is a https server using ssl mutual authentication and has these endpoints:
  - POST: https://server:port/publish/channel 
  - POST: https://server:port/upload/transferId
  - GET:  https://server:port/download/transferId
  
