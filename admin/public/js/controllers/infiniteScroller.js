app.controller('InfiniteController', function($scope) {
    $scope.swarms = [];

    for(var i = 1; i <= 50; i++) {
        $scope.swarms.push(i);
    }

    $scope.loadMore = function() {
        var last = $scope.swarms[$scope.swarms.length - 1];
        for(var i = 1; i <= 8; i++) {
            $scope.swarms.push(last + i);
        }
    };
});