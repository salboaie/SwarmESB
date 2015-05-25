/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */
'use strict';

SwarmMonitor.directive('cpuHistory', [function() {

    var controller = ['$scope', '$state', '$rootScope', '$element',
        function($scope, $state, $rootScope, $element){
            $scope.liveView = $scope.liveViewEnabled;
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
