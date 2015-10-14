/**
 * Legend div used to launch Legend
 *
 * @class legend-vm
 */

(function() {

    "use strict";

    define([
            "dojo/dom",
            "dojo/dom-construct",
            "dojo/topic",
            "app/models/map-model",
            "app/config/cbrConfig",
            "dojo/text!app/views/legendHelp-view.html",
            "app/vm/help-vm",
            "dojo/text!app/views/legend-view.html",
            "app/helpers/magNumberFormatter",
            "app/helpers/bookmark-delegate"
        ],
        function(dom, dc, tp, mapModel, conf, helpView, helpVM, legendview, magNumberFormatter, bookmarkDelegate) {

            var LegendVM = new function() {

                /**
                 * Store reference to module this object.
                 *
                 * @property self
                 * @type {*}
                 */
                var self = this;

                self.legend;
                self.legendTitle = "Legend";
                self.legendInitialized = false;

                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;
                // console.log("Height: " + self.winHeight + " & " + "Width: " + self.winWidth);
                self.newWindowWidth = self.winWidth;
                self.winVisible = true;

                if (self.winWidth <= 668) {
                    self.newWindowHeight = 5;
                    self.newWindowWidth = "210px";
                    self.winVisible = false;
                    self.winLocation = 220;
                } else if (self.winWidth <= 800) {
                    self.newWindowHeight = 50;
                    self.newWindowWidth = "210px";
                    self.winVisible = false;
                    self.winLocation = 220;
                } else if (self.winWidth <= 1024) {
                    self.newWindowHeight = (self.winHeight / 2) - 148;
                    self.newWindowWidth = "210px";
                    self.winLocation = 215;
                } else if (self.winWidth <= 1200) {
                    self.newWindowWidth = "210px";
                    self.winLocation = 215;
                } else {
                    self.newWindowHeight = (self.winHeight / 2) - 50;
                    self.newWindowWidth = "250px";
                    self.winLocation = 255;
                }

                /**
                 * Initialize the class.
                 *
                 * @method init
                 */
                self.init = function(initializationData) {
                    dc.place(legendview, "mapContainer", "after");

                    tp.subscribe("MapLoaded", self.mapLoaded);
                    tp.subscribe("addTOCLayers", self.addTOCLayers);
                    tp.subscribe("MapRenderUpdated", self.updateLegend);
                    tp.subscribe("NewMapThemeSelected", self.updateLegendTitle);
                    tp.subscribe("legendStateO", function() {
                        self.openWindow();
                    });
                    tp.subscribe("legendStateC", function() {
                        self.closeWindow();
                    });
                    tp.subscribe("BaseMapOpacityChanged", self.updateSliderOpacity);

                    var legendWindow = $("#legendWindowDiv").kendoWindow({
                        width: self.newWindowWidth, //250px
                        height: "auto",
                        title: self.legendTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: self.winVisible, //true
                        resizable: false
                    }).data("kendoWindow");

                    // Initial window placement
                    $("#legendWindowDiv").closest(".k-window").css({
                        top: "55px", //self.newWindowHeight,
                        left: self.winWidth - self.winLocation
                    });

                    // attach collapse event handler during initialization. vw
                    var panelBar2 = $("#panelBar2").kendoPanelBar({
                        collapse: self.onCollapse,
                        expand: self.onExpand
                    }).data("kendoPanelBar");

                    var helpButton = legendWindow.wrapper.find(".k-i-help");
                    helpButton.click(function() {
                        helpVM.openWindow(helpView);
                    });

                    // Now initialize the map
                    mapModel.createLayers(mapModel.mapInstance, initializationData);

                }; //end init
                //===============================================================================================>
                /**
                Method for opening the window.

                @method openWindow
                **/
                self.openWindow = function() {
                    var win = $("#legendWindowDiv").data("kendoWindow");
                    win.restore();
                    win.open();

                    $("#legendWindowDiv").closest(".k-window").css({
                        top: "55px", //self.newWindowHeight,
                        left: self.winWidth - self.winLocation
                    });
                };

                self.closeWindow = function() {
                    var win = $("#legendWindowDiv").data("kendoWindow");
                    win.close();
                };

                //removes selected state from Advanced Map Options Panel vw
                self.onCollapse = function(e) {
                    $(e.item).children().removeClass("k-state-selected");
                };
                self.onExpand = function(e) {
                    $(e.item).children().removeClass("k-state-selected");
                };

                // change window location when window resized
                self.winResize = function() {
                    self.winWidth = document.documentElement.clientWidth;
                    self.winHeight = document.documentElement.clientHeight;

                    $("#legendWindowDiv").closest(".k-window").css({
                        top: "55px", //self.newWindowHeight,
                        left: self.winWidth - self.winLocation
                    });
                };

                var resizeTimer;
                $(window).resize(function() {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(self.winResize, 200);
                });

                self.addTOCLayers = function(layersToAdd) { //add layer options here...
                    if (mapModel.mapInstance.id === mapModel.baseMapInstance.id) {
                        $("#layersList").empty();
                        var initialOpacity = (mapModel.initializationData === undefined) ? 0.8 : mapModel.initializationData.maps[0].mapOpacity;
                        $.each(layersToAdd, function(index, layer) {
                            var liId = "li" + index;
                            dc.create("li", {
                                id: liId
                            }, "layersList", "last");
                            //layer.visible set by check in layer options passed in if present
                            var chkId = "c" + layer.id;
                            if (mapModel.initializationData !== undefined) {
                                for (var i = 0; i < mapModel.initializationData.LO.length; i++) {
                                    layer.visible = false;
                                    if (mapModel.initializationData.LO[i] === chkId) {
                                        layer.visible = true;
                                        break;
                                    }
                                }
                            }
                            dc.create("input", {
                                id: chkId,
                                type: "checkbox",
                                class: "vertMiddle",
                                onclick: self.onCheckBoxClick,
                                checked: layer.visible
                            }, liId, "first"); //TODO legendLayerOptions check is about here on visible
                            dc.create("label", {
                                for: chkId,
                                innerHTML: layer.title,
                                class: "vertMiddle layerListLabel"
                            }, liId, "last");
                            if (layer.visible) {
                                bookmarkDelegate.legendLayerOptions.push("c" + layer.id);
                            }
                        });

                        $("#slider").kendoSlider({
                            change: function(e) {
                                var sLayer = mapModel.baseMapInstance.getLayer("Census2010byBlockGroup");
                                sLayer.setOpacity(e.value);
                                self.legend.refresh(); 
                            },
                            slide: function(e) {
                                var sLayer = mapModel.baseMapInstance.getLayer("Census2010byBlockGroup");
                                sLayer.setOpacity(e.value);
                                self.legend.refresh(); 
                            },
                            increaseButtonTitle: "Decrease",
                            decreaseButtonTitle: "Increase",
                            min: 0,
                            max: 1,
                            smallStep: 0.1,
                            largeStep: 0.01,
                            value: initialOpacity
                        }).data("kendoSlider");
                    }
                };

                self.onCheckBoxClick = function(e) {
                    var layerId = e.currentTarget.id.substr(1);
                    for (var i = 0; i < mapModel.mapInstances.length; i++) {
                        var layer = mapModel.mapInstances[i].getLayer(layerId);
                        // console.log(layer);
                        if (layer.visible) {
                            layer.hide();
                            bookmarkDelegate.legendLayerOptions.remove("c" + layerId);
                        } else {
                            layer.show();
                            bookmarkDelegate.legendLayerOptions.push("c" + layerId);
                        }
                        var baseLayer = mapModel.mapInstance.getLayer("esriBasemap");
                        if (layer.id === "esriImagery" && layer.visible === true) {
                            baseLayer.hide();
                        } else {
                            baseLayer.show();
                        }
                    }
                    tp.publish("BaseLayersUpdated");
                };

                //Thematic Legend
                self.mapLoaded = function(map) {
                    if (map.id === mapModel.baseMapInstance.id) {
                        if (!self.legendInitialized) {
                            self.legend = new esri.dijit.Legend({
                                map: map,
                                layerInfos: [{
                                    layer: map.getLayer("Census2010byBlockGroup"),
                                    title: self.legendMapTitle
                                }]
                            }, "legendDiv");
                            self.legend.startup();
                            dom.byId("legendTitle").innerHTML = self.legendMapTitle;
                            // dom.byId("title2").innerHTML = self.legendMapTitle;
                            dom.byId("dataSource").innerHTML = self.sourceInfo;
                            self.legendInitialized = true;
                        }
                    }
                };

                self.updateLegend = function() {
                    if (mapModel.mapInstance.id === mapModel.baseMapInstance.id) {
                        self.legend.refresh([{
                            layer: mapModel.mapInstance.getLayer("Census2010byBlockGroup"),
                            title: self.legendMapTitle
                        }]);
                        dom.byId("legendTitle").innerHTML = self.legendMapTitle;
                        // dom.byId("title2").innerHTML = "&nbsp;-&nbsp;&nbsp;" + self.legendMapTitle;
                        dom.byId("dataSource").innerHTML = self.sourceInfo;
                    }
                };

                self.updateLegendTitle = function(dataItem) {
                    if (mapModel.mapInstance.id === mapModel.baseMapInstance.id) {
                        self.legendMapTitle = dataItem.ShortName;
                        self.sourceInfo = dataItem.Source;
                    }
                };

                /**
                Updates the value of the transparency slider

                @method updateSliderOpacity
                @param {double} opacity - value of layer transparency to update slider to match.
                **/
                self.updateSliderOpacity = function(opacity) {
                    $("#slider").getKendoSlider().value(opacity);
                }; //end updateSliderOpacity

            }; //end LegendVM

            return LegendVM;

        } //end function
    );
}());