(function (window, angular, console) {
    'use strict';
    angular.module('myApp.controllers').controller('wizard-afslut', ['$scope', '$rootScope', '$http', '$stateParams', '$state', '$upload', '$q',
        function ($scope, $rootScope, $http, $stateParams, $state, $upload, $q) {
            var opretInfo = function (name, description, image, imageType) {
                var doc = {
                    name: name,
                    description: description,
                    hidden: true
                }
                var res;
                return $http.post('/couchdb/' + $rootScope.appID + '-' + $stateParams.organization, doc).then(function (data) {
                    res = data.data;
                    return $q.when(blobUtil.dataURLToBlob(image));
                }).then(function (blob) {
                    return $q.when(blobUtil.blobToArrayBuffer(blob));
                }).then(function (arrayBuff) {
                    return $upload.http({
                        method: 'PUT',
                        url: '/couchdb/' + $rootScope.appID + '-' + $stateParams.organization + '/' + res.id + '/logo?rev=' + res.rev,
                        headers: {
                            'Content-Type': imageType
                        },
                        data: arrayBuff
                    }).progress(function (evt) {
                        $scope.dynamic = parseInt(100.0 * evt.loaded / evt.total);
                    });
                });
            };
            var opretBorger = function (id, database) {
                var config = $rootScope.wizard.template.borger.configuration;
                var doc = {
                    "_id": id,
                    widgets: config.widgets,
                    map: {
                        baselayers: [],
                        overlays: []
                    },
                    type: "configuration",
                    organization: $stateParams.organization,
                    security: []
                };
                for (var i = 0; i < $rootScope.wizard.overlays.borger.length; i++) {
                    var item = $rootScope.wizard.overlays.borger[i];
                    item.overlay.name = item.name;
                    if (item.overlay.id === $rootScope.wizard.template.borger.overlay.id) {
                        item.overlay = $rootScope.wizard.template.borger.overlay;
                        item.overlay.database = database;
                        $rootScope.wizard.test.borgeroverlay = item.overlay.id;
                    }
                    doc.map.overlays.push(item.overlay);
                }
                for (var i = 0; i < $rootScope.wizard.baselayers.borger.length; i++) {
                    var item = $rootScope.wizard.baselayers.borger[i];
                    item.overlay.name = item.name;
                    doc.map.baselayers.push(item.overlay);
                }
                return $http.put('/api/rfsconfig/' + $rootScope.appID + '/' + id, doc)
            };
            var opretSagsbehandler = function (id, database) {
                var config = $rootScope.wizard.template.sagsbehandler.configuration;
                var doc = {
                    "_id": id,
                    widgets: config.widgets,
                    map: {
                        baselayers: [],
                        overlays: []
                    },
                    type: "configuration",
                    organization: $stateParams.organization,
                    security: $rootScope.wizard.template.sagsbehandler.configuration.security
                };
                for (var i = 0; i < $rootScope.wizard.overlays.sagsbehandler.length; i++) {
                    var item = $rootScope.wizard.overlays.sagsbehandler[i];
                    item.overlay.name = item.name;
                    if (item.overlay.id === $rootScope.wizard.template.sagsbehandler.overlay.id) {
                        item.overlay = $rootScope.wizard.template.sagsbehandler.overlay;
                        item.overlay.database = database;
                        $rootScope.wizard.test.sagsbehandleroverlay = item.overlay.id;
                    }
                    doc.map.overlays.push(item.overlay);
                }
                for (var i = 0; i < $rootScope.wizard.baselayers.sagsbehandler.length; i++) {
                    var item = $rootScope.wizard.baselayers.sagsbehandler[i];
                    item.overlay.name = item.name;
                    doc.map.baselayers.push(item.overlay);
                }
                return $http.put('/api/rfsconfig/' + $rootScope.appID + '/' + id, doc)
            };
            var opretDatabase = function () {
                return $http.post('/api/database', {
                    name: $rootScope.wizard.template.borger.name,
                    organization: $stateParams.organization
                });
            }
            var opretStraks = function () {
                if ($rootScope.wizard.straks) {
                    return $http.put('/api/' + $rootScope.wizard.test.database + '/straks', {
                        straks: $rootScope.wizard.straks
                    });
                }
                return;
            };
            var opretSchema = function (id) {
                return $http.put('/api/database/' + id + '/schema', {
                    schema: $rootScope.wizard.schema
                });
            }
            var opretEmailTemplate = function (database, name) {
                return $http.post('/api/' + database + '/emailtemplate', { name: name, action: 'create' });
            };
            var getDescription = function (description) {
                var html = '';
                var p = description.split('\n');
                for (var i = 0; i < p.length; i++) {
                    html += '<p>' + p[i] + '</p>\n';
                }
                return html;
            };
            var getSender = function (sender) {
                var html = '';
                var p = sender.split('\n');
                for (var i = 0; i < p.length; i++) {
                    html += p[i] + '<br/>\n';
                }
                return html;
            };
            var getRows = function (fields, attachments) {
                var html = '';
                var i;
                for (i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    var title = field.title || field.name;
                    if (i & 1)
                        html += '<tr class="odd">';
                    else
                        html += '<tr class="even">';
                    html += '<td>' + title + '</td><td><%= doc.properties.' + field.name + ' %></td></tr>\n'
                }
                if (i > 0) {
                    i--;
                }
                for (var j = 0; j < attachments.length; j++) {
                    var field = attachments[j];
                    var title = field.title || field.name;
                    if ((i + j) & 1)
                        html += '<tr class="even">';
                    else
                        html += '<tr class="odd">';
                    html += '<td>' + title + '</td><td><a href="http://<%= env.os2geo %>/couchdb/db-' + $rootScope.wizard.test.database + '/<%= doc._id %>/' + field.name + '"><img src="http://<%= env.os2geo %>/couchdb/db-' + $rootScope.wizard.test.database + '/<%= doc._id %>/tn_' + field.name + '"/></a></td></tr>\n'
                }
                return html;
            };
            var text = function (email, fields) {
                var s = email.name + '\n';
                s += email.description + '\n';
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    var title = field.title || field.name;
                    s += title + ' <%= doc.properties.' + field.name + ' %>\n';
                }
                s += email.sender;
                return s;
            }
            var html = function (email, id, overlay, fields, attachments) {
                return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta name="viewport" content="width=device-width" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>`+ email.name + `</title>
</head>
<body itemscope itemtype="http://schema.org/EmailMessage">
<table class="body-wrap">
    <tr>
        <td></td>
        <td class="container" width="600">
            <div class="content">
                <table class="main" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="aligncenter header-content">
                            `+ email.name + `
                        </td>
                    </tr>
                    <tr>
                        <td class="aligncenter">
                            <img src="https://<%= env.os2geo %>/couchdb/`+ $rootScope.appID + '-' + $stateParams.organization + '/' + $rootScope.wizard.test.borger + `/logo" class="logo"/>
                        </td>
                    </tr>
                    <tr>
                        <td class="aligncenter large">
                            `+ $rootScope.wizard.template.borger.name + `
                        </td>
                    </tr>
                    <tr>
                        <td class="content-wrap">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td class="content-block">
                                    `+ getDescription(email.description) + `
                                    </td>
                                </tr>
                                <tr>
                                    <td class="content-block">
                                        <table class="form" width="100%" cellpadding="0" cellspacing="0">
                                            `+ getRows(fields, attachments) + `
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="aligncenter content-block">
                                        <a href="https://<%= env.rfs %>/#/menu/organizations/`+ $stateParams.organization + '/' + id + '?layer=' + overlay + `&id=<%= doc._id %>" class="btn-primary">Vis indberetning</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="content-block">
                                        `+ getSender(email.sender) + `
                                        <img src="https://<%= env.os2geo %>/couchdb/`+ $rootScope.appID + '/' + $stateParams.organization + `/logo" />
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <div class="footer">
                    <table width="100%">
                        <tr>
                            <td class="aligncenter content-block"><a href="https://<%= env.rfs %>">RapportFraStedet</a></td>
                        </tr>
                    </table>
                </div>
            </div>
        </td>
        <td></td>
    </tr>
</table>
</body>
</html>`;
            };
            var css = function () {
                return `/* -------------------------------------
    GLOBAL
    A very basic CSS reset
------------------------------------- */
* {
  margin: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  box-sizing: border-box;
  font-size: 14px;
}

img {
  max-width: 100%;
}

body {
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: none;
  width: 100% !important;
  height: 100%;
  line-height: 1.6em;
  /* 1.6em * 14px = 22.4px, use px to get airier line-height also in Thunderbird, and Yahoo!, Outlook.com, AOL webmail clients */
  /*line-height: 22px;*/
}

/* Let's make sure all tables have defaults */
table td {
  vertical-align: top;
}

/* -------------------------------------
    BODY & CONTAINER
------------------------------------- */
body {
  background-color: #f6f6f6;
}

.body-wrap {
  background-color: #f6f6f6;
  width: 100%;
}

.container {
  display: block !important;
  max-width: 600px !important;
  margin: 0 auto !important;
  /* makes it centered */
  clear: both !important;
}

.content {
  max-width: 600px;
  margin: 0 auto;
  display: block;
  padding: 20px;
}

/* -------------------------------------
    HEADER, FOOTER, MAIN
------------------------------------- */
.main {
  background-color: #fff;
  border: 1px solid #e9e9e9;
  border-radius: 3px;
}

.content-wrap {
  padding: 20px;
}

.content-block {
  padding: 0 0 20px;
}

.header {
  width: 100%;
    background-color: #2196F3;
    color:#fff;
}

.footer {
  width: 100%;
  clear: both;
  color: #999;
  padding: 20px;
}
.footer p, .footer a, .footer td {
  color: #999;
  font-size: 12px;
}

/* -------------------------------------
    TYPOGRAPHY
------------------------------------- */
h1, h2, h3 {
  font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
  color: #000;
  margin: 40px 0 0;
  line-height: 1.2em;
  font-weight: 400;
}

h1 {
  font-size: 32px;
  font-weight: 500;
  /* 1.2em * 32px = 38.4px, use px to get airier line-height also in Thunderbird, and Yahoo!, Outlook.com, AOL webmail clients */
  /*line-height: 38px;*/
}

h2 {
  font-size: 24px;
  /* 1.2em * 24px = 28.8px, use px to get airier line-height also in Thunderbird, and Yahoo!, Outlook.com, AOL webmail clients */
  /*line-height: 29px;*/
}

h3 {
  font-size: 18px;
  /* 1.2em * 18px = 21.6px, use px to get airier line-height also in Thunderbird, and Yahoo!, Outlook.com, AOL webmail clients */
  /*line-height: 22px;*/
}

h4 {
  font-size: 14px;
  font-weight: 600;
}

p, ul, ol {
  margin-bottom: 10px;
  font-weight: normal;
}
p li, ul li, ol li {
  margin-left: 5px;
  list-style-position: inside;
}

/* -------------------------------------
    LINKS & BUTTONS
------------------------------------- */
a {
  color: #348eda;
  text-decoration: underline;
}

.btn-primary {
  text-decoration: none;
  color: #FFF;
  background-color: #FF9800;
  border: solid #FF9800;
  border-width: 10px 20px;
  line-height: 2em;
  /* 2em * 14px = 28px, use px to get airier line-height also in Thunderbird, and Yahoo!, Outlook.com, AOL webmail clients */
  /*line-height: 28px;*/
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  display: inline-block;
  border-radius: 5px;
  text-transform: capitalize;
}

/* -------------------------------------
    OTHER STYLES THAT MIGHT BE USEFUL
------------------------------------- */
.last {
  margin-bottom: 0;
}

.first {
  margin-top: 0;
}

.aligncenter {
  text-align: center;
}

.alignright {
  text-align: right;
}

.alignleft {
  text-align: left;
}
.alignmiddle {
     vertical-align: middle;
}
.clear {
  clear: both;
}

/* -------------------------------------
    ALERTS
    Change the class depending on warning email, good email or bad email
------------------------------------- */
.alert {
  font-size: 16px;
  color: #fff;
  font-weight: 500;
  padding: 20px;
  text-align: center;
  border-radius: 3px 3px 0 0;
}
.alert a {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
}
.alert.alert-warning {
  background-color: #FF9F00;
}
.alert.alert-bad {
  background-color: #D0021B;
}
.alert.alert-good {
  background-color: #68B90F;
}

/* -------------------------------------
    FORM
    Styles for the form table
------------------------------------- */
.form {
    margin
}
.form td {
  padding: 10px;
    border: 1px solid #fff;
}
.odd {
    /*background-color: #E3F2FD;*/
    background-color: #90CAF9;
}
.even {

    background-color: #BBDEFB;
}
.form .invoice-items {
  width: 100%;
}
.invoice .invoice-items td {
  border-top: #eee 1px solid;
}
.invoice .invoice-items .total td {
  border-top: 2px solid #333;
  border-bottom: 2px solid #333;
  font-weight: 700;
}

/* -------------------------------------
    RESPONSIVE AND MOBILE FRIENDLY STYLES
------------------------------------- */
@media only screen and (max-width: 640px) {
  body {
    padding: 0 !important;
  }

  h1, h2, h3, h4 {
    font-weight: 800 !important;
    margin: 20px 0 5px !important;
  }

  h1 {
    font-size: 22px !important;
  }

  h2 {
    font-size: 18px !important;
  }

  h3 {
    font-size: 16px !important;
  }

  .container {
    padding: 0 !important;
    width: 100% !important;
  }

  .content {
    padding: 0 !important;
  }

  .content-wrap {
    padding: 10px !important;
  }

  .invoice {
    width: 100% !important;
  }
}

/*# sourceMappingURL=styles.css.map */

.header-content {
    vertical-align: middle;
    padding: 20px;
    font-size: 24px;
    background-color: #2196F3;
    color:#fff;
}

.logo {
    border-radius: 40px;
    margin:20px;
}

.large {
    font-size: 32px;
    font-weight: bold;
    color: #666;
}
`;
            };
            var opdaterEmailTemplate = function (data) {
                var doc = {
                    _id: data.id,
                    _rev: data.rev,
                    name: $rootScope.wizard.email.borger.name,
                    action: 'create',
                    html: html($rootScope.wizard.email.borger, $rootScope.wizard.test.borger, $rootScope.wizard.test.borgeroverlay, $rootScope.wizard.fields.borger, $rootScope.wizard.attachments.borger),
                    text: text($rootScope.wizard.email.borger, $rootScope.wizard.fields.borger),
                    css: css(),
                    type: 'emailtemplate',
                    database: $rootScope.wizard.test.database,
                    userfields: {}
                };
                var rules = {};
                if ($rootScope.wizard.email.borger.receipt)
                    rules['/properties/' + $rootScope.wizard.email.borger.receipt.name] = true;
                doc.userfields['/properties/' + $rootScope.wizard.email.borger.email.name] = { rules: rules };
                return $http.put('/api/emailtemplate', doc);
            };
            var opdaterEmailTemplateSagsbehandler = function (data) {
                var users = {};
                for (var key in $rootScope.wizard.email.sagsbehandler.users) {
                    var user = $rootScope.wizard.email.sagsbehandler.users[key];
                    var rules = {};
                    for (var r in user.rules) {
                        rules['/properties/' + r] = user.rules[r];
                    }
                    users[key] = { rules: rules };
                }
                var doc = {
                    _id: data.id,
                    _rev: data.rev,
                    name: $rootScope.wizard.email.sagsbehandler.name,
                    action: 'create',
                    html: html($rootScope.wizard.email.sagsbehandler, $rootScope.wizard.test.sagsbehandler, $rootScope.wizard.test.sagsbehandleroverlay, $rootScope.wizard.fields.sagsbehandler, $rootScope.wizard.attachments.sagsbehandler),
                    text: text($rootScope.wizard.email.sagsbehandler, $rootScope.wizard.fields.sagsbehandler),
                    css: css(),
                    type: 'emailtemplate',
                    database: $rootScope.wizard.test.database,
                    users: users
                };
                return $http.put('/api/emailtemplate', doc);
            };
            $scope.next = function () {
                $scope.opret = true;
                $scope.database = false;
                $scope.schema = false;
                $scope.straks = false;
                $scope.borger1 = false;
                $scope.borger2 = false;
                $scope.borgeremail1 = false;
                $scope.borgeremail2 = false;
                $scope.sagsbehandler1 = false;
                $scope.sagsbehandler2 = false;
                $scope.sagsbehandleremail1 = false;
                $scope.sagsbehandleremail2 = false;
                $rootScope.wizard.test = {};
                opretDatabase().then(function (data) {
                    console.log('database');
                    $scope.database = true;
                    $rootScope.wizard.test.database = data.data.id;
                    return opretSchema(data.data.id);
                }).then(function (data) {
                    console.log('schema');
                    $scope.schema = true;
                    return opretStraks();
                }).then(function (data) {
                    console.log('straks');
                    $scope.straks = true;
                    return opretInfo($rootScope.wizard.template.borger.name, $rootScope.wizard.template.borger.description, $rootScope.wizard.template.borger.image, $rootScope.wizard.template.borger.imageType);
                }).then(function (data) {
                    console.log('borger1');
                    $scope.borger1 = true;
                    $rootScope.wizard.test.borger = data.data.id;
                    return opretBorger(data.data.id, $rootScope.wizard.test.database);
                }).then(function (data) {
                    console.log('borger2');
                    $scope.borger2 = true;
                    if ($rootScope.wizard.email.borger.send) {
                        return opretEmailTemplate($rootScope.wizard.test.database, $rootScope.wizard.email.borger.name);
                    }
                    return;
                }).then(function (data) {
                    console.log('borgeremail1');
                    $scope.borgeremail1 = true;
                    if (data) {
                        return opdaterEmailTemplate(data.data);
                    }
                    return;
                }).then(function (data) {
                    console.log('borgeremail2');
                    $scope.borgeremail2 = true;
                    if ($rootScope.wizard.template.sagsbehandler) {
                        return opretInfo($rootScope.wizard.template.sagsbehandler.name, $rootScope.wizard.template.sagsbehandler.description, $rootScope.wizard.template.sagsbehandler.image, $rootScope.wizard.template.sagsbehandler.imageType).then(function (data) {
                            console.log('sagsbehandler1');
                            $scope.sagsbehandler1 = true;
                            $rootScope.wizard.test.sagsbehandler = data.data.id;
                            return opretSagsbehandler(data.data.id, $rootScope.wizard.test.database);
                        }).then(function (data) {
                            console.log('sagsbehandler2');
                            $scope.sagsbehandler2 = true;
                            if ($rootScope.wizard.email.sagsbehandler.send) {
                                return opretEmailTemplate($rootScope.wizard.test.database, $rootScope.wizard.email.sagsbehandler.name);
                            }
                            return;
                        }).then(function (data) {
                            console.log('sagsbehandleremail1');
                            $scope.sagsbehandleremail1 = true;
                            if (data) {
                                return opdaterEmailTemplateSagsbehandler(data.data);
                            }
                            return;
                        });
                    }
                    return;
                }).then(function (data) {
                    console.log('sagsbehandleremail2');
                    $scope.sagsbehandleremail2 = true;
                    $rootScope.wizard.step.afslut = 1;
                    sessionStorage.setItem('wizard', JSON.stringify($rootScope.wizard));
                    $state.go('wizard.test');
                }).catch(function (error) {
                    console.log(error)
                    $scope.error = error;
                });
            }
            console.log($rootScope.wizard);
        }
    ]);
})(this, this.angular, this.console);