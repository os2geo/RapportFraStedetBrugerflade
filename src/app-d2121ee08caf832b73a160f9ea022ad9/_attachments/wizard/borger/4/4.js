(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-borger-4', ['$scope', '$rootScope', '$http', '$stateParams', '$state',
        function ($scope, $rootScope, $http, $stateParams, $state) {
            $scope.addAttachment = function () {
                schema.properties._attachments = schema.properties._attachments || {};
                schema.properties._attachments.type = "object";
                schema.properties._attachments.additionalProperties = true;
                schema.properties._attachments.properties = schema.properties._attachments.properties || {};
                var key = "new";
                var i = 1;
                while (schema.properties._attachments.properties.hasOwnProperty(key + i) || schema.properties._attachments.properties.hasOwnProperty('tn_' + key + i)) {
                    i++;
                }
                key = key + i;
                $rootScope.wizard.attachments.borger.push({
                    name: key,
                    key: key,
                    title: "",
                    required: false
                });
                schema.properties._attachments.properties[key] = {
                    title: "",
                    additionalProperties: true,
                    type: "object"
                }
                schema.properties._attachments.properties['tn_' + key] = {
                    title: "",
                    additionalProperties: true,
                    type: "object"
                }
            };
            $scope.removeAttachment = function (field) {
                field.required = false;
                $scope.attachmentRequiredChanged(field);
                for (var i = 0; i < $rootScope.wizard.attachments.borger.length; i++) {
                    var item = $rootScope.wizard.attachments.borger[i];
                    if (item.name === field.name) {
                        $rootScope.wizard.attachments.borger.splice(i, 1);
                        break;
                    }
                }
                if (schema.properties._attachments.properties.hasOwnProperty(field.name)) {
                    delete schema.properties._attachments.properties[field.name];
                }
                if (schema.properties._attachments.properties.hasOwnProperty('tn_' + field.name)) {
                    delete schema.properties._attachments.properties['tn_' + field.name];
                }
            };
            $scope.attachmentRequiredChanged = function (field) {
                if (field.required) {
                    schema.properties._attachments.required = schema.properties._attachments.required || [];
                    schema.properties._attachments.required.push(field.name);
                } else {
                    if (schema.properties._attachments.required) {
                        var index = schema.properties._attachments.required.indexOf(field.name);
                        if (index !== -1) {
                            schema.properties._attachments.required.splice(index, 1);
                            if (schema.properties._attachments.required.length === 0) {
                                delete schema.properties._attachments.required;
                            }
                        }
                    }

                }
                $scope.$emit('validate');
            };
            $scope.attachmentNameChanged = function (field) {
                var name = 'tn_' + field.name;
                var key = 'tn_' + field.key;
                if (field.name !== "") {
                    if (!schema.properties._attachments.properties.hasOwnProperty(field.name)) {
                        schema.properties._attachments.properties[field.name] = schema.properties._attachments.properties[field.key];
                        delete schema.properties._attachments.properties[field.key];
                        field.key = field.name;

                    }

                    if (!schema.properties._attachments.properties.hasOwnProperty(name)) {
                        schema.properties._attachments.properties[name] = schema.properties._attachments.properties[key];
                        delete schema.properties._attachments.properties[key];
                    }
                }
            };
            $scope.attachmentTitleChanged = function (field) {
                if (field.name !== "") {
                    if (schema.properties._attachments.properties.hasOwnProperty(field.name)) {
                        schema.properties._attachments.properties[field.name].title = field.title;
                    }
                    if (schema.properties._attachments.properties.hasOwnProperty('tn_' + field.name)) {
                        schema.properties._attachments.properties['tn_' + field.name].title = field.title;
                    }
                }
            };
            var getField = function (form) {
                for (var i = 0; i < form.length; i++) {
                    var field = form[i];
                    if (field.id === '_attachments') {
                        return field;
                    }
                }
                return null;
            }
            $scope.next = function () {
                var form = $rootScope.wizard.template.borger.overlay.form;
                var field = getField(form);
                if (!field) {
                    field = { id: '_attachments', type: 'group' };
                    form.push(field);
                }
                field.fields = [];
                var list = $rootScope.wizard.template.borger.overlay.list;
                for (var i = list.length - 1; i >= 0; i--) {
                    if (list[i].indexOf('/_attachments') === 0) {
                        list.splice(i, 1);
                    }
                }
                for (var i = 0; i < $rootScope.wizard.attachments.borger.length; i++) {
                    var attachment = $rootScope.wizard.attachments.borger[i];
                    if (attachment.form) {
                        field.fields.push({
                            id: attachment.name,
                            type: 'file',
                            fields: []
                        });
                    }
                    if (attachment.list) {
                        list.push('/_attachments/' + attachment.name);
                    }

                }
                $rootScope.wizard.schema = schema;
                $rootScope.wizard.step.borger = 5;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.borger.5');
            }
            var schema = $rootScope.wizard.schema;
            if ($rootScope.wizard.attachments.borger.length === 0) {
                if (schema.properties && schema.properties._attachments && schema.properties._attachments.properties) {
                    for (var key in schema.properties._attachments.properties) {
                        if (key.indexOf('tn_') !== 0) {
                            var field = schema.properties._attachments.properties[key];
                            var required = false;
                            if (schema.properties._attachments.required && schema.properties._attachments.required.indexOf(key) !== -1) {
                                required = true;
                            }
                            var attachment = {
                                name: key,
                                key: key,
                                title: field.title,
                                required: required
                            };
                            for (var i = 0; i < $rootScope.wizard.template.borger.overlay.form.length; i++) {
                                var field = $rootScope.wizard.template.borger.overlay.form[i];
                                if (field.id === '_attachments') {
                                    for (var j = 0; j < field.fields.length; j++) {
                                        if (field.fields[j].id === key) {
                                            attachment.form = true;
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                            for (var i = 0; i < $rootScope.wizard.template.borger.overlay.list.length; i++) {
                                var field = $rootScope.wizard.template.borger.overlay.list[i];
                                if (field === '/_attachments/' + key) {
                                    attachment.list = true;
                                    break;
                                }
                            }
                            $rootScope.wizard.attachments.borger.push(attachment);
                        }
                    }
                }
            }
        }
    ]);
})(this, this.angular, this.console);