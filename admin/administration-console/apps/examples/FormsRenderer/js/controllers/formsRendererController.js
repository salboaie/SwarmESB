'use strict';
app.controller('formRenderedController', ['$scope',"swarmHubService",
    function ($scope,swarmHubService) {

        var swarmHub = swarmHubService.hub;

        $scope.form = {};
        $scope.forms = [];

        swarmHub.startSwarm("forms.js","retrieveForms");
        swarmHub.startSwarm("zones.js","");

        $scope.submitForm = function(form){
            swarmHub.startSwarm("forms.js","submitFormAnswer",form.data,form.formId);
            form.canModify = false;
        };

        swarmHub.on("forms.js","answerSubmitted",function(swarm){
            $scope.$apply();
            alert('Form submitted successfully')
        });

        swarmHub.on("forms.js","failed",function(swarm){
            alert('An error occured');
            console.log(swarm.err);
        });

        swarmHub.on("forms.js","gotForms",function(swarm){
            $scope.forms = swarm.forms.map(function(form,id){
                form.show = true;
                form.expand = false;
                form.id = id;
                form.canModify = true;
                return form;
            });
            swarmHub.startSwarm("forms.js","retrieveAnswers");
            $scope.$apply();
        });

        swarmHub.on("forms.js","gotAnswers",function(swarm){
            swarm.answers.forEach(function(answer){
                $scope.forms.forEach(function (form) {
                    //of course it can be done a lot faster than n^2... in case it bugs the algorithmicaly inclined among you
                    if(form.formId === answer.form){
                        form.data = answer.answer;
                        form.canModify = false;
                    }
                })
            });
            $scope.$apply();
        });
    }]);

