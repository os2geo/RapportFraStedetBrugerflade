(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-borger-1', ['$scope', '$rootScope', '$http', '$stateParams', '$state', '$q',
        function ($scope, $rootScope, $http, $stateParams, $state, $q) {
            $scope.organization = $stateParams.organization;
            $scope.showCommon = true;
            var getWidget = function (data) {
                return $q(function (resolve, reject) {
                    for (var i = 0; i < data.widgets.length; i++) {
                        var widget = data.widgets[i];
                        if (widget.id === 'indberetninger') {
                            resolve(widget.layers[0]);
                        }
                    }
                    reject("Der findes ikke en inberetnings widget i skabelonen");
                });
            };
            var getOverlay = function (id, data) {
                return $q(function (resolve, reject) {
                    var overlayReturn;
                    for (var i = 0; i < data.map.overlays.length; i++) {
                        var overlay = data.map.overlays[i];
                        $rootScope.wizard.overlays.borger.push({
                            name: overlay.name,
                            configuration: {
                                name: $scope.template.doc.name,
                                id: $scope.template.id
                            },
                            overlay: overlay
                        });
                        if (overlay.id === id) {
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
                $rootScope.wizard = {
                    step: {
                        wizard: 1,
                        borger: 1,
                        sagsbehandler: 0
                    },
                    template: {
                        borger: {
                            name: "",
                            description: "",
                            image: "",
                            template: $scope.template.id
                        }
                    },
                    database: {
                        fields: []
                    },
                    overlays: {
                        borger: [],
                        sagsbehandler: []
                    },
                    baselayers: {
                        borger: [],
                        sagsbehandler: []
                    },
                    email: {
                        borger: {},
                        sagsbehandler: {
                            users: {}
                        }
                    },
                    attachments: {
                        borger: [],
                        sagsbehandler: []
                    },
                    fields: {
                        borger: [],
                        sagsbehandler: []
                    }
                };
                var data;
                if ($scope.template) {
                    $q.when().then(function () {
                        if ($scope.template.doc._attachments && $scope.template.doc._attachments.logo) {
                            return $q.when(blobUtil.imgSrcToDataURL('/couchdb/' + $rootScope.appID + '-' + $scope.template.organization + '/' + $scope.template.id + '/logo', $scope.template.doc._attachments.logo.content_type)).then(function (dataURL) {
                                $rootScope.wizard.template.borger.image = dataURL;
                                $rootScope.wizard.template.borger.imageType = $scope.template.doc._attachments.logo.content_type;
                                //$rootScope.$apply();
                            });
                        }
                        return;
                    }).then(function () {
                        return $http.get('/couchdb/' + $rootScope.appID + '/' + $scope.template.id);
                    }).then(function (res) {
                        data = res.data;
                        return getWidget(data);
                    }).then(function (id) {
                        return getOverlay(id, data);
                    }).then(function (overlay) {
                        $rootScope.wizard.template.borger.overlay = overlay;
                        $rootScope.wizard.template.borger.configuration = data;
                        $rootScope.wizard.template.borger.name = $scope.template.doc.name.substring(2) + " 1";
                        $rootScope.wizard.template.borger.description = $scope.template.doc.description;
                        for (var i = 0; i < data.map.baselayers.length; i++) {
                            var overlay = data.map.baselayers[i];
                            $rootScope.wizard.baselayers.borger.push({
                                name: overlay.name,
                                configuration: {
                                    name: $scope.template.doc.name,
                                    id: $scope.template.id
                                },
                                overlay: overlay
                            });
                        }
                        $http.get('/couchdb/db-' + $rootScope.wizard.template.borger.overlay.database + '/_design/straks').then(function (res) {
                            if (res.data.lib && res.data.lib.straks && res.data.lib.straks.length > 15) {
                                $rootScope.wizard.straks = JSON.parse(res.data.lib.straks.substring(15));
                            }
                        }).catch(function (err) {
                            console.log(err);
                        });
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
                                $rootScope.wizard.template.borger.image = e.target.result;
                                $rootScope.wizard.template.borger.imageType = $files[0].type;
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
                        if (template.doc.isBorgerTemplate) {
                            $scope.configurations.push(template);
                        }
                        if($rootScope.wizard.template.borger.template === template.id){
                            $scope.template = template;
                        }
                        if ($stateParams.template && template.id == $stateParams.template && !$scope.template) {
                            $scope.template = template;
                            $scope.templateChanged();
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
                if ($scope.names.indexOf($rootScope.wizard.template.borger.name) !== -1) {
                    form.name.$error = { exist: true };
                    form.name.$valid = false;
                    form.$valid = false;
                }
                if (form.$valid && !$scope.error) {
                    $rootScope.wizard.step.borger = 2;
                    sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                    $state.go('wizard.borger.2');
                }
            };
            getAll();
        }
    ]);
})(this, this.angular, this.console);