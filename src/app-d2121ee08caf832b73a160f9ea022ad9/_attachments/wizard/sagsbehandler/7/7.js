(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-sagsbehandler-7', ['$scope', '$rootScope', '$http', '$stateParams', '$state', '$modal',
        function ($scope, $rootScope, $http, $stateParams, $state, $modal) {
            var modalInstance;
            $scope.doc = { showCommon: true };
            $scope.addOverlay = function () {
                $scope.doc.configuration = null;
                $scope.doc.overlay = null;
                $scope.doc.name = null;
                modalInstance = $modal.open({
                    templateUrl: 'wizard/overlay-modal.html',
                    scope: $scope
                });
            };
            $scope.removeOverlay = function (overlay) {
                for (var i = 0; i < $rootScope.wizard.overlays.sagsbehandler.length; i++) {
                    if ($rootScope.wizard.overlays.sagsbehandler[i].$$hashKey === overlay.$$hashKey) {
                        $rootScope.wizard.overlays.sagsbehandler.splice(i, 1);
                        break;
                    }
                }
            }
            $scope.submit = function (form) {
                if (form.$valid && !$scope.error) {
                    $rootScope.wizard.overlays.sagsbehandler.push({
                        name: $scope.doc.name,
                        configuration: {
                            name: $scope.doc.configuration.doc.name,
                            id: $scope.doc.configuration.id
                        },
                        overlay: $scope.doc.overlay
                    });
                    modalInstance.close();
                }
            };
            $scope.cancel = function () {
                modalInstance.close();
            };

            $scope.overlayChanged = function () {
                $scope.doc.name = $scope.doc.overlay.name;
            }
            $scope.configurationChanged = function () {
                $scope.doc.overlays = [];
                $scope.doc.overlay = null;
                $http.get('/couchdb/' + $rootScope.appID + '/' + $scope.doc.configuration.id).success(function (data) {
                    $scope.doc.overlays = data.map.overlays;
                }).error(function (data, status, headers, config) {
                    $scope.error = data;
                });
            }
            $scope.showCommonChanged = function () {
                getAll();
            };

            var get = function (organization, symbol) {
                return $http.get('/couchdb/' + $rootScope.appID + '-' + organization + '/_all_docs?include_docs=true').
                    success(function (data, status, headers, config) {
                        for (var i = 0; i < data.rows.length; i++) {
                            var template = data.rows[i]
                            template.doc.name = symbol + " " + template.doc.name;
                            template.organization = organization;
                            if (template.doc.isSagsbehandlerTemplate) {
                                $scope.doc.configurations.push(template);
                            }
                        }
                    }).
                    error(function (data, status, headers, config) {
                        $scope.error = data;
                    });
            };
            $scope.doc.configurations = [];
            var getAll = function () {
                get($stateParams.organization, '⚬').then(function () {
                    if ($scope.doc.showCommon && $stateParams.organization != 'd2121ee08caf832b73a160f9ea08f0bb') {
                        get('d2121ee08caf832b73a160f9ea08f0bb', '⚭')
                    }
                });
            };
            getAll();
            $scope.next = function () {
                $rootScope.wizard.step.sagsbehandler = 7;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.afslut');
            }
        }
    ]);
})(this, this.angular, this.console);