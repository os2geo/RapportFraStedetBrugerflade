(function (window, angular, console) {
    'use strict';

    // Declare app level module which depends on filters, and services
    angular.module('myApp', [
        'ui.router',
        'ui.bootstrap',
        'ui.sortable',
        'myApp.filters',
        'myApp.services',
        'myApp.controllers',
        'myApp.directives',
        'angular-md5',
        'ncy-angular-breadcrumb',
        'angularFileUpload'
    ])

        .config(['$stateProvider', '$urlRouterProvider', '$breadcrumbProvider', '$compileProvider',
            function ($stateProvider, $urlRouterProvider, $breadcrumbProvider, $compileProvider) {

                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|rfs):/);


                /*$breadcrumbProvider.setOptions({
                    template: '<ol class="breadcrumb">' +
                        '<li ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract">' +
                        '<a ng-switch-when="false" href="#{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a> ' +
                        '<span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span>' +
                        '</li>' +
                        '</ol>'
                });*/

                $urlRouterProvider.when('/:organization', '/:organization/info');
                $urlRouterProvider.when('/:organization/configurations', '/:organization/configurations/list');
                $urlRouterProvider.when('/:organization/configuration/:configuration', '/:organization/configuration/:configuration/wizard');

                $stateProvider.state('organization', {
                    url: '/:organization',
                    templateUrl: 'organization/organization.html',
                    controller: 'organization',
                    ncyBreadcrumb: {
                        label: '#'
                    }

                });
                $stateProvider.state('organization.info', {
                    url: '/info',
                    templateUrl: 'organization/info/info.html',
                    controller: 'organization-info',
                    ncyBreadcrumb: {
                        label: 'Info'
                    }
                });
                $stateProvider.state('organization.delete', {
                    url: '/delete',
                    templateUrl: 'organization/delete/delete.html',
                    controller: 'organization-delete',
                    ncyBreadcrumb: {
                        label: 'Slet'
                    }
                });
                $stateProvider.state('organization.configurations', {
                    url: '/configurations',
                    templateUrl: 'configurations/configurations.html',
                    controller: 'configurations',
                    ncyBreadcrumb: {
                        label: 'Konfigurationer'
                    }
                });

                $stateProvider.state('organization.configurations.list', {
                    url: '/list',
                    templateUrl: 'configurations/list/list.html',
                    controller: 'configurations-list',
                    ncyBreadcrumb: {
                        label: 'Liste'
                    }

                });

                $stateProvider.state('organization.configurations.create', {
                    url: '/create',
                    templateUrl: 'configurations/create/create.html',
                    controller: 'configurations-create',
                    ncyBreadcrumb: {
                        label: 'Opret'
                    }

                });
                $stateProvider.state('wizard', {
                    url: '/wizard/:organization?template',
                    templateUrl: 'wizard/wizard.html',
                    controller: 'wizard',
                    resolve: {
                        wizard: function ($rootScope, $stateParams) {
                            if (!$rootScope.wizard) {
                                var wizard = sessionStorage.getItem('wizard');
                                if (wizard) {
                                    $rootScope.wizard = JSON.parse(wizard);
                                } else {
                                    $rootScope.wizard = $rootScope.wizard || {
                                        step: {
                                            wizard: 0,
                                            borger: 0,
                                            sagsbehandler: 0
                                        },
                                        template: {
                                            borger: {
                                                name: "",
                                                description: "",
                                                image: "",
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
                                    }
                                    if($stateParams.template){
                                        $rootScope.wizard.step = {
                                            wizard: 1,
                                            borger: 1,
                                            sagsbehandler: 0
                                        }
                                    }
                                }
                            }
                            return;
                        }                        
                    }
                });
                $stateProvider.state('wizard.borger', {
                    url: '/borger',
                    templateUrl: 'wizard/borger/borger.html',
                    controller: 'wizard-borger',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.wizard > 0) {
                                return;
                            }
                            return $q.reject({ step: 'wizard' })
                        }
                    }
                });
                $stateProvider.state('wizard.borger.1', {
                    url: '/1',
                    templateUrl: 'wizard/borger/1/1.html',
                    controller: 'wizard-borger-1',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.borger > 0) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.borger' })
                        }
                    }
                });
                $stateProvider.state('wizard.borger.2', {
                    url: '/2',
                    templateUrl: 'wizard/borger/2/2.html',
                    controller: 'wizard-borger-2',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.borger > 1) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.borger.1' })
                        }
                    }
                });
                $stateProvider.state('wizard.borger.3', {
                    url: '/3',
                    templateUrl: 'wizard/borger/3/3.html',
                    controller: 'wizard-borger-3',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.borger > 2) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.borger.2' })
                        }
                    }
                });
                $stateProvider.state('wizard.borger.4', {
                    url: '/4',
                    templateUrl: 'wizard/borger/4/4.html',
                    controller: 'wizard-borger-4',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.borger > 3) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.borger.3' })
                        }
                    }
                });
                $stateProvider.state('wizard.borger.5', {
                    url: '/5',
                    templateUrl: 'wizard/borger/5/5.html',
                    controller: 'wizard-borger-5',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.borger > 4) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.borger.4' })
                        }
                    }
                });
                $stateProvider.state('wizard.borger.6', {
                    url: '/6',
                    templateUrl: 'wizard/borger/6/6.html',
                    controller: 'wizard-borger-6',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.borger > 5) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.borger.5' })
                        }
                    }
                });
                $stateProvider.state('wizard.borger.6.1', {
                    url: '/1',
                    templateUrl: 'wizard/borger/6/1/1.html',
                    controller: 'wizard-borger-6-1',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.borger > 6) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.borger.6' })
                        }
                    }
                });
                $stateProvider.state('wizard.borger.7', {
                    url: '/7',
                    templateUrl: 'wizard/borger/7/7.html',
                    controller: 'wizard-borger-7',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.borger > 6) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.borger.6' })
                        }
                    }
                });
                $stateProvider.state('wizard.borger.8', {
                    url: '/8',
                    templateUrl: 'wizard/borger/8/8.html',
                    controller: 'wizard-borger-8',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.borger > 7) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.borger.7' })
                        }
                    }
                });

                $stateProvider.state('wizard.sagsbehandler', {
                    url: '/sagsbehandler',
                    templateUrl: 'wizard/sagsbehandler/sagsbehandler.html',
                    controller: 'wizard-sagsbehandler',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.borger > 6) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.borger.6' })
                        }
                    }
                });
                $stateProvider.state('wizard.sagsbehandler.1', {
                    url: '/1',
                    templateUrl: 'wizard/sagsbehandler/1/1.html',
                    controller: 'wizard-sagsbehandler-1',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.sagsbehandler > 0) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.sagsbehandler' })
                        }
                    }
                });
                $stateProvider.state('wizard.sagsbehandler.2', {
                    url: '/2',
                    templateUrl: 'wizard/sagsbehandler/2/2.html',
                    controller: 'wizard-sagsbehandler-2',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.sagsbehandler > 1) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.sagsbehandler.1' })
                        }
                    }
                });
                $stateProvider.state('wizard.sagsbehandler.3', {
                    url: '/3',
                    templateUrl: 'wizard/sagsbehandler/3/3.html',
                    controller: 'wizard-sagsbehandler-3',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.sagsbehandler > 2) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.sagsbehandler.2' })
                        }
                    }
                });
                $stateProvider.state('wizard.sagsbehandler.4', {
                    url: '/4',
                    templateUrl: 'wizard/sagsbehandler/4/4.html',
                    controller: 'wizard-sagsbehandler-4',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.sagsbehandler > 3) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.sagsbehandler.3' })
                        }
                    }
                });
                $stateProvider.state('wizard.sagsbehandler.5', {
                    url: '/5',
                    templateUrl: 'wizard/sagsbehandler/5/5.html',
                    controller: 'wizard-sagsbehandler-5',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.sagsbehandler > 4) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.sagsbehandler.4' })
                        }
                    }
                });
                $stateProvider.state('wizard.sagsbehandler.5.1', {
                    url: '/1',
                    templateUrl: 'wizard/sagsbehandler/5/1/1.html',
                    controller: 'wizard-sagsbehandler-5-1',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.sagsbehandler > 5) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.sagsbehandler.5' })
                        }
                    }
                });
                $stateProvider.state('wizard.sagsbehandler.5.2', {
                    url: '/2',
                    templateUrl: 'wizard/sagsbehandler/5/2/2.html',
                    controller: 'wizard-sagsbehandler-5-2',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.sagsbehandler > 5.1) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.sagsbehandler.5.1' })
                        }
                    }
                });
                $stateProvider.state('wizard.sagsbehandler.6', {
                    url: '/6',
                    templateUrl: 'wizard/sagsbehandler/6/6.html',
                    controller: 'wizard-sagsbehandler-6',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.sagsbehandler > 5) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.sagsbehandler.5' })
                        }
                    }
                });
                $stateProvider.state('wizard.sagsbehandler.7', {
                    url: '/7',
                    templateUrl: 'wizard/sagsbehandler/7/7.html',
                    controller: 'wizard-sagsbehandler-7',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.sagsbehandler > 6) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.sagsbehandler.6' })
                        }
                    }
                });
                $stateProvider.state('wizard.afslut', {
                    url: '/afslut',
                    templateUrl: 'wizard/afslut/afslut.html',
                    controller: 'wizard-afslut',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.template.sagsbehandler) {
                                if ($rootScope.wizard.step.sagsbehandler > 2) {
                                    return;
                                }
                                return $q.reject({ step: 'wizard.sagsbehandler.2' })
                            }
                            if ($rootScope.wizard.step.borger > 6) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.borger.6' })
                        }
                    }
                });
                $stateProvider.state('wizard.test', {
                    url: '/test',
                    templateUrl: 'wizard/test/test.html',
                    controller: 'wizard-test',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step.afslut > 0) {
                                return;
                            }
                            return $q.reject({ step: 'wizard.afslut' })
                        }
                    }
                });
                $stateProvider.state('wizard.9', {
                    url: '/9',
                    templateUrl: 'wizard/9/9.html',
                    controller: 'wizard-9',
                    resolve: {
                        step: function ($q, $rootScope) {
                            if ($rootScope.wizard.step > 8) {
                                return 9;
                            }
                            return $q.reject({ step: 8 })
                        }
                    }
                });
                $stateProvider.state('config', {
                    url: '/:organization/configuration/:configuration',
                    templateUrl: 'config/config.html',
                    controller: 'config',
                    ncyBreadcrumb: {
                        label: '{{configuration.name}}',
                        parent: 'organization.configurations'
                    }

                });
                $stateProvider.state('config.info', {
                    url: '/info',
                    templateUrl: 'config/info/info.html',
                    controller: 'config-info',
                    ncyBreadcrumb: {
                        label: 'Info'
                    }

                });
                $stateProvider.state('config.wizard', {
                    url: '/wizard',
                    templateUrl: 'config/wizard/wizard.html',
                    controller: 'config-wizard',
                    ncyBreadcrumb: {
                        label: 'Wizard'
                    }

                });
                $stateProvider.state('config.text', {
                    url: '/text',
                    templateUrl: 'config/text/text.html',
                    controller: 'config-text',
                    ncyBreadcrumb: {
                        label: 'Tekst'
                    }

                });
                $stateProvider.state('config.delete', {
                    url: '/delete',
                    templateUrl: 'config/delete/delete.html',
                    controller: 'config-delete',
                    ncyBreadcrumb: {
                        label: 'Slet'
                    }

                });


                $stateProvider.state('login', {
                    url: '/login',
                    templateUrl: 'login/login.html',
                    controller: 'login'
                });
            }
        ])

        .run(['$rootScope', '$stateParams', '$state', '$location', '$templateCache',
            function ($rootScope, $stateParams, $state, $location, $templateCache) {

                $templateCache.put("template/accordion/accordion-group.html",
                    "<div class=\"panel panel-default\">\n" +
                    "  <div class=\"panel-heading\">\n" +
                    "    <h4 class=\"panel-title\">\n" +
                    "      <a style=\"color:inherit\" class=\"pull-right\" ng-click=\"$broadcast('remove')\"><i class=\"fa fa-close\"></i></a>" +
                    "      <a class=\"accordion-toggle\" ng-click=\"toggleOpen()\" ><i class=\"fa\" ng-class=\"{'fa-minus-square-o':isOpen,'fa-plus-square-o':!isOpen}\"></i></a>\n" +
                    "      <span ng-class=\"{'text-muted': isDisabled}\" accordion-transclude=\"heading\">{{heading}}</span>" +
                    "    </h4>\n" +
                    "  </div>\n" +
                    "  <div class=\"panel-collapse\" collapse=\"!isOpen\">\n" +
                    "	  <div class=\"panel-body\" ng-transclude></div>\n" +
                    "  </div>\n" +
                    "</div>");


                var urls = $location.$$absUrl.split('/');
                for (var i = 0; i < urls.length; i++) {
                    var url = urls[i];
                    if (url.indexOf('app-') !== -1) {
                        $rootScope.appID = url;
                        break;
                    }
                }
                $rootScope.$on('$stateChangeError',
                    function (event, toState, toParams, fromState, fromParams, error) {
                        if (error.step) {
                            $state.go(error.step, { organization: toParams.organization });
                        } else {
                            $state.go('login');
                        }
                    });
                $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                    if (toState.name !== 'login') {
                        $rootScope.lastState = toState.name;
                    }
                });
            }
        ]);
})(this, this.angular, this.console);