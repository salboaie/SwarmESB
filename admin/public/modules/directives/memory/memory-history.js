/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */
'use strict';

SwarmMonitor.directive('memoryHistory', [function() {

    var controller = ['$scope', '$state', '$rootScope', '$element',
        function($scope, $state, $rootScope, $element){
            $scope.liveView = $scope.liveViewEnabled;
            $scope.memPeriod="Last 5 minutes";

            $scope.memChanged=function(){
                $scope.$parent.memPeriod=$scope.memPeriod;
                $scope.$parent.updateMemChart();
            }

        }];

    return {
        replace: true,
        templateUrl: 'modules/directives/memory/memory-history.html',
        restrict: 'E',
        scope: {
            config: '=config',
            data: '=data',
            availableMemory: '=availableMemory',
            liveViewEnabled: '=liveViewEnabled'
        },
        controller: controller
    }
}]);


