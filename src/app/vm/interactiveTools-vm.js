/**
 * Interactive selection tools.
 *
 * @class interactiveTools-vm
 */

(function() {

    "use strict";

    define([
            "dojo/dom-construct",
            "dojo/dom",
            "dojo/on",
            "dojo/topic",
            "dojo/text!app/views/interactiveTools-view.html",
            "app/helpers/layer-delegate",
            "app/models/map-model",
            "dijit/form/CheckBox",
            "app/config/interactiveToolConfig",
            "app/config/demographicConfig",
            "app/vm/demographic-vm",
            "esri/toolbars/draw",
            "esri/symbols/SimpleMarkerSymbol",
            "esri/symbols/SimpleFillSymbol",
            "esri/graphic"
        ],
        function(dc, dom, on, topic, view, layerDelegate, mapModel, CheckBox, interactiveToolConfig, demographicConfig, demographicVM, Draw, SimpleMarkerSymbol, SimpleFillSymbol, Graphic) {

            var InteractiveToolsVM = new function() {

                /**
                 * Store reference to module this object.
                 *
                 * @property self
                 * @type {*}
                 */
                var self = this;

                /**
                 * Store the callback methods passed in.
                 *
                 * @property qryCallback
                 * @type {*}
                 *
                 * @property qryErrback
                 * @type {*}
                 */
                var qryCallback = null,
                    qryErrback = null;

                /**
                 * Esri toolbar.
                 *
                 * @property toolbars
                 * @type {[Toolbar]}
                 */
                self.toolbars = [];

                /**
                 * Selection actions available to the user in the list view.
                 *
                 * @property selActions
                 * @type {Object}
                 */
                self.selActions;

                /**
                 * Stores the url passed in to query against.
                 *
                 * @property queryUrl
                 * @type {string}
                 */
                self.queryUrl = "";

                /**
                 * Initialize the class
                 *
                 * @method init
                 *
                 */
                self.init = function() {

                };

                /**
                 * Insert the interactive tools after elementName.
                 *
                 * @method insertAfter
                 * @param {string} newElementName - name for the div element to be created to house the tools.
                 * @param {string} elementName - name of the existing element to insert the tools after.
                 * @param {*} callback - callback method for results returned by spatial query.
                 * @param {*} errback - callback method for errors returned by spatial query.
                 * @param {string} queryUrl - map service URL to query.
                 */
                self.insertAfter = function(newElementName, elementName, callback, errback, queryUrl) {
                    // Save the callback methods for later
                    qryCallback = callback;
                    qryErrback = errback;
                    self.queryUrl = queryUrl;

                    // Place the controls
                    dc.create("div", {
                        id: newElementName
                    }, elementName, "after");
                    dc.place(view, newElementName, "first");

                    // Create a new instance of the draw toolbar and wire up the onDrawEnd event
                    for (var i = 0; i < mapModel.mapInstances.length; i += 1) {
                        self.toolbars.push(new Draw(mapModel.mapInstances[i]));
                        self.toolbars[i].on("draw-end", self.onDrawEnd);
                    }

                    topic.subscribe("MapLoaded", self.mapFrameLoaded);
                    topic.subscribe("RemoveAMap", self.mapFrameRemoved);

                    // Wire up the clear selection button click event
                    $("#interactiveClearSelectionBtn").bind("click", self.clearSelection);

                    var listDivObj = $("#interactiveSelectVerticalList");
                    var kendoListView = listDivObj.data("kendoListView");

                    // Create the list view containing the tools.
                    if (kendoListView === undefined || kendoListView === null) {
                        self.selActions = [];
                        self.selActions.push({
                            image: "app/resources/img/i_draw_point.png",
                            title: "Point of Interest",
                            tool: esri.toolbars.Draw.POINT
                        });
                        self.selActions.push({
                            image: "app/resources/img/i_draw_rect.png",
                            title: "Area of Interest",
                            tool: esri.toolbars.Draw.EXTENT
                        });
                        self.selActions.push({
                            image: "app/resources/img/i_draw_poly.png",
                            title: "Region of Interest",
                            tool: esri.toolbars.Draw.POLYGON
                        });
                        self.selActions.push({
                            image: "app/resources/img/i_draw_line.png",
                            title: "Corridor of Interest",
                            tool: esri.toolbars.Draw.POLYLINE
                        });

                        listDivObj.kendoListView({
                            dataSource: {
                                data: self.selActions
                            },
                            selectable: "single",
                            change: self.onListSelectionChanged,
                            template: kendo.template($("#interactiveListTemplate").html())
                        });
                    }

                    // Make sure the buffer options panel is not displayed on startup
                    $("#bufferOptions").css("display", "none");

                    //Set default checked state
                    $("#zoomSelection").prop("checked", true);

                    // Wire up the buffer checkbox change event
                    $("input#bufferSelection").change(self.bufferChange);

                    // Create the buffer units drop down list
                    $("#bufferUnit").kendoDropDownList({
                        dataTextField: "text",
                        dataValueField: "value",
                        dataSource: interactiveToolConfig.bufferUnits
                    });
                    $("#bufferUnit").getKendoDropDownList().select(interactiveToolConfig.selectedBufferUnitIndex ? interactiveToolConfig.selectedBufferUnitIndex : 0);

                    // Create the buffer distance text box
                    $("#bufferDistance").kendoNumericTextBox({
                        min: 0,
                        format: "#.#",
                        value: interactiveToolConfig.defaultBufferValue ? interactiveToolConfig.defaultBufferValue : 1
                    });
                };

                self.mapFrameLoaded = function(map) {
                    if (mapModel.mapInstances.length !== self.toolbars.length) {
                        self.toolbars.push(new Draw(mapModel.mapInstance));
                        self.toolbars[self.toolbars.length - 1].on("draw-end", self.onDrawEnd);
                    }
                };

                self.mapFrameRemoved = function() {
                    self.toolbars.pop();
                };

                /**
                 * Fired when user toggle the buffer checkbox - Toggle the display of the buffer options panel
                 *
                 * @method bufferChange
                 *
                 */
                self.bufferChange = function() {
                    if (dojo.byId("bufferSelection").checked) {
                        $("#bufferOptions").css("display", "block");
                    } else {
                        $("#bufferOptions").css("display", "none");
                    }
                };

                /**
                 * Fired when user selects a tool item in the list view.
                 *
                 * @event change
                 * @param e - event arguments
                 */
                self.onListSelectionChanged = function(e) {
                    var selectedObj = this.select();
                    if (selectedObj === undefined || selectedObj === null) {
                        return;
                    }

                    var selIndex = $(selectedObj).index();
                    if (selIndex < 0) {
                        return;
                    }

                    // Activate the selected tool on the Esri toolbar
                    var item = self.selActions[selIndex];
                    for (var i = 0; i < self.toolbars.length; i += 1) {
                        self.toolbars[i].activate(item.tool);
                    }

                    // disables/hides popup window when interactive summary tools are selected
                    mapModel.hideInfoWindow();
                };

                /**
                 * Clear the selected graphics.
                 *
                 * @method clearSelection
                 */
                self.clearSelection = function() {
                    for (var i = 0; i < self.toolbars.length; i += 1) {
                        self.toolbars[i].deactivate();
                    }
                    mapModel.clearGraphics();
                    $("#interactiveSelectVerticalList").data("kendoListView").clearSelection();
                };

                /**
                 * Finish drawing and execute the spatial query.
                 *
                 * @event onDrawEnd
                 * @param {Geometry} geometry - geometry drawn by user.
                 */
                self.onDrawEnd = function(evt) {
                    self.clearSelection();
                    // adding loading icon. vw
                    esri.show(dojo.byId("loading"));

                    $("#demACSSummaryOptionsRow").hide();
                    $("#demACSDataGrid").hide();
                    //$("#demTabStrip").css("visibility", "hidden");
                    $("#reportLoading").show();
                    demographicVM.resetComparisonDropdowns();
                    var censusUrl = demographicConfig.reports.blockGroups.censusRestUrl;
                    var censusCallback = demographicVM.interactiveSelectionQueryHandler;
                    var acsUrl = demographicConfig.reports.blockGroups.ACSRestUrl;
                    var acsCallback = demographicVM.interactiveSelectionQueryHandler;
                    var bufferGeometry = dojo.byId("bufferSelection").checked;

                    if (bufferGeometry) {
                        var unit = dojo.byId("bufferUnit").value;
                        var distance = dojo.byId("bufferDistance").value;

                        //buffer the geometry
                        layerDelegate.bufferQuery(distance, unit, evt.geometry).then(function(geometries) {

                            var displayFeatures = function(results) {
                                //add originally selected feature to the map
                                mapModel.addGraphics(results.features, "yellow", true);

                                var selectionSymbol = null;
                                var selectionGraphic = null;

                                //add original selection to map
                                if (evt.geometry.type === "point") {
                                    selectionSymbol = new SimpleMarkerSymbol(interactiveToolConfig.selectionPointSymbol);
                                } else {
                                    selectionSymbol = new SimpleFillSymbol(interactiveToolConfig.selectionSymbol);
                                }
                                selectionGraphic = new Graphic(evt.geometry, selectionSymbol);
                                mapModel.addGraphic(selectionGraphic, undefined, true, true);

                                //add buffer geometry to map
                                var bufferSymbol = new SimpleFillSymbol(interactiveToolConfig.bufferSymbol);
                                var graphic = new Graphic(geometries[0], bufferSymbol);
                                mapModel.addGraphic(graphic, undefined, true, true);
                            };

                            var queryOrigFeature = function(results) {
                                //call original callback
                                var type = "census";
                                if (Object.keys(results.features[0].attributes).length > 120) {
                                    type = "acs";
                                }

                                if (type === "acs") {
                                    acsCallback(results);
                                } else {
                                    censusCallback(results);
                                }

                                //perform query with original geometry
                                layerDelegate.query(censusUrl, displayFeatures, null, evt.geometry, undefined, true);
                                layerDelegate.query(acsUrl, displayFeatures, null, evt.geometry, undefined, true);
                            };

                            //perform query with buffered geometry
                            layerDelegate.query(censusUrl, queryOrigFeature, qryErrback, geometries[0], undefined, true);
                            layerDelegate.query(acsUrl, queryOrigFeature, qryErrback, geometries[0], undefined, true);
                            demographicVM.updateSelectionGraphic();
                        }, function(error) {
                            //error buffering - query without buffering
                            layerDelegate.query(censusUrl, censusCallback, qryErrback, evt.geometry, undefined, true);
                            layerDelegate.query(acsUrl, acsCallback, qryErrback, evt.geometry, undefined, true);
                            demographicVM.updateSelectionGraphic();
                        });
                    } else {
                        layerDelegate.query(censusUrl, censusCallback, qryErrback, evt.geometry, undefined, true);
                        layerDelegate.query(acsUrl, acsCallback, qryErrback, evt.geometry, undefined, true);



                        var selectionSymbol = null;
                        var selectionGraphic = null;

                        //add original selection to map
                        if (evt.geometry.type === "point") {
                            selectionSymbol = new SimpleMarkerSymbol(interactiveToolConfig.selectionPointSymbol);
                        } else {
                            selectionSymbol = new SimpleFillSymbol(interactiveToolConfig.selectionSymbol);
                        }
                        selectionGraphic = new Graphic(evt.geometry, selectionSymbol);
                        demographicVM.updateSelectionGraphic(selectionGraphic);
                    }

                };
            };

            return InteractiveToolsVM;
        });
}());
