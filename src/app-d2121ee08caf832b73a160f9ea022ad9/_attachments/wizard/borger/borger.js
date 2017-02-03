(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-borger', ['$scope', '$rootScope', '$http', '$stateParams', '$state',
        function ($scope, $rootScope, $http, $stateParams, $state) {
            $scope.next = function () {
                $rootScope.wizard.step.borger = 1;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.borger.1');
            }
        }
    ]);
})(this, this.angular, this.console);