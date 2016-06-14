/**
 * Created by ctalmacel on 25/01/16.
 */

var whys = require('.././lib/whyNew.js');

exports.create = function(flowName, states){
    var activePhases = {};
    var flowStatus = "created";
    var name = flowName;
    var statesRegister = {};
    var joinsRegister = {};
    var motivations = {};
    var thisFlow = this;
    var currentPhase = "not running";

    function mkArgs(args,pos){
        var argsArray = [];
        for(var i=pos;i<args.length;i++){
            argsArray.push(args[i]);
        }
        return argsArray;
    }

    function addErrorTreatment(func){
        return function(){
            try{
                return func.apply(thisFlow,mkArgs(arguments,0));
            }
            catch(error){
                console.log("Catch an error");
                flowStatus = "failed";
                return thisFlow.error(error);
            }
        }
    }

    function updateStatusBeforeCall(stateName){
        if(activePhases[stateName] ==undefined){
            activePhases[stateName] = 1;
        }else{
            activePhases[stateName]++;
        }
    }
    function updateStatusAfterCall(stateName){
        activePhases[stateName]--;

        if(activePhases[stateName] === 0){
            var done = true;
            for(var phase in activePhases){
                if(activePhases[phase] > 0){
                    done = false;
                    break;
                }
            }
            if(done){
                flowStatus = "done";
            }
        }
    }

    function registerNewFunctionCall(stateName){

        updateStatusBeforeCall(stateName);

        notifyJoinsOfNewCall(stateName);

        function notifyJoinsOfNewCall(stateName){
            //register function call in joins
            statesRegister[stateName].joins.forEach(function (join) {
                joinsRegister[join].inputStates[stateName] = (joinsRegister[join].inputStates[stateName] == -1) ? 1 : (joinsRegister[join].inputStates[stateName] + 1)
            });
        }

    }

    function makePhaseUpdatesAfterCall(stateName){
        updateJoinsAfterCall(stateName);
        updateStatusAfterCall(stateName);


        function updateJoinsAfterCall(stateName){
            statesRegister[stateName].joins.forEach(function (joinName) {
                thisFlow[joinName]("check inputs before calling");
            });
        }
    }

    function attachStatesToFlow() {


        function registerState(state){

            function makePhaseUpdates(func,stateName){
                return function() {
                    function toBeExecuted() {
                        var parentPhase = currentPhase;
                        currentPhase = stateName;
                        registerNewFunctionCall(stateName);
                        var ret = func.apply(thisFlow, mkArgs(arguments, 0));
                        makePhaseUpdatesAfterCall(stateName);
                        currentPhase = parentPhase;
                        return ret;
                    }

                    function motivateCall(){
                        return currentPhase+ " to "+ stateName;
                    }

                    var finalFunction = toBeExecuted.why(motivateCall());

                    return finalFunction.apply(thisFlow,mkArgs(arguments,0));
                }
            }

            statesRegister[state] = {
                code: states[state],
                joins: []
            }
            thisFlow[state] = addErrorTreatment(makePhaseUpdates(states[state], state));
        }

        function registerJoin(join){

            function makeJoinUpdates(func,joinName){

                function joinReady(joinName){
                    var join = joinsRegister[joinName];
                    var gotAllInputs = true;
                    for(var inputState in join.inputStates){
                        if(join.inputStates[inputState] != 0) {
                            gotAllInputs = false;
                            break;
                        }
                    }
                    return gotAllInputs;
                }

                return function(checkInputs) {
                    function toBeExecuted() {
                        var parentPhase = currentPhase;
                        currentPhase = joinName;
                        updateStatusBeforeCall(joinName);

                        var readyToRoll = true;

                        if(checkInputs!==undefined) {
                            joinsRegister[joinName].inputStates[parentPhase]--;
                            readyToRoll = joinReady(joinName);
                        }

                        if(readyToRoll) {
                            func.apply(thisFlow);
                            for (var inputState in joinsRegister[joinName].inputStates) {
                                joinsRegister[joinName].inputStates[inputState] = -1;
                            }
                        }

                        updateStatusAfterCall(joinName);
                        currentPhase = parentPhase;
                    }
                    function motivateCall(){
                        return currentPhase+ " to "+ joinName;
                    }
                    toBeExecuted.why(motivateCall()).apply(thisFlow,mkArgs(arguments,0));
                }
            }


            joinsRegister[join] = {
                code: states[join].code,
                inputStates: {}
            }


            var inStates = states[state].join.split(',');
            inStates.forEach(function (input) {
                joinsRegister[join].inputStates[input] = -1;
            })

            //for direct call of join
            thisFlow[join] = addErrorTreatment(makeJoinUpdates(states[join].code,join));

        }

        function joinStates(){
            for(var join in joinsRegister){
                for(var inputState in joinsRegister[join].inputStates){
                    statesRegister[inputState].joins.push(join);
                }
            }
        }

        thisFlow.error = function(error){
            var motivation = currentPhase + " failed";
            if(states['error']!==undefined) {
                states['error'].why(motivation).apply(thisFlow,[error]);
            }
            else{
                function defaultError(error){
                    console.error(currentPhase+ " failed");
                    console.error(error);
                }
                defaultError.why(motivation)(error);
            }
        }

        for (var state in states) {

            if(state == "error"){
                continue;
            }

            if (typeof states[state] === "function") {
                registerState(state);
            }
            else {
                registerJoin(state);
            }
        }
        joinStates();
    }

    this.next = function() {

        var stateName = arguments[0];
        var motivation = arguments[1];

        if(motivation === undefined){
            motivation = currentPhase+" to "+stateName;
        }


        var args = mkArgs(arguments,2);
        registerNewFunctionCall(stateName);

        process.nextTick(addErrorTreatment(function() {
            currentPhase = stateName;
            statesRegister[stateName].code.apply(thisFlow, args);
            makePhaseUpdatesAfterCall(stateName);
        }.why(motivation)));
    }

    this.continue = function(){
        var stateName = arguments[0];
        var motivation = arguments[1];

        if(motivation === undefined){
            motivation = currentPhase+" to "+stateName;
        }

        registerNewFunctionCall(stateName);
        var args = mkArgs(arguments,2);
        return addErrorTreatment(function(){
                currentPhase = stateName;
                statesRegister[stateName].code.apply(thisFlow, mkArgs(arguments,0));
                makePhaseUpdatesAfterCall(stateName);
        }.why(motivation));
    };

    this.getStatus = function(){
        return flowStatus;
    };

    this.getActivePhases = function(){
        return activePhases;
    };

    attachStatesToFlow();

    return function(){
        flowStatus = "running";
        thisFlow.begin.apply(thisFlow, mkArgs(arguments, 0));
        return thisFlow;
    }

}