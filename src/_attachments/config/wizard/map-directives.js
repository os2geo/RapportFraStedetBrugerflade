/*jshint -W054 */
(function (window, angular, console, L) {
    'use strict';
    /* Directives */
    angular.module('myApp.directives')
    
    
    .directive('map', function () {
        return {
            restrict: 'A',
            scope: {
                onCreate: '&'
            },
            link: function ($scope, $element, $attr) {
                var map = new L.Map($element[0]);
                map.attributionControl.setPrefix('');
                $scope.onCreate({
                    map: map
                });
            }
        };
    });
    
    /*.directive('map', ['$http', '$timeout', 'kfticket',
        function ($http, $timeout, kfticket) {

            return {
                link: function (scope, element, attrs) {

                    
                    var createMap = function (epsg) {
                        if (scope.map) {
                            scope.map.remove();
                        }
                        if (epsg === "25832") {
                            scope.map = new L.Map(element[0], {
                                crs: new L.Proj.CRS.TMS('EPSG:25832',
                                    '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs', [120000, 5900000, 1000000, 6500000], {
                                        resolutions: [1638.4, 819.2, 409.6, 204.8, 102.4, 51.2, 25.6, 12.8, 6.4, 3.2, 1.6, 0.8, 0.4, 0.2, 0.1]
                                    })
                            });

                        } else {
                            scope.map = new L.Map(element[0]);
                        }

                    };
                    var baselayers = {};
                    var overlays = {};
                    scope.$on('layerChanged', function (e, layer, isBaselayer) {
                        if (isBaselayer) {
                            if (baselayers.hasOwnProperty(layer.name)) {
                                scope.map.removeLayer(baselayers[layer.name]);
                            }
                            var baselayer = createLayer(layer);
                            if (baselayer) {
                                baselayers[layer.name] = baselayer;
                                if (layer.selected) {
                                    createMap(layer.epsg);
                                    scope.map.addLayer(baselayer);
                                    scope.map.setView(L.latLng(55.9, 11.8), 7);
                                }
                            }
                        } else {
                            var overlay = createLayer(layer);
                            if (overlay) {
                                overlays[layer.name] = overlay;
                                if (layer.selected) {
                                    scope.map.addLayer(overlay);
                                }
                            }
                        }
                    });
                    scope.$on('layerSelected', function (e, layer, isBaselayer) {
                        if (isBaselayer) {
                            for (var key in baselayers) {
                                var baselayer = baselayers[key];
                                scope.map.removeLayer(baselayer);
                            }
                            scope.map.addLayer(baselayers[layer.name]);
                        } else {
                            var overlay = overlays[layer.name];
                            if (scope.map.hasLayer(overlay)) {
                                scope.map.removeLayer(overlay);
                            } else {
                                scope.map.addLayer(overlay);
                            }
                        }
                    });
                    scope.$on('layerRemove', function (e, layer, isBaselayer) {
                        if (isBaselayer) {
                            scope.map.removeLayer(baselayers[layer.name]);
                        } else {
                            scope.map.removeLayer(overlays[layer.name]);
                        }
                    });
                    scope.$on('layerAdd', function (e, layer, isBaselayer) {
                        if (isBaselayer) {
                            var baselayer = createLayer(layer);
                            if (baselayer) {
                                baselayers[layer.name] = baselayer;
                                if (layer.selected) {
                                    createMap(layer.epsg);
                                    scope.map.addLayer(baselayer);
                                    scope.map.setView(L.latLng(55.9, 11.8), 7);
                                }
                            }
                        } else {
                            var overlay = createLayer(layer);
                            if (overlay) {
                                overlays[layer.name] = overlay;
                                if (layer.selected) {
                                    scope.map.addLayer(overlay);
                                }
                            }
                        }
                    });
                    var createLayer = function (value) {
                        var jsonTransformed = {};
                        if (value.options) {
                            jsonTransformed = JSON.parse(value.options, function (key, value) {
                                if (value && (typeof value === 'string') && value.indexOf("function") === 0) {
                                    // we can only pass a function as string in JSON ==> doing a real function
                                    //eval("var jsFunc = " + value);
                                    var jsFunc = new Function('return ' + value)();
                                    return jsFunc;
                                }
                                return value;
                            });
                        }
                        jsonTransformed.ticket = scope.ticket;
                        if (value.attribution) {
                            jsonTransformed.attribution = value.attribution;
                        }
                        if (value.type === 'xyz' && value.url && value.url !== "") {
                            return L.tileLayer(value.url, jsonTransformed);
                        } else if (value.type === 'wms') {
                            jsonTransformed = angular.extend(jsonTransformed, value.wms);
                            return L.tileLayer.wms(value.url, jsonTransformed);
                        } else if (value.type === 'geojson') {
                            var layer = L.geoJson(null, jsonTransformed);
                            $http.get('/couchdb/db-' + value.database + '/_all_docs?include_docs=true').
                            success(function (data, status, headers, config) {
                                for (var i = 0; i < data.rows.length; i++) {
                                    var doc = data.rows[i].doc;
                                    if (doc._id.substring(0, 7) !== "_design") {
                                        layer.addData(doc);
                                    }
                                }
                            }).
                            error(function (data, status, headers, config) {
                                console.log(data);
                            });
                            return layer;
                        } else if (value.type === 'mbtiles' && value.mbtile && value.bounds) {
                            
                            if (typeof (value.minZoom) !== 'undefined') {
                                jsonTransformed.minZoom = value.minZoom;
                            }
                            if (typeof (value.maxZoom) !== 'undefined') {
                                jsonTransformed.maxZoom = value.maxZoom;
                            }
                            if (typeof (value.bounds) !== 'undefined') {
                                
                            }
                            return L.tileLayer('http://{s}.tilestream.data.kosgis.dk/v2/' + value.mbtile + '/{z}/{x}/{y}.' + value.format, jsonTransformed);
                        }
                        return null;
                    };
                }

            };
        }]);*/
})(this, this.angular, this.console, this.L);