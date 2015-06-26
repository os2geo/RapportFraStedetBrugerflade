(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('configurations-list', ['$scope', '$rootScope', '$http', '$stateParams',
        function ($scope, $rootScope, $http, $stateParams) {
            $scope.organization = $stateParams.organization;
            $scope.db = $rootScope.appID + '-' + $stateParams.organization;
            //$http.get('/couchdb/' + $rootScope.appID + '/_design/config/_view/configuration?key="' + $stateParams.organization + '"').
            $http.get('/couchdb/' + $scope.db + '/_all_docs?include_docs=true').
            success(function (data, status, headers, config) {
                $scope.configurations = data.rows;
            }).
            error(function (data, status, headers, config) {
                console.log(data);
            });
            $scope.design = function (doc) {
                if (doc.id === '_design/security') {
                    return false;
                }
                return true;
            }
        }
    ]);
})(this, this.angular, this.console);