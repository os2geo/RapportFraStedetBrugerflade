(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-sagsbehandler-4', ['$scope', '$rootScope', '$http', '$stateParams', '$state', '$modal',
        function ($scope, $rootScope, $http, $stateParams, $state, $modal) {
            $scope.fields = $rootScope.wizard.fields.sagsbehandler;
            var addField = function (field) {
                for (var i = 0; i < $scope.fields.length; i++) {
                    if ($scope.fields[i].name === field.name) {
                        return;
                    }
                }
                $scope.fields.push(field);
            }
            var modalInstance;

            var schema = $rootScope.wizard.schema;
            var form = $rootScope.wizard.template.sagsbehandler.overlay.form;
            var list = $rootScope.wizard.template.sagsbehandler.overlay.list;
            var keys = [];
            for (var i = 0; i < form.length; i++) {
                if (form[i].id === 'properties') {
                    var fields = form[i].fields;
                    for (var j = 0; j < fields.length; j++) {
                        var formfield = fields[j];
                        if (schema.properties && schema.properties.properties && schema.properties.properties.properties && schema.properties.properties.properties.hasOwnProperty(formfield.id)) {
                            var dbfield = schema.properties.properties.properties[formfield.id];
                            var field = {
                                name: formfield.id,
                                key: formfield.id,
                                title: dbfield.title,
                                type: formfield.type,
                                default: dbfield.default,
                                readonly: formfield.readonly || false,
                                form: true,
                                enum: dbfield.enum || []
                            }
                            if (schema.properties.properties.required && schema.properties.properties.required.indexOf(formfield.id) !== -1) {
                                field.required = true;
                            }
                            if (list.indexOf('/properties/' + formfield.id) !== -1) {
                                field.list = true;
                            }
                            addField(field);
                            keys.push(formfield.id);

                        }
                    }
                }

            }
            for (var i = 0; i < list.length; i++) {
                var key = list[i].substr(12);
                if (keys.indexOf(key) === -1) {
                    if (schema.properties && schema.properties.properties && schema.properties.properties.properties && schema.properties.properties.properties.hasOwnProperty(key)) {
                        var dbfield = schema.properties.properties.properties[key];

                        var field = {
                            name: key,
                            key: key,
                            title: dbfield.title,
                            type: "text",
                            default: dbfield.default,
                            list: true,
                            enum: dbfield.enum || []
                        }
                        if (schema.properties.properties.required && schema.properties.properties.required.indexOf(key) !== -1) {
                            field.required = true;
                        }
                        addField(field);
                        keys.push(key);
                    }
                }
            }

            var updateForm = function () {
                for (var i = 0; i < form.length; i++) {
                    if (form[i].id === 'properties') {
                        form[i].fields = [];
                        for (var n = 0; n < $scope.fields.length; n++) {
                            var field = $scope.fields[n];
                            if (field.form) {
                                form[i].fields.push({
                                    fields: [],
                                    id: field.name,
                                    type: field.type,
                                    readonly: field.readonly
                                });
                            }
                        }
                        break;
                    }
                }
            };
            var updateList = function () {
                list = [];
                for (var n = 0; n < $scope.fields.length; n++) {
                    var field = $scope.fields[n];
                    if (field.list) {
                        list.push('/properties/' + $scope.fields[n].name)
                    }
                }
                var list2 = $rootScope.wizard.template.sagsbehandler.overlay.list;
                for (var i = list2.length - 1; i >= 0; i--) {
                    if (list2[i].indexOf('/_attachments') === 0) {
                        list.push(list2[i]);
                    }
                }
            };
            $scope.previous = function () {
                $rootScope.wizard.fields.sagsbehandler = $scope.fields;
                updateForm();
                updateList();
                $rootScope.wizard.template.sagsbehandler.overlay.form = form;
                $rootScope.wizard.template.sagsbehandler.overlay.list = list;
                $state.go('wizard.sagsbehandler.3');
            }
            $scope.next = function () {
                $rootScope.wizard.fields.sagsbehandler = $scope.fields;
                updateForm();
                updateList();
                $rootScope.wizard.template.sagsbehandler.overlay.form = form;
                $rootScope.wizard.template.sagsbehandler.overlay.list = list;
                $rootScope.wizard.step.sagsbehandler = 5;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.sagsbehandler.5');
            }
        }
    ]);
})(this, this.angular, this.console);