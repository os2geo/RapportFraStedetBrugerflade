(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('config', ['$scope', '$rootScope', '$http', '$stateParams',
        function ($scope, $rootScope, $http, $stateParams) {
            $http.get('/couchdb/' + $rootScope.appID + '-' + $stateParams.organization + '/' + $stateParams.configuration).
            success(function (configuration, status, headers, config) {
                $scope.configuration = configuration;
                if (configuration._attachments) {
                    $scope.imagesrc = '/couchdb/' + $rootScope.appID + '-' + $stateParams.organization + '/' + configuration._id + '/logo';
                }
            }).
            error(function (data, status, headers, config) {});

            $scope.configurationId = $stateParams.configuration;
            $scope.organizationId = $stateParams.organization;
            $scope.doc = {
                "_id": $stateParams.configuration,
                widgets: [],
                map: {
                    baselayers: [{
                        name: "Open Street Map",
                        type: 'xyz',
                        url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                        attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> bidragyderer",
                        epsg: '3857',
                        selected: true,
                        bounds: [[55, 8], [57, 15]]
                            }],
                    overlays: []
                },
                type: "configuration",
                organization: $stateParams.organization,
                security: []
            };
            $http.get('/couchdb/' + $rootScope.appID + '/' + $stateParams.configuration).
            success(function (configuration, status, headers, config) {
                $scope.doc = configuration;
                $scope.doc.type = "configuration";
                $scope.doc.organization = $stateParams.organization;
                $scope.doc.security = $scope.doc.security || [];
            }).
            error(function (data, status, headers, config) {

            });
            $scope.save = function () {
                $scope.success = null;
                $scope.error = null;
                $http.put('/api/rfsconfig/' + $rootScope.appID + '/' + $scope.doc._id, $scope.doc).
                success(function (data, status, headers, config) {
                    $scope.success = data;
                    $scope.doc._rev = data.rev;
                    $scope.changed = false;
                    $scope.$broadcast('saved');
                }).
                error(function (data, status, headers, config) {
                    $scope.error = data;
                });
            };


            $scope.$on("validate", function () {
                $scope.changed = true;
            });
        }
    ]);
})(this, this.angular, this.console);