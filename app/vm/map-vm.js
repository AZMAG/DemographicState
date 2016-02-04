/**
 * Map
 *
 * @class map-vm
 */

(function() {

    "use strict";

    define([
            "dojo/dom-construct",
            "dojo/_base/array",
            "dojo/_base/lang",
            "dojo/on",
            "dojo/dom",
            "dojo/dom-style",
            "dojo/topic",
            "dojo/text!app/views/mapContainer-view.html",
            "app/models/map-model",
            "esri/map",
            "esri/dijit/HomeButton",
            "esri/dijit/Scalebar",
            "esri/dijit/Legend",
            "esri/geometry/Extent",

            "esri/Color",
            "esri/symbols/SimpleMarkerSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/SimpleFillSymbol",

            "esri/dijit/Popup",
            "esri/dijit/PopupTemplate",
            "esri/InfoTemplate",
            "app/vm/legend-vm",
            "app/vm/markupTools-vm"
        ],
        function(dc, da, lang, on, dom, ds, topic, view, mapModel, Map, HomeButton, Scalebar, Legend, Extent, Color, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Popup, PopupTemplate, InfoTemplate, legendVM, markupToolsVM) {

            //var MapVM = new function () {
            var MapVM = function() {

                /**
                 * Store reference to module this object.
                 *
                 * @property self
                 * @type {*}
                 */
                var self = this;

                self.mapID = "";

                self.map = null;

                self.legend = null;

                self.mapElementsClass = "";

                self.showMapElements = true;

                self.isSelected = false;

                self.mapInitData = {};

                self.mapTheme = ko.observable({
                    ShortName: "< Choose a Map >",
                    Source: ""
                });

                self.renderer = ko.observable(undefined);

                self.mapColorRamp = ko.observable(undefined);

                self.mapCBRCurrent = ko.observable(undefined);

                self.customBreaks = ko.observable(undefined);

                self.mapExtent = ko.observable(undefined);

                self.legendOpacity = ko.observable(0.8);

                self.mapInfoUpdated = ko.computed({
                    read: function() {
                        return self.renderer() && self.mapColorRamp() && self.mapCBRCurrent() && self.mapTheme() && self.mapExtent() && self.legendOpacity() && self.customBreaks();
                    },
                    owner: self
                }).extend({
                    notify: "always"
                });

                /**
                 * Initialize the class.
                 *
                 * @method init
                 * @param {string} mapID - ID of the Dom element that the map show be in.
                 * @param {string} homeButtonID - ID to give the home button of the map. If this is not provided (undefined or null) then no home button is initialized for this map
                 * @param {boolean} showSlider - Used to tell the map initialization to include a slider or not.
                 * @param {string} sliderPosition - Position of the zoom slider within the map control. Valid values are: "top-left", "top-right", "bottom-left", "bottom-right". The default value is "top-left".
                 * @param {boolean} showScalebar - Used to tell the map to show the scale bar or not.
                 * @param {boolean} showMapElements - used to toggle showing individual map items.
                 * @param {object} initData - This is an object built from the URL used to navigate to this page. It is the bookmarking data in the URL if there was any.
                 */
                self.init = function(mapID, homeButtonID, showSlider, sliderPosition, showScalebar, showMapElements, mapElementsClass, initData) {
                    self.createMap(mapID, homeButtonID, showSlider, sliderPosition, showScalebar, initData);
                    self.mapElementsClass = mapElementsClass;
                    self.showMapElements = showMapElements;

                    topic.subscribe("NewMapThemeSelected", self.updateMapInfo);
                    topic.subscribe("SelectedMapChanged", self.selectedMapChanged);
                    topic.subscribe("MapRenderUpdated", self.mapRendererUpdated);
                    topic.subscribe("NewColorRamp", self.mapColorRampUpdated);
                    topic.subscribe("MapFrameInitialized", self.mapFrameInitialized);
                    topic.subscribe("CustomeMapBreaks", self.customMapBreaksChanged);
                }; //end init

                // create a popup to replace the map's info window
                self.fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_BACKWARD_DIAGONAL,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([0, 255, 255]), 2), new Color([0, 255, 255, 0.25]));

                self.pointSymbol = new SimpleMarkerSymbol("circle", 26, null,
                    new Color([0, 0, 0, 0.25]));

                self.popup = new Popup({
                    fillSymbol: self.fillSymbol,
                    markerSymbol: self.pointSymbol,
                    titleInBody: false,
                    visibleWhenEmpty: false,
                    hideDelay: -1
                }, dc.create("div"));

                /**
                 *Creates a map.
                 *
                 * @method createMap
                 * @param {string} mapID - ID of the Dom element that the map show be in.
                 * @param {string} homeButtonID - ID to give the home button of the map. If this is not provided (undefined or null) then no home button is initialized for this map
                 * @param {boolean} showSlider - Used to tell the map initialization to include a slider or not.
                 * @param {string} sliderPosition - Position of the zoom slider within the map control. Valid values are: "top-left", "top-right", "bottom-left", "bottom-right". The default value is "top-left".
                 * @param {boolean} showScalebar - Used to tell the map to show the scale bar or not.
                 * @param {object} initializationData - This is an object built from the URL used to navigate to this page. It is the bookmarking data in the URL if there was any.
                 */
                self.createMap = function(mapID, homeButtonID, showSlider, sliderPosition, showScalebar, initializationData) {
                    self.mapInitData = initializationData;
                    var extentData = self.mapInitData ? self.mapInitData.extent : appConfig.initExtent;
                    this.mapID = mapID;
                    this.map = new Map(mapID, {
                        extent: new Extent(extentData),
                        infoWindow: self.popup,
                        minZoom: 7,
                        maxZoom: 19,
                        slider: showSlider,
                        sliderPosition: sliderPosition,
                        showAttribution: false,
                        logo: false,
                        autoResize: true
                    });

                    if (showScalebar) {
                        var scalebar = new Scalebar({
                            map: self.map,
                            scalebarUnit: this.units
                        });
                    }

                    if (homeButtonID) {
                        // create div for homebutton. vw
                        var homeButton = new HomeButton({
                            map: self.map,
                            visible: true, //show the button
                            extent: new Extent(appConfig.initExtent)
                        }, dc.create("div", {
                            id: homeButtonID
                        }, mapID, "last"));
                        homeButton._homeNode.title = "Original Extent";
                        homeButton.startup();
                    }

                    this.map.on("load", self.mapLoaded);
                    //this.map.on("click", self.mapClicked);
                    this.map.on("extent-change", self.mapExtentChanged);

                    self.mapExtent(this.map.extent);

                    if (self.mapInitData) {
                        //self.mapColorRamp(self.mapInitData.colorRamp);
                        self.mapCBRCurrent(self.mapInitData.colorPalet.ramp);
                        self.legendOpacity(self.mapInitData.mapOpacity);
                        self.mapColorRamp(self.mapInitData.colorRamp);
                        //self.mapCBRCurrent(self.colorPalet);
                    }

                }; //end createMap

                /**
                Event handler for the maps load event.

                @method mapLoad
                @param {object} params - Contains the map that was loaded.
                **/
                self.mapLoaded = function(params) {

                     //add title panel
                    var titleHTML = "<div id='mapFrameTitlePanel_{value}' title='Click here to select this map.' class='mapFrameTitlePanel selected {mapElementsClass}'><h2 id='mapFrameTitle_{value}'></h2></div>";
                    titleHTML = titleHTML.replace(/{value}/gi, self.mapID).replace(/{mapElementsClass}/gi, self.mapElementsClass);

                    dc.place(titleHTML, self.mapID, "last");

                    dom.byId("mapFrameTitle_{value}".replace(/{value}/gi, self.mapID)).innerHTML = self.mapTheme().ShortName;
                    if (!self.showMapElements) {
                        $("#" + "mapFrameTitlePanel_{value}".replace(/{value}/gi, self.mapID)).addClass("hidden");
                    }
                    $("#" + "mapFrameTitlePanel_{value}".replace(/{value}/gi, self.mapID)).click(function() {
                        self.mapClicked(null);
                    });

                    var layersTOC = [];
                    
                    for (var i = 0; i < appConfig.layerInfo.length; i++) {
                        var info = appConfig.layerInfo[i];
                        if (info.showTOC !== false) {
                            layersTOC.push(appConfig.layerInfo[i]);
                        }
                    }

                    for (var value = 0; value < 6; value++) {
                        if (mapModel.baseMapInstance._layers[layersTOC[value].id].visible)
                        {
                            layersTOC[value].checked = "checked";
                            self.map.getLayer(layersTOC[value].id).show();
                        }
                        else{
                            layersTOC[value].checked = "";
                            self.map.getLayer(layersTOC[value].id).hide();
                        }
                    }

                    var mapOptionCboxes = $(".layerOptionCbx");
                    $.each(mapOptionCboxes, function(index, cbox) {
                        var mapName = $(cbox).attr('map');
                        if (mapName === "map1") {
                            for (var i = 0; i < layersTOC.length; i++) {
                                var layer = layersTOC[i];
                                if (layer.id === cbox.value) {
                                    if (layer.checked === "checked") {
                                        $(cbox).attr('checked', true);
                                    }
                                    else{
                                        $(cbox).attr('checked', false);
                                    }
                                }
                            }
                        }
                    });

                    //add legend panel
                    var legendHTML =
                    "<div id='legendPanel_{value}' class='mapFrameLegendPanel {mapElementsClass}'>" +
                    "<ul id='legendPanelBar_{value}'><li>Legend<div id='censusDiv_{value}'>" +
                    "<div id='legendTitle_{value}' class='legendTitle'></div><p class='sliderInfo'>Transparency Slider</p>" +
                    "<div id='sliderDiv_{value}' class='legendSliderDiv'><input id='slider_{value}' class='balSlider'/></div>" +
                    "<div id='legendDiv_{value}'></div>" +
                    "<div class='legal'>Data Source:&nbsp;<span id='dataSource_{value}'></span></div></div></li>" +
                    "<li>Map Layers" +
                    "<ul id='layerOptionPanelBar_{value}'>" +
                    "<li class='panelBarLi'><input " + layersTOC[0].checked + " class='layerOptionCbx' map='" + self.mapID + "' value=" +layersTOC[0].id +" id='" + self.mapID + "chk1' type='checkbox'><label class='mapLayerLabel' for='" + self.mapID + "chk1'>" + layersTOC[0].title + "</label></li>" +
                    "<li class='panelBarLi'><input " + layersTOC[1].checked + " class='layerOptionCbx' map='" + self.mapID + "' value=" +layersTOC[1].id +" id='" + self.mapID + "chk2' type='checkbox'><label class='mapLayerLabel' for='" + self.mapID + "chk2'>" + layersTOC[1].title + "</label></li>" +
                    "<li class='panelBarLi'><input " + layersTOC[2].checked + " class='layerOptionCbx' map='" + self.mapID + "' value=" +layersTOC[2].id +" id='" + self.mapID + "chk3' type='checkbox'><label class='mapLayerLabel' for='" + self.mapID + "chk3'>" + layersTOC[2].title + "</label></li>" +
                    "<li class='panelBarLi'><input " + layersTOC[3].checked + " class='layerOptionCbx' map='" + self.mapID + "' value=" +layersTOC[3].id +" id='" + self.mapID + "chk4' type='checkbox'><label class='mapLayerLabel' for='" + self.mapID + "chk4'>" + layersTOC[3].title + "</label></li>" +
                    "<li class='panelBarLi'><input " + layersTOC[4].checked + " class='layerOptionCbx' map='" + self.mapID + "' value=" +layersTOC[4].id +" id='" + self.mapID + "chk5' type='checkbox'><label class='mapLayerLabel' for='" + self.mapID + "chk5'>" + layersTOC[4].title + "</label></li>" +
                    "<li class='panelBarLi'><input " + layersTOC[5].checked + " class='layerOptionCbx' map='" + self.mapID + "' value=" +layersTOC[5].id +" id='" + self.mapID + "chk6' type='checkbox'><label class='mapLayerLabel' for='" + self.mapID + "chk6'>" + layersTOC[5].title + "</label></li>" +
                    "</ul>" +
                    "</li></ul></div>";


                    //$(".layerOptionCbx").click(self.onCheckBoxClick);

                    $( "#dataTable tbody tr" ).on( "click", function() {
                      console.log( $( this ).text() );
                    });

                    legendHTML = legendHTML.replace(/{value}/gi, self.mapID).replace(/{mapElementsClass}/gi, self.mapElementsClass);

                    dc.place(legendHTML, self.mapID, "last");

                    var pbar = $("#legendPanelBar_{value}".replace(/{value}/gi, self.mapID)).kendoPanelBar();

                    //create esri legend
                    self.legend = new Legend({
                        map: params.map,
                        layerInfos: [{
                            layer: self.mapTheme().Service ? params.map.getLayer(self.mapTheme().Service) : params.map.getLayer("Census2010byBlockGroup"),
                            title: self.mapTheme().ShortName
                        }]
                    }, "legendDiv_{value}".replace(/{value}/gi, self.mapID));

                    self.legend.startup();

                    dom.byId("legendTitle_{value}".replace(/{value}/gi, self.mapID)).innerHTML = self.mapTheme().ShortName;
                    dom.byId("dataSource_{value}".replace(/{value}/gi, self.mapID)).innerHTML = self.mapTheme().Source;

                    //create transparency slider
                    $("#slider_{value}".replace(/{value}/gi, self.mapID)).kendoSlider({
                        change: self.updateMapOpacity,
                        slide: self.updateMapOpacity,
                        increaseButtonTitle: "Decrease",
                        decreaseButtonTitle: "Increase",
                        min: 0,
                        max: 1,
                        smallStep: 0.1,
                        largeStep: 0.01,
                        value: (self.mapInitData !== undefined) ? self.mapInitData.mapOpacity : 0.8
                    }).data("kendoSlider");
                    if (!self.mapTheme().Service) {
                        $("#slider_{value}".replace(/{value}/gi, self.mapID)).getKendoSlider().enable(false);
                    } else {
                        params.map.getLayer(self.mapTheme().Service).on("opacity-change", self.layerOpacityChanged);
                    }

                    if (!self.showMapElements) {
                        $("#" + "legendPanel_{value}".replace(/{value}/gi, self.mapID)).addClass("hidden");
                    }

                    $("#mapFrameGridCell" + self.mapID.replace("map", "")).click(function() {
                        self.mapClicked(null);
                    });

                    $(".layerOptionCbx").on( "click", self.onCBoxClick);

                    $(".layerOptionCbx").unbind("click").click(self.onCBoxClick);

                    markupToolsVM.initializeGraphics(self.mapID);

                }; //end mapLoaded

                /**
                This is called when the renderer is updated for a map. This it tracked by an observable variable in the map object.

                @method mapRendererUpdated
                **/
                self.mapRendererUpdated = function(e) {
                    //check to see if this map is the current selected map
                    if (mapModel.mapInstance.id === self.mapID && self.mapTheme().Service) {
                        try {
                            self.legend.refresh([{
                                layer: self.map.getLayer(self.mapTheme().Service),
                                title: self.mapTheme().ShortName
                            }]);
                        } catch (e) {
                            // console.log(e);
                        }
                        var lyr = self.map.getLayer(self.mapTheme().Service);
                        if (lyr) {
                            self.renderer(lyr.layerDrawingOptions[0].renderer);
                        }
                    }
                }; //end mapRendererUpdated

                /**
                This is called when the color ramp is changed on a map. This is tracked by an observable variable in the map object.

                @method mapColorRampUpdated
                @param {object} newRamp - The new color ramp object
                @param {object} cbrCurrent - The new cbr object
                **/
                self.mapColorRampUpdated = function(newRamp, cbrCurrent) {
                    if (mapModel.mapInstance.id === self.mapID) {
                        self.mapColorRamp(newRamp);
                        self.mapCBRCurrent(cbrCurrent.Ramp);
                    }
                }; //end mapColorRampUpdated

                /**
                Event triggered by clicking a map. This makes the clicked map the selected map

                @method mapClicked
                @param {object} e - click event (not used)
                **/
                self.mapClicked = function() {
                    if (!self.isSelected) {
                        mapModel.mapInstance = self.map;
                        topic.publish("SelectedMapChanged", self.map);
                    }
                }; //end mapClicked

                /**
                Event triggered when map extent changes.

                @method mapExtentChanged
                @param {object} params - map extent change data.
                **/
                self.mapExtentChanged = function(params) {
                    if ((params.delta && ((params.delta.x < -20 || params.delta.x > 20) || (params.delta.y < -20 || params.delta.y > 20))) || params.levelChange) {
                        mapModel.syncMapExtents(params.extent, params.target.id);
                        self.mapExtent(self.map.extent);
                    }
                }; //end mapExtentChanged

                /**
                Event triggered when map custom breaks changes.

                @method customMapBreaksChanged
                @param {object} params - contains the new custom breaks.
                **/
                self.customMapBreaksChanged = function(params) {
                    if (mapModel.mapInstance.id === self.mapID) {
                        if (params.customSet) {
                            self.customBreaks({
                                breaks: params.breaks
                            });
                        } else {
                            self.customBreaks({});
                        }
                    }
                }; //end customMapBreaksChanged

                /**
                Event triggered when map opacity is changed

                @method updateMapOpacity
                @param {string} name - description.
                **/
                self.updateMapOpacity = function(e) {
                    if (self.mapTheme().Service) {
                        var sLayer = self.map.getLayer(self.mapTheme().Service);
                        self.legendOpacity(e.value);
                        sLayer.setOpacity(e.value);
                        if (self.mapID === mapModel.baseMapInstance.id) {
                            //publish opacity changed to update legend in legend window
                            //topic.publish("BaseMapOpacityChanged", e.value);
                            legendVM.updateSliderOpacity(e.value);
                        }
                        self.legend.refresh();
                    }
                }; //end updateMapOpacity

                /**
                Called when the opacity of the map changes - if it doesn't match current opacity value stored need to update value
                Used to keep main legend in legend window and map frame legend in sync

                @method layerOpacityChanged
                @param {object} params - contains layer opacity information.
                **/
                self.layerOpacityChanged = function(params) {
                    if (params.opacity !== self.legendOpacity()) {
                        $("#slider_{value}".replace(/{value}/gi, self.mapID)).getKendoSlider().value(params.opacity);
                        legendVM.updateSliderOpacity(params.opacity);
                    }
                }; //end layerOpacityChanged

                /**
                Called when the thematic map is changed for a map.

                @method updateMapInfo
                @param {object} dataItem - Themeatic map info..
                **/
                self.updateMapInfo = function(dataItem) {
                    //check to see if this map is the current selected map
                    if (mapModel.mapInstance.id === self.mapID && dataItem) {
                        self.mapTheme(dataItem);

                        //update legend elements and labels
                        if (self.legend !== null) {
                            dom.byId("mapFrameTitle_{value}".replace(/{value}/gi, self.mapID)).innerHTML = self.mapTheme().ShortName;
                            dom.byId("legendTitle_{value}".replace(/{value}/gi, self.mapID)).innerHTML = self.mapTheme().ShortName;
                            dom.byId("dataSource_{value}".replace(/{value}/gi, self.mapID)).innerHTML = self.mapTheme().Source;
                        }
                        //if map loaded - enable slider, update legend, add opacity changed event
                        if (self.map.loaded) {

                            $("#slider_{value}".replace(/{value}/gi, self.mapID)).getKendoSlider().enable(true);

                            self.legend.refresh([{
                                layer: self.map.getLayer(self.mapTheme().Service),
                                title: self.mapTheme().ShortName
                            }]);

                            //self.map.getLayer(self.mapTheme().Service).on("opacity-change", self.layerOpacityChanged);

                        } else {
                            // console.log("map-vm: updateMapInfo");
                        }
                    }
                }; //end updateMapInfo

                /**
                Toggles the visibility of the legend and title in each map.

                @method toggleMapElements
                @param {boolean} show - Toggles the visibility of the legend and title in each map.
                **/
                self.toggleMapElements = function(show) {
                    if (show) {
                        $("#mapFrameTitlePanel_{value}".replace(/{value}/gi, self.mapID)).removeClass("hidden");
                        $("#legendPanel_{value}".replace(/{value}/gi, self.mapID)).removeClass("hidden");
                    } else {
                        $("#mapFrameTitlePanel_{value}".replace(/{value}/gi, self.mapID)).addClass("hidden");
                        $("#legendPanel_{value}".replace(/{value}/gi, self.mapID)).addClass("hidden");
                    }
                }; //end toggleMapElements

                /**
                Called when the selected map is changed to set the new selected map toc and legend

                @method selectedMapChanged
                @param {object} map - The new map.
                **/
                self.selectedMapChanged = function(map) {
                    if (map.id === self.mapID && map.loaded) {
                        self.isSelected = true;
                        $("#" + "mapFrameTitlePanel_{value}".replace(/{value}/gi, self.mapID)).addClass("selected");
                        topic.publish("SelectedMapChagned.UpdateTOC", {
                            mapName: self.mapTheme().ShortName,
                            renderer: self.renderer(),
                            colorRamp: self.mapColorRamp(),
                            mapIndex: self.mapID.replace("map", ""),
                            currentCBR: self.mapCBRCurrent(),
                            customBreaks: self.customBreaks()
                        });
                    } else {
                        self.isSelected = false;
                        $("#" + "mapFrameTitlePanel_{value}".replace(/{value}/gi, self.mapID)).removeClass("selected");
                    }
                }; //end selectedMapChanged


                self.onCBoxClick = function(e) {
                    var layerName = e.currentTarget.value;
                    var mapId = e.currentTarget.id.substring(3, 4) - 1;
                    var layer = mapModel.mapInstances[mapId].getLayer(layerName);
                        if (layer.visible) {
                            layer.hide();
                        } else {
                            layer.show();
                        }
                    var baseLayer = mapModel.mapInstances[mapId].getLayer("esriBasemap");
                        if (layer.id === "esriImagery" && layer.visible === true) {
                            baseLayer.hide();
                        } else {
                            baseLayer.show();
                        }
                };

                /**
                Called when the selected map is changed to set the new selected map toc and legend

                @method mapFrameInitialized
                @param {object} map - The new map.
                @param {object} initData - initialization data provided with the URL
                **/
                self.mapFrameInitialized = function(map, initData) {
                    if (map.id !== self.mapID) {
                        self.isSelected = false;
                        $("#" + "mapFrameTitlePanel_{value}".replace(/{value}/gi, self.mapID)).removeClass("selected");
                    }
                }; //end mapFrameInitialized

                /**
                This function is used by the bookmark delegate to get all of the maps properties and add them to the bookmarking URL.

                @method getMapBookmarkInfo
                **/
                self.getMapBookmarkInfo = function() {
                    return {
                        ID: self.mapID,
                        Extent: self.mapExtent(),
                        MapInfo: self.mapTheme(),
                        Opacity: self.legendOpacity(),
                        Renderer: self.renderer(),
                        ColorRamp: self.mapColorRamp(),
                        CBRCurrent: self.mapCBRCurrent(),
                        customBreaks: self.customBreaks()
                    };
                }; //end getMapBookmarkInfo

                /**
                method exicuted when a map is removed from the display.

                @method destroy
                **/
                self.destroy = function() {
                    //remove/destroy dom elements and kendo widgets
                    $("#mapFrameTitlePanel_{value}".replace(/{value}/gi, self.mapID)).remove();
                    $("#legendPanelBar_{value}".replace(/{value}/gi, self.mapID)).getKendoPanelBar().destroy();
                    $("#legendPanel_{value}".replace(/{value}/gi, self.mapID)).remove();

                    //destroy map and legend
                    if (this.map) {
                        this.map.destroy();
                        markupToolsVM.clearGraphicsLayer(this.map.id);
                    }
                    if (this.legend) {
                        this.legend.destroy();
                    }
                }; //end destroy

            }; //end

            return MapVM;
        }
    );
}());