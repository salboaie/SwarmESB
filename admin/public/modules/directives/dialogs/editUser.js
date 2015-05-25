
'use strict';

SwarmMonitor.directive('editUser', [function() {
    
    var controller = ['$scope', '$state', '$rootScope', '$element',
        function($scope, $translate, $state, $rootScope, $element){
            $scope.status  = "";

            $scope.labelTitle = "Editing user: ";
            $scope.editUID = false;
            var organisationId = $scope.$parent.selectedOrganisation.organisationId;

            $scope.user = $scope.$parent.currentUser;
            if(!$scope.user){
                $scope.editUID = true;
                $scope.labelTitle = "New user: ";
                $scope.user = {
                    userId:"",
                    userName:"none",
                    password:"",
                    organisationId:organisationId
                }
            }

            $scope.saveUser = function(){
                if($scope.editUID ){
                    if(!$scope.user.userId ) {
                        $scope.status = 'Invalid user id...';
                        return;
                    }

                    if(!$scope.user.password ) {
                        $scope.status = 'Invalid password...';
                        return;
                    }

                    swarmHub.startSwarm('UserCtrl.js', 'create', $scope.user);
                    $scope.status = 'Creating...';

                } else {
                    swarmHub.startSwarm('UserCtrl.js', 'update', $scope.user);
                    $scope.status = 'Saving...';
                }
            }

            $scope.deleteUser = function() {
                if (!$scope.editUID) {
                    var txt;
                    var r = confirm("Confirm deletion of user '"+ $scope.user.userId + "'?");
                    if (r == true) {
                        swarmHub.startSwarm('UserCtrl.js', 'delete', $scope.user);
                        $scope.closeThisDialog('Deleting...');
                    } else {
                        //..
                    }
                }
            }

            function closeMe(){
                if($scope.dialog){
                    $scope.dialog.close();
                }
                swarmHub.off('UserCtrl.js', 'userCreationDone', closeMe);
                swarmHub.off('UserCtrl.js', 'saveDone', closeMe);
            }

            swarmHub.on('UserCtrl.js', 'userCreationDone', closeMe);
            swarmHub.on('UserCtrl.js', 'saveDone', closeMe);

            swarmHub.on('UserCtrl.js', "userCreationFailed", function(){
                $scope.status = 'Failed to create, wrong id...';
                $scope.$apply();
            });

            swarmHub.on('UserCtrl.js', 'userUpdateFailed', function(){
                $scope.status = 'Validate your input...';
                $scope.$apply();
            });
        }];

    return {
        replace: true,
        templateUrl: 'modules/directives/dialogs/editUser.html',
        restrict: 'E',
        controller: controller
    }
}]);
