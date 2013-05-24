var persistenceManager =
{
    meta: {
        name: "PersistenceManager.js"
    },
    vars: {
        debug: true,
        type: null,
        result: null,
        request: null,
        error: null,
        historyFilters: null,
        requestFilters: null,
        currentFilter: null,
        canContinue: true
    },
    processRequest: function (request) {
        var requests, i, len;
        requests = request instanceof Array ? request : [request];

        //TODO : this is a parallel executionn
        //TODO :    -> do we need a sequential execution for [UPDATE,GET] ????
        for (i = 0, len = requests.length; i < len; i++) {
            request = requests[i];
            this.type = request.type;
            this.request = request;
            if (!this.historyFilters) {
                this.historyFilters = [];
            }
            this.decideRequestFilters(this.type);
            this.runNextFilter();
        }
    },
    decideRequestFilters: function (type) {
        switch (type) {
            case "CREATE":
            case "DROP":
            case "QUERY":
                this.requestFilters = ['DbPersistencePhase'].reverse();
                break;
            case "DELETE":
                this.requestFilters = [];
                break;
            case "UPDATE":
            case "PUT":
            case "GET":
                if (this.request.skipCache) {
                    this.requestFilters = ['RuleEnginePhase', 'DbPersistencePhase', 'PersistenceCachePhase', 'RuleEnginePhase'].reverse();
                }
                else {
                    this.requestFilters = ['RuleEnginePhase', 'PersistenceCachePhase', 'DbPersistencePhase', 'PersistenceCachePhase', 'RuleEnginePhase'].reverse();
                }

                break;
        }
    },
    runNextFilter: function () {
        this.currentFilter = this.getFilter();
        if (this.canContinue && this.currentFilter) {
            this.swarm(this.currentFilter);
        }
        else {
            delete this['debug'];
            delete this['canContinue'];
            delete this['currentFilter'];
            delete this['requestFilters'];
            this.home("done");
        }
    },
    getFilter: function () {
        if (this.requestFilters.length) {
            return this.requestFilters.pop();
        }
        else {
            return null;
        }
    },
    getRequestParams: function (paramsDict) {
        var result = [];
        for (var key in paramsDict) {
            result.push(paramsDict[key]);
        }
        return result;
    },


    RuleEnginePhase: {
        node: "RuleEngine",
        code: function () {
            this.historyFilters.push("RuleEngine");
            this.canContinue = true;
            this.runNextFilter();
        }
    },
    PersistenceCachePhase: {
        node: "PersistenceCache",
        code: function () {
            this.historyFilters.push("PersistenceCache");

            var id = '';
            if (this.request && this.request.params) {
                id = this.request.params['id']
            }
            var key = getKey(this.request.className, id);

            switch (this.type) {
                case "DELETE":
                case "UPDATE":
                    invalidate(key);
                    this.canContinue = true;
                case "PUT":
                    this.canContinue = true;
                    break;
                case "REFRESH":
                    key = getKey(this.request.className, this.result['id']);
                    update(key, this.result);
                    this.canContinue = true;
                    break;
                case "GET":
                    var value = search(key);
                    if (value) {
                        value.cacheInfo = "This data is from cache"; // for testing
                        this.result = value;
                        this.canContinue = false;
                    }
                    else {
                        this.canContinue = true;
                    }
                    break;

                default :
                    this.canContinue = true;
                    break;
            }
            this.runNextFilter();
        }
    },
    DbPersistencePhase: {
        node: "DbPersistence",
        code: function () {
            this.historyFilters.push("DbPersistence");

            var self = this;
            var reqType = this.type.toLowerCase();
            var functionCall = global[reqType + "Call"];
            var params = [this.request.className].concat(this.getRequestParams(this.request.params));

            if (!functionCall) {
                console.error("No function call found for " + reqType);
            }

            params.push(function (result) {
                self.result = result;
                self.type = "REFRESH";
                self.canContinue = true;
                self.runNextFilter();
            });

            try {
                functionCall.apply(this, params);
            }
            catch (e) {
                console.error("Function call " + this.type + " error : " + e.toString());
            }
        }
    }
};

persistenceManager;