(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('organization-delete', ['$scope', '$rootScope', '$state', '$http', '$stateParams',
        function ($scope, $rootScope, $state, $http, $stateParams) {
            $scope.error = null;
            $scope.delete = function () {
                if ($scope.organization) {
                    $http.delete('/couchdb/' + $rootScope.appID + '-organizations/' + $stateParams.organization + '?rev=' + $scope.organization._rev).
                    success(function (data, status, headers, config) {
                        $state.go('organization.info', {
                            organization: $stateParams.organization
                        });
                    }).
                    error(function (data, status, headers, config) {
                        $scope.error = data;
                    });
                }
            };
        }
    ]);
})(this, this.angular, this.console);