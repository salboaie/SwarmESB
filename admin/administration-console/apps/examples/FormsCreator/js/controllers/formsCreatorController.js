'use strict';
app.controller('formCreatorController', ['$scope','swarmHubService',
    function ($scope,swarmHubService) {

        var swarmHub = swarmHubService.hub;

        $scope.form = {};
        $scope.forms = [];
        $scope.zones = [];
        $scope.newForm = false;
        $scope.waitingForConfirmation = true;

        swarmHub.startSwarm("forms.js","retrieveForms");
        swarmHub.startSwarm("zones.js","getAllZones");

        $scope.submitForm = function(){
            swarmHub.startSwarm("forms.js","submitForm",$scope.form);
            $scope.waitingForConfirmation = true;
        };

        swarmHub.on("forms.js","formSubmitted",function(swarm){
            $scope.waitingForConfirmation = false;
            $scope.forms.push($scope.form);
            $scope.newForm = false;
            $scope.$apply()
            alert('Form submitted successfully')
        });

        swarmHub.on("forms.js","failed",function(swarm){
            $scope.waitingForConfirmation = false;
            alert('An error occured');
            console.log(swarm.err);
        });

        swarmHub.on("forms.js","gotForms",function(swarm){
            $scope.waitingForConfirmation = false;
            $scope.forms = swarm.forms;
            $scope.$apply();
        });
        swarmHub.on("zones.js","gotAllZones",function(swarm){
            $scope.zones = swarm.zones;
            $scope.$apply();
        });


        $scope.formChanged = function(){
            $scope.form = JSON.parse($scope.form)
            $scope.form.name = undefined;
            $scope.newForm = true;
        }

        $scope.createNewForm = function(){
            $scope.form = {structure:{}};
            $scope.newForm = true;
        }
    }]);

