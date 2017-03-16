exports.init = function(sf){
    sf.exceptions.register('unknown', function(explanation){
        if(explanation){
            throw("Unknown exception: " + explanation);
        } else {
            throw("Unknown exception");
        }
    })

    sf.exceptions.register('resend', function(exceptions){
            throw(exceptions);
    })

    sf.exceptions.register('notImplemented', function(explanation){
        if(explanation){
            throw("notImplemented exception: " + explanation);
        } else {
            throw("notImplemented exception");
        }
    })

    sf.exceptions.register('security', function(explanation){
        if(explanation){
            throw("Security exception: " + explanation);
        } else {
            throw("Security exception!");
        }
    })


    sf.exceptions.register('duplicateDependency', function(variable){
            throw("Duplicate dependency exception: " + variable);
    })

}