define([
    "dojo/parser",
    "dojo/topic",
    "magcore/widgets/layer-list",
    "./maps/maps-utils",
    "./config/config",
    "./config/initConfig",
    "./layerlist",
    "./sidebar",
    "./maps/maps-panel",
    "./maps/customClassBreaks",
    "./maps/colorRamps",
    "./maps/cbr",
    "./maps/maps",
    "./reports/standardReports",
    "./reports/reports",
    "./reports/reportGrid",
    "./reports/reportCharts",
    "./reports/exportToExcel",
    "./reports/customGeographyReports",
    "./reports/advancedQueryReports",
    "./widgets/zoom",
    "./widgets/sketch",
    "./widgets/share",
    "./widgets/search",
    "./widgets/print",
    "./widgets/locate",
    "./widgets/legend",
    "./widgets/home",
    "./widgets/basemapToggle",
    "./widgets/drawing",
    "dojo/domReady!"
], function (
    parser,
    tp,
    LayerList,
    mapUtils,
    config,
    initConfig
) {
    parser.parse();

    /** The global MAG object. 
     * @exports mag-demographics/app
     * @version 4.0.7
     * @author Geographic Information Services, Inc.
     */
    var mag = {
        /** The current version of MAG.
         * @type {String}
         * 
         */
        version: '4.0.7'
    };

    $.getJSON(config.mainUrl + "/?f=json", function (data) {
        for (var i = 0; i < data.layers.length; i++) {
            var layer = data.layers[i];
            for (var j = 0; j < config.layers.length; j++) {
                var conf = config.layers[j];
                if ("Census10_" + conf.layerName === layer.name) {
                    conf["censusIndex"] = layer.id;
                } else if ("ACS_" + conf.layerName === layer.name) {
                    conf["ACSIndex"] = layer.id;
                }
                config.layerDef[conf.id] = conf;
            }
        }

        initConfig.updateLayers();

        tp.publish("config-loaded");
        config.configLoaded = true;
    });

    $("#colorRampModal").load("views/modal-colorRamp.html", function () {
        tp.publish("crp");
    });
    $("#customClassBreaksModal").load("views/modal-customBreaks.html", function () {
        tp.publish("classBreaksModalLoaded");
    });

    //*** terms binding
    $("#termsModal").load("views/modal-terms.html");
    //*** privacy binding
    $("#privacyModal").load("views/modal-privacy.html");
    $("#legendHelpModal").load("views/modal-help-legend.html");
    $("#mapsHelpModal").load("views/modal-help-maps.html");
    $("#reportsHelpModal").load("views/modal-help-reports.html");
    $("#layersHelpModal").load("views/modal-help-layers.html");
    $("#printWidgetModal").load("views/modal-print.html");
    $(".pd").each(function (i, el) {
        let panelId = $(el).attr("panel-id");
        $(el).load(`views/${panelId}.html`, function () {

            tp.publish("panel-loaded", panelId);
            switch (panelId) {
                case "about-view":
                    //*** version binding
                    $(".version").html(config.version);
                    //*** copy write binding
                    $(".copyright").html(config.copyright);
                    break;
                case "layers-view":
                    if (mapUtils.map != null) {
                        initLayers();
                    } else {
                        tp.subscribe("map-loaded", initLayers);
                    }
                    
                    break
            }
        })
    });
    function initLayers() {
        var layers = new LayerList({
            layers: config.layers.filter(x => x.showTOC),
            map: mapUtils.map
        }, "layerList");
    }
    return mag;
});