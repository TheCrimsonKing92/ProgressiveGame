(function(){
    angular.module('app')
        .filter('floor', function () {
        return function (input) {
            return Math.floor(input);
        };
    });
})();