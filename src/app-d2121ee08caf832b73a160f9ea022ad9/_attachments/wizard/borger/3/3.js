(function (window, angular, console, L) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-borger-3', ['$scope', '$rootScope', '$http', '$stateParams', '$state', '$modal',
        function ($scope, $rootScope, $http, $stateParams, $state, $modal) {
            var map,
                selectedLayer;
            var modalInstance;
            $scope.add = function () {
                $scope.doc = {};
                modalInstance = $modal.open({
                    templateUrl: 'wizard/straks-modal.html',
                    scope: $scope
                });
            };
            $scope.cancel = function () {
                modalInstance.close();
            };
            $scope.mapCreated = function (mapvar) {
                map = mapvar;
                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?').addTo(map);
                map.fitBounds([
                    [
                        53.113655,
                        3.32016
                    ],
                    [
                        58.35397,
                        17.55777
                    ]
                ]);
                var key;
                for (key in $rootScope.wizard.straks) {
                    if ($rootScope.wizard.straks.hasOwnProperty(key)) {
                        $scope.selectedIndex = key;
                        break;
                    }
                }
                if (key) {
                    $scope.straks = $rootScope.wizard.straks[key];
                    selectedLayer = L.geoJson($rootScope.wizard.straks[key].geojson).addTo(map);
                    map.fitBounds(selectedLayer.getBounds());

                }

            };

            $scope.select = function (index) {
                if (map.hasLayer(selectedLayer)) {
                    map.removeLayer(selectedLayer);
                }
                $scope.selectedIndex = index;
                if (index) {
                    $scope.straks = $rootScope.wizard.straks[index];
                    selectedLayer = L.geoJson($scope.straks.geojson).addTo(map);
                    map.fitBounds(selectedLayer.getBounds());
                } else {
                    delete $scope.straks;
                }
            };



            $scope.onFileSelect = function ($files) {
                if ($files.length > 0) {
                    var fileReader = new FileReader();
                    fileReader.readAsText($files[0]);
                    fileReader.onload = function (e) {
                        $scope.fileError = false;
                        $scope.fileSuccess = true;
                        $scope.$apply();
                        $scope.doc.geojson = JSON.parse(e.target.result);                        
                    };
                }
            };


            $scope.submit = function (form) {
                $scope.fileError = false;
                if (!$scope.doc.geojson) {
                    $scope.fileError = true;
                    return;
                }
                if (form.$valid) {
                    modalInstance.close();
                    $http.get('/couchdb/_uuids').success(function (data, status, headers, config) {
                        var uuid = data.uuids[0];
                        $rootScope.wizard.straks = $rootScope.wizard.straks || {};
                        $rootScope.wizard.straks[uuid] = $scope.doc;
                        $scope.select(uuid);

                    }).error(function (data, status, headers, config) {
                        $scope.error = data;
                    });
                    
                }
            };
            $scope.delete = function () {
                delete $rootScope.wizard.straks[$scope.selectedIndex];
                $scope.select(null);
            };
            $scope.next = function () {
                $rootScope.wizard.step.borger = 4;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.borger.4');
            }
        }]);
})(this, this.angular, this.console, this.L);