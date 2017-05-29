/**
 * Created by ciprian on 4/20/17.
 */




var zonesSwarming = {
    getAllZones: function (form) {
        this.form = form;
        this.swarm("getZones");
    },
    getZones:{
        node:"UsersManager",
        code:function(){
            var self = this;
            getAllZones(S(function(err,zones){
                if(err){
                    self.err = err.message;
                    self.home('failed');
                }else{
                    self.zones = zones.map(function(zone){
                        return zone.zoneName;
                    });
                    self.home("gotAllZones");
                }
            }))
        }
    }
};
zonesSwarming;
