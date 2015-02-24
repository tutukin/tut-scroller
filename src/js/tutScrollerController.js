angular.module('tutScroller').controller('tutScrollerController',[
    '$scope',
    function ($scope) {
        $scope.shift    = 0;
        $scope.pos      = [];
        $scope.reference= null;

        $scope.getX     = function getX (n) {
            return $scope.pos[n] + $scope.shift;
        };

        $scope.translate= function move (s) {
            var res = ($scope.shift + s) % $scope.contentWidth;
            if ( res <= -$scope.itemWidth ) {
                res += $scope.contentWidth;
            }
            return res;
        };
    }
])
