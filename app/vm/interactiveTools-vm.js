/**
 * Interactive selection tools.
 *
 * @class interactiveTools-vm
 */

(function () {

    "use strict";

    define([
        "dojo/dom-construct",
        "dojo/dom",
        "dojo/on",
        "dojo/text!app/views/interactiveTools-view.html",
        "app/helpers/layer-delegate",
        "app/models/map-model",
        "esri/toolbars/draw",

        "vendor/kendo/web/js/jquery.min",
        "vendor/kendo/web/js/kendo.web.min",
    ],
        function (dc, dom, on, view, layerDelegate, mapModel) {

            var InteractiveToolsVM = new function () {

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
                var qryCallback = null, qryErrback = null;

                /**
                 * Esri toolbar.
                 *
                 * @property tb
                 * @type {Toolbar}
                 */
                self.tb;

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
                 * Initialize the class.
                 *
                 * @method init
                 */
                self.init = function () {

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
                self.insertAfter = function (newElementName, elementName, callback, errback, queryUrl) {
                    // Save the callback methods for later
                    qryCallback = callback;
                    qryErrback = errback;
                    self.queryUrl = queryUrl;

                    // Place the controls
                    dc.create("div", {id: newElementName}, elementName, "after");
                    dc.place(view, newElementName, "first");

                    // Create a new instance of the draw toolbar and wire up the onDrawEnd event
                    self.tb = new esri.toolbars.Draw(mapModel.mapInstance);
                    dojo.connect(self.tb, "onDrawEnd", self.onDrawEnd);

                    // Wire up the clear selection button click event
                    $("#interactiveClearSelectionBtn").bind("click", self.clearSelection);

                    var listDivObj = $("#interactiveSelectVerticalList");
                    var kendoListView = listDivObj.data("kendoListView");

                    // Create the list view containing the tools.
                    if(kendoListView === undefined || kendoListView === null) {
                        self.selActions = [];
                        self.selActions.push({ image: "app/resources/img/i_draw_point.png", title: "Point of Interest", tool: esri.toolbars.Draw.POINT });
                        self.selActions.push({ image: "app/resources/img/i_draw_rect.png", title: "Area of Interest", tool: esri.toolbars.Draw.EXTENT });
                        self.selActions.push({ image: "app/resources/img/i_draw_poly.png", title: "Region of Interest", tool: esri.toolbars.Draw.POLYGON });
                        self.selActions.push({ image: "app/resources/img/i_draw_line.png", title: "Corridor of Interest", tool: esri.toolbars.Draw.POLYLINE });

                        listDivObj.kendoListView({
                            dataSource: {
                                data: self.selActions
                            },
                            selectable: "single",
                            change: self.onListSelectionChanged,
                            template: kendo.template($("#interactiveListTemplate").html())
                        });
                    }
                };

                /**
                 * Fired when user selects a tool item in the list view.
                 *
                 * @event change
                 * @param e - event arguments
                 */
                self.onListSelectionChanged = function () {
                    var selectedObj = this.select();
                    if(selectedObj === undefined || selectedObj === null) {
                        return;
                    }

                    var selIndex = $(selectedObj).index();
                    if(selIndex < 0) {
                        return;
                    }

                    // Activate the selected tool on the Esri toolbar
                    var item = self.selActions[selIndex];
                    self.tb.activate(item.tool);
                };

                /**
                 * Clear the selected graphics.
                 *
                 * @method clearSelection
                 */
                self.clearSelection = function () {
                    self.tb.deactivate();
                    mapModel.clearGraphics();
                    $("#interactiveSelectVerticalList").data("kendoListView").clearSelection();
                };

                /**
                 * Finish drawing and execute the spatial query.
                 *
                 * @event onDrawEnd
                 * @param {Geometry} geometry - geometry drawn by user.
                 */
                self.onDrawEnd = function(geometry) {
                    self.clearSelection();
                    // adding loading icon. vw
                    esri.show(dojo.byId("loading"));

                    layerDelegate.query(self.queryUrl, qryCallback, qryErrback, geometry, undefined, true);
                };
            };

            return InteractiveToolsVM;
        });
} ());