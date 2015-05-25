
'use strict';

SwarmMonitor.directive('login', ['$location','localStorageService', function(){
    
    var controller = ['$scope', '$location', 'localStorageService',
        function($scope, $location, localStorageService){
            $scope.status  = "";
            $scope.user = $scope.$parent.currentUser;



            $scope.login = function(){
                //init swarm system connection
                var swarmClient = new SwarmClient($location.host(), 8080,  $scope.user.userId,
                    $scope.user.password, "swarmMonitor", "testCtor",
                    function securityErrorFunction(err, data) {
                        $scope.status = 'Invalid user or password...';
                        $scope.$apply();
                    }, function errorFunction(err) {
                        $scope.status = 'Invalid connection...';
                        $scope.$apply();
                    });
                swarmHub.resetConnection(swarmClient);

                function closeMe(){
                    localStorageService.set('user', $scope.user.userId);
                    localStorageService.set('password', $scope.user.password);
                    $scope.closeThisDialog('Created...');
                    swarmHub.off('login.js', 'success', closeMe);
                    swarmHub.off('login.js', 'fail', fail);
                }

                function fail(){
                    $scope.status = 'Invalid user or password...';
                    $scope.$apply();
                }

                swarmHub.on('login.js', "success", function(swarm){
                    closeMe();
                });

                swarmHub.on('login.js', 'fail', fail);

            }

            $scope.user.userId = localStorageService.get('user');
            $scope.user.password = localStorageService.get('password');

            if($scope.user.userId){
                $scope.login();
            }
        }];

    return {
        replace: true,
        templateUrl: 'modules/directives/dialogs/login.html',
        restrict: 'E',
        controller: controller
    }
}]);
