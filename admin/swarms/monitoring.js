var swarmDescription = {
    meta:{
        name:"monitoring.js",
        debug:false
    },
    vars:{
        period:0
    },
    fetchCpuHistory:function(period){
        this.period=period;
        this.broadcast('getCpuData');
    },
    fetchMemHistory:function(period){
        this.period = period;
        this.broadcast('getMemoryData');
    },
    getCpuData:{
        node:"SwarmMonitor",
        code : function (){
            var self=this;
            getCpuHistory(this.period, S(function(error,result){
                if(!error) {
                    self.status = result;
                    self.home("cpuHistory");
                }
                else{
                    self.error=error;
                    self.home("cpuHistoryError");
                }

            }));

        }
    },
    getMemoryData:{
        node:"SwarmMonitor",
        code: function() {
            var self=this;
            getMemoryHistory(this.period, S(function(error,result){
                if(!error) {
                    self.status = result;
                    self.status.totalMemory=getFreeMemory();
                    self.home("memoryHistory");
                }
                else{
                    self.error=error;
                    self.home("memoryHistoryError");
                }

            }));
        }
    }
};

swarmDescription;/**
 * Created by TAC on 7/2/2015.
 */
