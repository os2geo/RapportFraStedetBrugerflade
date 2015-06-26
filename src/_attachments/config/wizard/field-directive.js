(function (window, angular, console) {
    'use strict';
    /* Directives */
    angular.module('myApp.directives')

    .directive("field", function ($compile, $http) {
        return {
            restrict: "E",
            scope: {
                field: '=',
                parentFields: '=',
                schema: '='
            },
            templateUrl: 'config/wizard/field.html',
            compile: function (tElement, tAttr) {
                var contents = tElement.contents().remove();
                var compiledContents;
                return function (scope, iElement, iAttr) {
                    if (!compiledContents) {
                        compiledContents = $compile(contents);
                    }
                    compiledContents(scope, function (clone, scope) {
                        iElement.append(clone);
                    });
                };
            },
            controller: function ($scope) {
                $scope.$on('remove', function (event) {
                    if (!event.defaultPrevented) {
                        $scope.$parent.$parent.$parent.$parent.$parent.formkeys.push($scope.parentFields[$scope.$parent.$parent.$parent.$index].id);
                        $scope.parentFields.splice($scope.$parent.$parent.$parent.$index, 1);
                        $scope.$emit('validate');
                        event.preventDefault();
                    }
                });
                $scope.removeGeometry = function ($index) {
                    $scope.geometries.push($scope.field.fields[$index].id);
                    $scope.field.fields.splice($index, 1);
                };
                $scope.add = function () {
                    $scope.field.fields.push({
                        id: "Ny",
                        fields: []
                    });
                    $scope.$emit('validate');
                };
                $scope.remove = function () {
                    this.parentFields.splice(this.$parent.$index, 1);
                    $scope.$emit('validate');
                };
                $scope.changeName = function () {
                    $scope.$emit('validate');
                };

                $scope.changeType = function () {
                    $scope.$emit('validate');
                };
                var checkStringType = function (string) {
                    switch (string.format) {
                    case "date-time":
                        return "datetime-local";
                    case "email":
                        return "email";
                    case "hostname":
                        return "url";
                    case "ipv4":
                        return "url";
                    case "ipv6":
                        return "url";
                    case "uri":
                        return "url";
                    }
                    return "text";
                };
                var checkType = function (item) {
                    if (item.enum && item.enum.length > 1) {
                        return "radio";
                    } else {
                        if (angular.isArray(item.type)) {
                            if (item.type.indexOf('string') !== -1) {
                                return checkStringType(item);
                            } else if (item.type.indexOf('object') !== -1) {
                                return "group";
                            } else if (item.type.indexOf('boolean') !== -1) {
                                return "checkbox";
                            } else if (item.type.indexOf('array') !== -1) {
                                return "checkbox";
                            } else if (item.type.indexOf('integer') !== -1 || item.type.indexOf('number') !== -1) {
                                return "number";
                            }
                        } else {
                            switch (item.type) {
                            case "string":
                                return checkStringType(item);
                            case "object":
                                return "group";
                            case "boolean":
                                return "checkbox";
                            case "array":
                                return "checkbox";
                            case "integer":
                            case "number":
                                return "number";
                            }
                        }
                    }
                    return "";
                };

                var i, id, index;
                $scope.$watch("schema", function (newValue, oldValue) {
                    if ($scope.schema && $scope.schema.properties) {
                        $scope.formkeys = [];

                        for (var key in $scope.schema.properties) {
                            $scope.formkeys.push(key);
                        }
                        for (i = 0; i < $scope.field.fields.length; i++) {
                            id = $scope.field.fields[i].id;
                            index = $scope.formkeys.indexOf(id);
                            if (index !== -1) {
                                $scope.formkeys.splice(index, 1);
                            }
                        }
                    }
                    if ($scope.schema && $scope.schema.oneOf) {

                        $scope.geometries = [];
                        for (i = 0; i < $scope.schema.oneOf.length; i++) {
                            var oneOf = $scope.schema.oneOf[i];
                            $scope.geometries.push(oneOf.title);
                        }
                        for (i = 0; i < $scope.field.fields.length; i++) {
                            id = $scope.field.fields[i].id;
                            index = $scope.geometries.indexOf(id);
                            if (index !== -1) {
                                $scope.geometries.splice(index, 1);
                            }
                        }
                    }

                });



                /*var buildForm = function (node, parent) {

                    for (var key in node) {
                        var field = {
                            id: key,
                            fields: []
                        };
                        var item = node[key];
                        field.type = checkType(item);
                        parent.fields.push(field);
                        if (node[key].properties) {
                            buildForm(node[key].properties, field);
                        }
                    }
                };*/
                $scope.addFormField = function () {
                    var field = {
                        id: $scope.formfield,
                        fields: []
                    };
                    var item = $scope.schema.properties[$scope.formfield];
                    field.type = checkType(item);
                    $scope.field.fields.push(field);
                    var i = $scope.formkeys.indexOf($scope.formfield);
                    $scope.formkeys.splice(i, 1);
                    $scope.formfield = null;
                    $scope.$emit('validate');
                };
                $scope.addGeometry = function () {
                    var field = {
                        id: $scope.formfield,
                        type: $scope.formfield,
                        fields: []
                    };
                    $scope.field.fields.push(field);
                    var i = $scope.geometries.indexOf($scope.formfield);
                    $scope.geometries.splice(i, 1);
                    $scope.formfield = null;
                    $scope.$emit('validate');
                };
            }
        };
    });
})(this, this.angular, this.console);