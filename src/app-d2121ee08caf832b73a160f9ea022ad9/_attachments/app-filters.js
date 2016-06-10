(function (angular) {
    'use strict';

    /* Filters */

    angular.module('myApp.filters', [])

    .filter('max', function () {
        return function (input, antal) {
            var n = parseInt(antal);
            if (input.hasOwnProperty(antal)) {
                return input[antal];
            }

            var max;
            for (var key in input) {
                if (key !== '$$hashKey') {
                    key = parseInt(key);
                    max = max || key;
                    max = max > key ? max : key;
                }
            }
            if (n > max) {
                return input[max];
            }
            return input[3];
        };
    })

    .filter('bytes', function () {
        return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        };
    });

})(this.angular);