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

        var packDataNicely=function(containingObject){
            var addition={};
            addition.date= new Date(containingObject[0]);
            addition.value=containingObject[1].toFixed(2);
            return addition;
        };

        swarmHub.on('monitoring.js','cpuHistory',function(response){
            $scope.serverData.cpuHistory=[];
            for(var i=0;i<response.status.data.length;i++){

                $scope.serverData.cpuHistory.push(packDataNicely(response.status.data[i]));
            }
            $scope.$apply();
        });

        swarmHub.on('monitoring.js','memoryHistory',function(response){
            $scope.serverData.memoryHistory=[];
            for(var i=0;i<response.status.data.length;i++){
                $scope.serverData.memoryHistory.push(packDataNicely(response.status.data[i]));
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
