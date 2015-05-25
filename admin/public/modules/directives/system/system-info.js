/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */
'use strict';

SwarmMonitor.directive('systemInfo', [function() {

    var controller = ['$scope', '$state', '$rootScope', '$element',
        function($scope, $state, $rootScope, $element){
            $scope.info = [];
            var addInfo = function(type, value) {
                $scope.info.push({
                    type: type,
                    value: value
                });
            };
            
            $scope.$watch('data', function(newValue, oldValue){
                $scope.info = [];
                if (newValue) {
                    addInfo('Host Name', newValue.hostName);
                    addInfo('System Type', newValue.type);
                    addInfo('Platform', newValue.platform);
                    addInfo('Architecture', newValue.architecture);
                    addInfo('Uptime', $rootScope.timeFormat(newValue.uptime));
                    addInfo('Total Memory', $rootScope.bytesFormat(newValue.totalMemory,3));
                    addInfo('CPU Model', newValue.cpus[0].model);
                    addInfo('CPU Cores', newValue.cpus.length);
                }
                //$scope.$apply();
            });
        }];

    return {
        replace: true,
        templateUrl: 'modules/directives/system/system-info.html',
        restrict: 'E',
        scope: {
            data: '=data'
        },
        controller: controller
    }
}]);
