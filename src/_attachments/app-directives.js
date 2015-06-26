(function (window, angular) {
    'use strict';
    /* Directives */
    angular.module('myApp.directives', [])
        .directive('image', function () {
            return {
                scope: {
                    onLoad: '&'
                },
                link: function (scope, element, attrs) {
                    element.bind("load", function (e) {
                        scope.onLoad(e);
                    });
                }
            };
        });
})(this, this.angular);