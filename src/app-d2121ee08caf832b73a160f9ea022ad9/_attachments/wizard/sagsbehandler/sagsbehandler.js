(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-sagsbehandler', ['$scope', '$rootScope', '$http', '$stateParams', '$state',
        function ($scope, $rootScope, $http, $stateParams, $state) {
            $scope.yes = function () {
                $rootScope.wizard.template.sagsbehandler = {
                    name: "",
                    description: "",
                    image: "",
                };
                $rootScope.wizard.step.sagsbehandler = 1;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.sagsbehandler.1');
            }
            $scope.no = function () {
                delete $rootScope.wizard.template.sagsbehandler;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.afslut');
            }
        }
    ]);
})(this, this.angular, this.console);