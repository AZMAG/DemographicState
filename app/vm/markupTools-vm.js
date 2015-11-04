
(function () {

    "use strict";

    define([
        "dojo",
        "dojo/dom-construct",
        "dojo/topic",
        "dojo/_base/array",
        "esri/toolbars/draw",
        "esri/graphic",
        "esri/layers/GraphicsLayer",
        "esri/toolbars/edit",
        "dojo/text!app/views/markupToolsHelp-view.html",
        "app/vm/help-vm",
        "dojo/text!app/views/markupTools-view.html",
        "app/models/map-model"
    ], function (
        dj,
        dc,
        tp,
        array,
        Draw,
        Graphic,
        GraphicsLayer,
        Edit,
        helpView,
        helpVM,
        view,
        mapModel) {

            var markupToolsVM = new function () {

                var self = this;
                
                self.isMarkupToolActive = ko.observable(false);
                self.activeMarkupTool = ko.observable('');
                self.markupToolsKendoTree = "";
                self.markupToolNodeSelections = ko.observableArray();
                self.markupToolDraw = null;
                self.markupToolDrawGraphicsList = [];
                self.markupToolGraphicsLayer = null;
                // Edit Markup Graphics settings
                self.isEditingActive = ko.observable(false);
                self.markupToolEdit = null;
                self.markupGraphicClickHandler = null;
                self.isDeleteGraphicActive = ko.observable(false);
                // Markup tool settings
                self.fillColorSelection = null;
                self.outlineColorSelection = null;
                self.fontSize = 12; // Default the font size to 12
                self.textInput = ko.observable('');
                
                // Kendo Window dimensions and location
                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;
                self.newWindowWidth = self.winWidth;
                self.isThisWindowVisible = true;
                self.winTopLocation = 55;
                self.winLeftAligned = false;
                self.winLocation = 2;
                self.setWindowLocation = function () {
                    self.winWidth = document.documentElement.clientWidth;
                    self.winHeight = document.documentElement.clientHeight;
                    if (self.winWidth <= 668) {
                        self.newWindowHeight = 5;
                        self.newWindowWidth = "250px";
                        self.winVisible = false;
                        self.winLocation = 5;
                    } else if (self.winWidth <= 800) {
                        self.newWindowHeight = 50;
                        self.newWindowWidth = "250px";
                        self.winVisible = false;
                        self.winLocation = 5;
                        self.winTopLocation = 55;
                    } else if (self.winWidth <= 1024) {
                        self.newWindowHeight = 250;
                        self.newWindowWidth = "250px";
                        self.winLocation = 5;
                        self.winTopLocation = 55;
                    } else if (self.winWidth <= 1200) {
                        self.newWindowWidth = "250px";
                        self.winLocation = 5;
                        self.winTopLocation = 55;
                    } else {
                        self.newWindowHeight = 250;
                        self.newWindowWidth = "250px";
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
                self.init = function (relatedElement, relation) {
                    dc.place(view, relatedElement, relation);
                    ko.applyBindings(self, dojo.byId("markupToolsLauncher"));

                    self.setWindowLocation();

                    tp.subscribe("MarkupToolsStateO", function () { self.openWindow(); });
                    tp.subscribe("MarkupToolsStateC", function () { self.closeWindow(); });
                    
                    // Initialize Kendo Window Object 
                    var markupToolsWindow = $("#markupToolsLauncher").kendoWindow({
                        width: self.newWindowWidth,
                        height: "auto",//425px
                        title: self.windowTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: self.isThisWindowVisible,
                        resizable: false
                    }).data("kendoWindow");

                    var mtSlider =  $("#mtSlider").kendoSlider({
                            increaseButtonTitle: "Decrease",
                            decreaseButtonTitle: "Increase",
                            min: 0,
                            max: 1,
                            smallStep: 0.1,
                            largeStep: 0.01,
                            value: 0.8,
                            change: self.sliderChange,
                            slide: self.sliderChange,
                        }).data("kendoSlider");

                    // Set Kendo Window Help
                    var helpButton = markupToolsWindow.wrapper.find(".k-i-help");
                    helpButton.click(function () {
                        helpVM.openWindow(helpView);
                    });

                    // Initialize Kendo Window placement
                    $("#markupToolsLauncher").closest(".k-window").css({
                        top: '55px',
                        left: '76%'
                    });

                    // Initialize the Markup/Drawing Tool's Kendo Tree Nodes
                    self.markupToolsKendoTree = $("#markupToolsKendoTree").kendoTreeView({
                        dataSource: appConfig.markupToolTreeNodes,
                        dataTextField: "DisplayText",
                        dataBound: function (e) {
                            e.sender.element.find("span.k-in").css('cursor', 'pointer');
                        }
                    }).data("kendoTreeView");
                    // IMPORTANT: Over-ride the Kendo Treeview click event in order to be able to deactivate it. 
                    $('#markupToolsKendoTree').on('click', '.k-item', function(e) {
                        self.onMarkupToolSelection();
                    });
                    
                    // Initialize Drawing Tools
                    self.markupToolDraw = new Draw(mapModel.mapInstance, { showTooltips: true, tooltipOffset: 10 });
                    self.markupToolDraw.on("draw-end", self.addMarkupToolGraphicToMap);

                    // Initialize Edit Tools
                    self.markupToolEdit = new Edit(mapModel.mapInstance);

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
                        cascade: function (e) { } // fired when changed in code and user interaction
                    }).data("kendoDropDownList");

                }; //end int
                

                //***********************Kendo Widget functions*****************************

                /**
                Method for opening the Kendo Window.
                @method openWindow
                **/
                self.openWindow = function () {
                    var win = $("#markupToolsLauncher").data("kendoWindow");
                        win.restore();
                        win.open();

                        $("#markupToolsLauncher").closest(".k-window").css({
                            top: "55px",
                            left: "76%"
                        });
                };

                self.sliderChange = function (evt) {
                    if (self.isEditingActive() === true) {
                        self.markupToolGraphicsLayer.setOpacity(evt.value);
                    }
                };

                self.closeWindow = function () {
                    var win = $("#markupToolsLauncher").data("kendoWindow");
                    win.close();
                };

                // change window location when window resized
                self.winResize = function () {
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
                self.onMarkupToolSelection = function () {
                    if (!self.markupToolGraphicsLayer) {
                        self.markupToolGraphicsLayer = new GraphicsLayer({ id: "markupToolsGraphics" });
                        mapModel.mapInstance.addLayer(self.markupToolGraphicsLayer);
                    }

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
                        self.activeMarkupTool('');
                    }
                };

                /**
                Method for handling a change in markup-tool's fill color selection.
                * @method activateMarkupTool
                * @param {dataItem} Kendo Tree Node.
                **/
                self.activateMarkupTool = function (dataItem) {
                    self.isMarkupToolActive(true);
                    self.activeMarkupTool(dataItem.text);
                    self.markupToolDraw.activate(Draw[dataItem.Type]);
                };
                
                /**
                * Turns the Draw Tools off (i.e. set to inactive).
                * @method deactivateMarkupTool
                */
                self.deactivateMarkupTool = function (e) {
                    self.markupToolDraw.deactivate();
                    
                    var selectedNode = self.markupToolsKendoTree.select();
                    if (selectedNode) {
                        self.markupToolsKendoTree.select($());
                    }
                    
                    self.isMarkupToolActive(false);
                    self.activeMarkupTool('');
                };
                
                /**
                Method for handling a change in markup-tool's fill color selection.
                @method onFillColorPaletteSelection
                **/
                self.onFillColorPaletteSelection = function (e) {
                    if (e) {
                        self.fillColorSelection = kendo.parseColor(e.value);
                    }
                };

                /**
                Method for handling a change in markup-tool's fill color selection.
                @method onFillColorPaletteSelection
                **/
                self.onOutlineColorPaletteSelection = function (e) {
                    if (e) {
                        self.outlineColorSelection = kendo.parseColor(e.value);
                    }
                };
                
                /**
                Method for handling a change in markup-tool's text font size.
                @method onFontSizeSelection
                **/
                self.onFontSizeSelection = function (e) {
                    if (e) {
                        self.fontSize = self.fontSizeList.dataItem(e.node);
                    }
                };

                /**
                Method for handling a change in markup-tool selection.
                @method addMarkupToolGraphicToMap
                **/
                self.addMarkupToolGraphicToMap = function (evt) {
                    // Save the graphics
                    var geometryType = self.markupToolDraw._geometryType;

                    // Set the markup tool symbology based on the geometry type
                    var markupSymbology = self.getSymbol(geometryType);
                    if (markupSymbology) {
                        var graphicObj = new Graphic(evt.geometry, markupSymbology);
                        self.markupToolDrawGraphicsList.push(graphicObj);
                        self.markupToolGraphicsLayer.add(graphicObj);

                        self.deactivateMarkupTool();
                    }
                };
                
                /**
                 * Determine symbol for graphic based on supplied color and geometry type.
                 *
                 * @method getSymbol
                 * @param {string} geometryType - the geometry type symbolize.
                 * @returns {Symbol}
                 */
                self.getSymbol = function(geometryType) {
                    var markupSymbology = null, fillColor = null, outlineColor = null, textColor = null;
                    var slider = $("#mtSlider").getKendoSlider();
                    var fillColorOpacity = slider.value();

                    // Check if a fill and/or outline Kendo Color Palette selection was made
                    if (self.fillColorSelection) {
                        // Set the the fill opacity value to half (0.50), so layers behind the markup tool can be visible 
                        fillColor = new dojo.Color([self.fillColorSelection.r, self.fillColorSelection.g, self.fillColorSelection.b,
                                                    fillColorOpacity]);
                        textColor = new dojo.Color([self.fillColorSelection.r, self.fillColorSelection.g, self.fillColorSelection.b,
                                                    appConfig.outlineColorOpacity]);
                    } else { // Default color is Cyan
                        fillColor = new dojo.Color([0, 255, 255, fillColorOpacity]);
                        textColor = new dojo.Color([0, 255, 255, appConfig.outlineColorOpacity]);
                    }
                    if (self.outlineColorSelection) {
                        // Set the the fill opacity value to half (0.50), so layers behind the markup tool can be visible 
                        outlineColor = new dojo.Color([self.outlineColorSelection.r, self.outlineColorSelection.g, self.outlineColorSelection.b,
                                                    appConfig.outlineColorOpacity]);
                    } else { // Default color is Cyan
                        outlineColor = new dojo.Color([0, 255, 255, appConfig.outlineColorOpacity]);
                    }

                    // Define the Markup Tool's symbology
                    if (["polygon", "freehandpolygon", "circle", "arrow"].indexOf(geometryType) > -1) {
                        markupSymbology = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, outlineColor, 3), fillColor);
                    } else if (["line", "polyline"].indexOf(geometryType) > -1) {
                        markupSymbology = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, outlineColor, 2);
                    } else if (["point"].indexOf(geometryType) > -1) {
                        // Create a TextSymbol to place when a map point is created
                        var textSymbol = new esri.symbol.TextSymbol(self.textInput()).setColor(textColor);
                        var font = new esri.symbol.Font();
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
                self.clearMarkupGraphics = function () {
                    if (self.markupToolGraphicsLayer) {
                        self.markupToolGraphicsLayer.clearGraphics();
                    }
                };

                /**
                Method for clearing the last markup graphic from the map
                @method undoLastMarkupGraphic
                */
                self.undoLastMarkupGraphic = function () {
                    if (self.markupToolDrawGraphicsList.length > 0) {
                        var markupGraphic = self.markupToolDrawGraphicsList.pop();
                        if (self.markupToolGraphicsLayer) {
                            self.markupToolGraphicsLayer.remove(markupGraphic);
                        }
                    }
                };

                self.editGraphics = function () {
                    if (self.isEditingActive()) {
                        self.isEditingActive(false);
                        if (self.markupGraphicClickHandler) {
                            self.markupGraphicClickHandler.remove();
                        }
                        self.markupToolEdit.deactivate();
                    } else {
                        self.isEditingActive(true);
                        if (self.isDeleteGraphicActive()) {
                            self.isDeleteGraphicActive(false);
                            if (self.markupGraphicClickHandler) {
                                self.markupGraphicClickHandler.remove();
                            }
                        }
                        if (self.markupToolGraphicsLayer) {
                            self.markupGraphicClickHandler = self.markupToolGraphicsLayer.on("click", self.editGraphicClicked);
                        }
                    }
                };

                self.deleteGraphics = function () {
                    if (self.isDeleteGraphicActive()) {
                        self.isDeleteGraphicActive(false);
                        if (self.markupGraphicClickHandler) {
                            self.markupGraphicClickHandler.remove();
                        }
                    } else {
                        self.isDeleteGraphicActive(true);
                        if (self.isEditingActive()) {
                            self.isEditingActive(false);
                            if (self.markupGraphicClickHandler) {
                                self.markupGraphicClickHandler.remove();
                            }
                            self.markupToolEdit.deactivate();
                        }
                        if (self.markupToolGraphicsLayer) {
                            self.markupGraphicClickHandler = self.markupToolGraphicsLayer.on("click", self.deleteGraphicClicked);
                        }
                    }
                };

                self.editGraphicClicked = function (evt) {
                    if (evt.graphic) {
                        var tool = esri.toolbars.Edit.MOVE | esri.toolbars.Edit.EDIT_VERTICES | esri.toolbars.Edit.SCALE | esri.toolbars.Edit.ROTATE;
                        var options = {
                            allowAddVertices: true,
                            allowDeleteVertices: true,
                            uniformScaling: true
                        };
                        self.markupToolEdit.activate(tool, evt.graphic, options);
                    }
                };

                self.deleteGraphicClicked = function (evt) {
                    var validMarkupGraphics = array.filter(self.markupToolDrawGraphicsList, function (item, index) {
                        return JSON.stringify(item.geometry.toJson()) !== JSON.stringify(evt.graphic.geometry.toJson());
                    });
                    self.markupToolDrawGraphicsList = validMarkupGraphics;
                    self.markupToolGraphicsLayer.remove(evt.graphic);
                };

            }; //end MarkupToolsVM

            return markupToolsVM;

        }//end function
    );
} ());