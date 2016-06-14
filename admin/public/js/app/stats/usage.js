'use strict';
app.controller('SwarmsUsage', ['$scope', function ($scope) {

    $scope.cpuPeriod = {};
    $scope.cpuHistory=[];
    $scope.memoryHistory=[];


    swarmHub.on('ping.js', 'launcherStatus', function (response) {
        $scope.usageStats = [];
        $scope.usageStats.push({
            name:"Active adapters",
            countNumber:response.status.adaptersCounter
        });

        $scope.usageStats.push({
            name:"Restarted adapters",
            countNumber:response.status.restartsCounter
        });
        $scope.$apply();
    });

    function monitoring(){
        var items=["Last month","Last 5 minutes", "Last year","Last day"];
        swarmHub.startSwarm('ping.js', 'queryLaunchers');
        var rndval=items[Math.floor(Math.random()*items.length)];
        swarmHub.startSwarm('monitoring.js','fetchCpuHistory',"Last 5 minutes");
        swarmHub.startSwarm('monitoring.js','fetchMemHistory',"Last 5 minutes")
        setTimeout(monitoring, 5*1000);
    }
    monitoring();

    var packDataNicely=function(containingObject){
        var addition=[];
        addition.push(containingObject[0]);
        addition.push(containingObject[1].toFixed(2));
        return addition;
    };

    swarmHub.on('monitoring.js','cpuHistory',function(response){
        $scope.cpuHistory=[];
        for(var i=0;i<response.status.data.length;i++){

            $scope.cpuHistory.push(packDataNicely(response.status.data[i]));
        }
        console.log($scope.cpuHistory);
        setTimeout(
            function(){
                $scope.$apply();
            },10);
    });

    swarmHub.on('monitoring.js','memoryHistory',function(response){
        $scope.memoryHistory = [];

        for(var i=0;i<response.status.data.length;i++){
            $scope.memoryHistory.push(packDataNicely(response.status.data[i]));
        }

        //$scope.serverData.totalMemory=(((response.status.totalMemory)/1024)/1024).toFixed(2);
        console.log("Memory",$scope.memoryHistory);
        setTimeout(
            function(){
                $scope.$apply();
            },10);
    });








}]);