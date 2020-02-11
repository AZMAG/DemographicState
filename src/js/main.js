define([
    "dojo/topic",
    "magcore/widgets/layer-list",
    "magcore/utils/formatter",
    "./maps/maps-utils",
    "./config/appConfig",
    "dojo/text!./views/about-view.html",
    "dojo/text!./views/help-view.html",
    "dojo/text!./views/layers-view.html",
    "dojo/text!./views/reports-view.html",
    "dojo/text!./views/modals/colorRamp.html",
    "dojo/text!./views/modals/customBreaks.html",
    "dojo/text!./views/modals/help-layers.html",
    "dojo/text!./views/modals/help-legend.html",
    "dojo/text!./views/modals/help-maps.html",
    "dojo/text!./views/modals/help-reports.html",
    "dojo/text!./views/modals/print.html",
    "dojo/text!./views/modals/privacy.html",
    "dojo/text!./views/modals/terms.html",
    "dojo/domReady!"
], function (
    tp,
    LayerList,
    formatter,
    mapUtils,
    config,
    aboutTemplate,
    helpTemplate,
    layersTemplate,
    reportsTemplate,
    colorRampTemplate,
    customBreaksTemplate,
    helpLayersTemplate,
    helpLegendTemplate,
    helpMapsTemplate,
    helpReportsTemplate,
    printTemplate,
    privacyTemplate,
    termsTemplate
) {

    var qs = formatter.qs("init");
    const JSON = qs ? JSON.parse(qs) : null;

    /** The global MAG object. 
     * @exports mag-demographics/main
     * @version 4.0.8
     * @author Geographic Information Services, Inc.
     */
    var mag = {
        /** The current version of MAG.
         * @type {String}
         * 
         */
        version: '4.0.8',
        package: 'mag-demographics',
        getExtent: function () {
            return getObject(JSON, 'extent')
        },
        getPanel: function () {
            return getObject(JSON, 'panel')
        },
        getTransparency: function () {
            return getObject(JSON, 'transparency')
        },
        getLegend: function () {
            return getObject(JSON, 'legend')
        },
        updateLayers: function () {
            if (objectExists(JSON, 'visibleLayers')) {
                updateConfig(JSON.visibleLayers);
            }
        },
        mapDataFieldNameMatches: function (name) {
            if (objectExists(JSON, 'mapData')) {
                if (JSON.mapData.FieldName === name) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        checkBasemap: function (map) {
            if (objectExists(JSON, 'basemap')) {
                if (JSON.basemap === map) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return null;
            }
        }
    };

    function initLayers() {
        var layerList = new LayerList({
            layers: config.layers.filter(x => x.showTOC),
            map: mapUtils.map
        }, "layerList");
    }
    function updateConfig(layers) {
        layers.forEach(function (layer) {
            config.layers.forEach(function (conf) {
                if (layer === conf.id) {
                    conf.visible = true;
                }
            })
        });
    }
    function objectExists(data, obj) {
        if (data != null && data.hasOwnProperty(obj)) {
            return true;
        } else {
            return false;
        }
    }
    function getObject(data, obj) {
        if (objectExists(data, obj)) {
            return data[obj];
        } else {
            return null;
        }
    }
    function onJSONLoaded(data) {
        data.layers.forEach(l => {
            config.layers.forEach(layer => {
                if (`Census10_${layer.layerName}` === l.name) {
                    layer["censusIndex"] = l.id;
                } else if (`ACS_${layer.layerName}` === l.name) {
                    layer["ACSIndex"] = l.id;
                }
                config.layerDef[layer.id] = layer;
            });
        });
        mag.updateLayers();
        loadPanels();
        requireModules();
    }
    function loadPanels() {
        $("#colorRampModal").html(colorRampTemplate);
        $("#customClassBreaksModal").html(customBreaksTemplate);
        $("#termsModal").html(termsTemplate);
        $("#privacyModal").html(privacyTemplate);
        $("#legendHelpModal").html(helpLegendTemplate);
        $("#mapsHelpModal").html(helpMapsTemplate);
        $("#reportsHelpModal").html(helpReportsTemplate);
        $("#layersHelpModal").html(helpLayersTemplate);
        $("#printWidgetModal").html(printTemplate);
        $("[panel-id=\"layers-view\"]").html(layersTemplate);
        $("[panel-id=\"about-view\"]").html(aboutTemplate);
        $("[panel-id=\"reports-view\"]").html(reportsTemplate);
        $("[panel-id=\"help-view\"]").html(helpTemplate);
        //*** version binding
        $(".version").html(config.version);
        //*** copy write binding
        $(".copyright").html(config.copyright);
        tp.subscribe("map-loaded", initLayers);              
    }
    function requireModules() {
        require([
            `${mag.package}/sidebar`,
            `${mag.package}/maps/maps-panel`,
            `${mag.package}/maps/customClassBreaks`,
            `${mag.package}/maps/colorRamps`,
            `${mag.package}/maps/cbr`,
            `${mag.package}/reports/standardReports`,
            `${mag.package}/reports/reports`,
            `${mag.package}/reports/reportGrid`,
            `${mag.package}/reports/reportCharts`,
            `${mag.package}/reports/exportToExcel`,
            `${mag.package}/reports/customGeographyReports`,
            `${mag.package}/reports/advancedQueryReports`,
            `${mag.package}/widgets/zoom`,
            `${mag.package}/widgets/sketch`,
            `${mag.package}/widgets/share`,
            `${mag.package}/widgets/search`,
            `${mag.package}/widgets/print`,
            `${mag.package}/widgets/locate`,
            `${mag.package}/widgets/legend`,
            `${mag.package}/widgets/home`,
            `${mag.package}/widgets/basemapToggle`,
            `${mag.package}/widgets/drawing`,
            `${mag.package}/maps/maps`
        ]);
    }
    $.getJSON(config.mainUrl + "/?f=json", onJSONLoaded);




    return mag;
});