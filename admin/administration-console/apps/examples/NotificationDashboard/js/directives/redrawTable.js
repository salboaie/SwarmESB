angular.module('app')
	.directive('redrawTable', function() {
		return function(scope, element, attrs) {
			var table = $("#usersTable");
			table[0].style.visibility = "hidden";

			if (scope.$last){
				table.trigger('footable_redraw');
				table[0].style.visibility = "visible";
			}
		};
	});
