(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('configurations', ['$scope', '$http', '$stateParams',
        function ($scope, $http, $stateParams) {
            /*$http.get('/couchdb/' + $rootScope.appID+'-'+ $stateParams.organization+'/_all_docs?include_docs=true').
            success(function (data, status, headers, config) {
                $scope.organization = data;
            }).
            error(function (data, status, headers, config) {
                console.log(data);
            });*/
        }
    ]);
})(this, this.angular, this.console);