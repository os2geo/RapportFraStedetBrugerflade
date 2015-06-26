(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('organization', ['$scope', '$rootScope', '$http', '$stateParams', '$state',
        function ($scope, $rootScope, $http, $stateParams, $state) {

            $scope.organizationid = $stateParams.organization;
            $scope.logosrc = "/couchdb/" + $rootScope.appID + "/" + $scope.organizationid + "/logo";
            $scope.organization = {};
            $scope.logo = false;
            $http.get('/couchdb/' + $rootScope.appID + '/' + $stateParams.organization).
            success(function (data, status, headers, config) {
                $scope.organization = data;
                if (data._attachments && data._attachments.logo) {
                    $scope.logo = true;
                }
            }).
            error(function (data, status, headers, config) {
                console.log(data);
            });
        }
    ]);
})(this, this.angular, this.console);