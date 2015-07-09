/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */
'use strict';

SwarmMonitor.directive('cpuHistory', [function() {

    var controller = ['$scope', '$state', '$rootScope', '$element',
        function($scope, $state, $rootScope, $element){
            $scope.liveView = $scope.liveViewEnabled;
            $scope.cpuPeriod="Last 5 minutes";
            $scope.cpuChanged=function(){
                $scope.$parent.cpuPeriod=$scope.cpuPeriod;
                $scope.$parent.updateCpuChart();
            }
        }];

    return {
        replace: true,
        templateUrl: 'modules/directives/cpu/cpu-history.html',
        restrict: 'E',
        scope: {
            config: '=config',
            data: '=data',
            liveViewEnabled: '=liveViewEnabled'
        },
        controller: controller
    }
}]);