module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('config.json'),
        'couch-compile': {
            "rfs2": {
                files: {
                    'tmp/rfs2.json': ['src/app-d2121ee08caf832b73a160f9ea022ad9']
                }
            }
        },
        'couch-push': {
            "rfs2": {
                options: {
                    user: '<%= config.couchdb.user %>',
                    pass: '<%= config.couchdb.password %>'
                },
                files: {
                    'http://geo.os2geo.dk/couchdb/app-d2121ee08caf832b73a160f9ea022ad9': 'tmp/rfs2.json'
                }
            },
            "rfs2-local": {
                options: {
                    user: '<%= config.local.user %>',
                    pass: '<%= config.local.password %>'
                },
                files: {
                    'http://localhost:5984/app-3495ccf8aafcb1541a0ef7cc2d01178e': 'tmp/rfs2.json'
                }
            },
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-couch');
    grunt.registerTask('default', ['couch-compile:rfs2', 'couch-push:rfs2']);
    grunt.registerTask('local', ['couch-compile:rfs2', 'couch-push:rfs2-local']);
};