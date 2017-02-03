(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-sagsbehandler-1', ['$scope', '$rootScope', '$http', '$stateParams', '$state', '$q',
        function ($scope, $rootScope, $http, $stateParams, $state, $q) {
            $scope.organization = $stateParams.organization;
            $scope.showCommon = true;
            var getOverlay = function (data) {
                return $q(function (resolve, reject) {
                    var overlayReturn;
                    for (var i = 0; i < data.map.overlays.length; i++) {
                        var overlay = data.map.overlays[i];
                        $rootScope.wizard.overlays.sagsbehandler.push({
                            name: overlay.name,
                            configuration: {
                                name: $scope.template.doc.name,
                                id: $scope.template.id
                            },
                            overlay: overlay
                        });
                        if (overlay.database === $rootScope.wizard.template.borger.overlay.database) {
                            overlayReturn = overlay;
                        }
                    }
                    if (overlayReturn) {
                        resolve(overlayReturn);
                    }
                    reject("Der findes ikke et indberetningslag i skabelonen");
                });
            };
            $scope.templateChanged = function () {
                delete $scope.error;
                delete $rootScope.wizard.template.sagsbehandler.configuration;
                delete $rootScope.wizard.template.sagsbehandler.overlay;
                $rootScope.wizard.template.sagsbehandler = {
                    template: $scope.template.id
                };
                $rootScope.wizard.baselayers.sagsbehandler = [];
                $rootScope.wizard.overlays.sagsbehandler = [];
                $rootScope.wizard.attachments.sagsbehandler = [];
                $rootScope.wizard.fields.sagsbehandler = [];
                $rootScope.wizard.email.sagsbehandler = { users: {} };
                var data;
                if ($scope.template) {
                    $q.when().then(function () {
                        if ($scope.template.doc._attachments && $scope.template.doc._attachments.logo) {
                            return $q.when(blobUtil.imgSrcToDataURL('/couchdb/' + $rootScope.appID + '-' + $scope.template.organization + '/' + $scope.template.id + '/logo', $scope.template.doc._attachments.logo.content_type)).then(function (dataURL) {
                                $rootScope.wizard.template.sagsbehandler.image = dataURL;
                                $rootScope.wizard.template.sagsbehandler.imageType = $scope.template.doc._attachments.logo.content_type;
                                //$rootScope.$apply();
                            });
                        }
                        return;
                    }).then(function () {
                        return $http.get('/couchdb/' + $rootScope.appID + '/' + $scope.template.id);
                    }).then(function (res) {
                        data = res.data;
                        return getOverlay(data);
                    }).then(function (overlay) {
                        $rootScope.wizard.template.sagsbehandler.overlay = overlay;
                        $rootScope.wizard.template.sagsbehandler.configuration = data;
                        $rootScope.wizard.template.sagsbehandler.name = $scope.template.doc.name.substring(2) + '1';
                        $rootScope.wizard.template.sagsbehandler.description = $scope.template.doc.description;
                        for (var i = 0; i < data.map.baselayers.length; i++) {
                            var overlay = data.map.baselayers[i];
                            $rootScope.wizard.baselayers.sagsbehandler.push({
                                name: overlay.name,
                                configuration: {
                                    name: $scope.template.doc.name,
                                    id: $scope.template.id
                                },
                                overlay: overlay
                            });
                        }
                    }).catch(function (err) {
                        $scope.error = JSON.stringify(err);
                    });
                }
            };
            $scope.showCommonChanged = function () {
                getAll();
            };
            $scope.onFileSelect = function ($files) {
                $scope.error = null;
                if ($files.length > 0) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL($files[0]);
                    fileReader.onload = function (e) {
                        var image = new Image();
                        image.onload = function () {
                            if (this.width !== 80 && this.height !== 80) {
                                $scope.$apply(function () {
                                    $scope.error = "Billedet skal være 80x80 pixel";
                                });
                            } else {
                                $rootScope.wizard.template.sagsbehandler.image = e.target.result;
                                $rootScope.$apply();
                            }
                        };
                        image.src = e.target.result;
                    };
                }
            };
            var get = function (organization, symbol) {
                return $http.get('/couchdb/' + $rootScope.appID + '-' + organization + '/_all_docs?include_docs=true').success(function (data, status, headers, config) {
                    if (symbol === '⚬') {
                        $scope.names = [];
                    }
                    for (var i = 0; i < data.rows.length; i++) {
                        var template = data.rows[i]
                        if (symbol === '⚬') {
                            $scope.names.push(template.doc.name);
                        }
                        template.doc.name = symbol + " " + template.doc.name;
                        template.organization = organization;
                        if (template.doc.isSagsbehandlerTemplate) {
                            $scope.configurations.push(template);
                        }
                        if ($rootScope.wizard.template.sagsbehandler.template === template.id) {
                            $scope.template = template;
                        }
                    }
                }).error(function (data, status, headers, config) {
                    $scope.error = data;
                });
            };
            var getAll = function () {
                $scope.configurations = [];
                get($stateParams.organization, '⚬').then(function () {
                    if ($scope.showCommon && $stateParams.organization != 'd2121ee08caf832b73a160f9ea08f0bb') {
                        get('d2121ee08caf832b73a160f9ea08f0bb', '⚭')
                    }
                });
            };
            $scope.submit = function (form) {
                if ($scope.names.indexOf($rootScope.wizard.template.sagsbehandler.name) !== -1) {
                    form.name.$error = { exist: true };
                    form.name.$valid = false;
                    form.$valid = false;
                }
                if (form.$valid && !$scope.error) {
                    $rootScope.wizard.step.sagsbehandler = 2;
                    sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                    $state.go('wizard.sagsbehandler.2');
                }
            };
            getAll();
        }
    ]);
})(this, this.angular, this.console);