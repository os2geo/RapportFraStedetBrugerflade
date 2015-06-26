(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('login', ['$scope', 'auth', '$http', 'md5', '$state', '$rootScope',
        function ($scope, auth, $http, md5, $state, $rootScope) {
            $scope.user = {
                name: "",
                password: "",
            };
            $scope.submit = function () {
                $scope.error = null;

                $http.post('/api/signin', $scope.user)

                .success(function (data, status, headers, config) {
                    $state.go($rootScope.lastState);
                })

                .error(function (data, status, headers, config) {
                    $scope.error = data;
                });
            };
        }
    ]);
})(this, this.angular, this.console);