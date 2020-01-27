module.exports = function (grunt) {

    "use strict";
    
    require("matchdep").filterDev(["grunt-*", "intern"]).forEach(grunt.loadNpmTasks);

    var VERSION_REGEXP = /\b(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?\b/i;
    var includedModules = [
        "mag-demographics/main"
    ]
    var excludedModules = [
        "dojo/domReady",
        "dojo/parser",
        "dojo/topic"
    ]
    var paths = {
        "mag-demographics": "",
        "magcore": "empty:",
        "dojo": "empty:",
        "dojo/domReady": "../../node_modules/requirejs-domready/domReady",
        "esri": "empty:"
    }
    grunt.initConfig({
        config: {
            out: 'build',
            src: 'src'
        },
        pkg: grunt.file.readJSON("package.json"),
        license: grunt.file.read('LICENSE'),
        bannercss: "/*! <%=pkg.description%>\n *\n" +
            " * Maricopa Association of Governments\n" +
            " * CSS files for Arizona Demographics\n" +
            " * @<%=pkg.name%>.min.css | v<%= pkg.version %>\n" +
            " * Production | <%= pkg.date %>\n" +
            " * http://ims.azmag.gov/\n" +
            " * Arizona Demographics\n" +
            " */\n\n" +
            " /*! <%= license%>\n" +
            " */\n",
        banner: "/*! <%= pkg.description %>\n *\n" +
            " * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n" +
            " */\n\n" +
            " /*! <%= license %>\n" +
            " */\n",
        usebanner: {
            js: {
                options: {
                    position: 'top',
                    banner: '<%= banner %>'
                },
                files: {
                    src: ['./<%=config.out%>/js/*.js']
                }
            },
            css: {
                options: {
                    position: 'top',
                    banner: '<%= bannercss %>'
                },
                files: {
                    src: ['./<%=config.out%>/css/*.css']
                }
            }
        },
        bump: {
            options: {
                files: ['package.json', '<%=pkg.name%>/js/main.js'],
                updateConfigs: ['pkg'],
                commit: false,
                createTag: false,
                tagName: '%VERSION%',
                tagMessage: '%VERSION%',
                push: false,
                globalReplace: true,
                prereleaseName: 'beta'
            }
        },
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
                src: ["index.html", "views/*.html"]
            }
        },

        // CSSLint. Tests CSS code quality
        // https://github.com/gruntjs/grunt-contrib-csslint
        csslint: {
            // define the files to lint
            files: ["<%=config.src%>/css/main.css"],
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
            src: ["Gruntfile.js", "<%=config.src%>/js/**/*.js"],
        },
        requirejs: {
            debug: {
                options: {
                    baseUrl: './<%=config.src%>/js',
                    out: './<%=config.out%>/js/<%=pkg.name%>.js',
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
                    baseUrl: './<%=config.src%>/js',
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

                        grunt.file.write(`${config.out}/js/${pkg.name}.min.js`, uglified.code);
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
                    cwd: "<%=config.out%>/views",
                    src: ["*.html"],
                    dest: "<%=config.out%>/views"
                }]
            }
        },

        cssmin: {
            release: {
                files: {
                    '<%=config.out%>/css/<%=pkg.name%>.min.css': '<%=config.out%>/css/<%=pkg.name%>.css'
                }
            }
        },

        postcss: {
            options: {
                map: false,
                processors: [
                    require('pixrem')(),
                    require('postcss-preset-env')(),
                    require('autoprefixer')()
                ]
            },
            dist: {
                files: {
                    '<%=config.out%>/css/<%=pkg.name%>.min.css': '<%=config.out%>/css/<%=pkg.name%>.min.css',
                    '<%=config.out%>/css/<%=pkg.name%>.css': '<%=config.out%>/css/<%=pkg.name%>.css'
                }
            }
        },

        concat: {
            css: {
                src: ["<%=config.src%>/css/*.css"],
                dest: "<%=config.out%>/css/<%=pkg.name%>.css"
            }
        },
        clean: {
            build: {
                src: ["<%=config.out%>/"]
            }
        },
        copy: {
            build: {
                files: [
                    {
                        cwd: "<%=config.src%>",
                        src: ["*", "images/**", "vendor/**", "views/**", "!index.html", "!css"],
                        dest: "<%=config.out%>/",
                        expand: true
                    },
                    {
                        expand: true,
                        cwd: "node_modules/",
                        src: [
                            "magcore/dist/**"
                        ],
                        dest: "<%=config.out%>/libs/"
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
                    "<%=config.out%>/index.html": "<%=config.out%>/index.html"
                }
            }
        },
        replace: {
            index: {
                src: '<%=config.src%>/index.html',
                dest: '<%=config.out%>/index.html',
                replacements: [
                    {
                        from: '<link rel="stylesheet" href="css/normalize.css" />',
                        to: ''
                    },
                    {
                        from: '<link rel="stylesheet" href="css/main.css" />',
                        to: '<link rel="stylesheet" href="css/<%=pkg.name%>.min.css" />'
                    },
                    {
                        from: '../node_modules/magcore/dist/js/magcore.js',
                        to: 'libs/magcore/dist/js/magcore.min.js'
                    },
                    {
                        from: '<script src="libs/magcore/dist/js/magcore.min.js"></script>\n',
                        to: '<script src="libs/magcore/dist/js/magcore.min.js"></script>\n\t' +
                            '<script src="js/<%=pkg.name%>.min.js"></script>\t\n'
                    }
                ]
            },
            src: {
                src: [ '<%=config.src%>/js/main.js'],
                dest: [ '<%=config.src%>/js/main.js'],
                replacements: [{
                    from: VERSION_REGEXP,
                    to: '<%=pkg.version%>'
                }]
            },
            metadata: {
                src: ["<%=config.src%>/index.html", "<%=config.src%>/humans.txt", "README.md", "LICENSE",
                    "<%=config.src%>/LICENSE", "<%=config.src%>/css/main.css", "<%=config.src%>/js/config/config.js"],
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
        },
        watch: {
            options: {
                livereload: 35729
            },
            debug: {
                files: ['./<%=config.src%>/css/**/*.css', './<%=config.src%>/js/**/*.js', './<%=config.src%>/views/**/*.html'],
                tasks: []
            },
            build: {
                files: ['./<%=config.src%>/css/**/*.css', './<%=config.src%>/js/**/*.js', './<%=config.src%>/views/**/*.html'],
                tasks: ['default']
            }
        },
        connect: {
            options: {
                hostname: 'localhost',
                base: './',
                livereload: 35729
            },
            debug: {
                options: {
                    port: 8000,
                    open: {
                        target: 'http://localhost:8000/src'
                    }
                }
            },
            build: {
                options: {
                    port: 8001,
                    protocol: 'https',
                    open: {
                        target: 'https://localhost:8001/build'
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
                                    name: "mag-demographics",
                                    location: "<%=config.src%>/js"
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
                        'node_modules/jquery/dist/jquery.js'
                    ]
                }
            }
        }
    });

    grunt.registerTask("GetClassBreaks", function () {
        require("./<%=config.src%>/generateClassBreaks.js")(grunt, this.async, {
            inputLocation: "./<%=config.src%>/js/config/cbrConfig.json",
            geoStatsPath: "./<%=config.src%>/vendor/geoStats.min.js",
            mainUrl: "https://geo.azmag.gov/arcgis/rest/services/maps/DemographicState2018/MapServer",
            outputLocation: "./<%=config.src%>/js/config/cbrConfig.json"
        });
    });

    // main build of the application
    grunt.registerTask("default", [
        "intern",
        "replace:metadata",
        "clean",      
        "requirejs",
        "replace:index",
        "concat",
        "cssmin",
        "postcss",
        "copy",
        "toggleComments",
        "htmlmin",
        "usebanner"
    ]);
    // build for deployment and run the application for testing
    grunt.registerTask("deploy", [
        "default",
        "connect:build",
        "watch:build"
    ]);
    // run the application for testing
    grunt.registerTask('run', [
        "intern",
        "connect:debug",
        "watch:debug"
    ]);
    // run the tests alone
    grunt.registerTask("test", ["intern"]);

    // lint the css and js
    grunt.registerTask("lint", [
        "csslint",
        "jshint"
    ]);
};

// ref
// http://coding.smashingmagazine.com/2013/10/29/get-up-running-grunt/
// http://csslint.net/about.html
// http://www.jshint.com/docs/options/
