(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-sagsbehandler-5', ['$scope', '$rootScope', '$http', '$stateParams', '$state',
        function ($scope, $rootScope, $http, $stateParams, $state) {
            $scope.yes = function () {
                $rootScope.wizard.email.sagsbehandler.send = true;
                $rootScope.wizard.step.sagsbehandler = 5.1;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.sagsbehandler.5.1');
            }
            $scope.no = function () {
                $rootScope.wizard.email.sagsbehandler.send = false;
                $rootScope.wizard.step.sagsbehandler = 6;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.sagsbehandler.6');
            }
        }
    ]);
})(this, this.angular, this.console);