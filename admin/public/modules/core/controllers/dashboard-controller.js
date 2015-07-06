/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */
'use strict';

/*
    Cod Preluat din proiectul open source swam monitor.
*/

SwarmMonitor.controller('DashboardController', ['$scope', '$state', '$rootScope',
    function ($scope, $state, $rootScope) {
        /* chart configurations */


        /* initial values */
        $scope.activeServersCount = 0;
        $scope.activeAdaptersCount = 0;
        $scope.activeServers = {};
        $scope.serverData = {};
        $scope.restartAdaptersCount = 0;
        $scope.serverData.cpuHistory=[];
        $scope.serverData.memoryHistory=[];
        $scope.serverData.totalMemory={};
        $scope.memPeriod={};
        $scope.cpuPeriod={};


        $scope.updateCpuChart=function(){
            swarmHub.startSwarm('monitoring.js','fetchCpuHistory',$scope.cpuPeriod)
        };

        $scope.updateMemChart=function(){
            swarmHub.startSwarm('monitoring.js','fetchMemHistory',$scope.memPeriod)
        };


        function refresh(){
            $scope.activeServersCount = 0;
            $scope.activeAdaptersCount = 0;
            $scope.activeServers = {};
            $scope.serverData = {};
            $scope.restartAdaptersCount = 0;
        };

        swarmHub.on('monitoring.js','cpuHistory',function(response){
            $scope.serverData.cpuHistory=[];
            for(var i=0;i<response.status.data.length;i++){
                var addition={};
                addition.date= new Date(response.status.data[i][0]);
                addition.value=response.status.data[i][1].toFixed(2);
                $scope.serverData.cpuHistory.push(addition);
            }
            console.log($scope.serverData.cpuHistory);
            $scope.$apply();
        });

        swarmHub.on('monitoring.js','memoryHistory',function(response){
            $scope.serverData.memoryHistory=[];
            for(var i=0;i<response.status.data.length;i++){
                var addition={};
                addition.date= new Date(response.status.data[i][0]);
                addition.value=response.status.data[i][1].toFixed(2);
                $scope.serverData.memoryHistory.push(addition);
            }
            $scope.serverData.totalMemory=(((response.status.totalMemory)/1024)/1024).toFixed(2);
            $scope.$apply();
        });

        swarmHub.on('ping.js', 'launcherStatus', function (response) {
            $scope.activeServers[response.status.launcherId] = response.status;
            $scope.activeServersCount += 1;
            $scope.activeAdaptersCount += response.status.adaptersCounter;
            $scope.restartAdaptersCount += response.status.restartsCounter;
            $scope.$apply(); //what for?
        });



        function timeOutPing(){
            refresh();
            swarmHub.startSwarm('ping.js', 'queryLaunchers');
            setTimeout(timeOutPing, 60*1000);
        }
        timeOutPing();

    }
]);
