
function BasicAggregator(logger){
    var processes = null;

    function LogIndex(){
        var counter = 0;
        var keySpace = {};

        function getKey(log){

        }

        this.append = function(log){

        }
    }

    var services = null;

    this.processAggregator = function(enable){
        if(enable){
            processes = {
                unknown : []
            };
        } else {
            processes = null;
        }
    }

    this.serviceAggregator = function(enable){
        if(enable){
            services = {
                unknown : new LogIndex()
            };
        } else {
            services = null;
        }
    }

    this.log = function(rawLog){
        if(services){

        }

        if(processes){

        }

    }
}

exports.createAggregator = function(logger){
        return new BasicAggregator(logger);
}
