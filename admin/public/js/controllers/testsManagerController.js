'use strict';

app.controller('testsManagerController', ['$scope', function($scope ) {


    var running_options = {
        multipleSelect:false,
        showIcon:true
    };

    var not_running_options = {
        multipleSelect:true,
        showIcon:true
    };

    $scope.currentlyRunningTests = false;
    $scope.treeOptions = not_running_options;
    $scope.testsTree = [];
    $scope.currentTestResult = [];
    $scope.executionTreeOptions = {
        showIcon:false,
        multipleSelect:false
    }

    var all_nodes = [];
    var runningTests = [];

    $scope.runSelectedTests=  function(){
        $scope.treeOptions = running_options;
        $scope.currentlyRunningTests = true;
        runningTests = getTestsToRun();
        updateNodes(all_nodes,{'disabled':true,'selected':false});
        updateNodes(runningTests, {'disabled':false,style:{color:'blue'},current_running_message :' is running','displayAsserts':false});

        swarmHub.startSwarm("TestRunner.js","start",runningTests.map(function(node){return node.realPath}));


        function getTestsToRun(){
            return all_nodes.filter(function(node){
                if(node.selected){
                    if(!node.children){
                        return true;
                    }
                }
                return false;
            })
        }
    }
    swarmHub.on('FetchResult.js','gotResult',function(returningSwarm){
        var test;

        runningTests.some(function(runningTest){
            if(runningTest.realPath === returningSwarm.result.test){
                test = runningTest;
                return true;
            }else{
                return false;
            }
        })

        if(returningSwarm.result['type']==='assert') {


            if(test['results']===false){
                test['results'] = []
            }

            if (returningSwarm.result['message']) {


                var testMessage = returningSwarm.result['message'];
                if (testMessage.match('Pass')) {
                    if (test.style.color !== 'red') {
                        test.style = {color: 'green'}
                    }
                }
                else {
                    if (testMessage.match('Fail')|| testMessage.match("Test did not terminate properly")) {
                        test.style = {color: 'red'};
                        if(testMessage.match("Test did not terminate properly")){
                            test['results'].push("Test did not terminate properly...");
                        }
                        test.current_running_message = test['results'][test['results'].length-1]
                    }
                    else{
                        var stack = returningSwarm['result']['stack'];
                        var line = stack.split(test['realPath'].slice(0,-1))[1].split(")")[0].split(":")[1];
                        test['results'].push(testMessage+" at line "+line);
                    }
                }
                propagateResultUptree(test);
            }

            $scope.$apply();
            return;
        }

        if(returningSwarm.result.result === "Terminated") {
            $scope.$apply(function(){
                if(test.style.color!=='green'){
                    test.style.color = 'red';
                }else {
                    test.current_running_message = ' finished successfully';
                }
            });
        }

        function propagateResultUptree(node){
            all_nodes.some(function(maybe_parent){
                if(maybe_parent['children']) {
                    return maybe_parent['children'].some(function (child) {
                        if (node === child) {
                            if(!maybe_parent['style']) {
                                maybe_parent['style'] = node['style'];
                                propagateResultUptree(maybe_parent);
                            }else{
                                if(maybe_parent['style']['color']!=='red'){
                                    maybe_parent['style'] = node['style'];
                                    propagateResultUptree(maybe_parent);
                                }
                            }
                            return true;
                        }
                        return false;
                    })
                }else{
                    return false;
                }
            })
        }
    })


    $scope.stopRunningTests = function(){
        $scope.currentTestResult = undefined;
        $scope.treeOptions = not_running_options;
        $scope.currentlyRunningTests = false;
        updateNodes(all_nodes, {'style':undefined,
                                'results':false,
                                'current_running_message':undefined,
                                'disabled':false,
                                'selected':false,
                                'displayAsserts':false,
                                'displayDetails':false})
        runningTests = [];
    };


    $scope.$on('selection-changed',function(e,node){

        if($scope.currentlyRunningTests === true){
            if(node.realPath){
                //if node has fielr realPath it means it is in the tests tree
                $scope.currentTestResult = getExecutionTree(node);
            }else{
                checkDetails(node);
            }
            return;
        }

        $scope.treeNodes.forEach(function(node){
            selectNode(node,false);
        })

        node.forEach(function(node){
            selectNode(node,true);
        })

        function selectNode(node,value){
            node.selected = value;
            if(node.children){
                node.children.forEach(function(node){
                    selectNode(node,value);
                });
            }
        }

        function getExecutionTree(node) {
            if(!node.whyLog){
                return [{
                    'name':'No why logs'
                }]
            }
            else{
                var result = [];
                for(var n in node.whyLog){
                    var newNode = {
                        'name':n
                    }
                    addDetails(newNode,node.whyLog[n]);
                    if(node.whyLog[n].calls) {
                        addChildren(newNode, node.whyLog[n].calls);
                    }
                    result.push(newNode);
                }
                return result;
            }

            function addDetails(node, details) {
                node.details = [];

                if (details.args.length > 0) {
                    var args = "Arguments: ";
                    details.args.forEach(function (arg) {
                        args += arg + " ";
                    })
                    node.details.push(args);
                }
                else {
                    node.details.push("No arguments");
                }
                node.details.push("Stack:");
                details.stack.forEach(function (stackLine) {
                    node.details.push("    "+stackLine);
                })
            }


            function addChildren(node,children){
                node.children = [];
                for(var child in children){
                    var newNode = {
                        'name': child
                    }
                    addDetails(newNode,children[child]);
                    if(children[child].calls) {
                        addChildren(newNode, children[child].calls);
                    }
                    node.children.push(newNode);
                }
            }
        }

        function checkDetails(node){
            if(node.displaysDetails){
                hideDetails(node);
            }else{
                displayDetails(node);
            }

            function hideDetails(node){
                node.displaysDetails = false;
            }
            function displayDetails(node){
                node.displaysDetails = true;
                console.log(node['details']);
            }
        }

    })

    swarmHub.on("FetchAvailableTests.js", 'gotTests', function (thisSwarm) {
        var tests = thisSwarm.tests;

        $scope.treeNodes = getFolderStructure(tests);
        $scope.treeOptions = not_running_options;

        function getFolderStructure(testsList){
            var nodes = [];
            testsList.forEach(function(testPath){
                var arrayedPath = testPath.split("/");
                var currentPath = "";
                var tree = nodes;
                arrayedPath.forEach(function(pathNode){

                    currentPath+=pathNode+"/";

                    var parent = undefined;
                    var gotNode =tree.some(function(node){
                        if(node.name===pathNode){
                            parent = node;
                            return true;
                        }else{
                            return false
                        }
                    })


                    if(!gotNode){
                        var newNode = {
                            name:pathNode,
                            children:[],
                            realPath:currentPath,
                            selected:false,
                            results:false
                        }
                        tree.push(newNode);
                        tree = newNode.children;
                        all_nodes.push(newNode);
                    }else{
                        tree = parent.children;
                    }

                })
            })

            function detectScriptsInTree(nodes) {
                nodes.forEach(function (node) {
                    if(node.name.match(".js")){
                        delete node.children
                        delete node.result
                    }else{
                        detectScriptsInTree(node.children)
                    }
                });
            }
            detectScriptsInTree(nodes);

            function dropRedundantNodes(nodes){
                if(nodes.length===1){
                    if(nodes[0].children.length > 1){
                        return nodes[0].children;
                    }else{
                        return dropRedundantNodes(nodes[0].children);
                    }
                }else{
                    return nodes;
                }
            }

            nodes = dropRedundantNodes(nodes);
            return nodes;
        }
        console.log($scope.testsTree);
        $scope.$apply();
    })

    swarmHub.startSwarm('FetchAvailableTests.js', 'start');


    function updateNodes(nodes,properties) {
        nodes.forEach(function (node) {
            for(var prop in properties) {
                node[prop] = properties[prop];

            }
        })
    }
}]);


