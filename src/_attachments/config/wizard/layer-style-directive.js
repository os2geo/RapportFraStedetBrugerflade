(function (window, angular, console) {
    'use strict';
    /* Directives */
    angular.module('myApp.directives')

    .directive("layerStyle", function ($compile, $http) {
        return {
            restrict: "E",
            scope: {
                layerStyle: '=',
                layer: '=',
                schema: '='
            },
            templateUrl: 'config/wizard/layer-style.html',
            compile: function (tElement, tAttr) {
                var contents = tElement.contents().remove();
                var compiledContents;
                return function (scope, iElement, iAttr) {
                    if (!compiledContents) {
                        compiledContents = $compile(contents);
                    }
                    compiledContents(scope, function (clone, scope) {
                        iElement.append(clone);
                    });
                };
            },
            controller: function ($scope) {
                $scope.$on('remove', function (event) {
                    if (!event.defaultPrevented) {
                        $scope.layer.styles.splice($scope.$parent.$parent.$parent.$index, 1);
                        $scope.$emit('validate');
                        event.preventDefault();
                    }
                });
                $scope.layerStyle.displayAs = $scope.layerStyle.displayAs || "Point";
                $scope.lineJoinOptions = ["miter", "round", "bevel", "inherit"];
                $scope.lineCapOptions = ["butt", "round", "square", "inherit"];
                $scope.pointTypeOptions = ["marker", "circle", "circleMarker"];
            }
        };
    });
})(this, this.angular, this.console);