/**
 *
 * @author Catalin Manolescu <cc.manolescu@gmail.com>
 */

'use strict';

SwarmMonitor.directive('siteHeader', ['$translate', function($translate) {
    
    var controller = ['$scope', '$state', '$rootScope', '$element',
        function($scope, $translate, $state, $rootScope, $element){
            
        }];

    return {
        replace: true,
        templateUrl: 'modules/directives/header/header.html',
        restrict: 'E',
        controller: controller
    }
}]);
