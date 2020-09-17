define([
    "mag/config/config",
    "mag/config/initConfig",
    "dojo/parser",
    "dojo/topic",
    "dojo/domReady!",
], function (config, initConfig, parser, tp) {
    parser.parse();
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

    $("#colorRampModal").load("app/views/modal-colorRamp.html", function () {
        tp.publish("crp");
    });
    $("#customClassBreaksModal").load(
        "app/views/modal-customBreaks.html",
        function () {
            tp.publish("classBreaksModalLoaded");
        }
    );

    //*** terms binding
    $("#termsModal").load("app/views/modal-terms.html");
    //*** privacy binding
    $("#privacyModal").load("app/views/modal-privacy.html");
    $("#legendHelpModal").load("app/views/modal-help-legend.html");
    $("#mapsHelpModal").load("app/views/modal-help-maps.html");
    $("#reportsHelpModal").load("app/views/modal-help-reports.html");
    $("#layersHelpModal").load("app/views/modal-help-layers.html");
    $("#printWidgetModal").load("app/views/modal-print.html");
    $(".pd").each(function (i, el) {
        let panelId = $(el).attr("panel-id");
        $(el).load(`app/views/${panelId}.html`, function () {
            tp.publish("panel-loaded", panelId);
        });
    });
});
