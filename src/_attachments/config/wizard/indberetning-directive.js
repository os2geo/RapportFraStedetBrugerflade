(function (window, angular, console) {
    'use strict';
    /* Directives */
    angular.module('myApp.directives')

    .directive("indberetning", function ($compile, $http) {
        return {
            restrict: "E",
            scope: {
                layer: '='
            },
            templateUrl: 'config/wizard/indberetning.html',
            controller: function ($scope) {
                var buildKeys = function (node, parent) {
                    for (var key in node) {
                        if (node[key].properties) {

                            buildKeys(node[key].properties, parent + '/' + key);

                        } else {
                            $scope.schemakeys.push(parent + '/' + key);
                        }
                    }
                };
                $http.get('/couchdb/db-' + $scope.layer.database + '/_design/schema').
                success(function (schema, status, headers, config) {
                    $scope.schemafield = null;
                    $scope.formfield = null;
                    $scope.schemakeys = [];
                    $scope.formkeys = [];
                    $scope.schema = schema.schema;

                    if ($scope.schema.properties) {
                        if ($scope.schema.properties.properties.oneOf && $scope.schema.properties.properties.oneOf && $scope.schema.properties.properties.oneOf.length > 0) {
                            $scope.schema.properties.properties.properties = $scope.schema.properties.properties.oneOf[0].properties;
                        }
                        buildKeys($scope.schema.properties, "");
                        for (var key in $scope.schema.properties) {
                            $scope.formkeys.push(key);
                        }
                        $scope.layer.list = $scope.layer.list || [];
                        $scope.layer.form = $scope.layer.form || [];
                        for (var i = 0; i < $scope.layer.list.length; i++) {
                            var id = $scope.layer.list[i];
                            var index = $scope.schemakeys.indexOf(id);
                            if (index !== -1) {
                                $scope.schemakeys.splice(index, 1);
                            }
                        }
                        for (var j = 0; j < $scope.layer.form.length; j++) {
                            var formid = $scope.layer.form[j].id;
                            var indexform = $scope.formkeys.indexOf(formid);
                            if (indexform !== -1) {
                                $scope.formkeys.splice(indexform, 1);
                            }
                        }
                    }
                }).
                error(function (data, status, headers, config) {

                });
            }
        };
    });
})(this, this.angular, this.console);