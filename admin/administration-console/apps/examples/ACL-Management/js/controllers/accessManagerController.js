'use strict';
app.controller('accessManagerController', ['$scope','ModalService','swarmHubService',
	function ($scope,ModalService,swarmHubService) {
		var swarmHub = swarmHubService.hub;

		$scope.searchFilter = {};
		$scope.rulesToDisplay = [];
		$scope.allRules = [];
		$scope.maxNrOfPages = 0;
		$scope.currentPage = 1;
		$scope.itemsPerPage = 10;
		$scope.maxPages = 5;
		$scope.advancedSearching = false;
		$scope.zones = [];

		swarmHub.startSwarm("acl.js", "getAllRules", $scope.searchFilter);
		swarmHub.startSwarm("zones.js","getAllZones");

		$scope.performSearch = function(){
			$scope.rulesToDisplay = [];
			$scope.allRules.forEach(function(rule){
				if(matchesFilter($scope.searchFilter,rule)){
					$scope.rulesToDisplay.push(rule);
				}
			});
			$scope.maxNrOfPages = Math.floor($scope.rulesToDisplay.length/$scope.itemsPerPage);
			$scope.maxNrOfPages += $scope.rulesToDisplay.length%$scope.itemsPerPage!==0?1:0;
		};

		swarmHub.on("zones.js","gotAllZones",function(swarm){
			$scope.zones = swarm.zones;
			$scope.$apply();
		});

		$scope.changeSearchModality = function(){
			$scope.searchFilter = {};
			$scope.advancedSearching = !$scope.advancedSearching;
		};



		$scope.createRule = function(){
			createRule("white_list",{},{});
		}
		$scope.addException = function(){
			createRule("black_list",{},{});
		}


		var swarmPredefinedValues = {
			"action":"execution",
			"contextType":"swarm"
		};

		var swarmLabels = {
			"zone":"The target users",
			"context":"Swarm Name",
			"subcontextType":"Swarm subcontext (usualy ctor)",
			"subcontext":"Swarm Constructor"
		};

		$scope.createSwarmRule = function(){
			createRule("white_list",swarmPredefinedValues,swarmLabels);
		};
		$scope.addSwarmException = function(){
			createRule("black_list",swarmPredefinedValues,swarmLabels);
		};

		$scope.editRule = editRule;
		$scope.removeRule = removeRule;
		$scope.changePage = function(currentPage){
			$scope.currentPage = currentPage;
		}

		function createRule (type,predefinedInputs,specificLabels){
			ModalService.showModal({
				templateUrl: "tpl/modals/createRule.html",
				controller: "createRuleController",
				inputs:{
					"type":type,
					"predefinedInputs":predefinedInputs,
					"specificLabels":specificLabels,
					'zones':$scope.zones
				}
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(rule) {
					swarmHub.startSwarm("acl.js","add",rule);
				});
			});
		}

		function editRule(rule){
			ModalService.showModal({
				templateUrl: "tpl/modals/editRule.html",
				controller: "editRuleController",
				inputs:{
					"rule":rule,
					'zones':$scope.zones
				}
			}).then(function(modal){
				modal.element.modal();
				modal.close.then(function(rule) {
					swarmHub.startSwarm("acl.js","update",rule);
				});
			});
		};

		function removeRule(rule){
			swarmHub.startSwarm("acl.js","remove",rule);
		};

		swarmHub.on("acl.js","gotRules",function(swarm){
			$scope.allRules = swarm.result;
			$scope.performSearch();
			$scope.$apply();
		});
		swarmHub.on("acl.js","ruleAdded",function(swarm){
			$scope.allRules.unshift(swarm.result);
			$scope.performSearch();
			$scope.$apply();
		});
		swarmHub.on("acl.js","ruleRemoved",function(swarm){
			$scope.allRules = $scope.allRules.filter(function(rule){
				if(rule.id===swarm.rule.id){
					return false;
				}
				return true;
			});
			$scope.performSearch();
			$scope.$apply();
		});
		swarmHub.on("acl.js","ruleUpdated",function(swarm){
			$scope.allRules = $scope.allRules.map(function(rule){
				if(rule.id===swarm.rule.id){
					return swarm.rule;
				}
				return rule;
			});
			$scope.performSearch();
			$scope.$apply();
		});
		swarmHub.on("acl.js","failed",function(swarm){
			console.log("Error "+swarm.err+" occured");
		});

		function matchesFilter(filter,obj){
			var matches = true;
			for(var field in filter){
				if(obj[field] !== filter[field] && filter[field]!==""){
					matches = false;
					break;
				}
			}
			return matches;
		}
	}]);

app.controller('createRuleController', ['$scope','type','predefinedInputs','zones','specificLabels',"$element",'close', function($scope,type,predefinedInputs,zones,specificLabels,$element, close) {
	$scope.rule = {};
	$scope.type = type;
	$scope.zones = zones;

	$scope.predefinedInputs = predefinedInputs;
	for(var prop in predefinedInputs){
		$scope.rule[prop] = predefinedInputs[prop];
	}

	$scope.labels = {
		"action":"Action",
		"zone":"User zone",
		"contextType":"Type of context",
		"context":"Context",
		"subcontextType":"Type of subcontext",
		"subcontext":"Subcontext"
	};
	if($scope.type ==="white_list"){
		$scope.labels.createMessage = "Create rule";
		$scope.labels.welcomeMessage = "Create new rule";
	}else{
		$scope.labels.createMessage = "Add exception";
		$scope.labels.welcomeMessage = "Add new exception"
	}
	for(var label in $scope.labels) {
		if (specificLabels[label]) {
			$scope.labels[label] = specificLabels[label];
		}
	}

	$scope.rule.type = type;
	$scope.createRule = function(){
		$element.modal('hide');
		close($scope.rule,500);
	}
}]);

app.controller('editRuleController',['$scope','rule','zones', '$element','close', function($scope,rule,zones,$element, close) {
	$scope.rule = {};
	$scope.zones = zones;
	for(var prop in rule){
		$scope.rule[prop] = rule[prop];
	}

	if(rule.type ==="white_list"){
		$scope.welcomeMessage = "Update rule";
	}else{
		$scope.welcomeMessage = "Update exception"
	}
	$scope.createMessage = "Update";



	$scope.updateRule = function(){
		$element.modal('hide');
		close($scope.rule,500);
	}
}]);