require([
        "dojo/parser",
        "dojo/topic",
        // "app/utilities",
        // "app/config/config",
        // "app/config/mapsConfig",
        // "app/config/colorRampConfig",
        // "app/config/acsFieldsConfig",
        // "app/config/censusFieldsConfig",
        // "app/widgets/legend",
        // "app/widgets/zoom",
        // "app/widgets/home",
        // "app/widgets/locate",
        // "app/widgets/basemapToggle",
        // "app/widgets/drawing",
        // "app/widgets/share",
        // "app/maps/cbr",
        // "app/maps/colorRamps",
        // "app/maps/customClassBreaks",
        // "app/maps/maps-panel",
        // "app/maps/maps-utils",
        // "app/maps/maps",
        // "app/reports/exportToExcel",
        // "app/reports/reports",
        // "app/reports/standardReports",
        // "app/reports/advancedQueryReports",
        // "app/reports/customGeographyReports",
        // "app/layerlist",
        // "app/sidebar",
        "dojo/domReady!"
    ],
    function (parser, tp) {
        parser.parse();
        $.getJSON(app.config.mainUrl + '/?f=json', function (data) {
            for (var i = 0; i < data.layers.length; i++) {
                var layer = data.layers[i];
                for (var j = 0; j < app.config.layers.length; j++) {
                    var conf = app.config.layers[j];
                    if ('Census10_' + conf.layerName === layer.name) {
                        conf["censusIndex"] = layer.id;
                    } else if ('ACS_' + conf.layerName === layer.name) {
                        conf["ACSIndex"] = layer.id;
                    }
                    app.config.layerDef[conf.id] = conf;
                }
            }
            app.initConfig = undefined;

            let initStr = qs("init");
            if (initStr) {
                app.initConfig = JSON.parse(initStr);
            }

            if (app.initConfig && app.initConfig.visibleLayers) {
                app.initConfig.visibleLayers.forEach(function (layer) {
                    app.config.layers.forEach(function (conf) {
                        if (layer === conf.id) {
                            conf.visible = true;
                        }
                    })
                });
            }
            tp.publish("config-loaded");
        });
    }
)

//*** terms binding
$("#termsModal").load("app/views/modal-terms.html");
//*** privacy binding
$("#privacyModal").load("app/views/modal-privacy.html");
$("#legendHelpModal").load("app/views/modal-help-legend.html");
$("#mapsHelpModal").load("app/views/modal-help-maps.html");
$("#reportsHelpModal").load("app/views/modal-help-reports.html");
$("#layersHelpModal").load("app/views/modal-help-layers.html");
$("#aboutHelpModal").load("app/views/modal-help-about.html");
