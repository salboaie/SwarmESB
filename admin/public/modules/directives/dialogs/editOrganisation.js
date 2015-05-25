
magic_counter = 0;

'use strict';

SwarmMonitor.directive('editOrganisation', [function() {
    
    var controller = ['$scope', '$state', '$rootScope', '$element',
        function($scope, $translate, $state, $rootScope, $element){
            var closeDialog = $scope.closeThisDialog;
            $scope.createNew = false;
            magic_counter++;
            console.log("Magic counter ", magic_counter);

            function checkOrganisation(){

                $scope.organisation = $scope.selectedOrganisation;
                if(!$scope.organisation){
                    $scope.createNew = true;
                    $scope.organisation = {};
                    $scope.organisation.organisationId  = ""
                    $scope.organisation.displayName     = "";
                    $scope.organisation.agent           = "";
                } else {
                    $scope.createNew = false;
                }
            }


            $scope.$watch('selectedOrganisation', function(newVal, oldVal){
                checkOrganisation();
            });


            $scope.checkInput = function(){
                if($scope.createNew){
                    if(!$scope.organisation.organisationId){
                        $scope.status = 'Organisation ID cant be empty';
                        return ;
                    }
                    swarmHub.startSwarm('Organisations.js', 'create', $scope.organisation);
                } else {
                    swarmHub.startSwarm('Organisations.js', 'update', $scope.organisation);
                }
                $scope.status = 'Saving...';
            }

            $scope.synchronise = function(){
                swarmHub.startSwarm('SynchroniseImages.js', 'agentForceIndex', $scope.organisation.agent);
            }


            function closeMe(){
                $scope.selectedOrganisation = $scope.organisation;
                if($scope.dialog){
                    $scope.dialog.close();
                }
                swarmHub.off('Organisations.js', 'organisationCreationDone', closeMe);
            }

            function saveDone(){
                $scope.status = 'Saved';
                //swarmHub.off('Organisations.js', 'organisationUpdateDone', saveDone);
                $scope.$apply();
            }

            swarmHub.on('Organisations.js', 'organisationCreationDone', closeMe);
            swarmHub.on('Organisations.js', 'organisationUpdateDone', saveDone);


            function creationFailed(swarm){
                $scope.status = "Organisation id \'" + $scope.organisationId +"\' already exists or is invalid! Try another!";
                $scope.$apply();
            }
            swarmHub.on('Organisations.js', 'creationFailed', creationFailed);


        }];

    return {
        replace: true,
        templateUrl: 'modules/directives/dialogs/editOrganisation.html',
        restrict: 'E',
        controller: controller
    }
}]);
