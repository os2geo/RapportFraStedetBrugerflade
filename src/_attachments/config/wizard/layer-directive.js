(function (window, angular, console, colorbrewer) {
    'use strict';
    /* Directives */
    angular.module('myApp.directives')

    .directive("layer", function ($compile, $http, $stateParams, $rootScope) {
        return {
            restrict: "E",
            scope: {
                layer: '=',
                configuration: '=',
                isBaselayer: '='
            },
            templateUrl: 'config/wizard/layer.html',
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
                var geojson;
                $scope.schemafield = null;
                $scope.formfield = null;
                $scope.schemakeys = [];
                $scope.themekeys = [];
                $scope.formkeys = [];
                $scope.addListField = function () {
                    $scope.layer.list.push(this.schemafield);
                    var i = $scope.schemakeys.indexOf(this.schemafield);
                    $scope.schemakeys.splice(i, 1);
                    $scope.schemafield = null;
                    $scope.$emit('validate');
                };
                $scope.removeListField = function () {
                    $scope.schemakeys.push($scope.layer.list[this.$index]);
                    $scope.layer.list.splice(this.$index, 1);
                    $scope.$emit('validate');
                };
                $scope.addFormField = function () {
                    var field = {
                        id: this.formfield,
                        fields: []
                    };
                    var item = $scope.schema.properties[this.formfield];
                    if (this.formfield === 'geometry') {
                        field.type = 'geometry';
                    } else {
                        field.type = checkType(item);
                    }
                    $scope.layer.form.push(field);
                    var i = $scope.formkeys.indexOf(this.formfield);
                    $scope.formkeys.splice(i, 1);
                    $scope.formfield = null;
                    $scope.$emit('validate');
                };
                $scope.addField = function () {
                    $scope.layer.form.push({
                        id: "Ny",
                        fields: []
                    });
                    $scope.$emit('validate');
                };
                /*var buildKeys = function (node, parent) {
                    for (var key in node) {
                        var localnode = node[key];
                        if (localnode.properties) {
                            buildKeys(localnode.properties, parent + '/' + key);
                        } else if (localnode.oneOf && localnode.oneOf.length > 0) {
                            buildKeys(localnode.oneOf[0].properties, parent + '/' + key);
                        } else {
                            $scope.schemakeys.push(parent + '/' + key);
                        }
                    }
                };*/
                var buildKeys = function (node, parent) {
                    for (var key in node) {
                        var localnode = node[key];
                        if (localnode.properties) {
                            buildKeys(localnode.properties, parent + '/' + key);
                        } else if (localnode.oneOf && localnode.oneOf.length > 0) {
                            buildKeys(localnode.oneOf[0].properties, parent + '/' + key);
                        } else {
                            $scope.schemakeys.push(parent + '/' + key);
                            $scope.themekeys.push(parent + '/' + key);
                        }
                    }
                };
                /*var buildKeys = function (node, parent) {
                    for (var key in node) {
                        if (node[key].properties) {

                            buildKeys(node[key].properties, parent + '/' + key);

                        } else {
                            $scope.schemakeys.push(parent + '/' + key);
                        }
                    }
                };*/
                var checkStringType = function (string) {
                    switch (string.format) {
                    case "date-time":
                        return "text";
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
                        return "select";
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
                            }
                        }
                    }
                    return "";
                };
                var initOpgaver = function () {

                    if ($scope.layer.database) {
                        $http.get('/couchdb/db-' + $scope.layer.database + '/_design/schema').
                        success(function (schema, status, headers, config) {
                            $scope.schemafield = null;
                            $scope.formfield = null;
                            $scope.schemakeys = [];
                            $scope.themekeys = [];
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


                var key,
                    widgets = {},
                    i,
                    widget;
                for (i = 0; i < $scope.configuration.widgets.length; i++) {
                    widget = $scope.configuration.widgets[i];
                    widgets[widget.id] = widget;
                }
                $scope.layer.selectionStyle = $scope.layer.selectionStyle || {
                    id: 'selection',
                    style: {
                        stroke: true,
                        color: "#ff0000",
                        weight: 4,
                        opacity: 0.7,
                        fill: true,
                        fillColor: "#ff0000",
                        fillOpacity: 0.5,
                        dashArray: null,
                        lineCap: null,
                        lineJoin: null,
                        clickable: true,
                        pointerEvents: null,
                        className: '',
                        radius: 10
                    },
                    pointType: "circleMarker",
                    displayAs: 'Point'
                };
                $http.get('/api/organization/' + $stateParams.organization + '/databases').
                success(function (data, status, headers, config) {
                    $scope.databases = data.rows;
                }).
                error(function (data, status, headers, config) {
                    $scope.error = data;
                });
                if (!$scope.layer.id) {
                    $http.get('/couchdb/_uuids').
                    success(function (data, status, headers, config) {
                        $scope.layer.id = data.uuids[0];
                    }).
                    error(function (data, status, headers, config) {});
                }
                $scope.schemakeys = [];
                $scope.onFileSelect = function ($files) {
                    if ($files.length > 0) {
                        var fileReader = new FileReader(),
                            key;
                        fileReader.readAsText($files[0]);
                        fileReader.onload = function (e) {
                            $scope.layer.geojson = JSON.parse(e.target.result);
                            $scope.$emit('validate');
                            if ($scope.layer.geojson.features && $scope.layer.geojson.features.length > 0) {
                                for (key in $scope.layer.geojson.features[0].properties) {
                                    if ($scope.layer.geojson.features[0].properties.hasOwnProperty(key)) {
                                        $scope.schemakeys.push("/properties/" + key);
                                    }
                                }
                            }
                            $scope.$apply();
                        };
                    }
                };
                if ($scope.layer.type === 'geojson') {
                    if ($scope.layer.geojson) {
                        if ($scope.layer.geojson.features && $scope.layer.geojson.features.length > 0) {
                            for (key in $scope.layer.geojson.features[0].properties) {
                                if ($scope.layer.geojson.features[0].properties.hasOwnProperty(key)) {
                                    $scope.schemakeys.push("/properties/" + key);
                                }
                            }
                        }
                    } else {
                        $http.get('/couchdb/' + $rootScope.appID + '/' + $stateParams.configuration + '/' + $scope.layer.id + '.geojson').
                        success(function (data, status, headers, config) {
                            var key;
                            geojson = data;
                            if (geojson.features && geojson.features.length > 0) {
                                for (key in geojson.features[0].properties) {
                                    if (geojson.features[0].properties.hasOwnProperty(key)) {
                                        $scope.themekeys.push("/properties/" + key);
                                    }
                                }
                            }
                        }).
                        error(function (data, status, headers, config) {
                            $scope.error = data;
                        });
                    }
                } else if ($scope.layer.type === 'database') {
                    $http.get('/couchdb/db-' + $scope.layer.database + '/_design/schema').
                    success(function (schema, status, headers, config) {
                        buildKeys(schema.schema.properties, "");
                    }).
                    error(function (data, status, headers, config) {
                        $scope.error = data;
                    });
                }
                $scope.layer.styles = $scope.layer.styles || [];
                if ($scope.layer.style) {
                    $scope.style = JSON.parse($scope.layer.style);
                }
                $scope.styleChange = function () {
                    if (this.style === "") {
                        delete $scope.layer.style;
                    } else {
                        $scope.layer.style = JSON.stringify(this.style);
                    }
                };
                if ($scope.layer.pointToLayer) {
                    $scope.pointToLayer = JSON.parse($scope.layer.pointToLayer);
                }
                $scope.pointToLayerChange = function () {
                    if (this.pointToLayer === "") {
                        delete $scope.layer.pointToLayer;
                    } else {
                        $scope.layer.pointToLayer = JSON.stringify(this.pointToLayer);
                    }
                };
                if ($scope.layer.onEachFeature) {
                    $scope.onEachFeature = JSON.parse($scope.layer.onEachFeature);
                }
                $scope.onEachFeatureChange = function () {
                    if (this.onEachFeature === "") {
                        delete $scope.layer.onEachFeature;
                    } else {
                        $scope.layer.onEachFeature = JSON.stringify(this.onEachFeature);
                    }
                };

                $scope.addStyle = function () {

                    $scope.layer.styles.push({
                        id: "default",
                        style: {
                            stroke: true,
                            weight: 4,
                            opacity: 0.7,
                            fill: true,
                            fillOpacity: 0.5,
                            dashArray: null,
                            lineCap: null,
                            lineJoin: null,
                            clickable: true,
                            pointerEvents: null,
                            className: '',
                            radius: 10
                        },
                        pointType: "circleMarker"
                    });
                    var paletteindex = 3;
                    if ($scope.colorbrewer[$scope.selectedPalette].hasOwnProperty($scope.layer.styles.length)) {
                        paletteindex = $scope.layer.styles.length;
                    } else {
                        var max;
                        for (var key in this.palette) {
                            if (key !== '$$hashKey') {
                                key = parseInt(key);
                                max = max || key;
                                max = max > key ? max : key;
                            }
                        }
                        if ($scope.layer.styles.length > max) {
                            paletteindex = max;
                        }
                    }
                    for (var i = 0; i < $scope.layer.styles.length; i++) {
                        var style = $scope.layer.styles[i];
                        style.style.color = $scope.colorbrewer[$scope.selectedPalette][paletteindex][i];
                        style.style.fillColor = $scope.colorbrewer[$scope.selectedPalette][paletteindex][i];
                    }
                };


                $scope.$watchCollection('layer', function () {
                    $scope.$emit('layerChanged', $scope.layer, $scope.isBaselayer);
                });
                $scope.$emit('layerAdd', $scope.layer, $scope.isBaselayer);
                $scope.layer.bounds = $scope.layer.bounds || [[], []];
                $scope.options = $scope.layer.options;
                $scope.selected = function () {
                    $scope.$emit('layerSelected', $scope.layer, $scope.isBaselayer, $scope.$parent.$parent.$parent.$index);
                };

                $scope.$on('remove', function (event) {
                    var key;
                    if (!event.defaultPrevented) {
                        $scope.$emit('layerRemove', $scope.layer, $scope.isBaselayer, $scope.$parent.$parent.$parent.$index);
                        if ($scope.isBaselayer) {
                            $scope.configuration.map.baselayers.splice($scope.$parent.$parent.$parent.$index, 1);
                        } else {
                            if ($scope.layer.type === 'geojson' && $scope.configuration._attachments) {
                                for (key in $scope.configuration._attachments) {
                                    if ($scope.configuration._attachments.hasOwnProperty(key)) {
                                        if (key.indexOf($scope.layer.id) !== -1) {
                                            delete $scope.configuration._attachments[key];
                                        }
                                    }
                                }
                            }
                            $scope.configuration.map.overlays.splice($scope.$parent.$parent.$parent.$index, 1);

                        }
                        $scope.$emit('validate');

                        event.preventDefault();
                    }
                });
                $scope.optionsChange = function () {
                    $scope.textError = null;
                    try {
                        $scope.layer.options = JSON.stringify(JSON.parse($scope.options));
                        $scope.$emit('validate');
                    } catch (ex) {
                        $scope.textError = ex.message;

                    }
                };
                var updateMBTiles = function (doc) {
                    $http.get('/tilestream/api/Tileset/' + doc.id).
                    success(function (data, status, headers, config) {
                        $scope.layer.name = doc.value.name;
                        $scope.layer.epsg = doc.value.epsg;
                        $scope.layer.type = 'mbtiles';
                        $scope.layer.format = doc.value.format;
                        $scope.layer.size = doc.value.size;
                        $scope.layer.bounds = [[data.bounds[1], data.bounds[0]], [data.bounds[3], data.bounds[2]]];
                        $scope.layer.minZoom = data.minzoom;
                        $scope.layer.maxZoom = data.maxzoom;

                    }).
                    error(function (data, status, headers, config) {
                        console.log(data);
                    });
                };
                $scope.changeMBTiles = function () {
                    for (var i = 0; i < $scope.mbtiles.rows.length; i++) {
                        var doc = $scope.mbtiles.rows[i];
                        if (doc.id === $scope.layer.mbtile) {
                            updateMBTiles(doc);
                            break;
                        }
                    }
                };

                $scope.typeChange = function () {
                    if ($scope.layer.type === 'wms') {
                        $scope.layer.wms = $scope.layer.wms || {};
                    }
                    if ($scope.layer.type === 'database' || $scope.layer.type === 'straks') {

                        $http.get('/api/organization/' + $stateParams.organization + '/databases').
                        success(function (data, status, headers, config) {
                            $scope.databases = data.rows;
                        }).
                        error(function (data, status, headers, config) {
                            $scope.error = data;
                        });
                    }
                    if ($scope.layer.type === 'straks') {

                        $http.get('/api/' + $scope.layer.database + '/straks').
                        success(function (data, status, headers, config) {
                            $scope.straks = data;
                        }).
                        error(function (data, status, headers, config) {
                            $scope.error = data;
                        });
                    }
                    if ($scope.layer.type === 'mbtiles') {
                        $http.get('/api/maps/' + $stateParams.organization).
                        success(function (data, status, headers, config) {
                            $scope.mbtiles = data;
                        }).
                        error(function (data, status, headers, config) {
                            console.log(data);
                        });


                    }
                };
                $scope.optionsType = [
                    {
                        key: 'Tiles (xyz)',
                        value: 'xyz'
                    }, {
                        key: 'WMS',
                        value: 'wms'
                    }, {
                        key: 'MBTiles',
                        value: 'mbtiles'
                    }, {
                        key: 'Database',
                        value: 'database'
                    }, {
                        key: 'GeoJSON',
                        value: 'geojson'
                    }, {
                        key: 'TopoJSON',
                        value: 'topojson'
                    }, {
                        key: 'Straks',
                        value: 'straks'
                    }
                ];
                $scope.optionsEPSG = [
                    {
                        key: 'Web mercator (EPSG:3857)',
                        value: '3857'
                    }, {
                        key: 'UTM32 / ETRS89 (EPSG:25832)',
                        value: '25832'
                    }
                ];
                $scope.databaseChange = function () {
                    initOpgaver();
                    if ($scope.layer.type === 'straks') {

                        $http.get('/api/' + $scope.layer.database + '/straks').
                        success(function (data, status, headers, config) {
                            $scope.straks = data;
                        }).
                        error(function (data, status, headers, config) {
                            $scope.error = data;
                        });
                    }
                };
                if ($scope.layer.database) {
                    $scope.databaseChange();
                }
                $scope.typeChange();



                var getValue = function (item, value) {
                    var path = value.split('/');
                    for (var m = 1; m < path.length; m++) {
                        var key = path[m];
                        if (item.hasOwnProperty(key)) {
                            item = item[key];
                        }
                    }
                    if (typeof (item) === 'object') {
                        return null;
                    }
                    return item;
                };
                $scope.colorbrewer = [];
                angular.forEach(colorbrewer, function (value, key) {
                    $scope.colorbrewer.push(value);
                });
                $scope.selectedPalette = 29;
                $scope.selectPalette = function (index) {
                    $scope.selectedPalette = this.$index;
                    var paletteindex = 3;
                    if (this.palette.hasOwnProperty($scope.layer.styles.length)) {
                        paletteindex = $scope.layer.styles.length;
                    } else {
                        var max;
                        for (var key in this.palette) {
                            if (key !== '$$hashKey') {
                                key = parseInt(key);
                                max = max || key;
                                max = max > key ? max : key;
                            }
                        }
                        if ($scope.layer.styles.length > max) {
                            paletteindex = max;
                        }
                    }
                    for (var i = 0; i < $scope.layer.styles.length; i++) {
                        var style = $scope.layer.styles[i];
                        style.style.color = this.palette[paletteindex][i];
                        style.style.fillColor = this.palette[paletteindex][i];
                    }
                };
                if ($scope.layer.styles.length === 0) {
                    $scope.addStyle();
                }
                var buildTheme = function (values, themefield) {
                    var paletteindex = 3,
                        i;
                    if ($scope.colorbrewer[$scope.selectedPalette].hasOwnProperty($scope.layer.styles.length)) {
                        paletteindex = $scope.layer.styles.length;
                    } else {
                        var max;
                        for (var key in $scope.colorbrewer[$scope.selectedPalette]) {
                            if (key !== '$$hashKey') {
                                key = parseInt(key);
                                max = max || key;
                                max = max > key ? max : key;
                            }
                        }
                        if ($scope.layer.styles.length > max) {
                            paletteindex = max;
                        }
                    }
                    for (i = 0; i < values.length; i++) {
                        $scope.layer.styles.push({
                            id: values[i],
                            style: {
                                stroke: true,
                                color: $scope.colorbrewer[$scope.selectedPalette][paletteindex][i],
                                weight: 4,
                                opacity: 0.7,
                                fill: true,
                                fillColor: $scope.colorbrewer[$scope.selectedPalette][paletteindex][i],
                                fillOpacity: 0.5,
                                dashArray: null,
                                lineCap: null,
                                lineJoin: null,
                                clickable: true,
                                pointerEvents: null,
                                className: '',
                                radius: 10
                            },
                            pointType: "circleMarker"
                        });
                    }

                    $scope.style = "function (feature) {\n    return theme[feature" + themefield.replace(/\//g, ".") + "].style;\n}";
                    $scope.styleChange();
                    $scope.pointToLayer = "function (feature, latlng) {\n    var t = theme[feature" + themefield.replace(/\//g, ".") + "];\n    switch (t.pointType) {\n        case 'marker':\n            return L.marker(latlng);\n        case 'circle': //radius i meter\n            return L.circle(latlng, t.style.radius, t.style);\n        case 'circleMarker': //radius i pixel\n            return L.circleMarker(latlng, t.style);\n    }\n}";
                    $scope.pointToLayerChange();
                    $scope.onEachFeature = "function (feature, layer) {\n    layer.bindPopup(\"<table><tr><td style='padding-right:5px'><strong>" + themefield + ":</strong></td><td>\" + feature" + themefield.replace(/\//g, ".") + " + \"</td></tr></table>\");\n}";
                    $scope.onEachFeatureChange();
                };
                $scope.themefieldChange = function () {
                    var themefield = this.themefield,
                        values = [],
                        i,
                        doc,
                        value;
                    $scope.layer.styles = [];
                    if ($scope.layer.type === 'geojson') {
                        if ($scope.layer.geojson) {
                            for (i = 0; i < $scope.layer.geojson.features.length; i++) {
                                doc = $scope.layer.geojson.features[i];
                                value = getValue(doc, themefield);
                                if (values.indexOf(value) === -1) {
                                    values.push(value);
                                }
                            }
                        } else if (geojson) {
                            for (i = 0; i < geojson.features.length; i++) {
                                doc = geojson.features[i];
                                value = getValue(doc, themefield);
                                if (values.indexOf(value) === -1) {
                                    values.push(value);
                                }
                            }
                        }
                        buildTheme(values, themefield);

                    } else if ($scope.layer.type === 'database') {
                        $http.get('/couchdb/db-' + $scope.layer.database + '/_all_docs?include_docs=true').
                        success(function (data, status, headers, config) {
                            for (i = 0; i < data.rows.length; i++) {
                                doc = data.rows[i].doc;
                                if (doc._id.substring(0, 7) !== "_design") {
                                    value = getValue(doc, themefield);
                                    if (values.indexOf(value) === -1) {
                                        values.push(value);
                                    }
                                }
                            }
                            buildTheme(values, themefield);
                        }).
                        error(function (data, status, headers, config) {
                            console.log(data);
                        });
                    }
                };
            }
        };
    });
})(this, this.angular, this.console, this.colorbrewer);