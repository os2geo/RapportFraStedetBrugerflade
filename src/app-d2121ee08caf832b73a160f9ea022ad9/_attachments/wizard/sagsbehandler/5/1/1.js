(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-sagsbehandler-5-1', ['$scope', '$rootScope', '$http', '$stateParams', '$state',
        function ($scope, $rootScope, $http, $stateParams, $state) {
            $scope.submit = function (myform) {
                if (myform.$valid && !$scope.error) {                    
                    $rootScope.wizard.step.sagsbehandler = 5.2;
                    sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                    $state.go('wizard.sagsbehandler.5.2');
                }
            }
        }
    ]);
})(this, this.angular, this.console);