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

        function refresh(){
            $scope.activeServersCount = 0;
            $scope.activeAdaptersCount = 0;
            $scope.activeServers = {};
            $scope.serverData = {};
            $scope.restartAdaptersCount = 0;

            $scope.input={};
            $scope.input.memPeriod="Last 5 minutes";
            $scope.input.cpuPeriod="Last 5 minutes";
            $scope.input.updateCpuChart=function(){
                swarmHub.startSwarm('monitoring.js','updateCpu',$scope.input.cpuPeriod)
            };

            $scope.input.updateMemChart=function(){
                swarmHub.startSwarm('monitoring.js','updateMem',$scope.input.memPeriod)
            };
        };


        swarmHub.on('monitoring.js','updateCpu',function(response){
            $scope.serverData.cpuHistory=response.status.cpuHistory;
            console.log("!!!!!!!!!!!!!!!!!!!!");
            console.log(response.status);
            console.log("!!!!!!!!!!!!!!!!!!!!");
            $scope.$apply();
        });

        swarmHub.on('monitoring.js','updateMem',function(response){
            $scope.serverData.memoryHistory=response.status.memoryHistory;
            $scope.serverData.info=response.status.info;
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
