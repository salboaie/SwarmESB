/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */
'use strict';

SwarmMonitor.directive('adaptorListView', [function() {

    var controller = ['$scope', '$state', '$rootScope', '$element',
        function($scope, $state, $rootScope, $element){
            $scope.$watch('data', function(newValue, oldValue){
                console.log('server nodes changed', newValue);
            });
        }];

    return {
        replace: true,
        templateUrl: 'modules/directives/system/adaptor-list-view.html',
        restrict: 'E',
        scope: {
            data: '=data'
        },
        controller: controller
    }
}]);
