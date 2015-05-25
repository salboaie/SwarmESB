/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */
'use strict';

SwarmMonitor.directive('memoryHistory', [function() {

    var controller = ['$scope', '$state', '$rootScope', '$element',
        function($scope, $state, $rootScope, $element){
            $scope.liveView = $scope.liveViewEnabled;
            $scope.bytesFormat = $rootScope.bytesFormat;
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
