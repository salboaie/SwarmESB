var persistenceManager =
{
    meta: {
        name: "PersistenceManager.js"
    },
    vars: {
        debug: true,
        request: null,
        requestFilters: [],
        currentFilter: null,
        canContinue: true
    },
    processRequest: function (request) {
        this.result = {};
        this.result.data = [];
        this.request = request;
        this.decideRequestFilters(request);
        this.runNextFilter();
    },
    decideRequestFilters: function (request) {
        switch (request.type) {
            case "DELETE":
                this.requestFilters = [];
                break;
            case "UPDATE":
            case "PUT":
            case "GET":
                this.requestFilters = ['RuleEnginePhase', 'PersistenceCachePhase', 'DbPersistencePhase', 'PersistenceCachePhase', 'RuleEnginePhase'].reverse();
                break;
        }
    },
    runNextFilter: function () {
        this.currentFilter = this.getFilter();
        if (this.canContinue && this.currentFilter) {
            this.swarm(this.currentFilter);
        }
        else {
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


    RuleEnginePhase: {
        node: "RuleEngine",
        code: function () {
            this.request.filters.push("RuleEngine");
            this.canContinue = true;
            this.runNextFilter();
        }
    },
    PersistenceCachePhase: {
        node: "PersistenceCache",
        code: function () {
            this.request.filters.push("PersistenceCache");

            var key = getKey(this.request.className, this.request.id);

            switch (this.request.type) {
                case "DELETE":
                case "UPDATE":
                case "PUT":
                    invalidate(key);
                    this.canContinue = true;
                    break;
                case "REFRESH":
                    update(key, this.request.data);
                    break;
                case "GET":
                    var value = search(key);
                    if (value) {
                        value.cacheInfo = "This data is from cache"; // for testing
                        this.request.data = value;
                        this.canContinue = false;
                    }
                    else {
                        this.canContinue = true;
                    }
                    break;
            }
            this.runNextFilter();
        }
    },
    DbPersistencePhase: {
        node: "DbPersistence",
        code: function () {
            var self = this;
            this.request.filters.push("DbPersistence");

            processDbRequest(this.request, function (result) {
                self.request.data = result;
                self.request.type = "REFRESH";
                self.canContinue = true;
                self.runNextFilter();
            });

        }
    }
};

persistenceManager;