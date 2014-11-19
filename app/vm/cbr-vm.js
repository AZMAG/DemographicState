/**
* Provides view-model implementation of the Thematic Maps module.
*
* @class ClassBreakRenderer
*/
(function () {

    "use strict";

    define([
        "dojo",
        "dojo/dom-construct",
        "dojo/topic",
        "app/config/cbrConfig",
        "app/vm/colorRamp-vm",
        "app/helpers/magNumberFormatter",
        "app/vm/classificationFactory-vm",
        "dojo/text!app/views/cbrHelp-view.html",
        "app/vm/help-vm",
        "dojo/text!app/views/cbr-view.html",
        "esri/tasks/GenerateRendererTask",
        "esri/layers/agsdynamic",

         "vendor/kendo/web/js/jquery.min",
        "vendor/kendo/web/js/kendo.web.min",
        "vendor/kendo/dataviz/js/kendo.dataviz.min",
    ],
        function (dj, dc, tp, conf, cRamp, magNum, custBreak, helpView, helpVM, view) {

            var CBRVM = new function () {

                var self = this;

                self.tocHTML = "";
                self.toc = "";
                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;
                //console.log("Height: " + self.winHeight + " & " + "Width: " + self.winWidth);
                self.newWindowWidth = self.winWidth;
                self.winVisible = true;

                    if (self.winWidth <= 668) {
                        self.newWindowWidth = "300px";
                        self.winVisible = false;
                    } else if (self.winWidth <= 800) {
                        self.newWindowWidth = "300px";
                        self.winVisible = false;
                    } else if (self.winWidth <= 1024) {
                        self.newWindowWidth = "300px";
                    } else if (self.winWidth <= 1200) {
                        self.newWindowWidth = "300px";
                    } else {
                        self.newWindowWidth = "318px";
                    }

                /**
                Title for the module's window

                @property windowTitle
                @type String
                **/
                self.windowTitle = "Maps";

                /**
                Initilization function for the module window.
                Configures all UI components using Kendo libraries, and binds all events and data sources.

                @method init
                @param {string} relatedElement - name of the element to attach the module window to.
                @param {string} relation - relationship of the window to the relatedElement.
                @param {map-model} map - the map model which the thematic layer will be added to.
                **/
                self.init = function (relatedElement, relation, map) {
                    dc.place(view, relatedElement, relation);

                    tp.subscribe("CBRStateO", function () { self.openWindow(); });
                    tp.subscribe("CBRStateC", function () { self.closeWindow(); });

                    tp.subscribe("NewColorRamp", function (event) { self.updateColorRamp(event); });
                    tp.subscribe("ClassBreakOptions", self.setBreaksList);
                    tp.subscribe("CustomBreaksUpdated", self.redrawThematicLayer);

                    var cbrWindow = $("#cbrWindow").kendoWindow({
                        width: self.newWindowWidth,
                        height: "auto",//425px
                        title: self.windowTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: self.winVisible,
                        resizable: false
                    }).data("kendoWindow");

                    var helpButton = cbrWindow.wrapper.find(".k-i-help");
                    helpButton.click(function () {
                        helpVM.openWindow(helpView);
                    });

                    // Initial window placement. vw
                    $("#cbrWindow").closest(".k-window").css({
                        top: 55,
                        left: 5
                    });

                    // attach collapse event handler during initialization. vw
                    $("#panelBar1").kendoPanelBar({
                        collapse: self.onCollapse,
                        expand: self.onExpand
                    }).data("kendoPanelBar");

                    self.colorRamp = $("#curColRamp").kendoColorPalette({
                        palette: ["#ddd1c3", "#d2d2d2", "#746153", "#3a4c8b", "#ffcc33", "#fb455f", "#ac120f"],
                        tileSize: 30,
                        columns: 7,
                        value: null,
                        change: self.colorPickerClicked
                    }).data("kendoColorPalette");

                    self.toc = $("#thematicTOC").kendoTreeView({
                        dataSource: conf.thematicMaps,
                        dataTextField: "ShortName",
                        select: self.mapSelected,
                        change: self.mapSelectionChanged
                    }).data("kendoTreeView");
                    self.toc.select(".k-item:first");
                    var dataItem = self.toc.dataItem(self.toc.select());
                    var currNode = self.toc.select()[0];
                    if (dataItem.NodeType === "cat") {
                        self.toc.select(currNode.children[1].firstChild);
                        self.toc.expand(currNode);
                    }

                    self.breaksCountList = $("#breaksCount").kendoDropDownList({
                        dataSource: [
                            1,
                            2,
                            3,
                            4,
                            5
                        ],
                        change: self.breaksCountSelected
                    }).data("kendoDropDownList");

                    self.classMethodList = $("#classScheme").kendoDropDownList({
                        dataSource: [
                            { Name: "Natural Breaks", Value: "natural-breaks"},
                            { Name: "Equal Interval", Value: "equal-interval" },
                            { Name: "Quantile", Value: "quantile" },
                            { Name: "Custom", Value: "custom" }
                        ],
                        dataTextField: "Name",
                        dataValueField: "Value",
                        change: self.classMethodChange
                    }).data("kendoDropDownList");

                    $("#editCustom").click(function () {
                        self.classMethodList.select(function (item) { return item.Value === "custom"; });
                        tp.publish("ClassificationMethodChanged", self.currentRenderer);
                    });

                    self.map = map;

                    cRamp.init(relatedElement, relation, "Sequential", "YlGn", "5");
                    custBreak.init(relatedElement, relation);
                    self.ReadyToRender = true;
                    self.updateRenderer();
                    self.mapSelectionChanged();
                    self.simpleFillSymbol = new esri.symbol.SimpleFillSymbol(
                        esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                        new esri.symbol.SimpleLineSymbol(
                            esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                            new dojo.Color([0, 0, 0]),
                            0.5
                        ),
                        new dojo.Color([175, 175, 175])
                    );
                }; //end int
//****************************************************************
                /**
                Method for opening the window.

                @method openWindow
                **/
                self.openWindow = function () {
                    var win = $("#cbrWindow").data("kendoWindow");
                        win.restore();
                        win.open();

                        $("#cbrWindow").closest(".k-window").css({
                          top: 55,
                          left: 5
                        });
                };

                self.closeWindow = function () {
                  var win = $("#cbrWindow").data("kendoWindow");
                    win.close();
                };

                // change window location when window resized
                self.winResize = function () {
                  $("#cbrWindow").closest(".k-window").css({
                      top: 55,
                      left: 5
                    });
                };

                var resizeTimer;
                  $(window).resize(function() {
                  clearTimeout(resizeTimer);
                  resizeTimer = setTimeout(self.winResize, 200);
                });

                //removes selected state from Advanced Map Options Panel vw
                self.onCollapse = function (e) {
                    $(e.item).children().removeClass("k-state-selected");
                };
                self.onExpand = function (e) {
                    $(e.item).children().removeClass("k-state-selected");
                };

                /**
                Method for updating the class break renderer.
                Triggered whenever renderer parameters have changed, such as number of breaks, classification method or classification field.

                @method updateRenderer
                **/
                self.updateRenderer = function () {
                    if (self.ReadyToRender !== true) {
                        return;
                    }
                    var thematicMap = self.toc.dataItem(self.toc.select());
                    var classDef = new esri.tasks.ClassBreaksDefinition();
                    classDef.classificationField = thematicMap.FieldName;
                    if (thematicMap.hasOwnProperty("NormalizeField")) {
                        classDef.normalizationField = thematicMap.NormalizeField;
                        classDef.normalizationType = "field";
                    }
                    if (self.classMethodList.dataItem().Value === "custom") {
                        classDef.classificationMethod = "natural-breaks";
                    }
                    else {
                        classDef.classificationMethod = self.classMethodList.dataItem().Value;
                    }
                    classDef.breakCount = self.breaksCountList.dataItem();
                    var params = new esri.tasks.GenerateRendererParameters();
                    params.classificationDefinition = classDef;

                    var mapServiceUrl = conf.mapServices[thematicMap.Service] + "/" + thematicMap.LayerId;
                    var generateRenderer = new esri.tasks.GenerateRendererTask(mapServiceUrl);
                    generateRenderer.execute(params, self.applyRenderer, self.rendererGenError);
                };

                /**
                Method to apply the class break renderer to the thematic layer.
                Triggered when the renderer has been updated or when the color ramp has been modified.

                @method applyRenderer
                **/
                self.applyRenderer = function (renderer) {
                    for (var i = 0; i < self.CurrentRamp.length; i++) {
                        renderer.infos[i].symbol.color = dojo.colorFromRgb(self.CurrentRamp[i]);
                    }

					// note: this applies symbology for No Data class, does not work with normalization
					renderer.defaultSymbol = self.simpleFillSymbol;
					renderer.defaultLabel = "No Data";

                    var dataItem = self.toc.dataItem(self.toc.select());
                    renderer.asPercent = dataItem.AsPercentages;
                    self.currentRenderer = renderer;
                    if (self.classMethodList.dataItem().Value === "custom") {
                        tp.publish("ClassificationMethodChanged", self.currentRenderer);
                    }
                    else {
                        self.redrawThematicLayer();
                    }
                };

                /**
                Method to refresh the thematic layer after the renderer has been applied.

                @method redrawThematicLayer
                **/
                self.redrawThematicLayer = function () {
                    var layerOption = new esri.layers.LayerDrawingOptions();
                    layerOption.renderer = self.currentRenderer;
                    for (var j = 0; j < layerOption.renderer.infos.length; j++){
                        var start;
                        var end;
                        if (layerOption.renderer.asPercent) {
                            start = Math.round(layerOption.renderer.infos[j].minValue * 100);
                            end = Math.round(layerOption.renderer.infos[j].maxValue * 100) + "%";
                        }
                        else {
                            start = magNum.formatValue(Math.round(layerOption.renderer.infos[j].minValue));
                            end = magNum.formatValue(Math.round(layerOption.renderer.infos[j].maxValue));
                        }
                        layerOption.renderer.infos[j].label = start + " - " + end;
                    }

                    var layerOptions = [layerOption];

                    for (var mapService in conf.mapServices) {
                        var layerObj = self.map.getLayer(mapService);
                        layerObj.visible = false;
                    }

                    var thematicLayer = self.map.getLayer(self.toc.dataItem(self.toc.select()).Service);
                    thematicLayer.setLayerDrawingOptions(layerOptions);
                    thematicLayer.visible = true;
                    //thematicLayer.refresh();
                    tp.publish("renderUpdated");
                };

                /**
                Method for handling a change in the classification method dropdown.

                @method classMethodChange
                @param {event} e - window event data, not used within this method.
                **/
                self.classMethodChange = function () {
                    var classMethod = self.classMethodList.dataItem().Value;
                    if (classMethod === "custom") {
                        tp.publish("ClassificationMethodChanged", self.currentRenderer);
                    }
                    else {
                        self.updateRenderer();
                    }
                };

                /**
                Method for handling a change in the thematic maps list selection when the selected item is a group node.

                @method mapSelected
                @param {event} e - window event data, including "node" property used for determining the selected data item.
                **/
                self.mapSelected = function (e) {
                    var dataItem = self.toc.dataItem(e.node);
                    if (dataItem.NodeType === "cat") {
                        self.toc.select(e.node.children[1].firstChild);
                        self.toc.expand(e.node);
                        e.preventDefault();
                    }
                };

                /**
                Method for handling a change in the thematic maps list selection.

                @method mapSelectionChanged
                **/
                self.mapSelectionChanged = function () {
                    var dataItem = self.toc.dataItem(self.toc.select());
                    tp.publish("NewMapSelected", dataItem);
                    if (dataItem.hasOwnProperty("DefaultBreaks")) {
                        self.ReadyToRender = false;
                        self.breaksCountList.select(function (item) { return item === dataItem.DefaultBreaks.length; });
                        tp.publish("SetNumBreaks", dataItem.DefaultBreaks.length);
                        var newRenderer = new esri.renderer.ClassBreaksRenderer(null, dataItem.FieldName);
                        if (dataItem.hasOwnProperty("NormalizeField")) {
                            newRenderer.normalizationField = dataItem.NormalizeField;
                            newRenderer.normalizationType = "field";
                        }
                        newRenderer.infos = dataItem.DefaultBreaks;
                        for (var i = 0; i < newRenderer.infos.length; i++) {
                            newRenderer.infos[i].classMaxValue = newRenderer.infos[i].maxValue;
                            newRenderer.infos[i].symbol = new esri.symbol.SimpleFillSymbol(
                              esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                              new esri.symbol.SimpleLineSymbol(
                                esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                                new dojo.Color([0, 0, 0]),
                                0.5
                              ),
                              new dojo.Color([175, 175, 175])
                            );
                        }
                        self.classMethodList.select(function (item) { return item.Value === "custom"; });
                        self.ReadyToRender = true;
                        self.applyRenderer(newRenderer);
                    }
                    else {
                        self.updateRenderer();
                    }
                };

                /**
                Method for handling a click event on the color ramp control.

                @method colorPickerClicked
                @param {event} e - Event data for the click event.
                **/
                self.colorPickerClicked = function () {
                    self.colorRamp.value(null);
                    tp.publish("SelectColorRamp", null);
                };

                /**
                Method for handling a selection in the breaks count dropdown control.

                @method breaksCountSelected
                @param {event} e - Event data for the click event.
                **/
                self.breaksCountSelected = function (e) {
                    var dataItem = self.breaksCountList.dataItem(e.node);
                    tp.publish("SetNumBreaks", dataItem);
                };


                /**
                Method for setting the list of possible breaks based on the selected color ramp.

                @method setBreaksList
                @param {array} breaksList - List of numbers representing the options for "number of breaks"
                **/
                self.setBreaksList = function (breaksList) {
                    var currentSelection = self.breaksCountList.dataItem();
                    self.breaksCountList.setDataSource(breaksList);
                    if (breaksList.indexOf(currentSelection) !== -1) {
                        self.breaksCountList.select(function (dataItem) { return dataItem === currentSelection; });
                    }
                    else {
                        tp.publish("SetNumBreaks", self.breaksCountList.dataItem());
                    }
                };

                /**
                Method for updating the color ramp.

                @method updateColorRamp
                @param {array} newRamp - Array of colors representing the new color ramp
                **/
                self.updateColorRamp = function (newRamp) {
                    self.CurrentRamp = newRamp;
                    var colorChangeOnly = (typeof (self.currentRenderer) !== "undefined") && (self.CurrentRamp.length === self.currentRenderer.infos.length);
                    dc.destroy("rampPad");
                    dc.place("<div id=\"rampPad\" style=\"padding: 2px\"><div id=\"curColRamp\" title=\"Pick a color scheme\" style=\"width: 250px\"></div></div>", "breaksControl");
                    var tileSize = 280 / newRamp.length;
                    tileSize = Math.min(tileSize, 30);
                    self.colorRamp = $("#curColRamp").kendoColorPalette({
                        palette: newRamp,
                        tileSize: tileSize,
                        columns: newRamp.length,
                        value: null,
                        change: self.colorPickerClicked
                    }).data("kendoColorPalette");
                    self.breaksCountList.select(function (dataItem) { return dataItem === newRamp.length; });
                    if (colorChangeOnly) {
                        for (var i = 0; i < self.CurrentRamp.length; i++) {
                            self.currentRenderer.infos[i].symbol.color = dojo.colorFromRgb(self.CurrentRamp[i]);
                        }
                        self.redrawThematicLayer();
                    }
                    else {
                        self.updateRenderer();
                    }
                };

            }; //end CBRVM
            return CBRVM;
        } //end function
    );

} ());