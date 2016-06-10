(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('config-delete', ['$scope', '$rootScope', '$http', '$stateParams', '$state',
        function ($scope, $rootScope, $http, $stateParams, $state) {
            $scope.delete = function () {
                $scope.error = null;
                $http.delete('/couchdb/' + $rootScope.appID + '-' + $stateParams.organization + '/' + $stateParams.configuration + '?rev=' + $scope.configuration._rev).
                success(function (data, status, headers, config) {
                    $http.get('/couchdb/' + $rootScope.appID + '/' + $stateParams.configuration).
                    success(function (configuration, status, headers, config) {
                        $http.delete('/couchdb/' + $rootScope.appID + '/' + $scope.configuration._id + '?rev=' + configuration._rev).
                        success(function (data, status, headers, config) {
                            $state.go('organization.configurations.list', {
                                organization: $stateParams.organization
                            });
                        }).
                        error(function (data, status, headers, config) {
                            $scope.error = data;
                        });
                    }).
                    error(function (data, status, headers, config) {
                        $state.go('organization.configurations.list', {
                            organization: $stateParams.organization
                        });
                    });
                }).
                error(function (data, status, headers, config) {
                    $scope.error = data;
                });
            };
        }]);
})(this, this.angular, this.console);