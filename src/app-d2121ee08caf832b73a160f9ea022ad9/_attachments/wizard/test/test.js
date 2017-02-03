(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-test', ['$scope', '$rootScope', '$http', '$stateParams', '$state',
        function ($scope, $rootScope, $http, $stateParams, $state) {
            var parts = window.location.hostname.split('.');
            var domain = '';
            if ((parts.length > 0 && parts[0] === 'test') || parts.length === 1) {
                domain = 'test.';
            }
            $scope.borgerapp = 'https://' + domain + 'rapportfrastedet.dk/#/menu/organizations/' + $stateParams.organization + '/' + $rootScope.wizard.test.borger;
            $scope.borger = 'http://' + domain + 'geo.os2geo.dk/couchdb/app-d2121ee08caf832b73a160f9ea022ad9/_design/config/index.html#/' + $stateParams.organization + '/configuration/' + $rootScope.wizard.test.borger + '/wizard';
            $scope.sagsbehandlerapp = 'https://' + domain + 'rapportfrastedet.dk/#/menu/organizations/' + $stateParams.organization + '/' + $rootScope.wizard.test.sagsbehandler;
            $scope.sagsbehandler = 'http://' + domain + 'geo.os2geo.dk/couchdb/app-d2121ee08caf832b73a160f9ea022ad9/_design/config/index.html#/' + $stateParams.organization + '/configuration/' + $rootScope.wizard.test.sagsbehandler + '/wizard';
            $scope.next = function () {
                sessionStorage.removeItem('wizard');
                $rootScope.wizard = {
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
                $state.go('wizard');
            }
        }
    ]);
})(this, this.angular, this.console);