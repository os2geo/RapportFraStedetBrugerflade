(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('config-info', ['$scope', '$rootScope', '$http', '$stateParams', '$upload',
        function ($scope, $rootScope, $http, $stateParams, $upload) {
            var file;
            $scope.onFileSelect = function ($files) {
                file = null;
                $scope.imageerror = null;
                if ($files.length > 0) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL($files[0]);
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
                                file = $files[0];
                            }
                        };


                    };
                }
            };
            $scope.submit = function (form) {
                $scope.success = null;
                $scope.error = null;
                $scope.type = 'info';
                if (form.$valid && !$scope.imageerror) {
                    $http.put('/couchdb/' + $rootScope.appID + '-' + $stateParams.organization+'/'+$scope.configuration._id, $scope.configuration).
                    success(function (data, status, headers, config) {
                        $scope.configuration._rev = data.rev;
                        $scope.success = data;
                        if (file) {
                            var fileReader = new FileReader();
                            fileReader.readAsArrayBuffer(file);
                            fileReader.onload = function (e) {
                                $upload.http({
                                    method: 'PUT',
                                    url: '/couchdb/' + $rootScope.appID + '-' + $stateParams.organization + '/' + data.id + '/logo?rev=' + data.rev,
                                    headers: {
                                        'Content-Type': file.type
                                    },
                                    data: e.target.result
                                }).progress(function (evt) {
                                    $scope.dynamic = parseInt(100.0 * evt.loaded / evt.total);
                                }).success(function (data, status, headers, config) {
                                    $scope.configuration._rev = data.rev;
                                    $scope.success = data;
                                    $scope.type = 'success';
                                }).error(function (data, status, headers, config) {
                                    $scope.error = data;
                                    $scope.type = 'error';
                                });
                            };
                        }
                    }).
                    error(function (data, status, headers, config) {
                        $scope.error = data;
                    });


                }
            };
        }]);
})(this, this.angular, this.console);