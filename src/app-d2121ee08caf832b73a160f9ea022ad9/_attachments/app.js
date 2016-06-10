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
        'ncy-angular-breadcrumb',
        'angularFileUpload'
    ])

    .config(['$stateProvider', '$urlRouterProvider', '$breadcrumbProvider','$compileProvider',
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
                    $state.go('login');
                });
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                if (toState.name !== 'login') {
                    $rootScope.lastState = toState.name;
                }
            });
        }
    ]);
})(this, this.angular, this.console);