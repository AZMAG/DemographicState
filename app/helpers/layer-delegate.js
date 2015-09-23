/**
 * Provides methods for communicating with a map service layer.
 *
 * @class layer-delegate
 */
// global variable for query count task vw
var queryCountGlobal;

(function () {
    "use strict";

    define([
        "app/models/map-model",
        'app/helpers/magNumberFormatter',
        'esri/tasks/GeometryService',
        'esri/tasks/BufferParameters',
        'app/config/interactiveToolConfig',
        'esri/graphic',
        "esri/tasks/query",
        "esri/tasks/QueryTask",
        "esri/tasks/identify"
    ],

        function (mapModel, magNumberFormatter, GeometryService, BufferParameters, interactiveToolConfig, Graphic) {

            var LayerDelegate = {

                geosvc: new GeometryService(interactiveToolConfig.geometryServiceURL),

                /**
                * Submit request to REST endpoint for layer and send the response back to the callback defined in the parameters.
                *
                * @method layerInfo
                * @param {string} url - map service REST URL.
                * @param {string} callback - callback method for results.
                * @param {string} errback - callback method for errors.
                */
                layerInfo: function (url, callback, errback) {
                    var request = esri.request({
                        url: url,
                        content: {
                            format: "json",
                            f: "json"
                        },
                        handleAs: "json",
                        callbackParamName: "callback"
                    });
                    request.then(callback, errback);
                },
                /**
                * Submit query to REST endpoint and send the response back to the callback defined in the parameters.
                *
                * @method query
                * @param {string} url - map service REST URL.
                * @param {string} callback - callback method for results.
                * @param {string} errback - callback method for errors.
                * @param {string} geometry - [OPTIONAL] geometry used for spatial query.
                * @param {string} where - [OPTIONAL] where clause applied to query.
                * @param {boolean} returnGeometry - [OPTIONAL] whether or not to return the geometry of the results.
                * @param {string[]} outFields - [OPTIONAL] array of fields to return.
                * @param {string[]} orderByFields - [OPTIONAL] array of fields to order the results by.
                **/
                query: function (url, callback, errback, geometry, where, returnGeometry, outFields, orderByFields) {
                    //Setup default values
                    outFields = (typeof outFields === "undefined") ? ["*"] : outFields;
                    where = (typeof where === "undefined") ? "1=1" : where;
                    geometry = (typeof geometry === "undefined") ? null : geometry;
                    returnGeometry = (typeof returnGeometry === "undefined") ? false : returnGeometry;
                    orderByFields = (typeof orderByFields === "undefined") ? [] : orderByFields;

                    //Create new query
                    if (url.indexOf("?") == -1)
                        url += "?r=" + Math.random();
                    else
                        url += "&r=" + Math.random();

                    var qt = new esri.tasks.QueryTask(url);
                    var query = new esri.tasks.Query();
                    query.geometry = geometry;
                    query.where = where;
                    query.returnGeometry = returnGeometry;
                    query.outFields = outFields;
                    query.orderByFields = orderByFields;
                    query.returnCountOnly = false;
                    query.returnIdsOnly = false;
                    query.maxAllowableOffset = .1;

                    // added to count features. vw
                    qt.executeForCount(query, function (count) {
                        queryCountGlobal = count;
                    });

                    //Execute query and return results to callback function
                    qt.execute(query, callback, errback);
                },

                // added to verify query without running vw
                /**
                 * Submit query to REST endpoint and send the response back to the callback defined in the parameters.
                 *
                 * @method query
                 * @param {string} url - map service REST URL.
                 * @param {string} callback - callback method for results.
                 * @param {string} errback - callback method for errors.
                 * @param {string} geometry - [OPTIONAL] geometry used for spatial query.
                 * @param {string} where - [OPTIONAL] where clause applied to query.
                 * @param {boolean} returnGeometry - [OPTIONAL] whether or not to return the geometry of the results.
                 * @param {string[]} outFields - [OPTIONAL] array of fields to return.
                 * @param {string[]} orderByFields - [OPTIONAL] array of fields to order the results by.
                 **/
                verify: function (url, callback, errback, geometry, where, returnGeometry, outFields, orderByFields) {

                    //Setup default values
                    outFields = (typeof outFields === "undefined") ? ["*"] : outFields;
                    where = (typeof where === "undefined") ? "1=1" : where;
                    geometry = (typeof geometry === "undefined") ? null : geometry;
                    returnGeometry = (typeof returnGeometry === "undefined") ? false : returnGeometry;
                    orderByFields = (typeof orderByFields === "undefined") ? [] : orderByFields;

                    //Create new query
                    if (url.indexOf("?") == -1)
                        url += "?r=" + Math.random();
                    else
                        url += "&r=" + Math.random();

                    var qt = new esri.tasks.QueryTask(url);
                    var query = new esri.tasks.Query();
                    query.geometry = geometry;
                    query.where = where;
                    query.returnGeometry = returnGeometry;
                    query.outFields = outFields;
                    query.orderByFields = orderByFields;
                    query.returnCountOnly = false;
                    query.returnIdsOnly = false;
                    query.maxAllowableOffset = .1;

                    // added to count features. vw
                    qt.executeForCount(query, function (count) {
                        queryCountGlobal = count;
                        var numCount = magNumberFormatter.formatValue(count);
                        document.getElementById("fCount1").innerHTML = numCount;
                    });
                },

                /**
                 * Submit identify query to REST endpoint and send the response back to the callback defined in the parameters.
                 *
                 * @method identify
                 * @param {string} url - map service REST URL.
                 * @param {string} geometry - geometry used for spatial query.
                 * @param {integer[]} layerIds - array of REST layer indicies to perform operation on.
                 * @param {string} callback - callback method for results.
                 * @param {string} errback - callback method for errors.
                 */
                identify: function (url, geometry, layerIds, callback, errback) {
                    var identifyTask = new esri.tasks.IdentifyTask(url);

                    var identifyParams = new esri.tasks.IdentifyParameters();
                    identifyParams.tolerance = 0;
                    identifyParams.returnGeometry = true;
                    identifyParams.layerIds = layerIds;
                    identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
                    identifyParams.width = mapModel.mapInstance.width;
                    identifyParams.height = mapModel.mapInstance.height;
                    identifyParams.geometry = geometry;
                    identifyParams.mapExtent = mapModel.getMapExtent();

                    identifyTask.execute(identifyParams, callback, errback);
                },

                /**
                * Submit query to REST endpoint and send the response back to the callback defined in the parameters.
                *
                * @method query
                * @param {string} distance - buffer distance.
                * @param {string} unit - buffer units.
                * @param {string} url - map service REST URL.
                * @param {string} callback - callback method for results.
                * @param {string} errback - callback method for errors.
                * @param {string} geometry - [OPTIONAL] geometry used for spatial query.
                * @param {string} where - [OPTIONAL] where clause applied to query.
                * @param {boolean} returnGeometry - [OPTIONAL] whether or not to return the geometry of the results.
                * @param {string[]} outFields - [OPTIONAL] array of fields to return.
                * @param {string[]} orderByFields - [OPTIONAL] array of fields to order the results by.
                **/
                bufferQuery: function (distance, unit, geometry) {
                    var params = new BufferParameters();
                    params.outSpatialReference = mapModel.mapInstance.spatialReference;
                    params.distances = [distance];
                    params.unit = unit;
                    params.geometries = [geometry];
                    if (interactiveToolConfig.bufferSpatialReference) {
                        params.bufferSpatialReference = new esri.SpatialReference(interactiveToolConfig.bufferSpatialReference);
                    }

                    return this.geosvc.buffer(params);
                }
            };

            return LayerDelegate;

        });
}());