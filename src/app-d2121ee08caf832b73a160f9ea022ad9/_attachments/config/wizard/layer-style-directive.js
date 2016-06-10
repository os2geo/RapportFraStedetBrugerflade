(function (window, angular, console) {
    'use strict';
    /* Directives */
    angular.module('myApp.directives')

        .directive("layerStyle", function ($compile, $http, $modal) {
            return {
                restrict: "E",
                scope: {
                    layerStyle: '=',
                    layer: '=',
                    schema: '='
                },
                templateUrl: 'config/wizard/layer-style.html',
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
                            $scope.layer.styles.splice($scope.$parent.$parent.$parent.$index, 1);
                            $scope.$emit('validate');
                            event.preventDefault();
                        }
                    });
                    $scope.layerStyle.displayAs = $scope.layerStyle.displayAs || "Point";
                    $scope.lineJoinOptions = ["miter", "round", "bevel", "inherit"];
                    $scope.lineCapOptions = ["butt", "round", "square", "inherit"];
                    $scope.pointTypeOptions = ["marker", "circle", "circleMarker", "maki"];
                    $scope.makiSizeOptions = ["s", "m", "l"];
                    var modalInstance;
                    
                    $scope.makiHelp = function () {
                        $scope.maki = $scope.layerStyle.style.icon;
                        $http.get('maki.json').then(function (res) {
                            $scope.icons = res.data;

                            modalInstance = $modal.open({
                                templateUrl: 'config/wizard/maki-modal.html',
                                scope: $scope,
                                //controller: 'ModalInstanceCtrl',
                                //size: size,
                                resolve: {
                                    items: function () {
                                        return $scope.items;
                                    }
                                }
                            });
                        });
                    }
                    $scope.ok = function () {
                        modalInstance.close();
                        $scope.layerStyle.style.icon = $scope.maki;
                    };
                    $scope.cancel = function () {
                        modalInstance.close();
                    };
                    $scope.makiSelect = function(item){
                        $scope.maki=item.icon;
                    }
                }
            };
        });
})(this, this.angular, this.console);