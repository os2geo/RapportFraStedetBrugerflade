(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-sagsbehandler-2', ['$scope', '$rootScope', '$http', '$stateParams', '$state', '$modal',
        function ($scope, $rootScope, $http, $stateParams, $state, $modal) {
            $http.get('/api/users/' + $stateParams.organization).success(function (data, status, headers, config) {
                $scope.users = {};
                angular.forEach(data.rows, function (item) {
                    $scope.users[item.value.name] = $rootScope.wizard.template.sagsbehandler.configuration.security.indexOf(item.value.name) !== -1;
                });
            }).error(function (data, status, headers, config) {
                $scope.error = data;
            });

            $scope.change = function (item) {
                $rootScope.wizard.template.sagsbehandler.configuration.security = [];
                for (var key in $scope.users) {
                    if ($scope.users[key]) {
                        $rootScope.wizard.template.sagsbehandler.configuration.security.push(key);
                    }
                }

            };
            $scope.next = function () {
                $rootScope.wizard.step.sagsbehandler = 3;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.sagsbehandler.3');
            }

        }
    ]);
})(this, this.angular, this.console);