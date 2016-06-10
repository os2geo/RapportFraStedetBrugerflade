(function (window, angular, console) {

    'use strict';

    /* Services */


    // Demonstrate how to register services
    // In this case it is a simple value service.
    angular.module('myApp.services', [])

    .factory('kfticket', ['$q', '$http', '$rootScope', '$browser',
        function ($q, $http, $rootScope, $browser) {
            return {
                getTicket: function () {
                    var deferred = $q.defer();
                    var cookies = $browser.cookies();
                    if (cookies.kfticket) {
                        window.setTimeout(function () {
                            deferred.resolve(cookies.kfticket);
                        }, 0);
                    } else {
                        $http.get("/api/kfticket").
                        success(function (data, status, headers, config) {
                            cookies = $browser.cookies();
                            deferred.resolve(cookies.kfticket);
                        }).
                        error(function (data, status, headers, config) {
                            deferred.reject();
                        });
                    }
                    return deferred.promise;
                }
            };
        }
    ]);


})(this, this.angular, this.console);