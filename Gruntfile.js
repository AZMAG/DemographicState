module.exports = function(grunt) {

    "use strict";

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        bannercss:  '/*! ========================================================================\n' +
                    ' * Maricopa Association of Governments\n' +
                    ' * CSS files for MAG State Demographic Viewer\n' +
                    ' * @concat.min.css | version | <%= pkg.version %>\n' +
                    ' * Production | <%= pkg.date %>\n' +
                    ' * http://ims.azmag.gov/\n' +
                    ' * State Demographic Viewer\n' +
                    ' * ==========================================================================\n' +
                    ' * Copyright 2017 MAG\n' +
                    ' * Licensed under MIT\n' +
                    ' * ========================================================================== */\n',

        htmlhint: {
            build: {
                options: {
                    "tag-pair": true, // Force tags to have a closing pair
                    "tagname-lowercase": true, // Force tags to be lowercase
                    "attr-lowercase": true, // Force attribute names to be lowercase e.g. <div id="header"> is invalid
                    "attr-value-double-quotes": true, // Force attributes to have double quotes rather than single
                    // "doctype-first": true,           // Force the DOCTYPE declaration to come first in the document
                    "spec-char-escape": true, // Force special characters to be escaped
                    "id-unique": true, // Prevent using the same ID multiple times in a document
                    // "head-script-disabled": false,   // Prevent script tags being loaded in the head for performance reasons
                    "style-disabled": true // Prevent style tags. CSS should be loaded through
                },
                src: ["index.html", "app/views/*.html"]
            }
        },

        // CSSLint. Tests CSS code quality
        // https://github.com/gruntjs/grunt-contrib-csslint
        csslint: {
            // define the files to lint
            files: ["app/resources/css/main.css"],
            strict: {
                options: {
                    "import": 0,
                    "empty-rules": 0,
                    "display-property-grouping": 0,
                    "shorthand": 0,
                    "font-sizes": 0,
                    "zero-units": 0,
                    "important": 0,
                    "duplicate-properties": 0,
                }
            }
        },

        jshint: {
            files: ["config.js", "app/vm/*.js", "app/config/*.js", "app/helpers/*.js", "app/models/*.js", "app/vm/*.js"],
            options: {
                // strict: true,
                sub: true,
                quotmark: "double",
                trailing: true,
                curly: true,
                eqeqeq: true,
                unused: true,
                scripturl: true, // This option defines globals exposed by the Dojo Toolkit.
                dojo: true, // This option defines globals exposed by the jQuery JavaScript library.
                jquery: true, // Set force to true to report JSHint errors but not fail the task.
                force: true,
                reporter: require("jshint-stylish-ex")
            }
        },

        uglify: {
            options: {
                // add banner to top of output file
                banner: '/*! main.js | <%= pkg.name %> - v<%= pkg.version %> | <%= grunt.template.today("mm-dd-yyyy") %> */\n'
            },
            build: {
                files: {
                    // config files
                    "../deploy/build.min/app/config/cbrConfig.js": ["app/config/cbrConfig.js"],
                    "../deploy/build.min/app/config/colorRampConfig.js": ["app/config/colorRampConfig.js"],
                    "../deploy/build.min/app/config/demographicConfig.js": ["app/config/demographicConfig.js"],
                    "../deploy/build.min/app/config/queryBuilderConfig.js": ["app/config/queryBuilderConfig.js"],
                    // models file
                    "../deploy/build.min/app/models/map-model.js": ["app/models/map-model.js"],
                    // vm files
                    "../deploy/build.min/app/vm/alert1-vm.js": ["app/vm/alert1-vm.js"],
                    "../deploy/build.min/app/vm/alert2-vm.js": ["app/vm/alert2-vm.js"],
                    "../deploy/build.min/app/vm/cbrlaunchbar-vm.js": ["app/vm/cbrlaunchbar-vm.js"],
                    "../deploy/build.min/app/vm/cbr-vm.js": ["app/vm/cbr-vm.js"],
                    "../deploy/build.min/app/vm/classificationFactory-vm.js": ["app/vm/classificationFactory-vm.js"],
                    "../deploy/build.min/app/vm/colorRamp-vm.js": ["app/vm/colorRamp-vm.js"],
                    "../deploy/build.min/app/vm/demographic-vm.js": ["app/vm/demographic-vm.js"],
                    "../deploy/build.min/app/vm/email-vm.js": ["app/vm/email-vm.js"],
                    "../deploy/build.min/app/vm/helpLaunchbar-vm.js": ["app/vm/helpLaunchbar-vm.js"],
                    "../deploy/build.min/app/vm/help-vm.js": ["app/vm/help-vm.js"],
                    "../deploy/build.min/app/vm/interactiveTools-vm.js": ["app/vm/interactiveTools-vm.js"],
                    "../deploy/build.min/app/vm/legendLaunchbar-vm.js": ["app/vm/legendLaunchbar-vm.js"],
                    "../deploy/build.min/app/vm/legend-vm.js": ["app/vm/legend-vm.js"],
                    "../deploy/build.min/app/vm/panelLaunchbar-vm.js": ["app/vm/panelLaunchbar-vm.js"],
                    "../deploy/build.min/app/vm/panel-vm.js": ["app/vm/panel-vm.js"],
                    "../deploy/build.min/app/vm/printLaunchbar-vm.js": ["app/vm/printLaunchbar-vm.js"],
                    "../deploy/build.min/app/vm/print-vm.js": ["app/vm/print-vm.js"],
                    "../deploy/build.min/app/vm/queryBuilderTwo-vm.js": ["app/vm/queryBuilderTwo-vm.js"],
                    "../deploy/build.min/app/vm/socialLaunchbar-vm.js": ["app/vm/socialLaunchbar-vm.js"],
                    "../deploy/build.min/app/vm/social-vm.js": ["app/vm/social-vm.js"],
                    "../deploy/build.min/app/vm/window-vm.js": ["app/vm/window-vm.js"]
                }
            }
        },

        cssmin: {
            add_banner: {
                options: {
                    // add banner to top of output file
                    banner: '/* <%= pkg.name %> - v<%= pkg.version %> | <%= grunt.template.today("mm-dd-yyyy") %> */'
                },
                files: {
                    "app/resources/css/main.min.css": ["app/resources/css/main.css"],
                    "app/resources/css/normalize.min.css": ["app/resources/css/normalize.css"]
                }
            }
        },

        concat: {
            options: {
                stripBanners: true,
                banner: '<%= bannercss %>\n'
            },
            dist: {
                src: ["app/resources/css/normalize.min.css", "app/resources/css/main.min.css"],
                dest: "app/resources/css/concat.min.css"
            }
        },

        watch: {
            html: {
                files: ["index.html"],
                tasks: ["htmlhint"]
            },
            css: {
                files: ["app/resources/css/main.css"],
                tasks: ["csslint"]
            },
            js: {
                files: ["config.js", "app/vm/*.js", "app/config/*.js", "app/helpers/*.js", "app/models/*.js", "app/vm/*.js"],
                tasks: ["jshint"]
            }
        },

        versioncheck: {
            options: {
                skip: ["semver", "npm", "lodash"],
                hideUpToDate: false
            }
        },

        replace: {
            update_Meta: {
                src: ["index.html", "config.js", "humans.txt", "README.md", "app/resources/css/main.css"], // source files array
                // src: ["README.md"], // source files array
                overwrite: true, // overwrite matched source files
                replacements: [{
                    // html pages
                    from: /(<meta name="revision-date" content=")[0-9]{2}\/[0-9]{2}\/[0-9]{4}(">)/g,
                    to: '<meta name="revision-date" content="' + '<%= pkg.date %>' + '">',
                }, {
                    // html pages
                    from: /(<meta name="version" content=")([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))(">)/g,
                    to: '<meta name="version" content="' + '<%= pkg.version %>' + '">',
                }, {
                    // config.js
                    from: /(v)([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))( \| )[0-9]{2}\/[0-9]{2}\/[0-9]{4}/g,
                    to: 'v' + '<%= pkg.version %>' + ' | ' + '<%= pkg.date %>',
                }, {
                    // humans.txt
                    from: /(Version\: v)([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/g,
                    to: "Version: v" + '<%= pkg.version %>',
                }, {
                    // humans.txt
                    from: /(Last updated\: )[0-9]{2}\/[0-9]{2}\/[0-9]{4}/g,
                    to: "Last updated: " + '<%= pkg.date %>',
                }, {
                    // README.md
                    from: /(### `version )([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/g,
                    to: "#### `version " + '<%= pkg.version %>',
                }, {
                    // README.md
                    from: /(`Updated: )[0-9]{2}\/[0-9]{2}\/[0-9]{4}/g,
                    to: "`Updated: " + '<%= pkg.date %>',
                }, {
                    // main.css
                    from: /(main.css)( \| )(version)( \| )([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/g,
                    to: "main.css | version |" +' <%= pkg.version %>',
                }]
            }
        }


    });

    // this would be run by typing "grunt test" on the command line
    // grunt.registerTask("test", ["uglify", "cssmin", "concat"]);

    grunt.registerTask("test", ["cssmin", "concat", "uglify"]);

     grunt.registerTask("check", ["versioncheck"]);

    grunt.registerTask("buildcss", ["cssmin", "concat"]);

    grunt.registerTask("work", ["jshint"]);

    grunt.registerTask("update", ["replace"]);

    grunt.registerTask("build", ["replace", "cssmin", "concat"]);

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask("default", []);

};

// ref
// http://coding.smashingmagazine.com/2013/10/29/get-up-running-grunt/
// http://csslint.net/about.html
// http://www.jshint.com/docs/options/