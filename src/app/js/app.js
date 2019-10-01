define([
    "mag/config/config",
    "mag/config/colorRampConfig",
    "mag/main",
    "mag/layerlist",
    "mag/sidebar",
    "mag/maps/maps-utils",
    "mag/maps/maps-panel",
    "mag/maps/customClassBreaks",
    "mag/maps/colorRamps",
    "mag/maps/cbr",
    "mag/maps/maps",
    "mag/utilities",
    "mag/reports/standardReports",
    "mag/reports/reports",
    "mag/reports/reportGrid",
    "mag/reports/reportCharts",
    "mag/reports/exportToExcel",
    "mag/reports/customGeographyReports",
    "mag/reports/advancedQueryReports",
    "mag/widgets/zoom",
    "mag/widgets/sketch",
    "mag/widgets/share",
    "mag/widgets/search",
    "mag/widgets/print",
    "mag/widgets/locate",
    "mag/widgets/legend",
    "mag/widgets/home",
    "mag/widgets/basemapToggle",
    "mag/widgets/drawing"
], function () {

    /** The global MAG object. 
     * @exports mag/app
     * @version v0.1.0
     * @author Kelly Bigley
     */
    var mag = {
        /** The current version of MAG.
         * @type {String}
         * 
         */
        version: '0.1.0'
    }
    return mag;
});