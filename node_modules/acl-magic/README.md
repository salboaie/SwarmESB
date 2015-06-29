# acl-magic: magically simple but powerful ACL (Access Control List) node.js module

This is another approach for implementing ACL subsystems in node.js systems. acl-magic provides configurable persistence, cache control and an extensible way to  model all kind of permissions.
Arbitrary complex rules can be added within js code that will be still using the main acl-magic concepts.

The ACL model is based on few abstract concepts:
  1. Resources: You got a directed graph of resources that can represent the final records, categories, intermediate branches, anything). This graph doesn't have cycles but can have multiple start roots.
  2. Zones:  You have users belonging to various access zones (groups, roles, etc). The user himself is an access zone. A zone can have multiple parent zones. A zone inherits rights from all its parent zones.
  3. Concerns: You can can have multiple concerns (specific actions in your application or things like capabilities: read/write, etc). multiple concerns can share the same persistence. Normally you instantiate only one persistence.
  4. Persistence: a method of storing relations between zones, resources and grants relations relative to a concern between zones and resources.


From the API perspective, zones and resources are just free string and you can add parent relations between zones or between resources from an "concern' object or from a "persistence" object.
As you can see bellow, two concerns can share the same persistence but could also be based on different persistence.

#Implementation
 We try to be as fast as possible and  load things from the database as lazy as possible (only when required).
 The  "allow" function is always asynchronous and can test if a zone (user or role, group,etc) has access on a specific resource or a specific part of a resource graph.
 Therefore, we load only the parents of that resource and try to find grant records specific for that resource and all the super zones of the  user (or zone).
 It is possible to write your own persistence engine and your own cache. The default cache just keeps everything in memory for 5 minutes.
 The cache is informed by any new grant records but in the default implementation it just ignores them.  You can chain concerns and add your own specific rules regarding permissions, access shortcuts, etc.


#APIs, How to use.

###Create a concern
  acl.createConcern(concernName, persistence, exceptionalRulesFunction, postCheckFunction)

 Take a look in our tests for how to use this module (https://github.com/salboaie/acl-magic/blob/master/test/aclTest.js).


###Create redis persistence
      var persistence =  acl.createRedisPersistence(redisConnection, cache);//cache is optional

###Create memory persistence (for tests mainly... but may be you can also use it to create a synchronous API when your application size permits it)
      var persistence =  acl.createMemoryPersistence(redisConnection);

###Add parent node for a resources from concern or from your persistence
      concern.addResourceParent(resourcesUID, parentUid)

      persistence.addResourceParent(resourcesUID, parentUid)

###Include a zone in another access zone from concern or from your persistence
      concern.addZoneParent(zoneId, parentZoneId)

      persistence.addZoneParent(zoneId, parentZoneId)

###Allow a zone to access a resource or subtree from that resources
     concern.grant(zoneId, resourceId)

###Remove the grant record for a zone on a subtree from that resources
     concern.ungrant(zoneId, resourceId)

###Test if an user has access to a resource or tree of resources
      concern.allow(zoneId, resourceId, callback)

###Create cache
      var cache  =  acl.createCache(); //use if you want to implement your own cache. The persistence instance can use your cache.


#The algorithm (for checking with allow on a specific concern)
       Step 0: if exist. returns the result of calling the exceptional rule function
       Step 1: load recursively all the parents for a specific zoneId
            cache.loadZoneParents(zoneId, callback)
       Step 2: for grant records
            cache.loadGrantRecords(resourceId, callback)
       Step 3: test if any parent is in grant records. If it successfully find one such record, finish and returns true
       Step 4: recursively, load parents resources and try step 3 while is possible
       Step 5: nothing found, return what postCheckFunction decides


 
