(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-sagsbehandler-3', ['$scope', '$rootScope', '$http', '$stateParams', '$state', '$q',
        function ($scope, $rootScope, $http, $stateParams, $state, $q) {
            var form = $rootScope.wizard.template.sagsbehandler.overlay.form;
            var getField = function () {
                for (var i = 0; i < form.length; i++) {
                    var field = form[i];
                    if (field.id === '_attachments') {
                        return field;
                    }
                }
                return null;
            }
            $scope.next = function () {
                var field = getField();
                if (!field) {
                    field = { id: '_attachments', type: 'group' };
                    form.push(field);
                }
                field.fields = [];
                var list = $rootScope.wizard.template.sagsbehandler.overlay.list;
                for (var i = list.length - 1; i >= 0; i--) {
                    if (list[i].indexOf('/_attachments') === 0) {
                        list.splice(i, 1);
                    }
                }
                for (var i = 0; i < $rootScope.wizard.attachments.sagsbehandler.length; i++) {
                    var attachment = $rootScope.wizard.attachments.sagsbehandler[i];
                    if (attachment.form) {
                        field.fields.push({
                            id: attachment.name,
                            readonly: attachment.readonly,
                            type: 'file',
                            fields: []
                        });
                    }
                    if (attachment.list) {
                        list.push('/_attachments/' + attachment.name);
                    }

                }
                $rootScope.wizard.step.sagsbehandler = 4;
                sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                $state.go('wizard.sagsbehandler.4');
            };
            $q.when().then(function () {
                if ($rootScope.wizard.attachments.sagsbehandler.length === 0) {
                    $rootScope.wizard.attachments.sagsbehandler = [];
                    var billeder = {};
                    var field = getField();
                    if (field) {
                        for (var j = 0; j < field.fields.length; j++) {
                            billeder[field.fields[j].id] = field.fields[j].readonly || false;
                        }
                    }
                    for (var i = 0; i < $rootScope.wizard.attachments.borger.length; i++) {
                        var a = $rootScope.wizard.attachments.borger[i];
                        var readonly = false;
                        if (billeder.hasOwnProperty(a.key)) {
                            readonly = billeder[a.key];
                        }
                        $rootScope.wizard.attachments.sagsbehandler.push({
                            form: a.form || false,
                            key: a.key,
                            list: a.list || false,
                            name: a.name,
                            required: a.required || false,
                            title: a.title,
                            readonly: readonly
                        });
                    }
                }

            }).catch(function (err) {
                $scope.error = JSOn.stringify(err);
            });
        }
    ]);
})(this, this.angular, this.console);