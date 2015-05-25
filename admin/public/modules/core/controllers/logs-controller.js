/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */
'use strict';
/*
    Cod Preluat din proiectul open source swam monitor.
 */


SwarmMonitor.controller('LogsController', ['$scope', '$state', '$rootScope',
    function($scope, $state, $rootScope) {
        $scope.logFiles = {};
        var addLogFile = function(fileName, server, nodeId) {
            if (!$scope.logFiles[fileName]) {
                $scope.logFiles[fileName] = {}
            }
            $scope.logFiles[fileName].name = fileName;
            
            if (!$scope.logFiles[fileName].files) {
                $scope.logFiles[fileName].files = [];
            }
            
            var found = false;
            for (var index in $scope.logFiles[fileName].files) {
                //console.log('check ', fileName, ' | index ', index, ' | server ', server);
                if ($scope.logFiles[fileName].files[index].server === server) {
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                $scope.logFiles[fileName].files.push({
                    name: fileName,
                    server: server,
                    node: nodeId
                });
            }
        };

        swarmHub.onSwarmConnection(function () {
            swarmHub.startSwarm('logUtils.js', 'list');
        });
        swarmHub.on('logUtils.js', 'doneList', function (response) {
            if (response.files) {
                for (var key in response.files) {
                    addLogFile(response.files[key], response.systemId, response.loggerId);
                }
                $scope.$apply();
            }
        });
        
        $scope.loadFile = function(event, file) {
            $scope.logContent = null;
            $scope.selectedFile = file;
            swarmHub.startSwarm('logUtils.js', 'read', file.node, file.name);
        };
        swarmHub.on('logUtils.js', 'doneRead', function (response) {
            $scope.logContent = atob(response.content);
            $scope.$apply();
        });
    }
]);
