module.exports = function (grunt) {

    "use strict";

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        bannercss: "/*! ========================================================================\n" +
            " * Maricopa Association of Governments\n" +
            " * CSS files for MAG State Demographic Viewer\n" +
            " * @concat.min.css | @version | <%= pkg.version %>\n" +
            " * Production | <%= pkg.date %>\n" +
            " * http://ims.azmag.gov/\n" +
            " * State Demographic Viewer\n" +
            " * ==========================================================================\n" +
            " * @Copyright <%= pkg.copyright %> MAG\n" +
            " * @License MIT\n" +
            " * ========================================================================== */\n",

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
            options: {
                jshintrc: true,
                reporter: require("jshint-stylish-ex")
            },
            src: ["Gruntfile.js", "src/app/js/*.js", "src/app/js/config/*.js", "src/app/js/maps/*.js", "src/app/js/reports/*.js", "src/app/js/widgets/*.js"],
        },

        babel: {
            options: {
                sourceMaps: false,
                presets: ["@babel/preset-env"]
            },
            dist0: {
                files: [{
                    expand: true,
                    cwd: "src/app/js/",
                    src: ["*.js"],
                    dest: "dist/app/js/"
                }]
            },
            dist1: {
                files: [{
                    expand: true,
                    cwd: "src/app/js/widgets",
                    src: ["*.js"],
                    dest: "dist/app/js/widgets"
                }]
            },
            dist2: {
                files: [{
                    expand: true,
                    cwd: "src/app/js/reports",
                    src: ["*.js"],
                    dest: "dist/app/js/reports"
                }]
            },
            dist3: {
                files: [{
                    expand: true,
                    cwd: "src/app/js/maps",
                    src: ["*.js"],
                    dest: "dist/app/js/maps"
                }]
            },
            dist4: {
                files: [{
                    expand: true,
                    cwd: "src/app/js/config",
                    src: ["*.js"],
                    dest: "dist/app/js/config"
                }]
            }
        },

        uglify: {
            options: {
                preserveComments: "true",
                mangle: false
            },
            target0: {
                files: [{
                    expand: true,
                    cwd: "dist/app/js",
                    src: ["*.js"],
                    dest: "dist/app/js"
                }]
            },
            target1: {
                files: [{
                    expand: true,
                    cwd: "dist/app/js/widgets",
                    src: ["*.js"],
                    dest: "dist/app/js/widgets"
                }]
            },
            target2: {
                files: [{
                    expand: true,
                    cwd: "dist/app/js/reports",
                    src: ["*.js"],
                    dest: "dist/app/js/reports"
                }]
            },
            target3: {
                files: [{
                    expand: true,
                    cwd: "dist/app/js/maps",
                    src: ["*.js"],
                    dest: "dist/app/js/maps"
                }]
            },
            target4: {
                files: [{
                    expand: true,
                    cwd: "dist/app/js/config",
                    src: ["*.js"],
                    dest: "dist/app/js/config"
                }]
            }
        },

        htmlmin: {
            htmlmin1: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "dist/index.html": "dist/index.html",
                }
            },
            htmlmin2: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: "dist/app/views",
                    src: ["*.html"],
                    dest: "dist/app/views"
                }]
            }
        },

        cssmin: {
            add_banner: {
                options: {
                    // add banner to top of output file
                    banner: '/* <%= pkg.name %> - v<%= pkg.version %> | <%= grunt.template.today("mm-dd-yyyy") %> */'
                },
                files: {
                    "dist/app/css/normalize.min.css": ["src/app/css/normalize.css"],
                    "dist/app/css/main.min.css": ["src/app/css/main.css"]
                }
            }
        },

        concat: {
            options: {
                stripBanners: true,
                banner: "<%= bannercss %>\n"
            },
            dist: {
                src: ["dist/app/css/normalize.min.css", "dist/app/css/main.min.css"],
                dest: "dist/app/css/concat.min.css"
            }
        },

        clean: {
            build: {
                src: ["dist/"]
            },
            cleanjs: {
                src: ["dist/js/*.js", "!dist/js/master.min.js"]
            },
            cleancss: {
                src: ["dist/app/css/*.css", "!dist/app/css/concat.min.css"]
            }
        },

        copy: {
            build: {
                cwd: "src/",
                src: ["**"],
                dest: "dist/",
                expand: true
            }
        },

        toggleComments: {
            customOptions: {
                options: {
                    removeCommands: false
                },
                files: {
                    "dist/index.html": "dist/index.html",
                    "dist/app/vm/cbr-vm.js": "dist/app/vm/cbr-vm.js",
                    "dist/app/vm/colorRamp-vm.js": "dist/app/vm/colorRamp-vm.js",
                    "dist/app/vm/contact-vm.js": "dist/app/vm/contact-vm.js",
                    "dist/app/vm/help-vm.js": "dist/app/vm/help-vm.js",
                    "dist/app/vm/interactiveTools-vm.js": "dist/app/vm/interactiveTools-vm.js",
                    "dist/app/vm/legend-vm.js": "dist/app/vm/legend-vm.js",
                    "dist/app/vm/mapContainer-vm.js": "dist/app/vm/mapContainer-vm.js",
                    "dist/app/vm/markupTools-vm.js": "dist/app/vm/markupTools-vm.js",
                    "dist/app/vm/panel-vm.js": "dist/app/vm/panel-vm.js",
                    "dist/app/vm/print-vm.js": "dist/app/vm/print-vm.js",
                    "dist/app/vm/queryBuilder-vm.js": "dist/app/vm/queryBuilder-vm.js",
                    "dist/app/vm/social-vm.js": "dist/app/vm/social-vm.js"
                }
            }
        },

        replace: {
            update_Meta: {
                src: ["src/index.html", "src/humans.txt", "README.md", "LICENSE", "src/LICENSE", "src/app/css/main.css", "src/app/js/config/config.js"],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    // html pages
                    from: /(<meta name="revision-date" content=")[0-9]{4}-[0-9]{2}-[0-9]{2}/g,
                    to: '<meta name="revision-date" content="' + "<%= pkg.date %>",
                }, {
                    // html pages
                    from: /(<meta name="version" content=")([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/g,
                    to: '<meta name="version" content="' + "<%= pkg.version %>",
                }, {
                    // config.js
                    from: /(v)([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))( \| )[0-9]{4}-[0-9]{2}-[0-9]{2}/g,
                    to: "v" + "<%= pkg.version %>" + " | " + "<%= pkg.date %>",
                }, {
                    // config.js
                    from: /(copyright\: ')([0-9]{4})(')/g,
                    to: "copyright: '" + "<%= pkg.copyright %>" + "'",
                }, {
                    // humans.txt
                    from: /(Version\: )([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/g,
                    to: "Version: " + "<%= pkg.version %>",
                }, {
                    // humans.txt
                    from: /(Last updated\: )[0-9]{4}-[0-9]{2}-[0-9]{2}/g,
                    to: "Last updated: " + "<%= pkg.date %>",
                }, {
                    // README.md
                    from: /(### version \| )([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/g,
                    to: "### version | " + "<%= pkg.version %>",
                }, {
                    // README.md
                    from: /(Updated \| )[0-9]{4}-[0-9]{2}-[0-9]{2}/g,
                    to: "Updated \| " + "<%= pkg.date %>",
                }, {
                    // main.css - /*! main.css v8.0.1 | MIT License | github.com/AZMAG/map-Demographic-Statewide */
                    from: /(\/\*! main.css v)([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/g,
                    to: "/*! main.css v" + "<%= pkg.version %>",
                }, {
                    // LICENSE
                    from: /(Copyright \(c\) )([0-9]{4})/g,
                    to: "Copyright (c) " + "<%= pkg.copyright %>",
                }]
            }
        }


    });

    grunt.registerTask("GetClassBreaks", function () {
        require("./src/app/vendor/js/generateClassBreaks.js")(grunt, this.async, {
            inputLocation: "./src/app/js/config/cbrConfig.json",
            geoStatsPath: "Z:\\Viewers\\Demographics\\src\\app\\vendor\\js\\geoStats.min.js",
            mainUrl: "https://geo.azmag.gov/gismag/rest/services/maps/DemographicState2017/MapServer",
            outputLocation: "./src/app/js/config/cbrConfig.json"
        });
    });


    // this would be run by typing "grunt test" on the command line
    // grunt.registerTask("test", ["uglify", "cssmin", "concat"]);

    grunt.registerTask("test", ["cssmin", "concat", "uglify"]);

    grunt.registerTask("check", ["versioncheck"]);

    grunt.registerTask("buildcss", ["cssmin", "concat"]);

    grunt.registerTask("work", ["jshint"]);

    grunt.registerTask("update", ["replace"]);

    grunt.registerTask("x", ["babel"]);

    // grunt.registerTask("build", ["replace", "cssmin", "concat"]);
    grunt.registerTask("build", ["clean:build", "replace", "copy", "toggleComments", "babel", "uglify", "htmlmin", "cssmin", "concat", "clean:cleancss"]);

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask("default", []);

};

// ref
// http://coding.smashingmagazine.com/2013/10/29/get-up-running-grunt/
// http://csslint.net/about.html
// http://www.jshint.com/docs/options/
