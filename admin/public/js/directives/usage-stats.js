angular.module('app')
    .directive('usageStats',  function () {
        return {
            templateUrl: 'js/directives/templates/usage-stats.html',
            restrict: 'A',
            transclude: true,
            scope: {
                stat: '=',
            },
            link: function ($scope) {

            }
        };
    });