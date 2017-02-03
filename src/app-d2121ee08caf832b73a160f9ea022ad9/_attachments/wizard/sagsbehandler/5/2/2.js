(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-sagsbehandler-5-2', ['$scope', '$rootScope', '$http', '$stateParams', '$state', 'md5',
        function ($scope, $rootScope, $http, $stateParams, $state, md5) {

            $scope.addUser = function () {
                $rootScope.wizard.email.sagsbehandler.users[$scope.user] = {
                    rules: {}
                };
                delete $scope.users[$scope.user];

                $scope.user = null;
            };
            $scope.removeUser = function (key) {
                $scope.users[key] = $scope.allusers[key];
                delete $rootScope.wizard.email.sagsbehandler.users[key];
            };
            $http.get('/api/users/' + $stateParams.organization).success(function (data, status, headers, config) {
                $scope.users = {};
                $scope.allusers = {};
                angular.forEach(data.rows, function (item) {
                    if (!$rootScope.wizard.email.sagsbehandler.users.hasOwnProperty(item.value.name)) {
                        $scope.users[item.value.name] = $scope.allusers[item.value.name] = "";
                    }
                    $http.jsonp("//www.gravatar.com/" + md5.createHash(item.value.name) + ".json?callback=JSON_CALLBACK").success(function (data, status, headers, config) {
                        if (data.entry && data.entry.length > 0 && data.entry[0].name && data.entry[0].name.formatted) {
                            $scope.allusers[item.value.name] = data.entry[0].name.formatted;
                            if (!$rootScope.wizard.email.sagsbehandler.users.hasOwnProperty(item.value.name)) {
                                $scope.users[item.value.name] = data.entry[0].name.formatted;
                            }
                        }

                    }).error(function (data, status, headers, config) { });
                });

            }).error(function (data, status, headers, config) {
                console.log(data);
            });

            $scope.previous = function () {
                $state.go('wizard.sagsbehandler.5.1');
            }
            $scope.next = function () {
                $rootScope.wizard.step.sagsbehandler = 6;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.sagsbehandler.6');
            }
        }
    ]);
})(this, this.angular, this.console);