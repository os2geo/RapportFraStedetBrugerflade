(function (window, angular, console, tv4) {
    'use strict';
    angular.module('myApp.controllers').controller('config-text', ['$scope', '$http',
        function ($scope, $http) {

            $scope.tekst = angular.toJson($scope.$parent.doc, true);
            $scope.$on("saved", function () {
                $scope.tekst = angular.toJson($scope.$parent.doc, true);
            });
            $scope.$watch("tekst", function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.textError = null;
                    try {
                        $scope.$parent.doc = JSON.parse(newValue);
                        $scope.$emit('validate');
                    } catch (ex) {
                        $scope.textError = ex.message;
                        $scope.$parent.valid = null;
                    }
                }
            });
            $scope.$watch("doc", function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.tekst = angular.toJson($scope.$parent.doc, true);
                }
            });
        }
    ]);
})(this, this.angular, this.console, this.tv4);