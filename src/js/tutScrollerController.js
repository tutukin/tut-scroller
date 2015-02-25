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
            var left = ($scope.shift + s) % $scope.contentWidth;
            var right = left + $scope.itemWidth;

            if ( left <= -$scope.itemWidth ) {
                left += $scope.contentWidth;
            }

            if ( left < $scope.contentWidth && right > $scope.contentWidth ) {
                left -= $scope.contentWidth;
            }

            return left;
        };
    }
])
