(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-borger-6', ['$scope', '$rootScope', '$http', '$stateParams', '$state',
        function ($scope, $rootScope, $http, $stateParams, $state) {
            $scope.yes = function () {
                $rootScope.wizard.email.borger.send = true;
                $rootScope.wizard.step.borger = 6.1;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.borger.6.1');
            }
            $scope.no = function () {
                if($rootScope.wizard.schema.properties.properties.dependencies){
                    delete $rootScope.wizard.schema.properties.properties.dependencies;
                }
                $rootScope.wizard.email.borger.send = false;
                $rootScope.wizard.step.borger = 7;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.borger.7');
            }
        }
    ]);
})(this, this.angular, this.console);