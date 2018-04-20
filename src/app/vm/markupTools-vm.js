/**
 * Markup Tools Window
 *
 * @class markupTools-vm
 */

(function() {

    "use strict";

    define([
            "dojo",
            "dojo/dom-construct",
            "dojo/topic",
            "app/vm/alert3-vm",
            "dojo/_base/array",
            "esri/toolbars/draw",
            "esri/graphic",
            "esri/layers/GraphicsLayer",
            "esri/toolbars/edit",
            "dojo/text!app/views/markupToolsHelp-view.html",
            "app/vm/help-vm",
            "dojo/text!app/views/markupTools-view.html",
            "app/models/map-model",
            "esri/Color",
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/TextSymbol",
            "esri/symbols/Font"
        ], function(
            dj,
            dc,
            tp,
            alertVM,
            array,
            Draw,
            Graphic,
            GraphicsLayer,
            Edit,
            helpView,
            helpVM,
            view,
            mapModel,
            Color,
            SimpleFillSymbol,
            SimpleLineSymbol,
            TextSymbol,
            Font) {

            var markupToolsVM = new function() {

                var self = this;

                self.isMarkupToolActive = ko.observable(false);
                self.activeMarkupTool = ko.observable("");
                self.markupToolsKendoTree = "";
                self.markupToolNodeSelections = ko.observableArray();
                self.markupToolDraw = null;

                self.markupGraphicLayers = [{
                    id: "map1",
                    graphicsList: [],
                    graphicsLayer: null,
                    selector: "markupToolsGraphicsMap1"
                }, {
                    id: "map2",
                    graphicsList: [],
                    graphicsLayer: null,
                    selector: "markupToolsGraphicsMap2"
                }, {
                    id: "map3",
                    graphicsList: [],
                    graphicsLayer: null,
                    selector: "markupToolsGraphicsMap3"
                }, {
                    id: "map4",
                    graphicsList: [],
                    graphicsLayer: null,
                    selector: "markupToolsGraphicsMap4"
                }];

                // Edit Markup Graphics settings
                self.isEditingActive = ko.observable(false);
                self.markupToolEdit = null;
                self.markupGraphicClickHandler = null;
                self.isDeleteGraphicActive = ko.observable(false);
                // Markup tool settings
                self.fillColorSelection = null;
                self.outlineColorSelection = null;
                self.fontSize = 12; // Default the font size to 12
                self.textInput = ko.observable("");
                self.allMaps = false;

                // Kendo Window dimensions and location
                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;
                self.newWindowWidth = self.winWidth;
                self.isThisWindowVisible = false;
                self.winTopLocation = 55;
                self.winLeftAligned = false;
                self.winLocation = 2;
                self.setWindowLocation = function() {
                    self.winWidth = document.documentElement.clientWidth;
                    self.winHeight = document.documentElement.clientHeight;
                    if (self.winWidth <= 668) {
                        self.newWindowHeight = 5;
                        self.newWindowWidth = "224px";
                        self.winVisible = false;
                        self.winLocation = 5;
                    } else if (self.winWidth <= 800) {
                        self.newWindowHeight = 50;
                        self.newWindowWidth = "224px";
                        self.winVisible = false;
                        self.winLocation = 5;
                        self.winTopLocation = 55;
                    } else if (self.winWidth <= 1024) {
                        self.newWindowHeight = 250;
                        self.newWindowWidth = "224px";
                        self.winLocation = 5;
                        self.winTopLocation = 55;
                    } else if (self.winWidth <= 1200) {
                        self.newWindowWidth = "224px";
                        self.winLocation = 5;
                        self.winTopLocation = 55;
                    } else {
                        self.newWindowHeight = 250;
                        self.newWindowWidth = "224px";
                        self.winLocation = 5;
                        self.winTopLocation = 250;
                    }
                };

                /**
                Title for the module's window
                @property windowTitle
                @type String
                **/
                self.windowTitle = "Markup Tools";

                /**
                Initilization function for the module window.
                Configures all UI components using Kendo libraries, and binds all events and data sources.
                @method init
                @param {string} relatedElement - name of the element to attach the module window to.
                @param {string} relation - relationship of the window to the relatedElement.
                **/
                self.init = function(relatedElement, relation) {
                    dc.place(view, relatedElement, relation);
                    ko.applyBindings(self, dojo.byId("markupToolsLauncher"));

                    self.setWindowLocation();

                    tp.subscribe("MarkupToolsStateO", function() {
                        self.openWindow();
                    });
                    tp.subscribe("MarkupToolsStateC", function() {
                        self.closeWindow();
                    });

                    // Initialize Kendo Window Object
                    var markupToolsWindow = $("#markupToolsLauncher").kendoWindow({
                        width: self.newWindowWidth,
                        height: "auto", //425px
                        title: self.windowTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: self.isThisWindowVisible,
                        resizable: false
                    }).data("kendoWindow");

                    //Initialize the transparency slider
                    var mtSlider = $("#mtSlider").kendoSlider({
                        increaseButtonTitle: "Decrease",
                        decreaseButtonTitle: "Increase",
                        min: 0,
                        max: 1,
                        smallStep: 0.1,
                        largeStep: 0.01,
                        value: 0.8,
                        change: self.sliderChange,
                        slide: self.sliderChange,
                        visible: true
                    }).data("kendoSlider");

                    // Set Kendo Window Help
                    var helpButton = markupToolsWindow.wrapper.find(".k-i-help");
                    helpButton.click(function() {
                        helpVM.openWindow(helpView);
                    });


                    // Initialize Kendo Window placement
                    $("#markupToolsLauncher").closest(".k-window").css({
                        top: "55px",
                        left: "76%"
                    });

                    // Initialize the Markup/Drawing Tool's Kendo Tree Nodes
                    self.markupToolsKendoTree = $("#markupToolsKendoTree").kendoTreeView({
                        dataSource: appConfig.markupToolTreeNodes,
                        dataTextField: "DisplayText",
                        dataBound: function(e) {
                            e.sender.element.find("span.k-in").css("cursor", "pointer");
                            e.sender.element.find("img.k-image").css("height", "23px");
                        }
                    }).data("kendoTreeView");
                    // IMPORTANT: Over-ride the Kendo Treeview click event in order to be able to deactivate it.
                    $("#markupToolsKendoTree").on("click", ".k-item", function(e) {
                        self.onMarkupToolSelection();
                    });

                    // Initialize Drawing Tools
                    self.markupToolDraw = new Draw(mapModel.mapInstance, {
                        showTooltips: true,
                        tooltipOffset: 10
                    });
                    self.markupToolDraw.on("draw-end", self.addMarkupToolGraphicToMap);

                    // Intialize the Fill and Outline Color Picker / Kendo Color Palette
                    self.fillColorPalette = $("#fillKendoColorPalette").kendoColorPalette({
                        palette: appConfig.fillColorPalette,
                        tileSize: 20,
                        columns: 10,
                        //opacity: true,
                        value: appConfig.fillColorPalette[0],
                        change: self.onFillColorPaletteSelection
                    }).data("kendoColorPalette");
                    self.fillColorSelection = kendo.parseColor(appConfig.fillColorPalette[0]);

                    self.outlineColorPalette = $("#outlineKendoColorPalette").kendoColorPalette({
                        palette: appConfig.outlineColorPalette,
                        tileSize: 20,
                        columns: 10,
                        //opacity: true,
                        value: appConfig.outlineColorPalette[0],
                        change: self.onOutlineColorPaletteSelection
                    }).data("kendoColorPalette");
                    self.outlineColorSelection = kendo.parseColor(appConfig.outlineColorPalette[0]);

                    // Intialize font size / Kendo Dropdown
                    self.fontSizeList = $("#markupToolFontSize").kendoDropDownList({
                        dataSource: appConfig.textSymbolFontSizes,
                        change: self.onFontSizeSelection, //NOT fired when changed in code
                        cascade: function(e) {} // fired when changed in code and user interaction
                    }).data("kendoDropDownList");

                }; //end int


                //***********************Kendo Widget functions*****************************

                /**
                Method for opening the Kendo Window.
                @method openWindow
                **/
                self.openWindow = function() {
                    var win = $("#markupToolsLauncher").data("kendoWindow");
                    win.restore();
                    win.open();

                    // <!-- comments:uncomment // -->
                    // ga('send', 'event', 'Click', 'Opened Window', 'Markup Window');
                    // <!-- endcomments -->

                    $("#markupToolsLauncher").closest(".k-window").css({
                        top: "55px",
                        left: "76%"
                    });

                    $("#markupToolTextInput").change(function() {
                        if (self.isEditingActive()) {
                            if (self.markupToolEdit._graphic !== null) {
                                self.updateGraphicSymbol();
                            }
                        }
                    });
                };

                /**
                Method for handling the transparency slider change
                @method sliderChange
                **/
                self.sliderChange = function(evt) {
                    if (self.isEditingActive()) {
                        if (self.markupToolEdit._graphic !== null) {
                            self.updateGraphicSymbol();
                        }
                    }
                };

                /**
                Method for opening the Kendo Window.
                @method openWindow
                **/
                self.closeWindow = function() {
                    var win = $("#markupToolsLauncher").data("kendoWindow");
                    win.close();
                };

                /**
                Method to change window location when window resized
                @method winResize
                **/
                self.winResize = function() {
                    self.setWindowLocation();
                    $("#markupToolsLauncher").closest(".k-window").css({
                        top: "55px",
                        left: "76%"
                    });
                };

                var resizeTimer;
                $(window).resize(function() {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(self.winResize, 200);
                });

                /**
                Method for handling a change in markup-tool selection.
                @method onMarkupToolSelection
                **/
                self.onMarkupToolSelection = function() {
                    try {
                        self.markupToolDraw.deactivate();
                    } catch (error) {
                        console.log(error);
                    }

                    //recreate new draw tool
                    self.markupToolDraw = new Draw(mapModel.mapInstance, {
                        showTooltips: true,
                        tooltipOffset: 10
                    });

                    //Add event to end of drawing to add shape to map
                    self.markupToolDraw.on("draw-end", self.addMarkupToolGraphicToMap);
                    
                    //Loop through and create a graphic layer for each map
                    $.each(mapModel.mapInstances, function(index, mapInstance) {
                        var graphicLayerConfig = self.getMapConfigById(mapInstance.id);

                        if (graphicLayerConfig.graphicsLayer === null) {
                            graphicLayerConfig.graphicsLayer = new GraphicsLayer({
                                id: graphicLayerConfig.selector
                            });
                            mapInstance.addLayer(graphicLayerConfig.graphicsLayer);
                            graphicLayerConfig.graphicsLayer.clear();
                            graphicLayerConfig.graphicsLayer.on("graphic-draw", self.refreshRectangles);
                        }
                    });

                    //Check if tool is selected.  If so, deactivate. Otherwise, activate markup tool.
                    var selectedNode = self.markupToolsKendoTree.select();
                    if (selectedNode) {
                        var dataItem = self.markupToolsKendoTree.dataItem(selectedNode);
                        if (dataItem) {
                            // Check if markup tool is already active
                            if (self.isMarkupToolActive()) {
                                var currentActiveTool = self.activeMarkupTool();
                                var newActiveTool = dataItem.text;
                                if (currentActiveTool == newActiveTool) {
                                    // Shut off current active tool
                                    self.deactivateMarkupTool();
                                } else {
                                    self.activateMarkupTool(dataItem);
                                }
                            } else {
                                self.activateMarkupTool(dataItem);
                            }
                        }
                    } else {
                        self.isMarkupToolActive(false);
                        self.activeMarkupTool("");
                    }
                };

                /**
                Method for handling a change in markup-tool's fill color selection.
                * @method activateMarkupTool
                * @param {dataItem} Kendo Tree Node.
                **/
                self.activateMarkupTool = function(dataItem) {
                    mapModel.hideInfoWindow();
                    self.isMarkupToolActive(true);
                    self.activeMarkupTool(dataItem.text);
                    self.markupToolDraw.activate(Draw[dataItem.Type]);
                };

                /**
                 * Turns the Draw Tools off (i.e. set to inactive).
                 * @method deactivateMarkupTool
                 */
                self.deactivateMarkupTool = function(e) {
                    mapModel.showInfoWindow();
                    self.markupToolDraw.deactivate();

                    var selectedNode = self.markupToolsKendoTree.select();
                    if (selectedNode) {
                        self.markupToolsKendoTree.select($());
                    }

                    self.isMarkupToolActive(false);
                    // self.activeMarkupTool("");
                };

                /**
                Method for handling a change in markup-tool's fill color selection.
                @method onFillColorPaletteSelection
                **/
                self.onFillColorPaletteSelection = function(e) {
                    if (e) {
                        self.fillColorSelection = kendo.parseColor(e.value);
                        if (self.isEditingActive()) {
                            if (!self.markupToolEdit._isTextPoint) {
                                self.updateGraphicSymbol();
                            } else {
                                self.updateTextSymbol();
                            }
                        }
                    }
                };

                /**
                Method for handling a change in markup-tool's fill color selection.
                @method onFillColorPaletteSelection
                **/
                self.onOutlineColorPaletteSelection = function(e) {
                    if (e) {
                        self.outlineColorSelection = kendo.parseColor(e.value);
                        if (self.isEditingActive()) {
                            if (self.markupToolEdit._graphic !== null) {
                                self.updateGraphicSymbol();
                            }
                        }
                    }
                };

                /**
                Method for handling a change in markup-tool's text font size.
                @method onFontSizeSelection
                **/
                self.onFontSizeSelection = function(e) {
                    if (e) {
                        self.fontSize = self.fontSizeList.dataItem(e.node);
                        if (self.isEditingActive()) {
                            if (self.markupToolEdit._graphic !== null) {
                                self.updateTextSymbol();
                            }
                        }
                    }
                };

                self.updateGraphicSymbol = function() {
                    var fill = self.fillColorSelection;
                    var outline = self.outlineColorSelection;
                    var slider = $("#mtSlider").getKendoSlider();
                    var fillColorOpacity = slider.value();

                    var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([outline.r, outline.g, outline.b]), 3), new Color([fill.r, fill.g, fill.b, fillColorOpacity]));

                    self.markupToolEdit._graphic.setSymbol(symbol);
                };

                self.updateTextSymbol = function() {
                    var fill = self.fillColorSelection;

                    var textSymbol = new TextSymbol(self.textInput()).setColor(new Color([fill.r, fill.g, fill.b, 1]));
                    var font = new Font();
                    font.setSize(self.fontSize.toString() + "pt");
                    textSymbol.setFont(font);

                    self.markupToolEdit._graphic.setSymbol(textSymbol);
                };

                /**
                Method for handling a change in markup-tool selection.
                @method addMarkupToolGraphicToMap
                **/
                self.addMarkupToolGraphicToMap = function(evt) {

                    // Save the graphics
                    var geometryType = self.markupToolDraw._geometryType;

                    if (geometryType === "point" && self.textInput() === "") {
                        $("#a2").html("Please enter text before trying to add a textbox.");
                        alertVM.openWindow();
                        document.getElementById("markupToolTextInput").style.borderColor = "red";
                    } else {
                        // Set the markup tool symbology based on the geometry type
                        var markupSymbology = self.getSymbol(geometryType);
                        if (markupSymbology) {
                            var graphicObj = new Graphic(evt.geometry, markupSymbology);

                            $.each(mapModel.mapInstances, function(index, mapInstance) {
                                var graphicLayerConfig = self.getMapConfigById(mapInstance.id);

                                if (graphicLayerConfig.graphicsLayer !== null) {
                                    var graphic = new Graphic(evt.geometry, markupSymbology);
                                    graphicLayerConfig.graphicsLayer.add(graphic);
                                    graphicLayerConfig.graphicsList.push(graphic);
                                }
                            });

                            self.deactivateMarkupTool();
                        }
                        document.getElementById("markupToolTextInput").style.borderColor = "";
                    }
                };

                /**
                Method for refreshing the textbox rectangles
                @method refreshRectangles
                **/
                self.refreshRectangles = function(evt) {
                    if (evt.node.nodeName === "text") {
                        self.removeAllRectangles();
                        self.addRectangles();
                    }
                };

                /**
                Method for removing the textbox rectangles.  This uses d3.js
                @method removeAllRectangles
                **/
                self.removeAllRectangles = function() {
                    $.each(self.markupGraphicLayers, function(index, graphicsLayer) {
                        var rectangleCollection = d3.select("#" + graphicsLayer.selector + "_layer").selectAll("rect");
                        rectangleCollection.remove();
                    });
                };

                /**
                Method for adding the textbox rectangles.  This uses d3.js
                @method addRectangles
                **/
                self.addRectangles = function() {
                    $.each(self.markupGraphicLayers, function(index, graphicsLayer) {
                        var svgContainer = d3.select("#" + graphicsLayer.selector + "_layer").select("g");
                        var calloutCollection = d3.select("#" + graphicsLayer.selector + "_layer").selectAll("text");
                        calloutCollection.each(function(d, i) {
                            var drawnObject = this.getBBox();
                            var rectangle = svgContainer.insert("rect", "path.data")
                                .attr("x", drawnObject.x - 5)
                                .attr("y", drawnObject.y - (drawnObject.height / 2))
                                .attr("width", drawnObject.width + (10))
                                .attr("height", drawnObject.height * 2)
                                .style("fill", "#fff")
                                .style("fill-opacity", ".95")
                                .style("stroke", "#666")
                                .style("stroke-width", "1.5px");
                        });
                    });
                };

                /**
                 * Determine symbol for graphic based on supplied color and geometry type.
                 *
                 * @method getSymbol
                 * @param {string} geometryType - the geometry type symbolize.
                 * @returns {Symbol}
                 */
                self.getSymbol = function(geometryType) {
                    var markupSymbology = null,
                        fillColor = null,
                        outlineColor = null,
                        textColor = null;
                    var slider = $("#mtSlider").getKendoSlider();
                    var fillColorOpacity = slider.value();

                    // Check if a fill and/or outline Kendo Color Palette selection was made
                    if (self.fillColorSelection) {
                        // Set the the fill opacity value to half (0.50), so layers behind the markup tool can be visible
                        fillColor = new Color([self.fillColorSelection.r, self.fillColorSelection.g, self.fillColorSelection.b,
                            fillColorOpacity
                        ]);
                        textColor = new Color([self.fillColorSelection.r, self.fillColorSelection.g, self.fillColorSelection.b,
                            appConfig.outlineColorOpacity
                        ]);
                    } else { // Default color is Cyan
                        fillColor = new Color([0, 255, 255, fillColorOpacity]);
                        textColor = new Color([0, 255, 255, appConfig.outlineColorOpacity]);
                    }
                    if (self.outlineColorSelection) {
                        // Set the the fill opacity value to half (0.50), so layers behind the markup tool can be visible
                        outlineColor = new Color([self.outlineColorSelection.r, self.outlineColorSelection.g, self.outlineColorSelection.b,
                            appConfig.outlineColorOpacity
                        ]);
                    } else { // Default color is Cyan
                        outlineColor = new Color([0, 255, 255, appConfig.outlineColorOpacity]);
                    }

                    // Define the Markup Tool's symbology
                    if (["polygon", "freehandpolygon", "circle", "arrow"].indexOf(geometryType) > -1) {
                        markupSymbology = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, outlineColor, 3), fillColor);
                    } else if (["line", "polyline"].indexOf(geometryType) > -1) {
                        markupSymbology = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, outlineColor, 2);
                    } else if (["point"].indexOf(geometryType) > -1) {

                        // Create a TextSymbol to place when a map point is created
                        var textSymbol = new TextSymbol(self.textInput()).setColor(textColor);
                        var font = new Font();
                        font.setSize(self.fontSize.toString() + "pt");
                        textSymbol.setFont(font);
                        markupSymbology = textSymbol;
                    }

                    return markupSymbology;
                };

                /**
                Method for clearing markup graphics from the map.
                @method clearMarkupGraphics
                **/
                self.clearMarkupGraphics = function() {
                    if (self.markupToolGraphicsLayer) {
                        self.markupToolGraphicsLayer.clearGraphics();
                    }
                };

                /**
                Method for clearing the last markup graphic from the map
                @method undoLastMarkupGraphic
                */
                self.undoLastMarkupGraphic = function() {
                    self.isEditingActive(false);
                    if (self.markupGraphicClickHandler) {
                        self.markupGraphicClickHandler.remove();
                    }
                    if (self.markupToolEdit) {
                        self.markupToolEdit.deactivate();
                    }
                    
                    mapModel.showInfoWindow();

                    $.each(mapModel.mapInstances, function(index, mapInstance) {
                        var graphicLayerConfig = self.getMapConfigById(mapInstance.id);
                        if (graphicLayerConfig.graphicsLayer !== null) {
                            graphicLayerConfig.graphicsList.pop();
                            graphicLayerConfig.graphicsLayer.clear();
                            $.each(graphicLayerConfig.graphicsList, function(index, value) {
                                graphicLayerConfig.graphicsLayer.add(value);
                            });
                        }
                    });

                    self.removeAllRectangles();
                    self.addRectangles();
                };

                /**
                Method fired when edit button is clicked in markup tools window.  This addes the click handler and activates the button.
                @method editGraphics
                */
                self.editGraphics = function() {
                    if (self.isEditingActive()) {
                        mapModel.showInfoWindow();
                        self.isEditingActive(false);
                        if (self.markupGraphicClickHandler) {
                            self.markupGraphicClickHandler.remove();
                        }
                        self.markupToolEdit.deactivate();
                    } else {
                        self.isEditingActive(true);
                        mapModel.hideInfoWindow();
                        if (self.isDeleteGraphicActive()) {
                            self.isDeleteGraphicActive(false);
                            if (self.markupGraphicClickHandler) {
                                self.markupGraphicClickHandler.remove();
                            }
                        }
                        var mapId = mapModel.getMap().id;
                        var graphicLayerConfig = self.getMapConfigById(mapId);
                        self.markupGraphicClickHandler = graphicLayerConfig.graphicsLayer.on("click", self.editGraphicClicked);
                    }
                };

                /**
                Method fired when delete button is clicked in markup tools window.  This addes the click handler and activates the button.
                @method deleteGraphics
                */
                self.deleteGraphics = function() {

                    if (self.isDeleteGraphicActive()) {
                        mapModel.showInfoWindow();
                        self.isDeleteGraphicActive(false);
                        if (self.markupGraphicClickHandler) {
                            self.markupGraphicClickHandler.remove();
                        }
                    } else {
                        self.isDeleteGraphicActive(true);
                        mapModel.hideInfoWindow();
                        if (self.isEditingActive()) {
                            self.isEditingActive(false);
                            if (self.markupGraphicClickHandler) {
                                self.markupGraphicClickHandler.remove();
                            }
                            self.markupToolEdit.deactivate();
                        }

                        var mapId = mapModel.getMap().id;
                        var graphicLayerConfig = self.getMapConfigById(mapId);
                        self.markupGraphicClickHandler = graphicLayerConfig.graphicsLayer.on("click", self.deleteGraphicClicked);

                    }
                };

                /*
                 * Helper method for looping through the graphics config array.  Pass correct config object back.
                 *
                 * @method deleteGraphics
                 * @param  {string}
                 * @return {object}
                 *
                 */
                self.getMapConfigById = function(mapid) {
                    var returnValue;
                    $.each(self.markupGraphicLayers, function(index, graphicLayer) {
                        if (graphicLayer.id.toString() === mapid.toString()) {
                            returnValue = graphicLayer;
                            return false;
                        }
                    });
                    return returnValue;
                };

                /*
                 * Method for disposing old graphics layers.  This is fired on map delete.
                 *
                 * @method clearGraphicsLayer
                 * @param  {string}
                 *
                 */
                self.clearGraphicsLayer = function(mapid) {
                    if (mapid !== "map1") {
                        var graphicLayerConfig = self.getMapConfigById(mapid);
                        if (graphicLayerConfig.graphicsLayer !== null) {
                            graphicLayerConfig.graphicsLayer = null;
                        }
                    }
                };

                /*
                 * Method for creating a new graphic layer.  This is fired on map add.
                 *
                 * @method initializeGraphics
                 * @param  {string}
                 *
                 */
                self.initializeGraphics = function(mapid) {
                    if (mapid !== "map1") {
                        var graphicLayerConfig = self.getMapConfigById(mapid);
                        graphicLayerConfig.graphicsLayer = new GraphicsLayer({
                            id: graphicLayerConfig.selector
                        });
                        mapModel.getMap().addLayer(graphicLayerConfig.graphicsLayer);
                        graphicLayerConfig.graphicsLayer.clear();
                        graphicLayerConfig.graphicsLayer.on("graphic-draw", self.refreshRectangles);
                        $.each(self.markupGraphicLayers[0].graphicsList, function(index, value) {
                            var graphic = new Graphic(value.geometry, value.symbol);
                            graphicLayerConfig.graphicsLayer.add(graphic);
                            graphicLayerConfig.graphicsList.push(graphic);
                        });
                    }
                };

                /*
                 * Method fired after user clicks edit button and clicks a graphic.
                 *
                 * @method initializeGraphics
                 * @param  {string}
                 *
                 */
                self.editGraphicClicked = function(evt) {
                    if (evt.graphic) {
                        self.markupGraphicClickHandler.remove();
                        var graphicMap = evt.srcElement.ownerSVGElement.id.substring(0, 4);

                        $.each(mapModel.mapInstances, function(index, mapInstance) {
                            if (mapInstance.id === graphicMap) {
                                self.markupToolEdit = new Edit(mapInstance);
                            }
                        });

                        var tool = esri.toolbars.Edit.MOVE | esri.toolbars.Edit.EDIT_VERTICES | esri.toolbars.Edit.SCALE | esri.toolbars.Edit.ROTATE;
                        if (evt.graphic.symbol.declaredClass === "esri.symbol.TextSymbol") {
                            tool = tool | esri.toolbars.Edit.EDIT_TEXT;
                        }
                        var options = {
                            allowAddVertices: true,
                            allowDeleteVertices: true,
                            uniformScaling: true
                        };

                        //active edit tool for clicked graphic.
                        self.markupToolEdit.activate(tool, evt.graphic, options);

                        //After edit is finished, apply edit to all maps.
                        self.markupToolEdit.on("deactivate", function(evt2) {
                            var deletedGraphic = evt.graphic;
                            $.each(mapModel.mapInstances, function(index, mapInstance) {
                                var graphicLayerConfig = self.getMapConfigById(mapInstance.id);
                                if (graphicLayerConfig.graphicsLayer !== null) {
                                    $.each(graphicLayerConfig.graphicsLayer.graphics, function(index, graphic) {
                                        if (graphic) {
                                            if (deletedGraphic.geometry === graphic.geometry) {
                                                graphicLayerConfig.graphicsLayer.remove(graphic);
                                                var validMarkupGraphics = array.filter(graphicLayerConfig.graphicsList, function(item, index) {
                                                    return JSON.stringify(item.geometry.toJson()) !== JSON.stringify(evt.graphic.geometry.toJson());
                                                });
                                                graphicLayerConfig.graphicsList = validMarkupGraphics;
                                            }
                                        }
                                    });
                                    var graphic = new Graphic(evt2.graphic.geometry, evt2.graphic.symbol);
                                    graphicLayerConfig.graphicsLayer.add(graphic);
                                    graphicLayerConfig.graphicsList.push(graphic);
                                }
                            });
                        });
                    }
                };


                /*
                 * Method for handling event fired when delete button has been clicked and a graphic is selected.
                 *
                 * @method deleteGraphicClicked
                 *
                 */
                self.deleteGraphicClicked = function(evt) {
                    var deletedGraphic = evt.graphic;
                    mapModel.showInfoWindow();
                    //Loop through all mapinstances and remove the graphic.
                    $.each(mapModel.mapInstances, function(index, mapInstance) {
                        var graphicLayerConfig = self.getMapConfigById(mapInstance.id);
                        if (graphicLayerConfig.graphicsLayer !== null) {
                            $.each(graphicLayerConfig.graphicsLayer.graphics, function(index, graphic) {
                                if (graphic) {
                                    if (deletedGraphic.geometry === graphic.geometry) {
                                        graphicLayerConfig.graphicsLayer.remove(graphic);
                                        var validMarkupGraphics = array.filter(graphicLayerConfig.graphicsList, function(item, index) {
                                            return JSON.stringify(item.geometry.toJson()) !== JSON.stringify(evt.graphic.geometry.toJson());
                                        });
                                        graphicLayerConfig.graphicsList = validMarkupGraphics;
                                    }
                                }
                            });
                        }
                    });

                    self.removeAllRectangles();
                    self.addRectangles();
                    self.isDeleteGraphicActive(false);
                    if (self.markupGraphicClickHandler) {
                        self.markupGraphicClickHandler.remove();
                    }
                };
            }; //end MarkupToolsVM

            return markupToolsVM;

        } //end function
    );
}());
