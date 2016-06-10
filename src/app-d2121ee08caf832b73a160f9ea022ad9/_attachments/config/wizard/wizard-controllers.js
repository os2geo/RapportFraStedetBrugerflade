(function (window, angular, console, FileReader, Image, L) {
    'use strict';
    angular.module('myApp.controllers').controller('config-wizard', ['$scope', '$rootScope', '$upload', '$http', 'kfticket', '$q', '$location', '$timeout', '$stateParams',
        function ($scope, $rootScope, $upload, $http, kfticket, $q, $location, $timeout, $stateParams) {

            var widgets = {
                    "adressesøgning": {
                        name: "Søg adresse",
                        options: "",
                        zoom: 16
                    },
                    "matrikelsøgning": {
                        name: "Søg matrikel",
                        zoom: 16
                    },
                    kortkontrol: {
                        name: "Kortlag"
                    },
                    indberetninger: {
                        name: "Mine indberetninger"
                    },
                    tracking: {
                        name: "Tracking"
                    },
                    opgaver: {
                        name: "Opgaver"
                    },
                    position: {
                        name: "Vis min position"
                    },
                    offlinemap: {
                        name: "Offline kort"
                    },
                    mitkort: {
                        name: "Minimap - Mit kort",
                        logo: ""
                    }
                },
                i,
                key;



            $scope.addBaselayer = function () {
                $scope.$parent.doc.map.baselayers = $scope.$parent.doc.map.baselayers || [];
                $scope.$parent.doc.map.baselayers.push({
                    type: "mbtiles"
                });
                $scope.$emit('validate');
            };
            $scope.addOverlay = function () {
                $scope.$parent.doc.map.overlays = $scope.$parent.doc.map.overlays || [];
                $scope.$parent.doc.map.overlays.push({
                    type: "mbtiles",
                    style: JSON.stringify("function (feature) {\n    return theme['default'].style;\n}"),
                    //pointToLayer: JSON.stringify("function (feature, latlng) {\n    var t = theme['default'];\n    switch (t.pointType) {\n        case 'marker':\n            return L.marker(latlng);\n        case 'circle': //radius i meter\n            return L.circle(latlng, t.style.radius, t.style);\n        case 'circleMarker': //radius i pixel\n            return L.circleMarker(latlng, t.style);\n    }\n}"),
                    pointToLayer: JSON.stringify("function (feature, latlng) {\n    var t = theme['default'];\n    switch (t.pointType) {\n        case 'marker':\n            return L.marker(latlng);\n        case 'maki':\n            var icon = L.MakiMarkers.icon(t.style);\n            return L.marker(latlng, {icon: icon});\n        case 'circle': //radius i meter\n            return L.circle(latlng, t.style.radius, t.style);\n        case 'circleMarker': //radius i pixel\n            return L.circleMarker(latlng, t.style);\n    }\n}"),

                    onEachFeature: JSON.stringify("function (feature, layer) {\n    layer.bindPopup(\"<table><tr><td style='padding-right:5px'><strong>ID:</strong></td><td>\" + feature.properties._id + \"</td></tr></table>\");\n}")

                });
                $scope.$emit('validate');
            };
            $scope.removeBaselayer = function () {
                $scope.baselayerkeys.push($scope.$parent.doc.baselayers[this.$index]);
                $scope.$parent.doc.baselayers.splice(this.$index, 1);
                $scope.$emit('validate');
            };


            $scope.widgets = angular.copy(widgets);
            for (key in widgets) {
                if (widgets.hasOwnProperty(key)) {
                    for (i = 0; i < $scope.$parent.doc.widgets.length; i += 1) {
                        if ($scope.$parent.doc.widgets[i].id === key) {
                            delete $scope.widgets[key];
                            break;
                        }
                    }
                }
            }

            $scope.addWidget = function () {
                var widget = angular.copy(widgets[$scope.widget]);
                widget.id = $scope.widget;
                $scope.$parent.doc.widgets.push(widget);
                delete $scope.widgets[$scope.widget];
                $scope.widget = null;
                $scope.$emit('validate');
            };
            $scope.$on("widgetremove", function (e, id) {
                $scope.widgets[id] = angular.copy(widgets[id]);
            });



            //region Map
            var createMap = function (epsg) {
                if (epsg === "25832") {
                    map.options.crs = new L.Proj.CRS.TMS('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs', [120000, 5900000, 1000000, 6500000], {
                        resolutions: [1638.4, 819.2, 409.6, 204.8, 102.4, 51.2, 25.6, 12.8, 6.4, 3.2, 1.6, 0.8, 0.4, 0.2, 0.1]
                    });
                } else {
                    map.options.crs = L.CRS.EPSG3857;
                }
            };
            $scope.$on('layerSelected', function (e, layer, isBaselayer, index) {
                if (isBaselayer) {
                    if (index !== $scope.selectedBaselayer && layer.selected) {
                        createLayer({
                            config: layer,
                            index: index
                        }).then(function (layer) {
                            var bounds = map.getBounds();
                            if (map.hasLayer(selectedBaselayerLeaflet)) {
                                map.removeLayer(selectedBaselayerLeaflet);
                            }
                            $scope.selectedBaselayer = index;

                            if (layer.config.epsg !== epsg) {
                                removeOverlays();
                                createMap(layer.config.epsg);
                            }
                            selectedBaselayerLeaflet = layer.data;
                            map.addLayer(layer.data);
                            if (layer.data.setZIndex) {
                                layer.data.setZIndex(0);
                            }
                            map.fitBounds(bounds);
                            $scope.selectedBaselayer = layer.index;

                            if (layer.config.epsg !== epsg) {
                                createOverlays();
                                epsg = layer.config.epsg;
                            }
                        });
                    }
                } else {
                    var overlay;
                    if (overlays.hasOwnProperty(index)) {
                        overlay = overlays[index];
                        if (map.hasLayer(overlay.data)) {
                            map.removeLayer(overlay.data);
                        }
                        delete overlays[index];
                    } else {
                        overlay = {
                            config: layer,
                            index: index
                        };
                        //if (overlay.config.type === 'geojson' || overlay.config.type === 'wms' || overlay.config.epsg === epsg) {

                        if (overlay.config.selected) {
                            createLayer(overlay).then(addLayer);
                        }
                        //}
                    }
                }
            });
            $scope.$on('layerRemove', function (e, layer, isBaselayer, index) {
                if (isBaselayer) {
                    $scope.selectedBaselayer = null;
                    if (map.hasLayer(selectedBaselayerLeaflet)) {
                        map.removeLayer(selectedBaselayerLeaflet);
                    }
                    selectedBaselayerLeaflet = null;

                } else {
                    var overlay;
                    if (overlays.hasOwnProperty(index)) {
                        overlay = overlays[index];
                        if (map.hasLayer(overlay.data)) {
                            map.removeLayer(overlay.data);
                        }
                        delete overlays[index];
                    }
                }
            });
            var createLayer = function (value) {
                var deferred = $q.defer();
                $timeout(function () {

                    var jsonTransformed = {};
                    if (value.config.options) {
                        jsonTransformed = JSON.parse(value.config.options, function (key, value) {
                            if (value && (typeof value === 'string') && value.indexOf("function") === 0) {
                                // we can only pass a function as string in JSON ==> doing a real function
                                //eval("var jsFunc = " + value);
                                var jsFunc = new Function('return ' + value)();
                                return jsFunc;
                            }
                            return value;
                        });
                    }
                    if (value.config.attribution) {
                        jsonTransformed.attribution = value.config.attribution;
                    }
                    if (value.config.type === 'xyz') {
                        if (value.config.ticket) {
                            kfticket.getTicket().then(function (ticket) {
                                jsonTransformed.ticket = ticket;
                                value.data = L.tileLayer(value.config.url, jsonTransformed);
                                deferred.resolve(value);
                            });
                        } else {
                            value.data = L.tileLayer(value.config.url, jsonTransformed);
                            deferred.resolve(value);
                        }
                    } else if (value.config.type === 'wms') {
                        jsonTransformed = angular.extend(jsonTransformed, value.config.wms);
                        if (value.config.ticket) {
                            kfticket.getTicket().then(function (ticket) {
                                jsonTransformed.ticket = ticket;
                                value.data = L.tileLayer.wms(value.config.url, jsonTransformed);
                                deferred.resolve(value);
                            });
                        } else {
                            value.data = L.tileLayer.wms(value.config.url, jsonTransformed);
                            deferred.resolve(value);
                        }
                    } else if (value.config.type === 'topojson' || value.config.type === 'geojson' || value.config.type === 'database' || value.config.type === 'straks') {
                        var theme = {};
                        if (value.config.styles) {
                            for (var i = 0; i < value.config.styles.length; i++) {
                                var style = value.config.styles[i];
                                theme[style.id] = style;
                            }
                        }
                        if (value.config.style) {
                            jsonTransformed.style = JSON.parse(value.config.style, function (key, value) {
                                if (value && (typeof value === 'string') && value.indexOf("function") !== -1) {
                                    // we can only pass a function as string in JSON ==> doing a real function
                                    //eval("var jsFunc = " + value);
                                    //var jsFunc = new Function('return ' + value)();
                                    var jsFunc = new Function("theme", 'return ' + value)(theme);
                                    //var jsFunc = eval(value);
                                    return jsFunc;
                                }
                                return value;
                            });
                        }
                        if (value.config.onEachFeature) {
                            jsonTransformed.onEachFeature = JSON.parse(value.config.onEachFeature, function (key, value) {
                                if (value && (typeof value === 'string') && value.indexOf("function") !== -1) {
                                    // we can only pass a function as string in JSON ==> doing a real function
                                    //eval("var jsFunc = " + value);
                                    var jsFunc = new Function('return ' + value)();
                                    return jsFunc;
                                }
                                return value;
                            });
                        }
                        if (value.config.pointToLayer) {
                            jsonTransformed.pointToLayer = JSON.parse(value.config.pointToLayer, function (key, value) {
                                if (value && (typeof value === 'string') && value.indexOf("function") !== -1) {
                                    // we can only pass a function as string in JSON ==> doing a real function
                                    //eval("var jsFunc = " + value);
                                    var jsFunc = new Function("theme", "L", 'return ' + value)(theme, L);

                                    return jsFunc;
                                }
                                return value;
                            });
                        }
                        if (value.config.type === 'database') {
                            value.data = L.geoJson(null, jsonTransformed);
                            $http.get('/couchdb/db-' + value.config.database + '/_design/views/_view/data?include_docs=true').
                            success(function (data, status, headers, config) {
                                for (var i = 0; i < data.rows.length; i++) {
                                    var doc = data.rows[i].doc;
                                    value.data.addData(doc);
                                }
                                deferred.resolve(value);
                            }).
                            error(function (data, status, headers, config) {
                                deferred.reject(data);
                            });
                        } else if (value.config.type === 'straks') {
                            $http.get('/api/' + value.config.database + '/straks/' + value.config.straks).success(function (data, status, headers, config) {
                                if (data.geojson) {
                                    value.data = L.geoJson(data.geojson, jsonTransformed);
                                    deferred.resolve(value);
                                } else {
                                    deferred.reject(data);
                                }
                            }).error(function (data, status, headers, config) {
                                deferred.reject(data);
                            });
                        } else if (value.config.type === 'geojson') {
                            if (value.config.geojson) {
                                value.data = L.geoJson(value.geojson, jsonTransformed);
                                deferred.resolve(value);
                            } else {
                                $http.get('/couchdb/' + $rootScope.appID + '/' + $stateParams.configuration + '/' + value.config.id + '.geojson').success(function (data, status, headers, config) {
                                    value.data = L.geoJson(data, jsonTransformed);
                                    deferred.resolve(value);

                                }).error(function (data, status, headers, config) {
                                    deferred.reject(data);
                                });
                            }
                        } else if (value.config.type === 'topojson') {
                            value.data = omnivore.topojson.parse(value.config.geojson, null, L.geoJson(null, jsonTransformed));
                            deferred.resolve(value);
                        }
                    } else if (value.config.type === 'mbtiles') {
                        if (typeof (value.config.minZoom) !== 'undefined') {
                            jsonTransformed.minZoom = value.minZoom;
                        }
                        if (typeof (value.config.maxZoom) !== 'undefined') {
                            jsonTransformed.maxZoom = value.maxZoom;
                        }

                        var url = '';
                        if ($location.$$host !== 'localhost') {
                            url += 'http://{s}.' + $location.$$host;
                        }
                        url += '/tilestream/v2/' + value.config.mbtile + '/{z}/{x}/{y}.' + value.config.format;
                        value.data = L.tileLayer(url, jsonTransformed);
                        deferred.resolve(value);
                    }
                });
                return deferred.promise;
            };
            var epsg, selectedBaselayerLeaflet;
            var overlayChange = function (overlay, index) {
                if (overlay.selected) {
                    createLayer(overlay, index).then(addLayer);
                } else {
                    if (map.hasLayer(overlay.leaflet)) {
                        map.removeLayer(overlay.leaflet);
                    }
                }
            };
            var baselayerChange = function (index) {
                if (index !== $scope.selectedBaselayer) {

                    var baselayer = $scope.$parent.doc.map.baselayers[index];
                    if (baselayer) {
                        createLayer(baselayer, 0).then(function (layer) {
                            var bounds = map.getBounds();
                            if (map.hasLayer(selectedBaselayerLeaflet)) {
                                map.removeLayer(selectedBaselayerLeaflet);
                            }
                            $scope.selectedBaselayer = index;

                            if (layer.config.epsg !== epsg) {
                                removeOverlays();
                                createMap(layer.config.epsg);
                            }
                            selectedBaselayerLeaflet = layer.data;
                            map.addLayer(layer.data);
                            if (layer.data.setZIndex) {
                                layer.data.setZIndex(0);
                            }
                            map.fitBounds(bounds);
                            epsg = layer.config.epsg;
                            createOverlays();

                        });
                    }
                }
            };
            var overlays = {};
            var addLayer = function (layer) {
                map.addLayer(layer.data);
                if (layer.data.setZIndex) {
                    layer.data.setZIndex(layer.index + 1);
                }
                overlays[layer.index] = layer;
            };
            var removeOverlays = function () {
                for (var key in overlays) {
                    var overlay = overlays[key];
                    if (map.hasLayer(overlay.data)) {
                        map.removeLayer(overlay.data);
                    }
                }
                overlays = {};
            };
            var createOverlays = function () {
                for (var i = 0; i < $scope.$parent.doc.map.overlays.length; i++) {
                    var overlay = {
                        config: $scope.$parent.doc.map.overlays[i],
                        index: i
                    };
                    //if (overlay.config.type === 'geojson' || overlay.config.type === 'wms' || overlay.config.epsg === epsg) {

                    if (overlay.config.selected) {
                        createLayer(overlay).then(addLayer);
                    }
                    //}
                }
            };
            var map;
            $scope.mapCreated = function (mapvar) {
                map = mapvar;
                var selectedBaselayer;
                for (var i = 0; i < $scope.$parent.doc.map.baselayers.length; i++) {
                    var baselayer = $scope.$parent.doc.map.baselayers[i];
                    if (baselayer.selected) {
                        epsg = baselayer.epsg;
                        selectedBaselayer = baselayer;
                        $scope.selectedBaselayer = i;
                        break;
                    }
                }
                if (selectedBaselayer) {
                    createMap(selectedBaselayer.epsg);
                    createLayer({
                        config: selectedBaselayer,
                        index: 0
                    }).then(function (layer) {
                        selectedBaselayerLeaflet = layer.data;
                        map.addLayer(layer.data);
                        if (layer.data.setZIndex) {
                            layer.data.setZIndex(0);
                        }
                        map.fitBounds(layer.config.bounds);
                        createOverlays();
                    });
                }
            };
            //endregion

            //region Security

            $http.get('/api/users/' + $stateParams.organization).
            success(function (data, status, headers, config) {
                $scope.users = {};
                angular.forEach(data.rows, function (item) {
                    $scope.users[item.value.name] = $scope.$parent.doc.security.indexOf(item.value.name) !== -1;
                });
            }).
            error(function (data, status, headers, config) {
                $scope.error = data;
            });

            $scope.change = function (item) {
                $scope.$parent.doc.security = [];
                for (var key in $scope.users) {
                    if ($scope.users[key]) {
                        $scope.$parent.doc.security.push(key);
                    }
                }

            };
            //endregion

        }]);
}(this, this.angular, this.console, this.FileReader, this.Image, this.L));