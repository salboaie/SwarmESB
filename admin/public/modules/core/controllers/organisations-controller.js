
'use strict';

/*
        Controller angular pentru adaugarea si editarea de useri si organizatii.
        Editarea si adaugarea si face in dialog-uri create cu modulul angular ngDialog
 */

SwarmMonitor.controller('OrganisationsController', ['$scope', '$state', '$rootScope','ngDialog',
    function($scope, $state, $rootScope, ngDialog) {
        $scope.organisations = [];

        function resetDelete(){
            $scope.deleteLabel = "Delete";
            $scope.confirmDelete = false;
        }

        resetDelete();

        swarmHub.onSwarmConnection(function () {
            swarmHub.startSwarm('Organisations.js', 'organisationsList');
        });

        swarmHub.startSwarm('Organisations.js', 'organisationsList');

        swarmHub.on('Organisations.js','organisationsListDone', function (response) {

            $scope.organisations = response.organisationList;
            console.log("organisations",$scope.organisations, response);
            $scope.$apply();
        });


        swarmHub.on('Organisations.js','organisationCreationDone', function (response) {
            $scope.organisations.unshift(response.organisation);
            $scope.$apply();
        });

        $scope.selectOrganisation = function(event, organisation) {
            event.preventDefault();
            $scope.selectedOrganisation = organisation;
            resetDelete();
            swarmHub.startSwarm('UserCtrl.js', 'usersList',  $scope.selectedOrganisation.organisationId);
        };

        swarmHub.on('UserCtrl.js', 'userListDone', function(swarm){
            $scope.users = swarm.userList;
            $scope.$apply();
        });

        swarmHub.on('UserCtrl.js', 'userCreationDone', function(swarm){
            $scope.users.unshift(swarm.user);
            $scope.$apply();
        });

        swarmHub.on('UserCtrl.js', 'userDeleted', function(swarm){
            $scope.users = $scope.users.filter(function(el){
                return el.userId !== swarm.user.userId;
            });
            $scope.$apply();
        });


        $scope.addUser = function(event) {
            $scope.currentUser = null;
            var dialog =   ngDialog.open({
                template: '<edit-user> Expanding...</edit-user>',
                plain: true,
                scope: $scope
            });
            $scope.dialog = dialog;
        }


        $scope.deleteOrganisation = function(event) {
            if($scope.confirmDelete == false){
                $scope.confirmDelete = true;
                $scope.deleteLabel = "Introduce '"  + $scope.organisation.organisationId + "' above to confirm deletion of "+ "'"+ $scope.organisation.organisationId + "' organisation";
            } else {
                if($scope.confirmOrganisationId == $scope.organisation.organisationId){
                    swarmHub.startSwarm('Organisations.js','delete',  $scope.selectedOrganisation.organisationId);
                    $scope.organisations = $scope.organisations.filter(function(item){
                        return item.organisationId !== $scope.selectedOrganisation.organisationId;
                    });
                    $scope.selectedOrganisation = null;
                    resetDelete();
                }  else {
                    alert("To confirm deletion, enter the text: " + $scope.organisation.organisationId);
                }
            }
        }



        $scope.addNewOrganisation = function(event) {
            $scope.selectedOrganisation = null;
            $scope.dialog =  ngDialog.open({
                template: '<edit-organisation> Expanding...</edit-organisation>',
                plain: true,
                scope: $scope
            });

        }

        $scope.editUser = function(event, user) {
                console.log(user);
                $scope.currentUser = user;
                $scope.dialog = ngDialog.open({
                    template: '<edit-user> Expanding...</edit-user>',
                    plain: true,
                    scope: $scope
                });
            }
            //event.preventDefault();
        }

]);
