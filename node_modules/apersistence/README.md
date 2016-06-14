## apersistence: module to create an abstraction/mapping between objects and possible mixtures of SQL and NOSQL databases. Sort of ORM but also for noSQL databases.


#Why?

 1. Sometimes, it is better to have proper models (with types) not simple Java Script objects. Also, for models it is better to have member functions like in classical OOP (member functions automate binding on this)
 2. Redis could be enough for many applications as the single database in use.
   On the other hand it will be better to have possibility as anytime in the future to simple replace some configuration and switch to a relational database for all models all or only for some of them.
 3. I was tired for creating keys for use with redis. Sharding or other techniques (caching,etc) could be implemented without touching existing code but by replacing the persistence implementation.
 4. Because of my curiosity to push the limits of the Redis database while keeping Redis's performance properties.
 5. Lazy or eager data loading using foreign keys could be implemented (not implemented now!)
 6. It is quite possible to use multiple databases in the same process/service. They could even link data between persistences.

#APIs, How to use.


###Create redis persistence
      var persistence = require("apersistence").createRedisPersistence(redisConnection);


###Define data models

        persistence.registerModel("UserModel", {
            ctor:function(){
                //optional/ no arguments/ but could do some intialisation
            },
            name: {
                type:'string',
                default:"no name",
                pk:true
            },
            age: {
                type:'int',
                default:0
            },
            printAge: function(){
                console.log("User: ", this.name, " age ", this.age);
            }
        });

### Load object
        var user = persistence.lookup("userModel", "A name")

### Save object
        persistence.save(user);


#Observations/Caution
    This module works fine with SwarmCore implementation ( the redisConnection members are expected to be bound for usage with asynchron library)   While we will try to keep this API in future but there is no guarantee, use at your own risk. This module is highly experimental and it is used mainly by the SwarmESB project.
