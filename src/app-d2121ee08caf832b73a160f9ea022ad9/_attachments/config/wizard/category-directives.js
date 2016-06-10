(function (window, angular, console, FileReader, Image, L) {
    'use strict';
    /* Directives */
    angular.module('myApp.directives').directive("category", function ($compile, $http, $rootScope, $upload, $stateParams, $q, $timeout, kfticket, $location) {
        return {
            restrict: "E",
            scope: {
                category: '=',
                parentCategories: '=',
                database: '=',
                schema: '=',
                configuration: '=',
                ticket: '=',
                widgets: '='
            },
            templateUrl: 'config/wizard/category.html',
            compile: function (tElement, tAttr) {
                var contents = tElement.contents().remove(),
                    compiledContents;
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

                $scope.category.instruction = $scope.category.instruction || "Angiv den geografiske placering af indberetningen i kortet.";
                $scope.addCategory = function () {
                    $scope.category.categories.push({
                        name: "Ny",
                        categories: [],
                        form: [],
                        list: [],
                        instruction: "Angiv den geografiske placering af indberetningen i kortet."
                    });
                    $scope.$emit('validate');
                };
                $scope.$on('remove', function (event) {
                    if (!event.defaultPrevented) {
                        $scope.parentCategories.splice($scope.$parent.$parent.$parent.$index, 1);
                        $scope.$emit('validate');
                        event.preventDefault();
                    }
                });

                $scope.changeName = function () {
                    $scope.$emit('validate');
                };
                $scope.addField = function () {
                    $scope.category.form.push({
                        id: "Ny",
                        fields: []
                    });
                    $scope.$emit('validate');
                };
                $scope.schemakeys = [];
                var buildKeys = function (node, parent) {
                    for (var key in node) {
                        if (node[key].properties) {

                            buildKeys(node[key].properties, parent + '/' + key);

                        } else {
                            $scope.schemakeys.push(parent + '/' + key);
                        }
                    }
                };
                buildKeys($scope.schema.properties, "");
                $scope.formkeys = [];
                if ($scope.schema.properties) {
                    for (var key in $scope.schema.properties) {
                        $scope.formkeys.push(key);
                    }
                }
                for (var i = 0; i < $scope.category.list.length; i++) {
                    var id = $scope.category.list[i];
                    var index = $scope.schemakeys.indexOf(id);
                    if (index !== -1) {
                        $scope.schemakeys.splice(index, 1);
                    }
                }


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
                /*for (var key in $scope.schema.properties) {
                    var field = {
                        id: key,
                        fields: []
                    };
                    var item = $scope.schema.properties[key];
                    field.type = checkType(item);
                    $scope.category.form.push(field);
                    if ($scope.schema.properties[key].properties) {

                        buildForm($scope.schema.properties[key].properties, field);
                    }
                }*/
                for (var j = 0; j < $scope.category.form.length; j++) {
                    var formid = $scope.category.form[j].id;
                    var indexform = $scope.formkeys.indexOf(formid);
                    if (indexform !== -1) {
                        $scope.formkeys.splice(indexform, 1);
                    }
                }
                $scope.addBaselayer = function () {
                    $scope.category.map.baselayers = $scope.category.map.baselayers || [];
                    $scope.category.map.baselayers.push({
                        type: "mbtiles"
                    });
                    $scope.$emit('validate');
                };
                $scope.addOverlay = function () {
                    $scope.category.map.overlays = $scope.category.map.overlays || [];
                    $scope.category.map.overlays.push({
                        type: "mbtiles"
                    });
                    $scope.$emit('validate');
                };
                $scope.removeBaselayer = function () {
                    $scope.baselayerkeys.push($scope.category.baselayers[this.$index]);
                    $scope.category.baselayers.splice(this.$index, 1);
                    $scope.$emit('validate');
                };
                $scope.addListField = function () {
                    $scope.category.list.push($scope.schemafield);
                    var i = $scope.schemakeys.indexOf($scope.schemafield);
                    $scope.schemakeys.splice(i, 1);
                    $scope.schemafield = null;
                    $scope.$emit('validate');
                };
                $scope.removeListField = function () {
                    $scope.schemakeys.push($scope.category.list[this.$index]);
                    $scope.category.list.splice(this.$index, 1);
                    $scope.$emit('validate');
                };
                $scope.addFormField = function () {
                    var field = {
                        id: $scope.formfield,
                        fields: []
                    };
                    var item = $scope.schema.properties[$scope.formfield];
                    if ($scope.formfield === 'geometry') {
                        field.type = 'geometry';
                    } else {
                        field.type = checkType(item);
                    }
                    $scope.category.form.push(field);
                    var i = $scope.formkeys.indexOf($scope.formfield);
                    $scope.formkeys.splice(i, 1);
                    $scope.formfield = null;
                    $scope.$emit('validate');
                };
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
                        } else if (value.config.type === 'tracking' || value.config.type === 'topojson' || value.config.type === 'geojson' || value.config.type === 'database' || value.config.type === 'straks' || value.config.type === 'indberetninger') {
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
                            /*jsonTransformed.pointToLayer = function (feature, latlng) {
                                if (theme.hasOwnProperty(feature.properties.name)) {
                                    var t = theme[feature.properties.name];
                                    switch (t.pointType) {
                                    case 'marker':
                                        return L.marker(latlng);
                                    case 'circle': //radius i meter
                                        return L.circle(latlng, t.style.radius, t.style);
                                    case 'circleMarker': //radius i pixel
                                        return L.circleMarker(latlng, t.style);
                                    }
                                }
                                return L.marker(latlng);
                            };*/
                            if (value.config.type === 'database') {
                                value.data = L.geoJson(null, jsonTransformed);
                                $http.get('/couchdb/db-' + value.config.database + '/_all_docs?include_docs=true').
                                success(function (data, status, headers, config) {
                                    for (var i = 0; i < data.rows.length; i++) {
                                        var doc = data.rows[i].doc;
                                        if (doc._id.substring(0, 7) !== "_design") {
                                            value.data.addData(doc);
                                        }
                                    }
                                    deferred.resolve(value);
                                }).
                                error(function (data, status, headers, config) {
                                    deferred.reject(data);
                                });
                            } else if (value.config.type === 'tracking') {
                                value.data = L.geoJson(null, jsonTransformed);
                                var fundet, i;
                                for (i = 0; i < $scope.configuration.widgets.length; i += 1) {
                                    var item = $scope.configuration.widgets[i]
                                    if (item.id === "tracking") {
                                        fundet = true;
                                        $http.get('/couchdb/db-' + item.database + '/_all_docs?include_docs=true').
                                        success(function (data, status, headers, config) {
                                            for (var i = 0; i < data.rows.length; i++) {
                                                var doc = data.rows[i].doc;
                                                if (doc._id.substring(0, 7) !== "_design") {
                                                    value.data.addData(doc);
                                                }
                                            }
                                            deferred.resolve(value);
                                        }).
                                        error(function (data, status, headers, config) {
                                            deferred.reject(data);
                                        });
                                    }
                                };
                                if (!fundet) {
                                    deferred.reject();
                                }

                            } else if (value.config.type === 'indberetninger') {
                                value.data = L.geoJson(null, jsonTransformed);
                                $http.get('/couchdb/db-' + $scope.database + '/_all_docs?include_docs=true').
                                success(function (data, status, headers, config) {
                                    for (var i = 0; i < data.rows.length; i++) {
                                        var doc = data.rows[i].doc;
                                        if (doc._id.substring(0, 7) !== "_design") {
                                            value.data.addData(doc);
                                        }
                                    }
                                    deferred.resolve(value);
                                }).
                                error(function (data, status, headers, config) {
                                    deferred.reject(data);
                                });
                            } else if (value.config.type === 'geojson') {
                                value.data = L.geoJson(value.config.geojson, jsonTransformed);
                                deferred.resolve(value);
                            } else if (value.config.type === 'topojson') {
                                value.data = omnivore.topojson.parse(value.config.geojson, null, L.geoJson(null, jsonTransformed))
                                deferred.resolve(value);
                            } else if (value.config.type === 'straks') {
                                $http.get('/api/' + $scope.database + '/straks').
                                success(function (data, status, headers, config) {
                                    if (data.hasOwnProperty(value.config.straks)) {
                                        value.data = L.geoJson(data[value.config.straks].geojson, jsonTransformed);
                                        deferred.resolve(value);
                                    } else {
                                        deferred.reject(data);
                                    }
                                }).
                                error(function (data, status, headers, config) {
                                    deferred.reject(data);
                                });
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

                        var baselayer = $scope.category.map.baselayers[index];
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
                    for (var i = 0; i < $scope.category.map.overlays.length; i++) {
                        var overlay = {
                            config: $scope.category.map.overlays[i],
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
                    for (var i = 0; i < $scope.category.map.baselayers.length; i++) {
                        var baselayer = $scope.category.map.baselayers[i];
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

                //region Logo
                $scope.imagesrc = '/couchdb/' + $rootScope.appID + '/' + $scope.configuration._id + '/logo';
                $scope.onFileSelect = function ($files) {
                    $scope.imagesuccess = null;
                    $scope.imageerror = null;
                    if ($files.length > 0) {
                        var file = $files[0];
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(file);
                        fileReader.onload = function (e) {
                            $scope.imagesrc = e.target.result;
                            var image = new Image();
                            $scope.$apply(function () {
                                image.src = e.target.result;
                            });
                            image.onload = function () {
                                // access image size here 
                                console.log(this.width);
                                if (this.width !== 80 && this.height !== 80) {
                                    $scope.$apply(function () {
                                        $scope.imageerror = "Billedet skal være 80x80 pixel";
                                    });
                                } else {
                                    var fileReader2 = new FileReader();
                                    fileReader2.readAsArrayBuffer(file);
                                    fileReader2.onload = function (e) {
                                        $upload.http({
                                            method: 'PUT',
                                            url: '/couchdb/' + $rootScope.appID + '/' + $scope.configuration._id + '/logo?rev=' + $scope.configuration._rev,
                                            headers: {
                                                'Content-Type': file.type
                                            },
                                            data: e.target.result
                                        }).progress(function (evt) {
                                            $scope.dynamic = parseInt(100.0 * evt.loaded / evt.total);
                                        }).success(function (data, status, headers, config) {
                                            $http.get('/couchdb/' + $rootScope.appID + '/' + $scope.configuration._id).
                                            success(function (doc, status, headers, config) {
                                                $scope.configuration._rev = doc._rev;
                                                $scope.configuration._attachments = doc._attachments;
                                                $scope.imagesuccess = data;
                                                $scope.type = 'success';
                                            }).
                                            error(function (data, status, headers, config) {
                                                $scope.imageerror = data;
                                            });



                                        }).error(function (data, status, headers, config) {
                                            $scope.imageerror = data;
                                            $scope.type = 'error';
                                        });
                                    };
                                }
                            };
                        };
                    }
                };
                //endregion
            }
        };
    });
})(this, this.angular, this.console, this.FileReader, this.Image, this.L);