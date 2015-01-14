/**
 * Map model (contains map related properties) - Singleton
 *
 * This module is defined as a singleton object and as such,
 * contains a different architecture than other modules.
 *
 * @class map-model
 **/

(function() {

    "use strict";

    define([
        "dojo/dom-construct",
        "dojo/dom",
        "dojo/on",
        "dojo/topic",
        "esri/dijit/HomeButton",
        "esri/dijit/LocateButton",
        "esri/dijit/Geocoder",
        "esri/layers/wms",
        "esri/layers/agsdynamic",
        "esri/map",
        "vendor/kendo/web/js/jquery.min",
        "vendor/kendo/web/js/kendo.web.min"
    ], function (dc, dom, on, tp, HomeButton, LocateButton, Geocoder) {

            /**
             * Holds reference to the map.
             *
             * @property instance
             * @type {map}
             */
        var instance = null;  //no globals!

            /**
             * Contains properties and methods to manage the ESRI map.
             *
             * @class MapModel
             * @constructor
             */
        function MapModel() {
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one MapModel, use MapModel.getInstance()");
            }
            this.mapInstance = null;
            this.mapLayers = [];
            this.anonymousMapLayers = [];
            this.allowedMapLayers = [];
            this.basemapLayers = [];
            this.layerCategories = [];
            this.selectableLayers = [{"title": "Custom Shape"}];
            this.initialize();
        }

        MapModel.prototype = {

                /**
                 * Initialize the class and load the map layers.
                 *
                 * @method initialize
                 */
            initialize: function () {
                var node = dc.create("div", {id: "map"}, "display", "first");

                // create div for loading gif. vw
                var loading = dc.create("div", {id: "loading"}, "map", "after");
                var img = dc.create("img", {id: "loadimag", src: "app/resources/img/loading.gif"}, "loading", "first");
                // hide div till called. vw
                esri.hide(dojo.byId("loading"));

                this.mapInstance = new esri.Map("map", {
                    extent: new esri.geometry.Extent(appConfig.initExtent),
                    // fitExent: true,
                    // lods: appConfig.lods,
                    minZoom: 7,
                    maxZoom: 19,
                    sliderPosition: "bottom-left",
                    showAttribution: false,
                    logo: false
                });

                var scalebar = new esri.dijit.Scalebar({
                    map: this.mapInstance,
                    scalebarUnit: this.units
                });

                // create div for homebutton. vw
                var homeButton = new HomeButton({
                    map: this.mapInstance,
                    visible: true   //show the button
                }, dc.create("div", {id: "HomeButton"}, "map", "after"));
                homeButton._homeNode.title = "Original Extent";
                homeButton.startup();

                // create div for geolocatebutton. vw
                // var geoLocateButton = new LocateButton({
                //     map: this.mapInstance,
                //     visible: true
                //   }, dc.create("div", {id: "LocateButton"}, "map", "last"));
                // geoLocateButton.startup();

                // create div for geocoder search box. vw
                // var geocoder = new Geocoder({
                //     map: this.mapInstance,
                //     autoComplete: true
                //     }, dc.create("div", {id: "search"}, "map", "last"));
                // geocoder.startup();

                on(this.mapInstance, "LayerAddResult", this.mapOnLayerAddResult);
                on(this.mapInstance, "Load", this.mapLoaded);

                // Moved call to create layers to legend-vm init method.
                //this.createLayers();

            },

            /**
             * Fired when a layer is added to the map.
             *
             * @event onLayerAddResult
             * @param {Layer} layer - the layer added to the map.
             * @param {Error} error - any errors that occurred loading the layer.
             */
            mapOnLayerAddResult: function (layer, error) {
                if (error) {
                    alert(error);
                }
                tp.publish("mapLayerAdded");
            },

            mapLoaded: function () {
                tp.publish("Map Loaded");
            },

            /**
             * Read layer info from config.js and add the layers to the map.
             *
             * @method createLayers
             */
            createLayers: function () {
            //appConfig.layerInfo.reverse();
                var layersToAdd = [];   // add all layers to TOC
                var layersTOC = []; // add only certin layers to TOC

                for (var i = 0; i < appConfig.layerInfo.length; i++) {
                    var info = appConfig.layerInfo[i];
                    var layer;

                    var token = "";
                    if(typeof info.token !== "undefined") {
                        token = "?token=" + info.token;
                    }

                    switch(info.type) {
                        case "wms":
                            var resourceInfo = {
                                extent: this.getMapExtent(),
                                layerInfos: info.layers,
                                version: info.version
                            };
                            var vlayers = [];
                            for(var x = 0; x < info.layers.length; x++) {
                                var li = info.layers[x];
                                vlayers.push(li.name);
                            }
                            layer = new esri.layers.WMSLayer(info.url,{
                                id: info.id,
                                visible: info.visible,
                                resourceInfo: resourceInfo,
                                visibleLayers: vlayers,
                                opacity: info.opacity
                            });
                            layer.setImageFormat("png");
                            break;
                        case "dynamic":
                            layer = new esri.layers.ArcGISDynamicMapServiceLayer(info.url + token, {
                                id: info.id,
                                visible: info.visible,
                                opacity: info.opacity
                            });
                            layer.setVisibleLayers(info.layers);
                            break;
                        case "tile":
                            layer = new esri.layers.ArcGISTiledMapServiceLayer(info.url + token, {
                                id: info.id,
                                visible: info.visible,
                                opacity: info.opacity
                            });
                            break;
                    }

                    layer.tocIndex = i;
                    this.applyLayerProperties(layer, info);
                    layersToAdd.push(layer);

                     if (info.showTOC !== false) {
                        layersTOC.push(layer);
                    }


                    // Hack: workaround inability to create legend when appending token to url
                    //http://forums.arcgis.com/threads/65481-Legend-problems-with-secured-services-when-migrating-to-3.0-3.1
                    if(typeof info.token !== "undefined")
                    {
                        layer.url = layer.originalUrl;
                        layer.queryUrl = layer.queryUrl + "?token=" + layer.token;
                    }
                }

                    // tp.publish("addTOCLayers", layersToAdd);
                    tp.publish("addTOCLayers", layersTOC);
                    this.mapInstance.addLayers(layersToAdd.reverse());

                },

                /**
                 * Add additional layer properties to the layer before adding it to the map.
                 *
                 * @method applyLayerProperties
                 * @param {Layer} layer - the layer to apply properties to.
                 * @param {Object} info - the layer info object from the config.js file.
                 */
                applyLayerProperties: function (layer, info) {
                    layer.layerType = info.type;
                    layer.layers = info.layers;
                    layer.title = info.title;
                    layer.description = info.description;
                    layer.filters = info.filters;
                    layer.category = info.category;
                    layer.selectable = info.selectable;
                    layer.queryUrl = info.queryUrl;
                    layer.historical = info.historical;
                    layer.originalUrl = info.url;
                    layer.token = info.token;
                    layer.queryWhere = info.queryWhere;
                    layer.layerDefField = info.layerDefField;
                    layer.isBasemap = (info.isBasemap) ? true : false;

                    if(typeof layer.queryWhere === "undefined" || layer.queryWhere === "") {
                        layer.queryWhere = "1=1";
                    }
                    if(typeof info.layerDefField === "undefined") {
                        layer.layerDefField = "";
                    }
                    if(typeof info.historical === "undefined") {
                        layer.historical = false;
                    }

                    //Apply a definition expression on the layer if
                    //it is a historical layer
                    layer.defExp = "";
                    if(layer.historical) {
                        var d = new Date();
                        d.setDate(d.getDate() - 1);
                        var curr_date = d.getDate();
                        var curr_month = d.getMonth() + 1; //Months are zero based
                        var curr_year = d.getFullYear();
                        var yesterday = curr_year + "-" + curr_month + "-" + curr_date;
                        layer.defExp = "(Date >= '" + yesterday + " 00:00:00' AND Date <= '" + yesterday + " 23:59:59')";
                    }

                    //Add observable properties
                    layer.loading = kendo.observable(false);
                    layer.isVisible = kendo.observable(layer.visible);
                    layer.optionsVisible = kendo.observable(false);

                    layer.refreshOpacity = function () {
                        this.opacityLevel((this.opacity * 100) + "%");
                    };

                    //Categorize layer
                    if(layer.isBasemap) {
                        this.basemapLayers.push(layer);
                    } else {
                        this.mapLayers.push(layer);
                        //this.categorizeLayer(layer);
                        if(layer.selectable) {
                            this.selectableLayers.push(layer);
                        }
                    }
                },

                /**
                 * Optionally categorize layers.
                 *
                 * @method categorizeLayer
                 * @param {Layer} layer - the layer to be categorized.
                 */
                categorizeLayer: function(layer) {
                    var l = this.layerCategories.length;
                    var exists = false;
                    var obj;

                    //Categorize the layer
                    for(var x = 0; x < l; x++) {
                        obj = this.layerCategories[x];
                        if(obj.category === layer.category) {
                            obj.layers.push(layer);
                            if(layer.historical) {
                                obj.historical = true;
                                exists = true;
                                break;
                            }
                        }
                    }

                    if(!exists) {
                        var id = Math.floor(Math.random() * 1000000);
                        var d = new Date();
                        d.setDate(d.getDate() - 1);
                        var curr_date = d.getDate();
                        var curr_month = d.getMonth() + 1; //Months are zero based
                        var curr_year = d.getFullYear();
                        var yesterday = curr_year + "-" + curr_month + "-" + curr_date;
                        obj = {
                            id: id,
                            category:layer.category,
                            historical: layer.historical,
                            fromDate: yesterday,
                            toDate: yesterday,
                            layers:[layer]
                        };
                        this.layerCategories.push(obj);
                    }

                    //Categorize the layer filters
                    l = layer.filters.length;
                    var filterCategories = [];
                    for(var x = 0; x < l; x++) {
                        exists = false;
                        var filter = layer.filters[x];
                        for(var y = 0; y < filterCategories.length; y++) {
                            obj = filterCategories[y];
                            if(obj.category === filter.category) {
                                obj.filters.push(filter);
                                exists = true;
                                break;
                            }
                        }
                        if(!exists) {
                            filterCategories.push({category:filter.category, filters:[filter]});
                        }
                    }
                    layer.filters = kendo.observable(filterCategories);
                },

                /**
                 * Get the map instance.
                 *
                 * @method getMap
                 * @returns {Map}
                 */
                getMap: function () {
                    return this.mapInstance;
                },

                /**
                 * Get the graphics layer from the map.
                 *
                 * @method getGraphics
                 * @returns {GraphicsLayer}
                 */
                getGraphics: function() {
                    return this.mapInstance.graphics;
                },

                /**
                 * Get the spatial reference of the map.
                 *
                 * @method getSpatialReference
                 * @returns {SpatialReference}
                 */
                getSpatialReference: function () {
                    return this.mapInstance.spatialReference;
                },

                /**
                 * Resize the map to fit it's parent container.
                 *
                 * @method resizeMap
                 */
                resizeMap: function () {
                    if (this.mapInstance) {
                        this.mapInstance.reposition();
                        this.mapInstance.resize();
                    }
                },

                /**
                 * Get the current map extent.
                 *
                 * @method getMapExtent
                 * @returns {Extent}
                 */
                getMapExtent: function () {
                    return this.mapInstance.extent;
                },

                /**
                 * Set the map extent to the extent of the provided geometry.
                 *
                 * @method setMapExtent
                 * @param {Geometry} geometry - source geometry for new extent.
                 */
                setMapExtent: function (geometry) {
                    var extent = new esri.geometry.Extent();
                    switch (geometry.type) {
                        case "extent": extent = geometry; break;
                        case "polygon": extent = geometry.getExtent(); break;
                        case "point":
                            var tol = 5000;
                            extent.update(geometry.x - tol, geometry.y - tol, geometry.x + tol, geometry.y + tol);
                            break;
                    }
                    this.mapInstance.setExtent(extent, true);
                },

                /**
                 * Center the map on the given point.
                 *
                 * @method centerMap
                 * @param {Point} pt - pont to center map on.
                 */
                centerMap: function (pt) {
                    this.mapInstance.centerAt(pt);
                },

                /**
                 * Center the map on the given latitude and longitude.
                 *
                 * @method centerMapAtLatLon
                 * @param {number} lat - latitude uses for center point.
                 * @param {number} lon - longitude used for center point.
                 */
                centerMapAtLatLon: function (lat, lon) {
                    var geoPt = new esri.geometry.Point(lon, lat, new esri.SpatialReference({ wkid: 102100 }));
                    var convertedPt = esri.geometry.geographicToWebMercator(geoPt);
                    this.mapInstance.centerAt(convertedPt);
                },

                /**
                 * Center and zoom the map on a given point.
                 *
                 * @method zoomToPoint
                 * @param {Point} pt - point to center and zoom to.
                 */
                zoomToPoint: function (pt) {
                    this.mapInstance.centerAndZoom(pt, 14);
                },

                /**
                 * Add a graphic to the map graphics layer.
                 *
                 * @method addGraphic
                 * @param {Graphic} graphic - feature to be added.
                 * @param {string} color - name of the color to use as a fill color.
                 */
                addGraphic: function (graphic, color) {
                    var symbol = this.getSymbol(graphic.geometry, color);
                    graphic.symbol = symbol;
                    this.mapInstance.graphics.add(graphic);
                },

                /**
                 * Add multiple graphics to the map graphics layer.
                 *
                 * @method addGraphics
                 * @param {Graphics[]} graphics - array of features to be added.
                 */
                addGraphics: function (graphics) {
                    if(graphics.length === 0) {
                        return;
                    }
                    var geometry = graphics[0].geometry;
                    var symbol = this.getSymbol(geometry);
                    for(var x = 0; x < graphics.length; x++) {
                        var g = graphics[x];
                        g.symbol = symbol;
                        this.mapInstance.graphics.add(g);
                    }
                },

                /**
                 * Set (change) the symbol of the given graphic.
                 *
                 * @method setSymbol
                 * @param {Graphic} graphic - the graphic whose symbol is to be set.
                 * @param {string} color - name of the color to use as a fill color.
                 */
                setSymbol: function(graphic, color) {
                    var symbol = this.getSymbol(graphic.geometry, color);
                    graphic.setSymbol(symbol);
                },

                /**
                 * Determine symbol for graphic based on supplied color and geometry type.
                 *
                 * @method getSymbol
                 * @param {Geometry} geometry - the geometry to be symbolized.
                 * @param {string} color - name of the color to use as a fill color.
                 * @returns {Symbol}
                 */
                getSymbol: function(geometry, color) {
                    var symbol, dojoColor;
                    color = (typeof color === "undefined") ? "cyan" : color;

                    switch (color) {
                        case "cyan": dojoColor = new dojo.Color([0, 255, 255, 0.50]); break;
                        case "yellow": dojoColor = new dojo.Color([255, 255, 0, 0.50]); break;
                        case "red": dojoColor = new dojo.Color([255, 0, 0, 0.25]); break;
                        case "green": dojoColor = new dojo.Color([0, 255, 0, 0.25]); break;
                        case "blue": dojoColor = new dojo.Color([0, 0, 255, 0.25]); break;
                        case "grey": dojoColor = new dojo.Color([117, 117, 117, 0.50]); break;

                    }

                    switch (geometry.type) {
                        case "point":
                            symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), dojoColor);
                            break;
                        case "polyline":
                            symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2);
                            break;
                        case "polygon":
                            symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 255, 255]), 3), dojoColor);
                            break;
                        case "extent":
                            symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([50, 50, 50]), 2), dojoColor);
                            break;
                        case "multipoint":
                            symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), dojoColor);
                            break;
                    }
                    return symbol;
                },

                /**
                 * Clear all graphics from map graphics layer
                 *
                 * @method clearGraphics
                 */
                clearGraphics: function () {
                    if (this.mapInstance !== null) {
                        if (this.mapInstance.graphics !== null) {
                            this.mapInstance.graphics.clear();
                        }
                    }
                }


            };  // End prototype

            /**
             * Get the singleton instance of the map.
             *
             * @method getInstance
             * @returns {Map}
             */
            MapModel.getInstance = function () {
                // summary:
                //      Gets an instance of the singleton
                if (instance === null) {
                    instance = new MapModel();
                }
                return instance;
            };

            return MapModel.getInstance();
        });
} ());