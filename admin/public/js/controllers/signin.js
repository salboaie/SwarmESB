'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$scope', '$http', '$state','authenticationService',
        function($scope, $http, $state, authenticationService) {
    $scope.user = {};
    $scope.authError = null;
    $scope.login = function() {

    var securityErrorFunction = function(err, data) {
            $scope.authError = 'Invalid user or password...';
            $scope.$apply();
    }

    var errorFunction = function(err) {
            $scope.status = 'Invalid connection...';
            $scope.$apply();
    }

    var successFunction = function(){
        $state.go('app.privatesky');
    }

    authenticationService.authenticateUser($scope.user.username,$scope.user.password,securityErrorFunction, errorFunction, successFunction);

    };
  }])
;