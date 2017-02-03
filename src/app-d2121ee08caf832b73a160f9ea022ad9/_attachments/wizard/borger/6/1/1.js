(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-borger-6-1', ['$scope', '$rootScope', '$http', '$stateParams', '$state',
        function ($scope, $rootScope, $http, $stateParams, $state) {
            $scope.fields = [];
            var schema = $rootScope.wizard.schema;
            var form = $rootScope.wizard.template.borger.overlay.form;
            var list = $rootScope.wizard.template.borger.overlay.list;
            for (var i = 0; i < $rootScope.wizard.fields.borger.length; i++) {
                var field = $rootScope.wizard.fields.borger[i];
                //if(field.type==="email"){
                $scope.fields.push(field);
                //}
            }
            $scope.sortableOptions = {
                update: function (e, ui) {
                    console.log('update');
                },
                stop: function (e, ui) {
                    console.log('stop');
                }
            };
            $scope.fieldNameChanged = function (field) {
                if (field.name !== "") {
                    if (!schema.properties.properties.properties.hasOwnProperty(field.name)) {
                        schema.properties.properties.properties[field.name] = schema.properties.properties.properties[field.key];
                        delete schema.properties.properties.properties[field.key];
                        var index = schema.properties.properties.required.indexOf(field.key);
                        if (index !== -1) {
                            schema.properties.properties.required.splice(index, 1);
                            schema.properties.properties.required.push(field.name);
                        }
                        for (var i = 0; i < form.length; i++) {
                            if (form[i].id === 'properties') {
                                for (var j = 0; j < form[i].fields.length; j++) {
                                    if (form[i].fields[j].id === field.key) {
                                        form[i].fields[j].id = field.name;
                                        var index = keys.indexOf(field.key);
                                        keys.splice(index, 1);
                                        keys.splice(index, 0, field.name);
                                    }
                                }
                            }
                        }
                        var index = list.indexOf('/properties/' + field.key);
                        if (index !== -1) {
                            list.splice(index, 1);
                            list.splice(index, 0, '/properties/' + field.name);
                        }

                        field.key = field.name;
                    }
                    else {
                        field.name = field.key;
                    }
                }
            };
            $scope.fieldTitleChanged = function (field) {
                if (field.title === "") {
                    delete schema.properties.properties.properties[field.name].title;
                } else {
                    schema.properties.properties.properties[field.name].title = field.title;
                }
            };
            $scope.fieldRequiredChanged = function (field) {
                if (field.required) {
                    schema.properties.properties.required = schema.properties.properties.required || [];
                    schema.properties.properties.required.push(field.name);
                } else {
                    if (schema.properties.properties.required) {
                        var index = schema.properties.properties.required.indexOf(field.name);
                        if (index !== -1) {
                            schema.properties.properties.required.splice(index, 1);
                            if (schema.properties.properties.required.length === 0) {
                                delete schema.properties.properties.required;
                            }
                        }
                    }
                }
            };
            $scope.addEmailField = function () {
                schema.properties.properties = schema.properties.properties || {};
                schema.properties.properties.type = "object";
                schema.properties.properties.properties = schema.properties.properties.properties || {};
                var key = "Email";
                var i = 1;
                while (schema.properties.properties.properties.hasOwnProperty(key + i)) {
                    i++;
                }
                key = key + i;
                $scope.fields.push({
                    name: key,
                    key: key,
                    title: "",
                    type: "email",
                    required: false,
                    form: true
                });
                schema.properties.properties.properties[key] = {
                    title: "",
                    type: "string"
                }
            };
            $scope.addReceiptField = function () {
                schema.properties.properties = schema.properties.properties || {};
                schema.properties.properties.type = "object";
                schema.properties.properties.properties = schema.properties.properties.properties || {};
                var key = "Kvittering";
                var i = 1;
                while (schema.properties.properties.properties.hasOwnProperty(key + i)) {
                    i++;
                }
                key = key + i;
                $scope.fields.push({
                    name: key,
                    key: key,
                    title: "",
                    type: "checkbox",
                    required: false,
                    form: true
                });
                schema.properties.properties.properties[key] = {
                    title: "",
                    type: "boolean"
                }
            };
            $scope.removeDataField = function (field) {
                field.required = false;
                $scope.fieldRequiredChanged(field);
                delete schema.properties.properties.properties[field.name];
                for (var i = 0; i < form.length; i++) {
                    if (form[i].id === 'properties') {
                        for (var j = 0; j < form[i].fields.length; j++) {
                            if (form[i].fields[j].id === field.key) {
                                form[i].fields.splice(j, 1);
                                break;
                            }
                        }
                    }
                }
                var index = list.indexOf('/properties/' + field.key);
                if (index !== -1) {
                    list.splice(index, 1);
                }
                for (var i = 0; i < $scope.fields.length; i++) {
                    var item = $scope.fields[i];
                    if (item.name === field.name) {
                        $scope.fields.splice(i, 1);
                        break;
                    }
                }
            };

            var updateForm = function () {
                for (var i = 0; i < form.length; i++) {
                    if (form[i].id === 'properties') {
                        form[i].fields = [];
                        for (var n = 0; n < $scope.fields.length; n++) {
                            var field = $scope.fields[n];
                            if (field.form) {
                                form[i].fields.push({ fields: [], id: field.name, type: field.type });
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
                var list2 = $rootScope.wizard.template.borger.overlay.list;
                for (var i = list2.length - 1; i >= 0; i--) {
                    if (list2[i].indexOf('/_attachments') === 0) {
                        list.push(list2[i]);
                    }
                }
            };

            $scope.previous = function () {
                $rootScope.wizard.schema = schema;
                $rootScope.wizard.fields.borger = $scope.fields;
                updateForm();
                updateList();
                $rootScope.wizard.template.borger.overlay.form = form;
                $rootScope.wizard.template.borger.overlay.list = list;
                $state.go('wizard.borger.6');
            }
            $scope.submit = function (myform) {
                if (myform.$valid && !$scope.error) {
                    $rootScope.wizard.schema = schema;
                    if ($rootScope.wizard.email.borger.receipt) {
                        $rootScope.wizard.schema.properties.properties.dependencies = {};
                        $rootScope.wizard.schema.properties.properties.dependencies[$rootScope.wizard.email.borger.receipt.key] = [$rootScope.wizard.email.borger.email.key];
                    } else {
                        if ($rootScope.wizard.schema.properties.properties.dependencies) {
                            delete $rootScope.wizard.schema.properties.properties.dependencies;
                        }

                    }
                    $rootScope.wizard.fields.borger = $scope.fields;
                    updateForm();
                    updateList();
                    $rootScope.wizard.template.borger.overlay.form = form;
                    $rootScope.wizard.template.borger.overlay.list = list;
                    $rootScope.wizard.step.borger = 7;
                    sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                    $state.go('wizard.borger.7');
                }
            }
        }
    ]);
})(this, this.angular, this.console);