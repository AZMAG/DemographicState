/**
 * Panel div used to launch various reports
 *
 * @class panel-vm
 */

(function() {

    "use strict";

    define([
            "dojo",
            "dojo/dom-construct",
            "dojo/topic",
            "dojo/dom",
            "app/models/map-model",
            "dojo/text!app/views/panelHelp-view.html",
            "app/vm/help-vm",
            "dojo/text!app/views/panel-view.html",
            "app/helpers/layer-delegate",
            "app/vm/demographic-vm",
            "app/config/demographicConfig",
            "app/vm/interactiveTools-vm",
            "app/vm/legend-vm",
            "app/vm/queryBuilder-vm"
        ],
        function(dj, dc, tp, dom, mapModel, helpView, helpVM, view, layerDelegate, demographicVM, demographicConfig, interactiveToolsVM, legendVM, qbVM) {

            var PanelVM = new function() {

                /**
                 * Store reference to module this object.
                 *
                 * @property self
                 * @type {*}
                 */
                var self = this;

                // detects html window size
                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;
                // console.log("Height: " + self.winHeight + " & " + "Width: " + self.winWidth);
                self.newWindowWidth = self.winWidth;
                self.winVisible = true;

                if (self.winWidth <= 668) {
                    self.newWindowWidth = "210px";
                    self.winVisible = false;
                    self.winLocation = 440;
                } else if (self.winWidth <= 800) {
                    self.newWindowWidth = "210px";
                    self.winVisible = false;
                    self.winLocation = 440;
                } else if (self.winWidth <= 1024) {
                    self.newWindowWidth = "210px";
                    self.winLocation = 430;
                } else if (self.winWidth <= 1200) {
                    self.newWindowWidth = "210px";
                    self.winLocation = 430;
                } else {
                    self.newWindowWidth = "250px";
                    self.winLocation = 510;
                }

                /**
                Title for the module's window

                @property windowTitle
                @type String
                **/
                self.windowTitle = "Reports";

                /**
                 * Initialize the class.
                 *
                 * @method init
                 */
                self.init = function() {
                    dc.place(view, "mapContainer", "after");

                    tp.subscribe("panelStateO", function() {
                        self.openWindow();
                    });
                    tp.subscribe("panelStateC", function() {
                        self.closeWindow();
                    });

                    var reportsWindow = $("#reportLauncher").kendoWindow({
                        width: self.newWindowWidth, //"250px"
                        height: "auto",
                        title: self.windowTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: self.winVisible, //true
                        resizable: false
                    }).data("kendoWindow");

                    var helpButton = reportsWindow.wrapper.find(".k-i-help");
                    helpButton.click(function() {
                        helpVM.openWindow(helpView);
                    });

                    // Initial window placement
                    $("#reportLauncher").closest(".k-window").css({
                        top: 55,
                        left: self.winWidth - self.winLocation
                    });

                    self.hideChoices();

                    qbVM.init("display", "after");

                    $.each(demographicConfig.reports, function(i, configItem) {
                        if (configItem.populateDropDown !== false) {
                            var url = configItem.ACSRestUrl;
                            var whereClause = configItem.whereClause;
                            layerDelegate.query(url, self.dropDownQueryHandler, self.queryFault, null, whereClause, false);
                        }
                    });

                }; //end init

                /**
                Method for opening the window.

                @method openWindow
                **/
                self.openWindow = function() {
                    var win = $("#reportLauncher").data("kendoWindow");
                    win.restore();
                    win.open();

                    $("#reportLauncher").closest(".k-window").css({
                        top: 55,
                        left: self.winWidth - self.winLocation
                    });
                };
                /**
                Method for closing the window.

                @method closeWindow
                **/
                self.closeWindow = function() {
                    var win = $("#reportLauncher").data("kendoWindow");
                    win.close();
                };

                // change window location when window resized
                self.winResize = function() {
                    self.winWidth = document.documentElement.clientWidth;
                    self.winHeight = document.documentElement.clientHeight;

                    $("#reportLauncher").closest(".k-window").css({
                        top: 55,
                        left: self.winWidth - self.winLocation
                    });
                };

                var resizeTimer;
                $(window).resize(function() {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(self.winResize, 200);
                });

                /**
                 * Callback method for errors returned by the query.
                 *
                 * @method queryFault
                 * @param {Error} error - error object
                 */
                self.queryFault = function(error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for results returned by dropdown query.
                 *
                 * @method dropDownQueryHandler
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.dropDownQueryHandler = function(results) {
                    var configItem;
                    var attributes = results.features[0].attributes;
                    if (attributes["PLACE_TYPE"]) {
                        configItem = demographicConfig.reports.placeSummary;
                    } else if (attributes["ZIPCODE"]) {
                        configItem = demographicConfig.reports.zipCodeSummary;
                    } else if (attributes["SLDIST_NAME"]) {
                        configItem = demographicConfig.reports.legislativeSummary;
                    } else if (attributes["CDIST_NAME"]) {
                        configItem = demographicConfig.reports.congressionalSummary;
                    } else if (attributes["COG"]) {
                        configItem = demographicConfig.reports.cogSummary;
                    } else if (attributes["COUNTYFP"]) {
                        configItem = demographicConfig.reports.countySummary;
                    }

                    var features = results.features;
                    var nameArray = [];
                    var fieldName = configItem.summaryField;
                    var dropdownSelector = configItem.dropdown;

                    $.each(features, function(index, feature) {
                        var name = feature.attributes[fieldName];
                        nameArray.push({
                            Name: name
                        });
                    });
                    // used to sort attributes and put into Array. vw
                    function compare(a, b) {
                        if (a.Name < b.Name) {
                            return -1;
                        }
                        if (a.Name > b.Name) {
                            return 1;
                        }
                        return 0;
                    }
                    nameArray.sort(compare);

                    $(dropdownSelector).kendoComboBox({
                        index: 0,
                        dataTextField: "Name",
                        dataValueField: "Name",
                        filter: "contains",
                        dataSource: {
                            data: nameArray
                        }
                    });
                };

                self.displayChoice = function(e) {

                    var sender = e.target.id;
                    var type;
                    var layerID;

                    switch (sender) {
                        case "launchStateSummaryWin":
                            type = "state";
                            layerID = "";
                            break;
                        case "launchCountySummaryWin":
                            type = "county";
                            layerID = "countyBoundaries";
                            break;
                        case "launchPlaceSummaryWin":
                            type = "place";
                            layerID = "";
                            break;
                        case "launchLegislativeSummaryWin":
                            type = "legislative";
                            layerID = "legislativeDistricts";
                            break;
                        case "launchCongressionalSummaryWin":
                            type = "congressional";
                            layerID = "congressionalDistricts";
                            break;
                        case "launchZipCodeEmpSummaryWin":
                            type = "zipCode";
                            layerID = "zipCodes";
                            break;
                        case "launchInteractiveSummaryDiv":
                            type = "demInteractive";
                            layerID = "";
                            break;
                        case "launchCogSummaryWin":
                            type = "cog";
                            layerID = "cogBoundaries";
                            break;
                    }
                    var layer = null;
                    var boxChecked = null;

                    if (layerID !== "") {
                        layer = mapModel.mapInstance.getLayer(layerID);
                        boxChecked = dom.byId("c" + layerID).checked;
                    }
                    var selector = "#" + type + "ChoiceDiv";
                    var $choiceDiv = $(selector);
                    $("#demInteractiveDiv").hide();

                    if ($choiceDiv.is(":hidden")) {
                        $choiceDiv.show();

                        self.hideChoices(selector);
                        
                        self.hideLayers(layerID);

                        if (layer !== null && layer.visible === false && boxChecked === false) {
                            dom.byId("c" + layerID).checked = true;
                            
                            //layer.show();
                            //dom.byId("c" + layerID).checked = true;
                        }
                        legendVM.updateLegendLayers(layerID);
                    } else {
                        $choiceDiv.hide();
                        legendVM.updateLegendLayers(layerID);
                        self.hideLayers(layerID);
                        if (layer !== null && layer.visible === true && boxChecked === true) {
                            dom.byId("c" + layerID).checked = false;
                            //legendVM.updateLegendLayers(layerID);
                            layer.hide();
                        }
                    }
                    if (type === "cog") {
                        var countyId = "countyBoundaries";
                        var countyLayer = mapModel.mapInstance.getLayer(countyId);
                        countyLayer.show();
                        dom.byId("c" + countyId).checked = true;
                    }
                };

                /**
                 * Hide all choice divs except for div id passed in parameter
                 *
                 * @parameter choice
                 */
                self.hideChoices = function(choice) {
                    var choiceDivs = ["#countyChoiceDiv", "#placeChoiceDiv", "#legislativeChoiceDiv", "#congressionalChoiceDiv", "#zipCodeChoiceDiv", "#cogChoiceDiv"];
                    $.each(choiceDivs, function(i, divID) {
                        if (divID !== choice) {
                            $(divID).hide();
                        }
                    });
                };

                self.hideLayers = function(layerID) {
                    var layerIds = ["countyBoundaries", "congressionalDistricts", "legislativeDistricts", "zipCodes", "cogBoundaries"];
                    $.each(layerIds, function(i, item) {
                        if (layerID !== item) {
                            var layer = mapModel.mapInstance.getLayer(item);
                            if (layer) {
                                layer.hide();
                                dom.byId("c" + item).checked = false;
                            }
                        }
                    });
                };

                /**
                 * Get the selected county name and call open method on demographicVM.
                 *
                 * @event click
                 */
                self.openSummaryWindow = function(e) {
                    var parent = e.target.parentNode;
                    var comboBox = $("#" + parent.id + " input")[1].id;
                    var type = comboBox.replace("ComboBox", "");

                    // Get the selected name
                    var selectedName = $("#" + comboBox).data("kendoComboBox").dataItem();
                    var param = selectedName.Name;

                    // Open the window
                    demographicVM.openWindow(param, type);
                };

                /**
                 * Get the selected county name and call open method on demographicVM.
                 *
                 * @event click
                 */
                self.openStateSummaryWindow = function(e) {
                    // Open the window
                    demographicVM.openWindow("Arizona", "state");
                };

                /**
                 * Show/Hide div containing interactive tools.
                 *
                 * @event click
                 */
                self.displayInteractiveDiv = function() {
                    var div = $("#demInteractiveDiv");
                    if (div.length === 0) {
                        interactiveToolsVM.insertAfter("demInteractiveDiv", "launchInteractiveSummaryDiv", demographicVM.interactiveCensusSelectionQueryHandler, demographicVM.interactiveSelectionQueryFault, demographicConfig.reports.censusTracts.ACSRestUrl);
                        self.hideChoices("#demInteractiveDiv");
                        self.hideLayers("");
                    } else {
                        if (div.is(":hidden")) {
                            self.hideChoices("#demInteractiveDiv");
                            $("#demInteractiveDiv").show();
                        } else {
                            interactiveToolsVM.clearSelection();
                            $("#demInteractiveDiv").hide();
                        }
                    }
                };

                /**
                 * Open the query builder window.
                 *
                 * @event click
                 */
                self.openQueryBuilder = function() {
                    self.hideChoices();
                    qbVM.openWindow();
                };

            }; // End of PanelVM

            return PanelVM;

        }); // End function
}());
