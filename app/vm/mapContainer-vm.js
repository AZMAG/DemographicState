/**
 * Map Container
 *
 * @class mapContainer-vm
 */

(function() {

    "use strict";

    define([
            "dojo/dom-construct",
            "dojo/_base/array",
            "dojo/_base/lang",
            "dojo/dom-style",
            "dojo/topic",
            "dojo/text!app/views/mapContainer-view.html",
            "app/models/map-model",
            "app/vm/map-vm",
            "app/helpers/bookmark-delegate"
        ],
        function(dc, da, lang, ds, topic, view, mapModel, mapVM, bookmarkDelegate) {
            var MapContainerVM = new function() {

                /**
                 * Store reference to module this object.
                 *
                 * @property self
                 * @type {*}
                 */
                var self = this;

                self.mapVMs = [];

                self.initializationData = null;

                /**
                 * Initialize the class.
                 *
                 * @method init
                 */
                self.init = function() {
                    dc.place(view, "display", "first");

                    topic.subscribe("AddNewMap", self.addNewMap);
                    topic.subscribe("RemoveAMap", self.removeMap);
                    topic.subscribe("BaseLayersUpdated", self.handleMapInfoUpdated);
                    topic.subscribe("MapLoaded", self.mapLoaded);

                    self.initializationData = bookmarkDelegate.getQueryStringMapDataObj();

                    if (self.initializationData) {
                        for (var i = 0; i < self.initializationData.maps.length; i++) {
                            var mapInitData = self.initializationData.maps[i];
                            mapInitData.extent = self.initializationData.E;
                            if (i === 0) {
                                // initialize first map
                                var initialMapVM = new mapVM();
                                initialMapVM.init("map1", "HomeButton1", true, "bottom-left", true, false, "mapFrameElementRight", mapInitData);
                                mapModel.loadInitialMap(initialMapVM.map);
                                self.mapVMs.push(initialMapVM);

                                initialMapVM.mapInfoUpdated.subscribe(self.handleMapInfoUpdated);
                            } else {
                                //self.addNewMap();
                            }
                        }
                    } else {
                        // initialize first map
                        var initialMapVM = new mapVM();
                        initialMapVM.init("map1", "HomeButton1", true, "bottom-left", true, false, "mapFrameElementRight", undefined);
                        mapModel.loadInitialMap(initialMapVM.map);
                        self.mapVMs.push(initialMapVM);

                        initialMapVM.mapInfoUpdated.subscribe(self.handleMapInfoUpdated);
                        mapModel.initializing = false;
                    }

                }; //end init

                /**
                this method adds a new map to the map container.

                @method addNewMap
                @param {object} mapInitData - initialization data from the URL querystring if provided.
                **/
                self.addNewMap = function(mapInitData) {
                    if (self.mapVMs.length < 4) {
                        var centerPnt = mapModel.baseMapInstance.extent.getCenter();
                        var newMapVM;

                        $("#launchLegend").addClass("aDisabled");

                        switch (self.mapVMs.length) {
                            case 1:
                                //Update grid rows
                                topic.publish("UpdateMapFrameGridRows", 2);

                                //apply css to arrange maps
                                $("#map2").removeClass("hidden");
                                $("#map1").width("49.8%");
                                $("#map2").width("49.8%");
                                $("#map2").css("left", "50%");

                                //recenter maps
                                mapModel.recenterMaps(centerPnt);

                                newMapVM = new mapVM();
                                newMapVM.init("map2", null, false, "", false, true, "mapFrameElementLeft", mapInitData);

                                //show map elements for first map
                                self.mapVMs[0].toggleMapElements(true);

                                //close legend and report windows
                                topic.publish("legendStateC", {
                                    name: "Close"
                                });
                                topic.publish("panelStateC", {
                                    name: "Close"
                                });
                                break;

                            case 2:
                                //Update grid rows
                                topic.publish("UpdateMapFrameGridRows", 3);

                                //apply css to arrange maps
                                $("#map3").removeClass("hidden");
                                $("#map1").height("49.8%");
                                $("#map2").height("49.8%");
                                $("#map3").height("49.8%");
                                $("#map3").css("top", "50.2%");
                                $("#map3").width("49.8%");

                                //recenter maps
                                mapModel.recenterMaps(centerPnt);

                                //create new map
                                newMapVM = new mapVM();
                                newMapVM.init("map3", null, false, "", false, true, "mapFrameElementRight", mapInitData);

                                break;

                            case 3:
                                //update UI
                                topic.publish("UpdateMapFrameGridRows", 4);

                                //apply css to arrange maps
                                $("#map4").removeClass("hidden");
                                $("#map4").height("49.8%");
                                $("#map4").css("left", "50%");
                                $("#map4").css("top", "50.2%");
                                $("#map4").width("49.8%");

                                //recenter maps
                                mapModel.recenterMaps(centerPnt);

                                //create new map
                                newMapVM = new mapVM();
                                newMapVM.init("map4", null, false, "", false, true, "mapFrameElementLeft", mapInitData);

                                break;
                        }

                        self.mapVMs.push(newMapVM);
                        mapModel.loadNewMap(newMapVM.map, mapInitData);
                        newMapVM.map.setScale(mapModel.baseMapInstance.getScale());
                        newMapVM.map.centerAt(centerPnt);
                        newMapVM.mapInfoUpdated.subscribe(self.handleMapInfoUpdated);
                    }

                    self.updateAddRemoveButtons();
                };

                /**
                method called when the map's Load event occurrs

                @method mapLoaded
                **/
                self.mapLoaded = function() {
                    if (mapModel.initializing && self.initializationData && self.mapVMs.length < self.initializationData.maps.length) {
                        setTimeout(function() {
                            var mapInitData = self.initializationData.maps[self.mapVMs.length];
                            mapInitData.extent = self.initializationData.E;
                            self.addNewMap(mapInitData);
                        }, 2000);
                    } else {
                        mapModel.initializing = false;
                    }
                };

                /**
                this method removes a map from the map container.

                @method removeMap
                **/
                self.removeMap = function() {
                    if (self.mapVMs.length > 1) {
                        switch (self.mapVMs.length) {
                            case 2:
                                $("#map2").addClass("hidden");
                                $("#map1").css("width", "100%");
                                //var toc = $("#thematicTOC").data("kendoTreeView");
                                //var item = toc.findByText("Total Population");
                                //toc.select(item);
                                $("#launchLegend").removeClass("aDisabled");
                                self.mapVMs[0].toggleMapElements(false);
                                break;
                            case 3:
                                $("#map3").addClass("hidden");
                                $("#map1").height("100%");
                                $("#map2").height("100%");
                                topic.publish("UpdateMapFrameGridRows", 2);
                                break;
                            case 4:
                                $("#map4").addClass("hidden");
                                topic.publish("UpdateMapFrameGridRows", 3);
                                break;
                        }

                        var mapVM = self.mapVMs.pop();
                        mapModel.removeMap(mapVM.map);
                        mapVM.destroy();
                        mapModel.recenterMaps(mapModel.baseMapInstance.extent.getCenter());
                    }

                    self.updateAddRemoveButtons();
                };

                /**
                 * Update displaying the buttons for adding/removing maps.
                 *
                 * @method updateAddRemoveButtons
                 */
                self.updateAddRemoveButtons = function() {
                    // update displaying the button to remove a map
                    if (self.mapVMs.length > 1) {
                        topic.publish("UpdateRemoveAMapButton", {
                            display: true
                        });
                        //hide header title
                        $("#title2").addClass("hidden");
                    } else {
                        topic.publish("UpdateRemoveAMapButton", {
                            display: false
                        });
                        //show header title
                        $("#title2").removeClass("hidden");
                    }
                    // update displaying the button to add a map
                    if (self.mapVMs.length < 4) {
                        topic.publish("UpdateAddAMapButton", {
                            display: true
                        });
                    } else {
                        topic.publish("UpdateAddAMapButton", {
                            display: false
                        });
                    }
                }; //end updateAddRemoveButtons

                self.handleMapInfoUpdated = function(value) {
                    var mapInfoList = [];
                    for (var i = 0; i < self.mapVMs.length; i++) {
                        var mapInfo = self.mapVMs[i].getMapBookmarkInfo();
                        mapInfoList.push(mapInfo);
                    }
                    bookmarkDelegate.mapInfoUpdated(mapInfoList);
                }; //end handleMapInfoUpdated

            }; //end

            return MapContainerVM;
        }
    );
}());