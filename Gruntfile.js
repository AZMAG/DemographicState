function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}
const fileHash = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyz');
const jsFilePath = `dist/app/js/main.${fileHash}.js`;

module.exports = function (grunt) {

    "use strict";

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    var includedModules = [
        "mag/app"
    ]
    var excludedModules = [
        "dojo/domReady",
        "dojo/parser",
        "dojo/topic"
    ]
    var paths = {
        "mag": "",
        "dojo": "empty:",
        "dojo/domReady": "../../../node_modules/requirejs-domready/domReady",
        "esri": "empty:"
    }
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        bannercss: "/*! ========================================================================\n" +
            " * Maricopa Association of Governments\n" +
            " * CSS files for Arizona Demographics\n" +
            " * @concat.min.css | @version | <%= pkg.version %>\n" +
            " * Production | <%= pkg.date %>\n" +
            " * http://ims.azmag.gov/\n" +
            " * Arizona Demographics\n" +
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
            babel0: {
                files: [{
                    expand: true,
                    cwd: "dist/app/js/",
                    src: ["*.js"],
                    dest: "dist/app/js/"
                }]
            }
        },

        requirejs: {
            debug: {
                options: {
                    baseUrl: 'src/app/js',                    
                    out: 'dist/app/js/mag.js',
                    // allow dependencies to be resolved but don't include in output (empty:)
                    paths: paths,
                    // but don't include them in the main build
                    exclude: excludedModules,
                    include: includedModules,
                    inlineText: true,
                    optimize: 'none',
                    generateSourceMaps: false,
                    preserveLicenseComments: true,
                    findNestedDependencies: true,
                    removeCombined: true
                }
            },
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
                    'dist/app/css/concat.min.css': 'dist/app/css/concat.min.css'
                }
            }
        },

        postcss: {
            options: {
                map: false,
                processors: [
                    require('pixrem')(),
                    require('postcss-preset-env')(),
                    require('autoprefixer')({
                        browsers: 'last 1 versions'
                    }),
                    require('cssnano')()
                ]
            },
            dist: {
                files: {
                    'dist/app/css/concat.min.css': 'dist/app/css/concat.min.css'
                }
            }
        },

        concat: {
            js: {
                src: ["dist/app/js/**", "!dist/app/js/generateClassBreaks.js", "!dist/app/js/main.js", "!dist/app/js/app.js",
                        "!dist/app/js/layerlist.js",
                        "!dist/app/js/sidebar.js",
                        "!dist/app/js/maps/maps-utils.js",
                        "!dist/app/js/maps/maps-panel.js",
                        "!dist/app/js/maps/customClassBreaks.js",
                        "!dist/app/js/maps/colorRamps.js",
                        "!dist/app/js/maps/cbr.js",
                        "!dist/app/js/utilities.js",
                        "!dist/app/js/maps/maps.js",
                        "!dist/app/js/reports/customGeographyReports.js",
                        "!dist/app/js/reports/advancedQueryReports.js",
                        "!dist/app/js/widgets/zoom.js",
                        "!dist/app/js/widgets/sketch.js",
                        "!dist/app/js/widgets/share.js",
                        "!dist/app/js/widgets/search.js",
                        "!dist/app/js/widgets/print.js",
                        "!dist/app/js/widgets/locate.js",
                        "!dist/app/js/widgets/legend.js",
                        "!dist/app/js/widgets/home.js",
                        "!dist/app/js/widgets/basemapToggle.js",
                        "!dist/app/js/widgets/drawing.js"
                    ],

                dest: jsFilePath
            },
            css: {
                src: ["dist/app/css/*.css", "!dist/app/css/concat.min.css"],
                dest: "dist/app/css/concat.min.css"
            }
        },

        clean: {
            build: {
                src: ["dist/"]
            },
            js: {
                src: ["dist/app/js/*", "!" + jsFilePath]
            },
            css: {
                src: ["dist/app/css/*", "!dist/app/css/concat.min.css"]
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
                    [jsFilePath]: jsFilePath
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
            },
            File_Reference: {
                src: ["dist/index.html"],
                overwrite: true,
                replacements: [{
                    from: "REPLACE_FILE_NAME_HASH",
                    to: fileHash,
                }]
            }

        },
        watch: {
            options: {
                livereload: 35729                
            },
            site: {
                files: ['./src/app/css/**/*.css', './src/app/js/**/*.js', './src/app/js/**/*.html'],
                tasks: ['build']
            }
        },
        connect: {
            options: {
                hostname: 'localhost',
                base: './dist/',
                livereload: 35729
            },
            site: {
                options: { 
                    port: 8000, 
                        open: {
                        target: 'http://localhost:8000'
                        }
                    }
                }
            } 


    });

    grunt.registerTask("GetClassBreaks", function () {
        require("./src/app/vendor/js/generateClassBreaks.js")(grunt, this.async, {
            inputLocation: "./src/app/js/config/cbrConfig.json",
            geoStatsPath: "Z:\\Viewers\\Demographics\\src\\app\\vendor\\js\\geoStats.min.js",
            mainUrl: "https://geo.azmag.gov/arcgis/rest/services/maps/DemographicState2017/MapServer",
            outputLocation: "./src/app/js/config/cbrConfig.json"
        });
    });

    grunt.registerTask("build-copy-concat", ["clean:build", "replace:update_Meta", "copy", "replace:File_Reference", "concat", "toggleComments"]);
    grunt.registerTask("build-js", ["clean:js", "babel", "uglify"]);
    grunt.registerTask("build-css", ["cssmin", "postcss", "clean:css"])
    grunt.registerTask("build-html", ["htmlmin"])
    grunt.registerTask("require", ["requirejs"] );

    // grunt.registerTask("build", ["build-copy-concat", "build-js", "build-css", "build-html", "require"]);
    grunt.registerTask("build", ["build-copy-concat", "build-js", "build-css", "require"]);

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask("default", ["build"]);

    grunt.registerTask('conn', [ "connect:site", "watch:site"]);

    grunt.registerTask('run', [ "build", "connect:site", "watch:site"]);
};

// ref
// http://coding.smashingmagazine.com/2013/10/29/get-up-running-grunt/
// http://csslint.net/about.html
// http://www.jshint.com/docs/options/
