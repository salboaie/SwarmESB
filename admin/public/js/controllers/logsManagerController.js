/**
 * Created by ciprian on 4/12/16.
 */

'use strict';
app.controller('logsManagerController',["$scope","loggingService",function ($scope,loggingService) {


    $scope.whyNodeSelected = false;
    $scope.logsToDisplay = [];
    $scope.logs = {};
    $scope.typeOnDisplay = "Select a log type to display logs";
    $scope.my_tree = {};

    var initial_display = 30;
    var expandedLog = undefined;

    loggingService.enableLoggingService();

    loggingService.getLogTypes("logsManagerController",function(level){
        $scope.logs[level] = [];
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    });

    loggingService.registerForLogs('logsManagerController',function(log){
        $scope.logs[log.type].unshift(log);
        $scope.logs[log.type].splice(-1,1);
        if(log.type===$scope.typeOnDisplay){
            noticeNewLog(log);
        }
    })

    $scope.getMoreLogs = function(){
        if($scope.typeOnDisplay ==="Select a log type to display logs"){
            return;
        }
        var lastTimestamp;
        if ($scope.logs[$scope.typeOnDisplay].length == 0) {
            lastTimestamp = new Date(Date.now())
        } else {
            lastTimestamp = $scope.logs[$scope.typeOnDisplay][$scope.logs[$scope.typeOnDisplay].length - 1].timestamp;
        }
        loggingService.getMoreLogs(lastTimestamp,$scope.typeOnDisplay,addNewLog)
    }

    $scope.expandLog = function(log){

        log.expanded = !log.expanded;

        if(expandedLog){
            expandedLog.expanded = false;
        }

        expandedLog = log;
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    }

    $scope.displayLogs= function(logType){
        $scope.logsToDisplay = $scope.logs[logType];
        $scope.typeOnDisplay = logType;
        if($scope.logsToDisplay.length===0){
            for(var i=0;i<initial_display;i++){
                $scope.getMoreLogs();
            }
        }
    }

    $scope.displayWhyNodeInfo = function(whyNode) {
        console.log(whyNode);
        $scope.whyNodeInfo = {};
        $scope.whyNodeSelected = true;
        $scope.whyNodeInfo.message = "You selected: " + whyNode.label;
        $scope.whyNodeInfo['stack'] = whyNode.description['stack'];
        $scope.whyNodeInfo['arguments'] = whyNode.description['arguments']

        if(!$scope.$$phase) {
            $scope.$apply();
        }
    };


    function addNewLog(log){
        log.expanded = false;
        log.timestamp = new Date(log.timestamp);
        $scope.logsToDisplay.push(log);
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    }


    function noticeNewLog(log){
        $scope.logsToDisplay.unshift(log);
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    }
}])

