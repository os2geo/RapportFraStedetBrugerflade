(function (window, angular, console) {
    'use strict';
    /* Directives */
    angular.module('myApp.directives')

    .directive("widget", function ($compile, $http) {
        return {
            restrict: "E",
            scope: {
                widget: '=',
                configuration: '='
            },
            templateUrl: 'config/wizard/widget.html',
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
                /*if ($scope.widget.id === 'indberetninger') {
                    if ($scope.configuration.list) {
                        $scope.widget.list = $scope.configuration.list;
                        delete $scope.configuration.list;
                    }

                    if ($scope.configuration.database) {
                        var layer;
                        for (var i = 0; i < $scope.configuration.map.overlays.length; i++) {
                            layer = $scope.configuration.map.overlays[i];
                            if (layer.type === 'indberetninger') {
                                break;
                            }
                        }
                        if (layer) {
                            $scope.widget.layers = [{layer:layer.id}];
                            layer.database = $scope.configuration.database;
                            layer.type = "database";
                            layer.replicateFrom = true;
                            delete $scope.configuration.database;
                            if ($scope.configuration.form) {
                                $scope.widget.form = $scope.configuration.form;
                                delete $scope.configuration.form;
                            }
                        }
                    }
                }*/
                $scope.$on('remove', function (event) {

                    if (!event.defaultPrevented) {
                        $scope.$emit('widgetremove', $scope.widget.id);
                        $scope.configuration.widgets.splice($scope.$parent.$parent.$parent.$index, 1);
                        event.preventDefault();
                    }
                });
                $scope.layer = null;
                $scope.layers = {};
                $scope.index = {};

                $scope.addLayer = function () {
                    if (this.layer) {
                        $scope.widget.layers = $scope.widget.layers || [];
                        $scope.widget.layers.push(this.layer);
                        delete $scope.layers[this.layer];
                        $scope.layer = null;
                    }
                    $scope.$emit('validate');
                };
                $scope.removeLayer = function () {
                    $scope.layers[this.layer] = $scope.index[this.layer];
                    $scope.widget.layers.splice(this.$index, 1);
                    $scope.layer = null;
                    $scope.$emit('validate');
                };
                if ($scope.widget.id === 'indberetninger') {
                    $scope.widget.description = $scope.widget.description || "Angiv den geografiske placering af indberetningen i kortet.";
                    $scope.widget.layers = $scope.widget.layers || [];
                    for (var i = 0; i < $scope.configuration.map.overlays.length; i++) {
                        var layer = $scope.configuration.map.overlays[i];
                        if (layer.type === 'database') {
                            if ($scope.widget.layers.indexOf(layer.id) === -1) {
                                $scope.layers[layer.id] = layer;
                            }
                            $scope.index[layer.id] = layer;
                        }
                    }
                }
            }
        };
    });
})(this, this.angular, this.console);