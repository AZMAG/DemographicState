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
            "app/config/acsFieldsConfig",
            "app/vm/colorRamp-vm",
            "app/helpers/magNumberFormatter",
            "app/vm/classificationFactory-vm",
            "dojo/text!app/views/cbrHelp-view.html",
            "app/vm/help-vm",
            "dojo/text!app/views/cbr-view.html",
            "app/helpers/layer-delegate",
            "app/vm/legend-vm",
            "app/helpers/bookmark-delegate",
            "app/models/map-model",
            "esri/Color",
            "esri/symbols/SimpleMarkerSymbol",
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/renderers/ClassBreaksRenderer",
            "esri/tasks/ClassBreaksDefinition",
            "esri/tasks/GenerateRendererParameters",
            "esri/tasks/GenerateRendererTask",
            "esri/layers/LayerDrawingOptions"
        ],
        function (dj, dc, tp, acsFieldsConfig, cRamp, magNum, custBreak, helpView, helpVM, view, layerDelegate, legend, bookmarkDelegate, mapModel, Color, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, ClassBreaksRenderer, ClassBreaksDefinition, GenerateRendererParameters, GenerateRendererTask, LayerDrawingOptions) {

            var CBRVM = new function () {

                var self = this;

                var colorRampOnly = false;

                self.tocHTML = "";
                self.toc = "";
                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;
                //console.log("Height: " + self.winHeight + " & " + "Width: " + self.winWidth);
                self.newWindowWidth = self.winWidth;
                self.winVisible = true;
                self.isMapChangeUpdate = false;
                self.customSet = false;

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
                @param {object} initializationData - the initialization data for the map.
                **/
                self.init = function (relatedElement, relation, initializationData) {
                    $.getJSON("app/config/cbrConfig.json", function (data) {
                        window.cbrConfig = {};
                        window.cbrConfig.thematicMaps = data;

                        dc.place(view, relatedElement, relation);

                        if (mapModel.initializationData !== undefined && mapModel.initializationData.maps[0].classificationMethod === "custom") {
                            self.initCustomBreaks = mapModel.initializationData.maps[0].breaks;
                        }
                        $("#dynamicRenderer").click(function (event) {
                            self.updateRenderer();
                        });

                        tp.subscribe("CBRStateO", function () {
                            self.openWindow();
                        });
                        tp.subscribe("CBRStateC", function () {
                            self.closeWindow();
                        });
                        tp.subscribe("NewColorRamp", function (event) {
                            self.updateColorRamp(event);
                        });
                        var dynamicRenderer = $("#dynamicRenderer");
                        tp.subscribe("extentChanged", function (event) {
                            var dynamic = dynamicRenderer.is(':checked');
                            if (!dynamic) {
                                self.updateRenderer();
                            }
                        });
                        tp.subscribe("ClassBreakOptions", self.setBreaksList);
                        tp.subscribe("CustomBreaksUpdated", function () {
                            tp.publish("CustomeMapBreaks", {
                                customSet: true,
                                breaks: self.currentRenderer.infos
                            });
                            self.redrawThematicLayer();
                        });
                        tp.subscribe("SelectedMapChanged", self.selectedMapChangedNew);
                        tp.subscribe("SelectedMapChanged.UpdateTOC", self.selectedMapChangedUpdate);
                        tp.subscribe("MapFrameInitialized", self.loadInitializedMap);

                        var cbrWindow = $("#cbrWindow").kendoWindow({
                            width: self.newWindowWidth,
                            height: "auto", //425px
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
                        var panelBar1 = $("#panelBar1").kendoPanelBar({
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
                            dataSource: cbrConfig.thematicMaps,
                            dataTextField: "ShortName",
                            select: self.mapSelected,
                            change: self.mapSelectionChanged,
                            loadOnDemand: false
                        }).data("kendoTreeView");

                        if (mapModel.initializationData !== undefined) {
                            self.loadMap(mapModel.initializationData.maps[0].selectedMap.ShortName);
                        }

                        self.breaksCountList = $("#breaksCount").kendoDropDownList({
                            dataSource: [
                                1,
                                2,
                                3,
                                4,
                                5
                            ],
                            change: self.breaksCountSelected, //NOT fired when changed in code
                            cascade: function (e) {} // fired when changed in code and user interaction
                        }).data("kendoDropDownList");
                        if (mapModel.initializationData !== undefined) {
                            self.breaksCountList.value(mapModel.initializationData.maps[0].colorPalet.numBreaks);
                        }

                        self.classMethodList = $("#classScheme").kendoDropDownList({
                            dataSource: [{
                                Name: "Natural Breaks",
                                Value: "natural-breaks"
                            }, {
                                Name: "Equal Interval",
                                Value: "equal-interval"
                            }, {
                                Name: "Quantile",
                                Value: "quantile"
                            }, {
                                Name: "Custom",
                                Value: "custom"
                            }],
                            dataTextField: "Name",
                            dataValueField: "Value",
                            change: self.classMethodChange
                        }).data("kendoDropDownList");
                        if (mapModel.initializationData !== undefined) {
                            self.classMethodList.value(mapModel.initializationData.maps[0].classificationMethod);
                        }

                        $("#editCustom").click(function () {
                            custBreak.loadInitialCustomBreaks = false;
                            self.classMethodList.select(function (item) {
                                return item.Value === "custom";
                            });
                            tp.publish("ClassificationMethodChanged", self.currentRenderer);
                        });

                        $("#btnNewMap").click(function () {
                            tp.publish("AddNewMap");
                        });

                        $("#btnRemoveMap").click(function () {
                            tp.publish("RemoveAMap");
                        });

                        tp.subscribe("UpdateRemoveAMapButton", function (obj) {
                            if (obj.display) {
                                $("#btnRemoveMap").removeClass("hidden");
                                $("#selectMapFrameControl").removeClass("hidden");
                            } else {
                                $("#btnRemoveMap").addClass("hidden");
                                $("#selectMapFrameControl").addClass("hidden");
                            }
                        });
                        tp.subscribe("UpdateAddAMapButton", function (obj) {
                            if (obj.display) {
                                $("#btnNewMap").removeClass("hidden");
                            } else {
                                $("#btnNewMap").addClass("hidden");
                            }
                        });
                        tp.subscribe("UpdateMapFrameGridRows", function (numOfCells) {
                            switch (numOfCells) {
                                case 2:
                                    $("#mapFrameGridRow2").addClass("hidden");
                                    break;
                                case 3:
                                    $("#mapFrameGridCell4").addClass("hidden");
                                    $("#mapFrameGridRow2").removeClass("hidden");
                                    break;
                                case 4:
                                    $("#mapFrameGridCell4").removeClass("hidden");
                                    break;
                            }
                        });

                        // load initialization data if present, otherwise load default data
                        var colorSchema = (mapModel.initializationData !== undefined && mapModel.initializationData.maps[0].classMethod !== undefined) ? mapModel.initializationData.maps[0].classMethod : "Sequential";
                        var colorPalet = (mapModel.initializationData !== undefined && mapModel.initializationData.maps[0].colorPalet !== undefined) ? mapModel.initializationData.maps[0].colorPalet.ramp : "OrRd";
                        var dataClass = (mapModel.initializationData !== undefined && mapModel.initializationData.maps[0].colorPalet.numBreaks !== undefined) ? mapModel.initializationData.maps[0].colorPalet.numBreaks : "5";
                        cRamp.init(relatedElement, relation, "Sequential", colorPalet, dataClass, bookmarkDelegate); //"Sequential", "YlGn", "5");
                        custBreak.init(relatedElement, relation, self.initCustomBreaks !== undefined);
                        if (mapModel.initializationData === undefined) {
                            self.loadMap();
                        }
                        self.ReadyToRender = true;
                        self.updateRenderer();

                        self.simpleFillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                new Color([0, 0, 0]), 0.5),
                            new Color([175, 175, 175])
                        );
                    });
                }; // end int
                // =================================================================================================================>

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
                $(window).resize(function () {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(self.winResize, 200);
                });

                //removes selected state from Advanced Map Options Panel vw
                self.onCollapse = function (e) {
                    $(e.item).children().removeClass("k-state-selected");
                };
                self.onExpand = function (e) {
                    var headerTitle = $(e.item).find(".k-header")[0].innerText;

                    // <!-- comments:uncomment // -->
                    // ga('send', 'event', 'Click', "Expanded ", headerTitle);
                    // <!-- endcomments -->

                    $(e.item).children().removeClass("k-state-selected");
                };

                self.loadMap = function (initializedMapText) {
                    //load in map from query string or by default load the first map
                    var dataItem = null;
                    if (initializedMapText !== undefined) {
                        dataItem = self.toc.findByText(initializedMapText);
                    } else {
                        if (cbrConfig.thematicMaps.length > 0 && cbrConfig.thematicMaps[0].items && cbrConfig.thematicMaps[0].items.length > 0) {
                            dataItem = self.toc.findByText(cbrConfig.thematicMaps[0].items[0].ShortName);
                        }
                    }
                    if (dataItem) {
                        self.toc.select(dataItem);
                    } else {
                        self.toc.select(".k-item:first");
                    }
                    dataItem = self.toc.dataItem(self.toc.select());
                    var currNode = self.toc.select()[0];
                    if (dataItem.NodeType === "cat") {
                        self.toc.select(currNode.children[1].firstChild);
                        self.toc.expand(currNode);
                    } else {
                        //expand all parent nodes
                        $(currNode).parentsUntil(".k-treeview").filter(".k-item").each(
                            function (index, element) {
                                self.toc.expand($(this));
                            }
                        );
                    }
                };

                self.loadInitializedMap = function (map, initData) {
                    //remove selected map frame
                    $("#mapFrameGridCell1").removeClass("selected");
                    $("#mapFrameGridCell2").removeClass("selected");
                    $("#mapFrameGridCell3").removeClass("selected");
                    $("#mapFrameGridCell4").removeClass("selected");
                    //select frame
                    $("#mapFrameGridCell" + initData.mapID.replace("map", "")).addClass("selected");

                    // it's an existing map - need to load the options
                    self.renderer = null;
                    self.toc.select(self.toc.findByText(initData.selectedMap.ShortName));
                    self.updateTOCSelection();

                    if (initData.classMethod === "custom") {
                        self.initCustomBreaks = initData.breaks;
                        custBreak.loadInitialCustomBreaks = true;
                        self.customSet = true;
                    } else {
                        self.initCustomBreaks = undefined;
                        custBreak.loadInitialCustomBreaks = false;
                        self.customSet = false;
                    }
                    self.classMethodList.select(function (item) {
                        return item.Value === initData.classMethod;
                        // console.log(initData.classMethod);
                    });
                    var oldBreakValue = self.breaksCountList.value();
                    self.breaksCountList.value(initData.breaks.length);
                    if (oldBreakValue !== initData.colorPalet.numBreaks.toString()) {
                        tp.publish("SetNumBreaks", self.breaksCountList.dataItem());
                    }
                    // console.log(initData);
                    tp.publish("AdditionalMapInitialized", initData.colorPalet.ramp, initData.colorPalet.numBreaks);
                    //self.updateColorRamp(initData.colorRamp);
                };

                self.selectedMapChangedNew = function (newMap) {
                    if (newMap === undefined || (newMap && !newMap.loaded)) {
                        if (newMap) {
                            //remove selected map frame
                            $("#mapFrameGridCell1").removeClass("selected");
                            $("#mapFrameGridCell2").removeClass("selected");
                            $("#mapFrameGridCell3").removeClass("selected");
                            $("#mapFrameGridCell4").removeClass("selected");
                            //select frame
                            $("#mapFrameGridCell" + newMap.id.replace("map", "")).addClass("selected");
                        }
                        // if the map isn't loaded yet - it's a new map and need to clear/reset the options
                        self.toc.select(null);
                        self.classMethodList.value(null);
                        self.breaksCountList.value(null);

                        dc.destroy("rampPad");
                        dc.place("<div id=\"rampPad\" style=\"padding: 2px\"><div id=\"curColRamp\" title=\"Pick a color scheme\" style=\"width: 250px\"></div></div>", "breaksControl");
                        self.colorRamp = $("#curColRamp").kendoColorPalette({
                            palette: ["#ddd1c3", "#d2d2d2", "#746153", "#3a4c8b", "#ffcc33", "#fb455f", "#ac120f"],
                            tileSize: 30,
                            columns: 7,
                            value: null,
                            change: self.colorPickerClicked
                        }).data("kendoColorPalette");

                        self.currentRenderer = null;
                        self.CurrentRamp = null;
                    }
                };

                self.selectedMapChangedUpdate = function (params) {
                    //remove selected map frame
                    $("#mapFrameGridCell1").removeClass("selected");
                    $("#mapFrameGridCell2").removeClass("selected");
                    $("#mapFrameGridCell3").removeClass("selected");
                    $("#mapFrameGridCell4").removeClass("selected");
                    //select frame
                    $("#mapFrameGridCell" + params.mapIndex).addClass("selected");
                    if (params.renderer) {
                        // it's an existing map - need to load the options
                        self.ReadyToRender = true; //false;
                        if (params.customBreaks && params.customBreaks.breaks) {
                            self.customSet = true;
                            self.initCustomBreaks = params.customBreaks.breaks;
                            custBreak.loadInitialCustomBreaks = true;
                            self.classMethodList.select(function (item) {
                                return item.Value === "custom";
                            });
                            self.breaksCountList.value(params.customBreaks.breaks.length);
                        } else {
                            self.customSet = false;
                            self.initCustomBreaks = undefined;
                            custBreak.loadInitialCustomBreaks = false;
                            self.classMethodList.select(function (item) {
                                return item.Value === params.renderer.classificationMethod;
                            });
                            self.breaksCountList.value(params.renderer.breaks.length);
                            self.currentRenderer = params.renderer;
                        }
                        //var oldBreakValue = self.breaksCountList.value();
                        //self.breaksCountList.value(params.renderer.breaks.length);
                        //if (oldBreakValue !== params.renderer.breaks.length.toString()) {
                        //    tp.publish("SetNumBreaks", self.breaksCountList.dataItem());
                        //}
                        self.currentRenderer = params.renderer;
                        //self.updateColorRamp(params.colorRamp);
                        self.isMapChangeUpdate = true;
                        self.toc.select(self.toc.findByText(params.mapName));
                        tp.publish("AdditionalMapInitialized", params.currentCBR, params.colorRamp.length);
                        self.updateTOCSelection();
                        //self.ReadyToRender = true;
                    } else {
                        self.selectedMapChangedNew();
                    }
                };

                self.updateTOCSelection = function () {
                    var dataItem = self.toc.dataItem(self.toc.select());
                    var currNode = self.toc.select()[0];

                    // collapse all items
                    self.toc.collapse(".k-item");

                    setTimeout(function () {
                        //expand all parent nodes
                        $(currNode).parentsUntil(".k-treeview").filter(".k-item").each(
                            function (index, element) {
                                self.toc.expand($(this));
                            }
                        );
                    }, 500);
                };

                /**
                Method for updating the class break renderer.
                Triggered whenever renderer parameters have changed, such as number of breaks, classification method or classification field.

                @method updateRenderer
                **/
                self.updateRenderer = function () {

                    if (self.ReadyToRender !== true || self.customSet) {
                        return;
                    }
                    var thematicMap = self.toc.dataItem(self.toc.select());
                    var classDef = new ClassBreaksDefinition();
                    if (thematicMap) {
                        classDef.classificationField = thematicMap.FieldName;
                        if (thematicMap.hasOwnProperty("NormalizeField")) {
                            classDef.normalizationField = thematicMap.NormalizeField;
                            classDef.normalizationType = "field";
                        }
                        if (self.classMethodList.dataItem() && self.classMethodList.dataItem().Value === "custom") {
                            classDef.classificationMethod = "natural-breaks";
                        } else if (self.classMethodList.dataItem()) {
                            classDef.classificationMethod = self.classMethodList.dataItem().Value;
                        } else {
                            self.classMethodList.select(0);
                            classDef.classificationMethod = self.classMethodList.dataItem().Value;
                        }
                        classDef.breakCount = self.breaksCountList.dataItem();
                        var mapServiceUrl = appConfig.mainURL + "/0";
                        var dynamic = $("#dynamicRenderer").is(':checked');
                        self.generateRenderer(classDef, mapServiceUrl, !dynamic);
                    }
                };

                self.generateRenderer = function (classDef, url, dynamic) {
                    function processResults(results) {
                        if (results.features) {
                            var layer = mapModel.mapInstance.getLayer("blockGroups");
                            var breaksCount = self.CurrentRamp.length;
                            var arr = [];

                            $.each(results.features, function (index, feature) {
                                var pushVal = 0;
                                var fieldVal = feature.attributes[classDef.classificationField];
                                if (classDef.normalizationField) {
                                    var normalizationVal = feature.attributes[classDef.normalizationField];
                                    pushVal = fieldVal / normalizationVal;
                                } else {
                                    pushVal = fieldVal;
                                }
                                if (pushVal) {
                                    arr.push(pushVal);
                                } else {
                                    arr.push(0);
                                }
                            });

                            var series = new geostats();
                            series.setSerie(arr);

                            var breakValues = [];

                            if (classDef.classificationMethod === "natural-breaks") {
                                breakValues = series.getClassJenks(breaksCount);
                            } else if (classDef.classificationMethod === "equal-interval") {
                                breakValues = series.getClassEqInterval(breaksCount);
                            } else if (classDef.classificationMethod === "quantile") {
                                breakValues = series.getClassQuantile(breaksCount);
                            }

                            var renderer = new ClassBreaksRenderer(null, classDef.classificationField);

                            $.each(self.CurrentRamp, function (i, colorArray) {
                                var min = breakValues[i];
                                var max = breakValues[i + 1];
                                renderer.addBreak(min, max, new SimpleFillSymbol().setColor(new Color(colorArray)));
                            });

                            colorRampOnly = false;
                            self.applyRenderer(renderer);
                        } else {
                            console.error("The field " + classDef.classificationField + " doesn't exist in your block groups layer.");
                        }
                    }

                    var extent = mapModel.getMapExtent();
                    if (dynamic !== true) {
                        extent = null;
                    }

                    var outFields = [classDef.classificationField, classDef.normalizationField];

                    if (!classDef.normalizationField) {
                        outFields = [classDef.classificationField];
                    }

                    if (dynamic) {
                        layerDelegate.query(url, processResults, processResults, extent, classDef.classificationField + " IS NOT NULL", false, outFields, null, false, null, null);
                    } else {
                        var thematicMap = self.toc.dataItem(self.toc.select());
                        var layer = mapModel.mapInstance.getLayer("blockGroups");
                        var breaksCount = 5;

                        if (self.CurrentRamp && self.CurrentRamp.length) {
                            breaksCount = self.CurrentRamp.length;
                        }

                        var breakValues = [];

                        if (classDef.classificationMethod === "natural-breaks") {
                            breakValues = thematicMap.breaks["Jenks" + breaksCount];
                        } else if (classDef.classificationMethod === "equal-interval") {
                            breakValues = thematicMap.breaks["EqInterval" + breaksCount];
                        } else if (classDef.classificationMethod === "quantile") {
                            breakValues = thematicMap.breaks["Quantile" + breaksCount];
                        }

                        var renderer = new ClassBreaksRenderer(null, classDef.classificationField);

                        $.each(self.CurrentRamp, function (i, colorArray) {
                            var min = breakValues[i];
                            var max = breakValues[i + 1];
                            renderer.addBreak(min, max, new SimpleFillSymbol().setColor(new Color(colorArray)));
                        });

                        colorRampOnly = false;
                        self.applyRenderer(renderer);
                    }
                }

                /**
                Method to apply the class break renderer to the thematic layer.
                Triggered when the renderer has been updated or when the color ramp has been modified.

                @method applyRenderer
                **/
                self.applyRenderer = function (renderer) {
                    if (self.CurrentRamp && self.CurrentRamp.length) {

                        for (var i = 0; i < self.CurrentRamp.length; i++) {
                            renderer.infos[i].symbol.color = dojo.colorFromRgb(self.CurrentRamp[i]);
                        }

                        if (self.initCustomBreaks) {
                            for (var i = 0; i < self.initCustomBreaks.length; i++) {
                                renderer.infos[i].minValue = self.initCustomBreaks[i][0];
                                renderer.infos[i].maxValue = self.initCustomBreaks[i][1];
                                renderer.infos[i].classMaxValue = self.initCustomBreaks[i][1];
                            }

                            self.initCustomBreaks = null;
                        }

                        // note: this applies symbology for No Data class, does not work with normalization
                        renderer.defaultSymbol = self.simpleFillSymbol;
                        renderer.defaultLabel = "No Data";
                        var dataItem = self.toc.dataItem(self.toc.select());

                        if (dataItem.hasOwnProperty("NormalizeField")) {
                            renderer.normalizationField = dataItem.NormalizeField;
                            renderer.normalizationType = "field";
                        }
                        renderer.asPercent = dataItem.AsPercentages;
                        self.currentRenderer = renderer;

                        if (self.classMethodList.dataItem().Value === "custom") {
                            tp.publish("ClassificationMethodChanged", self.currentRenderer);
                        } else {
                            self.redrawThematicLayer();
                        }
                        tp.publish("MapRenderUpdated");
                    }
                };

                /**
                Method to refresh the thematic layer after the renderer has been applied.

                @method redrawThematicLayer
                **/
                self.redrawThematicLayer = function () {
                    var layerOption = new LayerDrawingOptions();
                    layerOption.renderer = self.currentRenderer;
                    for (var j = 0; j < layerOption.renderer.infos.length; j++) {
                        var start;
                        var end;
                        if (layerOption.renderer.asPercent) {
                            start = Math.round(layerOption.renderer.infos[j].minValue * 100);
                            end = Math.round(layerOption.renderer.infos[j].maxValue * 100) + "%";
                        } else {
                            start = magNum.formatValue(Math.round(layerOption.renderer.infos[j].minValue));
                            end = magNum.formatValue(Math.round(layerOption.renderer.infos[j].maxValue));
                        }
                        layerOption.renderer.infos[j].label = start + " - " + end;
                    }

                    var layerOptions = [layerOption];

                    if (self.toc.dataItem(self.toc.select())) {
                        var thematicLayer = mapModel.mapInstance.getLayer('blockGroups');
                        thematicLayer.setLayerDrawingOptions(layerOptions);
                        thematicLayer.visible = true;
                        thematicLayer.refresh();
                    }
                    tp.publish("MapRenderUpdated");
                };

                /**
                Method for handling a change in the classification method dropdown.

                @method classMethodChange
                @param {event} e - window event data, not used within this method.
                **/
                self.classMethodChange = function () {
                    var classMethod = self.classMethodList.dataItem().Value;

                    // <!-- comments:uncomment // -->
                    // ga('send', 'event', 'Click', 'Class Method Change', classMethod);
                    // <!-- endcomments -->

                    if (classMethod === "custom") {
                        tp.publish("ClassificationMethodChanged", self.currentRenderer);
                    } else {
                        tp.publish("CustomeMapBreaks", {});
                        var $cbox = $("#dynamicRenderer");
                        $cbox.removeAttr("disabled");
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
                    var dataItem = null;

                    //if (mapInitializationData != undefined) {
                    //    self.toc.select(self.toc.findByText(mapInitializationData.selectedMap.ShortName));
                    //}
                    dataItem = self.toc.dataItem(self.toc.select());

                    if (dataItem) {
                        if (dataItem.Name !== "Total Population") {
                            // <!-- comments:uncomment // -->
                            // ga('send', 'event', 'Click', 'Chose Map', dataItem.Name);
                            // <!-- endcomments -->
                        }

                        //bookmarkDelegate.currentMap(dataItem);

                        if (!self.isMapChangeUpdate) {
                            tp.publish("NewMapThemeSelected", dataItem);
                        } else {
                            self.isMapChangeUpdate = false;
                        }

                        if (dataItem.hasOwnProperty("DefaultBreaks")) {
                            self.ReadyToRender = false;
                            self.breaksCountList.select(function (item) {
                                return item === dataItem.DefaultBreaks.length;
                            });
                            tp.publish("SetNumBreaks", dataItem.DefaultBreaks.length);
                            var newRenderer = new ClassBreaksRenderer(null, dataItem.FieldName);

                            if (dataItem.hasOwnProperty("NormalizeField")) {
                                newRenderer.normalizationField = dataItem.NormalizeField;
                                newRenderer.normalizationType = "field";
                            }
                            newRenderer.infos = dataItem.DefaultBreaks;
                            for (var i = 0; i < newRenderer.infos.length; i++) {
                                newRenderer.infos[i].classMaxValue = newRenderer.infos[i].maxValue;
                                newRenderer.infos[i].symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                        new Color([0, 0, 0]), 0.5),
                                    new Color([175, 175, 175])
                                );
                            }
                            self.classMethodList.select(function (item) {
                                return item.Value === "custom";
                            });
                            self.ReadyToRender = true;
                            self.applyRenderer(newRenderer);
                        } else {
                            self.updateRenderer();
                        }
                    }
                };

                /**
                Method for handling a click event on the color ramp control.

                @method colorPickerClicked
                @param {event} e - Event data for the click event.
                **/
                self.colorPickerClicked = function () {
                    self.colorRamp.value(null);
                    colorRampOnly = true;
                    tp.publish("SelectColorRamp", null);
                };

                /**
                Method for handling a selection in the breaks count dropdown control.

                @method breaksCountSelected
                @param {event} e - Event data for the click event.
                **/
                self.breaksCountSelected = function (e) {
                    var dataItem = self.breaksCountList.dataItem(e.node);

                    // <!-- comments:uncomment // -->
                    // ga('send', 'event', 'Click', 'Update number of Class Breaks', '' + dataItem);
                    // <!-- endcomments -->

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
                        self.breaksCountList.select(function (dataItem) {
                            return dataItem === currentSelection;
                        });
                    } else {
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
                    self.breaksCountList.select(function (dataItem) {
                        return dataItem == newRamp.length;
                    });
                    self.updateRenderer();
                };

            }; //end CBRVM
            return CBRVM;
        } //end function
    );
}());
