(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-borger-7', ['$scope', '$rootScope', '$http', '$stateParams', '$state', '$modal',
        function ($scope, $rootScope, $http, $stateParams, $state, $modal) {
            var modalInstance;
            $scope.doc = { showCommon: true };
            $scope.addOverlay = function () {
                $scope.doc.configuration = null;
                $scope.doc.overlay = null;
                $scope.doc.name = null;
                modalInstance = $modal.open({
                    templateUrl: 'wizard/baselayer-modal.html',
                    scope: $scope
                });
            };
            $scope.removeOverlay = function (overlay) {
                for (var i = 0; i < $rootScope.wizard.baselayers.borger.length; i++) {
                    if ($rootScope.wizard.baselayers.borger[i].$$hashKey === overlay.$$hashKey) {
                        $rootScope.wizard.baselayers.borger.splice(i, 1);
                        break;
                    }
                }
            }
            $scope.submit = function (form) {
                if (form.$valid && !$scope.error) {
                    $scope.doc.overlay.selected = false;
                    $rootScope.wizard.baselayers.borger.push({
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
                    $scope.doc.overlays = data.map.baselayers;
                }).error(function (data, status, headers, config) {
                    $scope.error = data;
                });
            }
            $scope.showCommonChanged = function () {
                getAll();
            };
            $scope.startChanged = function (item) {
                for (var i = 0; i < $rootScope.wizard.baselayers.borger.length; i++) {
                    if ($rootScope.wizard.baselayers.borger[i].$$hashKey !== item.$$hashKey) {
                        $rootScope.wizard.baselayers.borger[i].overlay.selected = false;
                    }
                }
            };
            var get = function (organization, symbol) {
                return $http.get('/couchdb/' + $rootScope.appID + '-' + organization + '/_all_docs?include_docs=true').
                    success(function (data, status, headers, config) {
                        for (var i = 0; i < data.rows.length; i++) {
                            var template = data.rows[i]
                            template.doc.name = symbol + " " + template.doc.name;
                            template.organization = organization;
                            if (template.doc.isBorgerTemplate) {
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
                $scope.error = "";
                var selected = false;
                for (var i = 0; i < $rootScope.wizard.baselayers.borger.length; i++) {
                    if ($rootScope.wizard.baselayers.borger[i].overlay.selected === true) {
                        selected = true;
                        break;
                    }
                }
                if ($rootScope.wizard.baselayers.borger.length === 0) {
                    $scope.error = "Der skal mindst være ét baggrundskort"
                } else if (!selected) {
                    $scope.error = "Der er ikke valgt et baggrundskort som skal vises ved opstart"
                } else {
                    $rootScope.wizard.step.borger = 8;
                    sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                    $state.go('wizard.borger.8');
                }
            }
        }
    ]);
})(this, this.angular, this.console);