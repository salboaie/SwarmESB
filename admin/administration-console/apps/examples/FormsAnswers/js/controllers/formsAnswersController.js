'use strict';
app.controller('formRenderedController', ['$scope','swarmHubService',
    function ($scope,swarmHubService) {

        var swarmHub = swarmHubService.hub;

        $scope.userEmail = undefined;
        $scope.forms = [];

        $scope.retrieveAnswers = function(form){
            swarmHub.startSwarm("forms.js","retrieveForms",{
                "email":$scope.userEmail
            });
        };

        swarmHub.on("forms.js","failed",function(swarm){
            alert('An error occured');
            console.log(swarm.err);
        });

        swarmHub.on("forms.js","gotForms",function(swarm){
            $scope.forms = swarm.forms.map(function(form,id){
                form.show = true;
                form.expand = false;
                form.id = id;
                return form;
            });
            swarmHub.startSwarm("forms.js","retrieveAnswers",{
                "email":$scope.userEmail
            });
            $scope.$apply();
        });

        swarmHub.on("forms.js","gotAnswers",function(swarm){
            swarm.answers.forEach(function(answer){
                $scope.forms.forEach(function (form) {
                    if(form.formId === answer.form){
                        form.data = answer.answer;
                        form.expand = true;
                    }
                })
            });
            $scope.$apply();
        });
    }]);

