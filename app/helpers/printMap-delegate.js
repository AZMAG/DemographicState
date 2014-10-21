/**
 * Communicates print tasks with REST endpoint.
 *
 * @class printMap-delegate
 */

(function () {
    "use strict";

    define([
        "app/models/map-model",
        "esri/tasks/PrintTask"
    ],

        function (mapModel) {

            var PrintMapDelegate = {

                /**
                 * Print a map to a JPG image and send the results (link to image) to callback method.
                 *
                 * @method printJpgMap
                 * @param {string} url - REST endpoint URL to print task.
                 * @param {*} callback - callback method to execute when response returns.
                 * @param {*} errback - callback method to execute when an error response is returned.
                 * @param {number} width - desired output width.
                 * @param {number} height - desired output height.
                 * @param {number} dpi - desired output DPI.
                 */
                printJpgMap: function (url, callback, errback, width, height, dpi) {

                    //Setup default values
                    width = (typeof width === "undefined") ? mapModel.mapInstance.width : width;
                    height = (typeof height === "undefined") ? mapModel.mapInstance.height : height;
                    dpi = (typeof dpi === "undefined") ? 96 : dpi;

                    var template = new esri.tasks.PrintTemplate();
                    template.exportOptions = {
                        width: width,
                        height: height,
                        dpi: dpi
                    };
                    template.format = "png32";
                    template.layout = "MAP_ONLY";
                    template.preserveScale = true;

                    var params = new esri.tasks.PrintParameters();
                    params.map = mapModel.getMap();
                    params.template = template;

                    var pt = new esri.tasks.PrintTask(url);
                    pt.async = true; // added by scott
                    var result = pt.execute(params, callback, errback);
                }
            };

            return PrintMapDelegate;

        });
} ());