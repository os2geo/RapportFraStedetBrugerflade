(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-borger-2', ['$scope', '$rootScope', '$http', '$stateParams', '$state', '$modal',
        function ($scope, $rootScope, $http, $stateParams, $state, $modal) {
            $scope.Point = false;
            $scope.LineString = false;
            $scope.Polygon = false;
            $scope.MultiPoint = false;
            $scope.MultiLineString = false;
            $scope.MultiPolygon = false;
            var schema;
            var init = function () {
                schema = $rootScope.wizard.schema;
                if (schema.properties && schema.properties.geometry && schema.properties.geometry.oneOf) {
                    for (var i = 0; i < schema.properties.geometry.oneOf.length; i++) {
                        var field = schema.properties.geometry.oneOf[i];
                        if (field.title === "Point") {
                            $scope.Point = true;
                        } else if (field.title === "LineString") {
                            $scope.LineString = true;
                        } else if (field.title === "Polygon") {
                            $scope.Polygon = true;
                        } else if (field.title === "MultiPolygon") {
                            $scope.MultiPolygon = true;
                        } else if (field.title === "MultiLineString") {
                            $scope.MultiLineString = true;
                        } else if (field.title === "MultiPoint") {
                            $scope.MultiPoint = true;
                        }
                    }
                }
                updateForm();
            }
            var getField = function (form) {
                for (var i = 0; i < form.length; i++) {
                    var field = form[i];
                    if (field.type === 'geometry') {
                        return field;
                    }
                }
                return null;
            }
            var updateForm = function () {
                var form = $rootScope.wizard.template.borger.overlay.form || [];
                var field = getField(form);
                if (!field) {
                    field = { id: 'geometry', type: 'geometry' };
                    form.push(field);
                }
                field.fields = [];
                if ($scope.Point) {
                    field.fields.push({ id: 'Point', type: 'Point', fields: [] });
                }
                if ($scope.LineString) {
                    field.fields.push({ id: 'LineString', type: 'LineString', fields: [] });
                }
                if ($scope.Polygon) {
                    field.fields.push({ id: 'Polygon', type: 'Polygon', fields: [] });
                }
                if ($scope.MultiPoint) {
                    field.fields.push({ id: 'MultiPoint', type: 'MultiPoint', fields: [] });
                }
                if ($scope.MultiLineString) {
                    field.fields.push({ id: 'MultiLineString', type: 'MultiLineString', fields: [] });
                }
                if ($scope.MultiPolygon) {
                    field.fields.push({ id: 'MultiPolygon', type: 'MultiPolygon', fields: [] });
                }
                $rootScope.wizard.template.borger.overlay.form = form;
            };
            var basic = function () {
                schema = schema || {};
                schema.$schema = "http://json-schema.org/draft-04/schema#";
                schema.title = "Projekt";
                schema.description = "";
                schema.type = ["object"];
                schema.properties = schema.properties || {};
                schema.properties._id = { "type": "string" };
                schema.properties._rev = { "type": "string" };
                schema.properties._revisions = {
                    "type": "object",
                    "properties": {
                        "start": {
                            "type": "integer"
                        },
                        "ids": {
                            "type": "array"
                        }
                    }
                };
                schema.properties.type = {
                    "enum": ["Feature"]
                };
                schema.properties.geometry = schema.properties.geometry || {};
                schema.properties.geometry.title = "geometry";
                schema.properties.geometry.description = "One geometry as defined by GeoJSON";
                schema.properties.geometry.type = "object";
                schema.properties.geometry.required = ["type", "coordinates"];
                schema.properties.geometry.oneOf = schema.properties.geometry.oneOf || [];
                schema.required = [
                    "properties",
                    "type",
                    "geometry"
                ];
                schema.definitions = {
                    "position": {
                        "description": "A single position",
                        "type": "array",
                        "minItems": 2,
                        "items": [
                            {
                                "type": "number"
                            },
                            {
                                "type": "number"
                            }
                        ],
                        "additionalItems": false
                    },
                    "positionArray": {
                        "description": "An array of positions",
                        "type": "array",
                        "items": {
                            "$ref": "#/definitions/position"
                        }
                    },
                    "lineString": {
                        "description": "An array of two or more positions",
                        "allOf": [
                            {
                                "$ref": "#/definitions/positionArray"
                            },
                            {
                                "minItems": 2
                            }
                        ]
                    },
                    "linearRing": {
                        "description": "An array of four positions where the first equals the last",
                        "allOf": [
                            {
                                "$ref": "#/definitions/positionArray"
                            },
                            {
                                "minItems": 4
                            }
                        ]
                    },
                    "polygon": {
                        "description": "An array of linear rings",
                        "type": "array",
                        "items": {
                            "$ref": "#/definitions/linearRing"
                        }
                    }
                };
            };
            $scope.pointChanged = function () {
                updateForm();
                if (!$scope.Point) {
                    if (schema && schema.properties && schema.properties.geometry && schema.properties.geometry.oneOf) {
                        for (var i = 0; i < schema.properties.geometry.oneOf.length; i++) {
                            var field = schema.properties.geometry.oneOf[i];
                            if (field.title === "Point") {
                                schema.properties.geometry.oneOf.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    basic();
                    schema.properties.geometry.oneOf.push({
                        "title": "Point",
                        "properties": {
                            "type": {
                                "enum": [
                                    "Point"
                                ]
                            },
                            "coordinates": {
                                "$ref": "#/definitions/position"
                            }
                        }
                    });
                }
                $scope.$emit('validate');
            };
            $scope.polygonChanged = function () {
                updateForm();
                if (!$scope.Polygon) {
                    if (schema && schema.properties && schema.properties.geometry && schema.properties.geometry.oneOf) {
                        for (var i = 0; i < schema.properties.geometry.oneOf.length; i++) {
                            var field = schema.properties.geometry.oneOf[i];
                            if (field.title === "Polygon") {
                                schema.properties.geometry.oneOf.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    basic();
                    schema.properties.geometry.oneOf.push({
                        "title": "Polygon",
                        "properties": {
                            "type": {
                                "enum": [
                                    "Polygon"
                                ]
                            },
                            "coordinates": {
                                "$ref": "#/definitions/polygon"
                            }
                        }
                    });
                }
                $scope.$emit('validate');
            };
            $scope.lineStringChanged = function () {
                updateForm();
                if (!$scope.LineString) {
                    if (schema && schema.properties && schema.properties.geometry && schema.properties.geometry.oneOf) {
                        for (var i = 0; i < schema.properties.geometry.oneOf.length; i++) {
                            var field = schema.properties.geometry.oneOf[i];
                            if (field.title === "LineString") {
                                schema.properties.geometry.oneOf.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    basic();
                    schema.properties.geometry.oneOf.push({
                        "title": "LineString",
                        "properties": {
                            "type": {
                                "enum": [
                                    "LineString"
                                ]
                            },
                            "coordinates": {
                                "$ref": "#/definitions/lineString"
                            }
                        }
                    });
                }
                $scope.$emit('validate');
            };
            $scope.multiPointChanged = function () {
                updateForm();
                if (!$scope.MultiPoint) {
                    if (schema && schema.properties && schema.properties.geometry && schema.properties.geometry.oneOf) {
                        for (var i = 0; i < schema.properties.geometry.oneOf.length; i++) {
                            var field = schema.properties.geometry.oneOf[i];
                            if (field.title === "MultiPoint") {
                                schema.properties.geometry.oneOf.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    basic();
                    schema.properties.geometry.oneOf.push({
                        "title": "MultiPoint",
                        "properties": {
                            "type": {
                                "enum": [
                                    "MultiPoint"
                                ]
                            },
                            "coordinates": {
                                "$ref": "#/definitions/positionArray"
                            }
                        }
                    });
                }
                $scope.$emit('validate');
            };
            $scope.multiLineStringChanged = function () {
                updateForm();
                if (!$scope.MultiLineString) {
                    if (schema && schema.properties && schema.properties.geometry && schema.properties.geometry.oneOf) {
                        for (var i = 0; i < schema.properties.geometry.oneOf.length; i++) {
                            var field = schema.properties.geometry.oneOf[i];
                            if (field.title === "MultiLineString") {
                                schema.properties.geometry.oneOf.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    basic();
                    schema.properties.geometry.oneOf.push({
                        "title": "MultiLineString",
                        "properties": {
                            "type": {
                                "enum": [
                                    "MultiLineString"
                                ]
                            },
                            "coordinates": {
                                "type": "array",
                                "items": {
                                    "$ref": "#/definitions/lineString"
                                }
                            }
                        }
                    });
                }
                $scope.$emit('validate');
            };
            $scope.multiPolygonChanged = function () {
                updateForm();
                if (!$scope.MultiPolygon) {
                    if (schema && schema.properties && schema.properties.geometry && schema.properties.geometry.oneOf) {
                        for (var i = 0; i < schema.properties.geometry.oneOf.length; i++) {
                            var field = schema.properties.geometry.oneOf[i];
                            if (field.title === "MultiPolygon") {
                                schema.properties.geometry.oneOf.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    basic();
                    schema.properties.geometry.oneOf.push({
                        "title": "MultiPolygon",
                        "properties": {
                            "type": {
                                "enum": [
                                    "MultiPolygon"
                                ]
                            },
                            "coordinates": {
                                "type": "array",
                                "items": {
                                    "$ref": "#/definitions/polygon"
                                }
                            }
                        }
                    });
                }
                $scope.$emit('validate');
            };
            $scope.next = function () {
                if ($scope.Point || $scope.LineString || $scope.Polygon || $scope.MultiPoint || $scope.MultiLineString || $scope.MultiPolygon) {
                    $rootScope.wizard.step.borger = 3;
                    $rootScope.wizard.schema = schema;
                    sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                    console.log($rootScope.wizard);
                    $state.go('wizard.borger.3');
                } else {
                    $scope.error = "Der skal vælges mindst én geometritype!"
                }
            }
            if (!$rootScope.wizard.schema) {
                $http.get('/couchdb/db-' + $rootScope.wizard.template.borger.overlay.database + '/_design/schema').success(function (data, status, headers, config) {
                    $rootScope.wizard.schema = data.schema;
                    init();
                }).error(function (data, status, headers, config) {
                    if (status === 404) {
                        $scope.error = "Den valgte database indeholder ikke et valideringsskema";
                    } else {
                        $scope.error = data;
                    }
                });
            } else {
                init();
            }
        }
    ]);
})(this, this.angular, this.console);