app.controller('userCtrl', ['$scope',"authenticationService", "$state", function($scope, authenticationService,$state) {

    $scope.user={};

    $scope.logout_user = function(){
        authenticationService.logoutCurrentUser(function(){
            $state.go("access.signin");
        });
    }

    authenticationService.getCurrentUser(function(user){
        $scope.user.username = user.userName;
    });


}]);
