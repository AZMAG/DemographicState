function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}
const fileHash = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyz');
const jsFilePath = `dist/app/js/main.${fileHash}.js`;

module.exports = function (grunt) {

    "use strict";

    require("matchdep").filterDev(["grunt-*", "intern"]).forEach(grunt.loadNpmTasks);

    var includedModules = [
        "mag/app",
        "magcore/main",
        "magcore/utils/formatter",
        "magcore/utils/charts",
        "magcore/utils/reports"
    ]
    var excludedModules = [
        "dojo/domReady",
        "dojo/parser",
        "dojo/topic"
    ]
    var paths = {
        "mag": "",
        "magcore": "empty:",
        "dojo": "empty:",
        "dojo/domReady": "../../../node_modules/requirejs-domready/domReady",
        "esri": "empty:"
    }
    grunt.initConfig({
        config: {
            out: 'dist',
            src: 'src'
        },
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
            src: ["Gruntfile.js", "<%=config.src%>/app/js/*.js", "<%=config.src%>/app/js/config/*.js", "<%=config.src%>/app/js/maps/*.js", "<%=config.src%>/app/js/reports/*.js", "<%=config.src%>/app/js/widgets/*.js"],
        },

        babel: {
            options: {
                sourceMaps: false,
                presets: ["@babel/preset-env"]
            },
            babel0: {
                files: [{
                    expand: true,
                    cwd: "<%=config.out%>/app/js/",
                    src: ["*.js"],
                    dest: "<%=config.out%>/app/js/"
                }]
            }
        },

        requirejs: {
            debug: {
                options: {
                    baseUrl: './<%=config.src%>/app/js',
                    out: './<%=config.out%>/app/js/mag.js',
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
            release: {
                options: {
                    baseUrl: './<%=config.src%>/app/js',
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
                    removeCombined: true,
                    out: function (text, sourceMapText) {
                        var UglifyJS = require('uglify-es'),
                            uglified = UglifyJS.minify(text),
                            config = grunt.config.get('config'),
                            pkg = grunt.config.get('pkg');

                        grunt.file.write(`${config.out}/app/js/mag.min.js`, uglified.code);
                    }
                }
            }
        },

        htmlmin: {
            htmlmin1: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "<%=config.out%>/index.html": "<%=config.out%>/index.html",
                }
            },
            htmlmin2: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: "<%=config.out%>/app/views",
                    src: ["*.html"],
                    dest: "<%=config.out%>/app/views"
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
                    '<%=config.out%>/app/css/concat.min.css': '<%=config.out%>/app/css/concat.min.css'
                }
            }
        },

        postcss: {
            options: {
                map: false,
                processors: [
                    require('pixrem')(),
                    require('postcss-preset-env')(),
                    require('autoprefixer')(),
                    require('cssnano')()
                ]
            },
            dist: {
                files: {
                    '<%=config.out%>/app/css/concat.min.css': '<%=config.out%>/app/css/concat.min.css'
                }
            }
        },

        concat: {
            css: {
                src: ["<%=config.out%>/app/css/*.css", "!<%=config.out%>/app/css/concat.min.css"],
                dest: "<%=config.out%>/app/css/concat.min.css"
            }
        },

        clean: {
            build: {
                src: ["<%=config.out%>/"]
            },
            js: {
                src: ["<%=config.out%>/app/js/*", "!" + jsFilePath]
            },
            css: {
                src: ["<%=config.out%>/app/css/*", "!<%=config.out%>/app/css/concat.min.css"]
            }

        },

        copy: {
            build: {
                files: [
                    {
                        cwd: "<%=config.src%>/",
                        src: ["**"],
                        dest: "<%=config.out%>/",
                        expand: true
                    },
                    { 
                        expand: true, 
                        cwd: "node_modules/", 
                        src: [
                            "magcore/<%=config.out%>/**"
                        ], 
                        dest: "<%=config.out%>/app/libs/"
                    }
                
                ]
            }
        },

        toggleComments: {
            customOptions: {
                options: {
                    removeCommands: false
                },
                files: {
                    "<%=config.out%>/index.html": "<%=config.out%>/index.html",
                    [jsFilePath]: jsFilePath
                }
            }
        },

        replace: {
            index: {
                src: '<%=config.src%>/index.html',
                dest: '<%=config.out%>/index.html',
                replacements: [ 
                    {
                        from: '<link rel="stylesheet" href="app/css/main.css" />', 
                        to: '<link rel="stylesheet" href="app/css/concat.min.css" />'
                    },   
                    { from: '../node_modules/magcore/<%=config.out%>/js/magcore.js', to: 'app/libs/magcore/<%=config.out%>/js/magcore.min.js'},
                    { 
                        from: '<script src="app/libs/magcore/<%=config.out%>/js/magcore.min.js"></script>\n', 
                        to: '<script src="app/libs/magcore/<%=config.out%>/js/magcore.min.js"></script>\n\t' + 
                        '<script src="app/js/mag.min.js"></script>\t\n'
                    },
                    { 
                        from: '<link rel="stylesheet" href="app/css/normalize.css" />', 
                        to: ''
                    }
                ]
            },
            update_Meta: {
                src: ["<%=config.src%>/index.html", "<%=config.src%>/humans.txt", "README.md", "LICENSE", "<%=config.src%>/LICENSE", "<%=config.src%>/app/css/main.css", "<%=config.src%>/app/js/config/config.js"],
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
                src: ["<%=config.out%>/index.html"],
                overwrite: true,
                replacements: [
                ]
            }

        },
        watch: {
            options: {
                livereload: 35729
            },
            site: {
                files: ['./<%=config.src%>/app/css/**/*.css', './<%=config.src%>/app/js/**/*.js', './<%=config.src%>/app/js/**/*.html'],
                tasks: ['build']
            }
        },
        connect: {
            options: {
                hostname: 'localhost',
                base: './<%=config.out%>/',
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
        },
        intern: {
            options: {
                suites: ["test/unit/**/*.js",],
                functionalSuites: ["test/functional/**/*.js"],
                environments: [
                    {
                        browserName: "chrome",
                        fixSessionCapabilities: "no-detect",
                        chromeOptions: {
                            args: ["headless", "disable-gpu", "window-size=1024,768"]
                        }
                    }
                ],
                reporters: ['runner'],
            },
            browser: {
                options: {
                    tunnelOptions: {
                        drivers: [
                            { name: "chrome", "version": "78.0.3904.70" }
                        ]
                    },
                    loader: {
                        script: "dojo2",
                        options: {
                            async: false,
                            tlmSiblingOfDojo: false,
                            has: {
                                "extend-esri": 1
                            },
                            packages: [
                                {
                                    name: "mag",
                                    location: "<%=config.src%>/app/js"
                                },
                                {
                                    name: "esri",
                                    location: "node_modules/arcgis-js-api"
                                },
                                {
                                    name: "dojo",
                                    location: "node_modules/dojo"
                                },
                                {
                                    name: "dojox",
                                    location: "node_modules/dojox"
                                },
                                {
                                    name: "dijit",
                                    location: "node_modules/dijit"
                                },
                                {
                                    name: "@dojo",
                                    location: "node_modules/@dojo"
                                },
                                {
                                    name: "tslib",
                                    location: "node_modules/tslib",
                                    main: "tslib"
                                }
                            ]
                        }
                    },
                    plugins: [
                        'node_modules/jquery/<%=config.out%>/jquery.js'
                    ]
                }
            }
        }
    });

    grunt.registerTask("GetClassBreaks", function () {
        require("./<%=config.src%>/app/vendor/js/generateClassBreaks.js")(grunt, this.async, {
            inputLocation: "./<%=config.src%>/app/js/config/cbrConfig.json",
            geoStatsPath: "Z:\\Viewers\\Demographics\\<%=config.src%>\\app\\vendor\\js\\geoStats.min.js",
            mainUrl: "https://geo.azmag.gov/arcgis/rest/services/maps/DemographicState2017/MapServer",
            outputLocation: "./<%=config.src%>/app/js/config/cbrConfig.json"
        });
    });

    grunt.registerTask("build-copy-concat", ["clean:build", "replace:update_Meta", "copy", "replace:File_Reference", "replace:index", "concat", "toggleComments"]);
    grunt.registerTask("build-js", ["clean:js", "babel"]);
    grunt.registerTask("build-css", ["cssmin", "postcss", "clean:css"])
    grunt.registerTask("build-html", ["htmlmin"])
    grunt.registerTask("require", ["requirejs"]);

    // grunt.registerTask("build", ["build-copy-concat", "build-js", "build-css", "build-html", "require"]);
    grunt.registerTask("build", ["intern", "build-copy-concat", "build-js", "build-css", "require"]);

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask("default", ["build"]);

    grunt.registerTask('conn', ["connect:site", "watch:site"]);

    grunt.registerTask('run', ["build", "connect:site", "watch:site"]);

    grunt.registerTask("test", ["intern"]);
};

// ref
// http://coding.smashingmagazine.com/2013/10/29/get-up-running-grunt/
// http://csslint.net/about.html
// http://www.jshint.com/docs/options/
