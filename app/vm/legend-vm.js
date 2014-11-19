/**
 * Legend div used to launch Legend
 *
 * @class legend-vm
 */

(function () {

    "use strict";

    define([
        "dojo/dom-construct",
        "dojo/dom",
        "dojo/topic",
        "app/models/map-model",
        "app/config/cbrConfig",
        "dojo/text!app/views/legendHelp-view.html",
        "app/vm/help-vm",
        "dojo/text!app/views/legend-view.html",

        "vendor/kendo/web/js/jquery.min",
        "vendor/kendo/web/js/kendo.web.min"
    ],

        function (dc, dom, tp, mapModel, conf, helpView, helpVM, legendview) {

            var LegendVM = new function () {

                /**
                 * Store reference to module this object.
                 *
                 * @property self
                 * @type {*}
                 */
                var self = this;

                self.legend;
                self.legendTitle = "Legend";

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
                self.init = function () {
                    dc.place(legendview, "map", "after");

                    tp.subscribe("Map Loaded", self.mapLoaded);
                    tp.subscribe("addTOCLayers", self.addTOCLayers);
                    tp.subscribe("renderUpdated", self.updateLegend);
                    tp.subscribe("NewMapSelected", self.updateLegendTitle);
                    tp.subscribe("legendStateO", function () { self.openWindow(); });
                    tp.subscribe("legendStateC", function () { self.closeWindow(); });

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
                        top: self.newWindowHeight,
                        left: self.winWidth - self.winLocation
                    });

                    // attach collapse event handler during initialization. vw
                    // var panelBar2 = $("#panelBar2").kendoPanelBar({
                    $("#panelBar2").kendoPanelBar({
                            collapse: self.onCollapse,
                            expand: self.onExpand
                        }).data("kendoPanelBar");

                    var helpButton = legendWindow.wrapper.find(".k-i-help");
                    helpButton.click(function () {
                        helpVM.openWindow(helpView);
                    });

                    // Now initialize the map
                    mapModel.createLayers();

                }; //end init
//****************************************************************
                /**
                Method for opening the window.

                @method openWindow
                **/
                self.openWindow = function () {
                    var win = $("#legendWindowDiv").data("kendoWindow");
                    win.restore();
                    win.open();

                    $("#legendWindowDiv").closest(".k-window").css({
                        top: self.newWindowHeight,
                        left: self.winWidth - self.winLocation
                    });
                };

                self.closeWindow = function () {
                  var win = $("#legendWindowDiv").data("kendoWindow");
                    win.close();
                };

                //removes selected state from Advanced Map Options Panel vw
                self.onCollapse = function (e) {
                    $(e.item).children().removeClass("k-state-selected");
                };
                self.onExpand = function (e) {
                    $(e.item).children().removeClass("k-state-selected");
                };

                // change window location when window resized
                self.winResize = function () {
                  self.winWidth = document.documentElement.clientWidth;
                  self.winHeight = document.documentElement.clientHeight;

                  $("#legendWindowDiv").closest(".k-window").css({
                        top: self.newWindowHeight,
                        left: self.winWidth - self.winLocation
                    });
                };

                var resizeTimer;
                  $(window).resize(function() {
                  clearTimeout(resizeTimer);
                  resizeTimer = setTimeout(self.winResize, 200);
                });

                self.addTOCLayers = function (layersToAdd) {
                  $("#layersList").empty();
                  $.each(layersToAdd, function (index, layer) {
                      var liId = "li" + index;
                      dc.create("li", { id: liId }, "layersList", "last");

                      var chkId = "c" + layer.id;
                      dc.create("input", { id: chkId, type: "checkbox", class: "vertMiddle", onclick: self.onCheckBoxClick, checked: layer.visible }, liId, "first");
                      dc.create("label", { for: chkId, innerHTML: layer.title, class: "vertMiddle layerListLabel" }, liId, "last");

                      $("#slider").kendoSlider({
                            change: function (e) {
                              var sLayer = mapModel.mapInstance.getLayer("Census2010byBlockGroup");
                              sLayer.setOpacity(e.value);
                            },
                            slide: function (e) {
                              var sLayer = mapModel.mapInstance.getLayer("Census2010byBlockGroup");
                              sLayer.setOpacity(e.value);
                            },
                            increaseButtonTitle: "Decrease",
                            decreaseButtonTitle: "Increase",
                            min: 0,
                            max: 1,
                            smallStep: 0.1,
                            largeStep: 0.01,
                            value: 0.8
                      }).data("kendoSlider");

                  });
                };

                self.onCheckBoxClick = function (e) {
                    var layerId = e.currentTarget.id.substr(1);
                    var layer = mapModel.mapInstance.getLayer(layerId);
                    (layer.visible) ? layer.hide() : layer.show();
                };

              //Thematic Legend
                self.mapLoaded = function () {
                  self.legend = new esri.dijit.Legend ({
                    map: mapModel.mapInstance,
                    layerInfos: [{
                      layer: mapModel.mapInstance.getLayer("Census2010byBlockGroup"),
                      title: self.legendMapTitle
                    }]
                  }, "legendDiv");
                  self.legend.startup();
                  dom.byId("legendTitle").innerHTML = self.legendMapTitle;
                  dom.byId("title2").innerHTML = self.legendMapTitle;
                  dom.byId("dataSource").innerHTML = self.sourceInfo;
                };

                self.updateLegend = function () {
                  self.legend.refresh([{
                       layer: mapModel.mapInstance.getLayer("Census2010byBlockGroup"),
                       title: self.legendMapTitle
                     }]);
                  dom.byId("legendTitle").innerHTML = self.legendMapTitle;
                  dom.byId("title2").innerHTML = self.legendMapTitle;
                  dom.byId("dataSource").innerHTML = self.sourceInfo;
                };

                self.updateLegendTitle = function (dataItem) {
                  self.legendMapTitle = dataItem.ShortName;
                  self.sourceInfo = dataItem.Source;
                };

              };//end LegendVM

            return LegendVM;

      }//end function
    );
} ());