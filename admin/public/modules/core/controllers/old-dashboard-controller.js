/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */
'use strict';

/*
    Cod Preluat din proiectul open source swam monitor. Nu e folosit momentan de USMED
*/

SwarmMonitor.controller('DashboardController', ['$scope', '$state', '$rootScope',
    function ($scope, $state, $rootScope) {
        /* chart configurations */
        $scope.cpuHistoryChart = {
            categoryField: 'time',
            valueField: 'cpuLoad',
            category: {
                parseDates: true, // in order char to understand dates, we should set parseDates to true
                minPeriod: 'ss', // 'mm' for minute interval			 
                axisColor: '#DADADA',
                categoryBalloonDateFormat: 'JJ:NN:SS, DD MMMM'
            },
            value: {
                title: "CPU Load (in percent)"
            },
            graph: {
                type: 'line', // try to change it to "column"
                lineColor: '#3399FF'
            }
        };

        $scope.memoryHistoryChart = {
            categoryField: 'time',
            valueField: 'usedMemory',
            category: {
                parseDates: true, // in order char to understand dates, we should set parseDates to true
                minPeriod: 'ss', // 'mm' for minute interval			 
                axisColor: '#DADADA',
                categoryBalloonDateFormat: 'JJ:NN:SS, DD MMMM'
            },
            value: {
                title: "Used Memory (in bytes)"
            },
            graph: {
                type: 'line', // try to change it to "column"
                lineColor: '#d1cf2a'
            }
        };

        /* initial values */
        $scope.activeServersCount = 1;
        $scope.activeAdaptorsCount = 1;
        $scope.swarmsCount = 1;
        $scope.activeServers = {};
        $scope.serverData = {};
        
        var notificationEnabled = false;

        /* clean up stuff */
        var activeServersChecker;
        var systemLoadChecker;
        $scope.$on('$destroy', function () {
            if (activeServersChecker) {
                clearInterval(activeServersChecker);
                activeServersChecker = null;
            }
            if (systemLoadChecker) {
                clearInterval(systemLoadChecker);
                systemLoadChecker = null;
            }

        });

        /* load active servers */
        var updateServerCount = function () {
            var sCount = 0;
            for (var sKey in $scope.activeServers) {
                sCount++;
            }
            $scope.activeServersCount = sCount;
        };
        swarmHub.on('monitorClient.js', 'loadDone', function (response) {
            //console.log('history for ' + response.systemId);
            $scope.serverData[response.systemId].cpuHistory = response.cpuLoadHistory;
            $scope.serverData[response.systemId].memoryHistory = response.memoryLoadHistory;
            $scope.$apply();
        });

        var loadActiveServers = function() {
            swarmHub.onSwarmConnection(function () {
                swarmHub.startSwarm('monitorClient.js', 'activeServers');
            });
        };
        
        var updateAdaptorCount = function() {
            var count = 0;
            for (var sKey in $scope.activeServers) {
                count += $scope.activeServers[sKey].nodes.length;
            }
            $scope.activeAdaptorsCount = count;
        };
        loadActiveServers();
        swarmHub.on('monitorClient.js', 'done', function (response) {
            var asChanged = false;
            //check if any server has died
            for (var sKey in $scope.activeServers) {
                if (!response.serversInfo[sKey]) {
                    //remove server key
                    delete $scope.activeServers[sKey];
                    asChanged = true;
                    if (notificationEnabled) {
                        $rootScope.notifications.push({
                            id: sKey,
                            type: 'error',
                            text: 'Server down: ' + sKey
                        });
                    }
                }
            }
            //add new servers
            for (sKey in response.serversInfo) {
                if (!$scope.activeServers[sKey]) {
                    $scope.activeServers[sKey] = {};
                    $scope.activeServers[sKey].nodes = response.serversInfo[sKey];
                    $scope.activeServers[sKey].identity = sKey;
                    asChanged = true;
                    if (!$scope.serverData[sKey]) {
                        $scope.serverData[sKey] = {};
                    }
                    if (!$scope.serverData[sKey].cpuHistory) {
                        //ask for server info
                        swarmHub.onSwarmConnection(function () {
                            swarmHub.startSwarm('monitorClient.js', 'loadHistory', sKey);
                        });
                    }
                    if (notificationEnabled) {
                        $rootScope.notifications.push({
                            id: sKey,
                            type: 'success',
                            text: 'Server started: ' + sKey
                        });
                    }
                }
            }

            updateServerCount();

            if (asChanged) {
                updateAdaptorCount();
                $scope.$apply();
            }

            notificationEnabled = true;
        });
        activeServersChecker = setInterval(loadActiveServers, 5000);

        $scope.selectServer = function (event, server) {
            event.preventDefault();
            if (server) {
                $scope.selectedServer = server.identity;
            } else {
                $scope.selectedServer = null;
            }
        };

        /* get system info */
        swarmHub.onSwarmConnection(function () {
            swarmHub.startSwarm('systemInfo.js', 'startAll');
        });
        swarmHub.on('systemInfo.js', 'done', function (response) {
            var sKey = response.systemInfo.systemId;
            //console.log('system info for ' + sKey, response.systemInfo);
            if (!$scope.serverData[sKey]) {
                $scope.serverData[sKey] = {}
            }
            $scope.serverData[sKey].info = response.systemInfo;
            $scope.$apply();
        });

        systemLoadChecker = setInterval(function () {
            swarmHub.onSwarmConnection(function () {
                swarmHub.startSwarm('monitorClient.js', 'systemLoad');
            });
        }, 600000);

        swarmHub.on('monitorClient.js', 'loadCheckDone', function (response) {
            var sKey = response.systemInfo.systemId;
            if ($scope.serverData[sKey]) {
                if ($scope.serverData[sKey].cpuHistory) {
                    $scope.serverData[sKey].cpuHistory.push({
                        cpuLoad: response.systemInfo.cpuLoad,
                        time: response.systemInfo.time
                    });
                }
                if ($scope.serverData[sKey].memoryHistory) {
                    $scope.serverData[sKey].memoryHistory.push({
                        usedMemory: response.systemInfo.usedMemory,
                        time: response.systemInfo.time
                    });
                }
            }
        });
        
        /* check swarms */
        swarmHub.onSwarmConnection(function () {
            swarmHub.startSwarm('monitorClient.js', 'listSwarms');
        });
        swarmHub.on('monitorClient.js','listSwarmsDone', function (response) {
            $scope.swarmsCount = response.swarmList.length;
            $scope.$apply();
        });
    }
]);
