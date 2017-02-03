(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-borger-5', ['$scope', '$rootScope', '$http', '$stateParams', '$state', '$modal',
        function ($scope, $rootScope, $http, $stateParams, $state, $modal) {
            $scope.fields = $rootScope.wizard.fields.borger;
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
            var form = $rootScope.wizard.template.borger.overlay.form;
            var list = $rootScope.wizard.template.borger.overlay.list;
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
                            type: 'text',
                            default: dbfield.default,
                            list: true
                        }
                        if (dbfield.enum && dbfield.enum.length > 0) {
                            field.type = 'radio';
                            field.enum = dbfield.enum;
                        }
                        if (schema.properties.properties.required && schema.properties.properties.required.indexOf(key) !== -1) {
                            field.required = true;
                        }
                        addField(field);
                        keys.push(key);
                    }
                }
            }
            $scope.addEnums = function (field) {
                $scope.field = field;
                $scope.enums = $scope.fields[field].enum || [];
                modalInstance = $modal.open({
                    templateUrl: 'wizard/enums-modal.html',
                    scope: $scope
                });
            };
            $scope.ok = function () {
                modalInstance.close();
                $scope.fields[$scope.field].enum = [];
                for (var i = 0; i < $scope.enums.length; i++) {
                    $scope.fields[$scope.field].enum.push($scope.enums[i]);
                }
            };
            
            $scope.addEnum = function () {                
                $scope.enums.push(this.myForm.newEnum.$modelValue);
            };
            $scope.removeEnum = function () {
                $scope.enums.splice(this.$index, 1);
            };
            $scope.fieldNameChanged = function (field) {
                if (field.name !== "") {

                    if (!schema.properties.properties.properties.hasOwnProperty(field.name)) {
                        schema.properties.properties.properties[field.name] = schema.properties.properties.properties[field.key];
                        delete schema.properties.properties.properties[field.key];
                        schema.properties.properties.required = schema.properties.properties.required || [];
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
            $scope.fieldDefaultChanged = function (field) {
                if (field.default === "") {
                    delete schema.properties.properties.properties[field.name].default;
                } else {
                    schema.properties.properties.properties[field.name].default = field.default;
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
            $scope.fieldTypeChanged = function (field) {
                if (field.name !== "" && schema.properties.properties.properties.hasOwnProperty(field.name)) {
                    if (field.type === "email") {
                        schema.properties.properties.properties[field.name].type = 'string';
                        schema.properties.properties.properties[field.name].format = 'email';
                        if (schema.properties.properties.properties[field.name].hasOwnProperty("enum")) {
                            delete schema.properties.properties.properties[field.name].enum;
                        }
                    } else if (field.type === "text" || field.type === "textarea") {
                        schema.properties.properties.properties[field.name].type = 'string';
                        if (schema.properties.properties.properties[field.name].hasOwnProperty("format")) {
                            delete schema.properties.properties.properties[field.name].format;
                        }
                        if (schema.properties.properties.properties[field.name].hasOwnProperty("enum")) {
                            delete schema.properties.properties.properties[field.name].enum;
                        }
                    } else if (field.type === "checkbox") {
                        schema.properties.properties.properties[field.name].type = 'boolean';
                        if (schema.properties.properties.properties[field.name].hasOwnProperty("format")) {
                            delete schema.properties.properties.properties[field.name].format;
                        }
                        if (schema.properties.properties.properties[field.name].hasOwnProperty("enum")) {
                            delete schema.properties.properties.properties[field.name].enum;
                        }
                    } else if (field.type === "radio") {
                        schema.properties.properties.properties[field.name].type = 'string';
                        if (schema.properties.properties.properties[field.name].hasOwnProperty("format")) {
                            delete schema.properties.properties.properties[field.name].format;
                        }
                        schema.properties.properties.properties[field.name].enum = field.enum;

                    } else if (field.type === "timestamp") {
                        schema.properties.properties.properties[field.name].type = 'string';
                        schema.properties.properties.properties[field.name].format = 'date-time';
                        if (schema.properties.properties.properties[field.name].hasOwnProperty("enum")) {
                            delete schema.properties.properties.properties[field.name].enum;
                        }
                    }
                }
            };

            $scope.addDataField = function () {
                schema.properties.properties = schema.properties.properties || {};
                schema.properties.properties.type = "object";
                schema.properties.properties.properties = schema.properties.properties.properties || {};
                var key = "new";
                var i = 1;
                while (schema.properties.properties.properties.hasOwnProperty(key + i)) {
                    i++;
                }
                key = key + i;
                $scope.fields.push({
                    name: key,
                    key: key,
                    title: "",
                    type: "text",
                    required: false
                });
                schema.properties.properties.properties[key] = {
                    title: "",
                    type: "string"
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
                                keys.splice(keys.indexOf(field.key), 1);
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
                delete schema.properties.properties.properties[field.name];
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
                $state.go('wizard.borger.4');
            }
            $scope.next = function () {
                $rootScope.wizard.schema = schema;
                $rootScope.wizard.fields.borger = $scope.fields;
                updateForm();
                updateList();
                $rootScope.wizard.template.borger.overlay.form = form;
                $rootScope.wizard.template.borger.overlay.list = list;
                $rootScope.wizard.step.borger = 6;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                console.log($rootScope.wizard);
                $state.go('wizard.borger.6');
            }
        }
    ]);
})(this, this.angular, this.console);