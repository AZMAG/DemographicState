define([
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
    "mag/widgets/share"
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