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
        }


        swarmHub.on('ping.js', 'launcherStatus', function (response) {
            $scope.activeServers[response.status.launcherId] = response.status;
            $scope.activeServersCount += 1;
            $scope.activeAdaptersCount += response.status.adaptersCounter;
            $scope.restartAdaptersCount += response.status.restartsCounter;
            $scope.$apply();
        });

        function timeOutPing(){
            refresh();
            swarmHub.startSwarm('ping.js', 'queryLaunchers');
            setTimeout(timeOutPing, 60*1000);
        }

        timeOutPing();

    }
]);
