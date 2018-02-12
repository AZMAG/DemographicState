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
                    if (attributes["PLACE"]) {
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
                    } else if (attributes["DistNum"]) {
                        configItem = demographicConfig.reports.supervisorSummary;
                    } else if (attributes["CityDistrictName"]) {
                        configItem = demographicConfig.reports.councilDistrictSummary;
                    }

                    var features = results.features;
                    var nameArray = [];

                    if (!configItem) {
                        console.error("There was an error matching the button clicked to the config item", attributes);
                    }

                    var fieldName = configItem.summaryField;
                    var sortField = configItem.sortField;
                    var dropdownSelector = configItem.dropdown;
                    // console.log(features);
                    $.each(features, function(index, feature) {
                        var name = feature.attributes[fieldName];
                        var sort = feature.attributes[sortField];
                        nameArray.push({
                            Name: name,
                            Sort: sort
                        });
                    });
                    // console.log(nameArray);
                    // used to sort attributes and put into Array.
                    function compare(a, b) {
                        if (a.Sort < b.Sort) {
                            return -1;
                        }
                        if (a.Sort > b.Sort) {
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
                /**
                 * [displayChoice description]
                 * @param  {[type]} e [description]
                 * @return {[type]}   [description]
                 */
                self.displayChoice = function(e) {

                    var sender = e.target.id;
                    var type;
                    var layerID;

                    switch (sender) {
                        case "launchStateSummaryWin":
                            type = "state";
                            layerID = null;
                            break;
                        case "launchCountySummaryWin":
                            type = "county";
                            layerID = "countyBoundaries";
                            break;
                        case "launchPlaceSummaryWin":
                            type = "place";
                            layerID = null;
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
                            layerID = null;
                            break;
                        case "launchCogSummaryWin":
                            type = "cog";
                            layerID = "cogBoundaries";
                            break;
                        case "launchSupervisorSummaryWin":
                            type = "supervisor";
                            layerID = "supervisorDistricts";
                            break;
                        case "launchCouncilDistrictSummaryWin":
                            type = "councilDistrict";
                            layerID = "councilDistricts";
                            break;
                    }
                    var layer;
                    if (layerID !== null) {
                        layer = mapModel.mapInstance.getLayer(layerID);
                    } else {
                        layer = null;
                    }
                    

                    var selector = "#" + type + "ChoiceDiv";
                    var $choiceDiv = $(selector);

                    if ($choiceDiv.is(":hidden")) {
                        $choiceDiv.show();
                        self.hideChoices(selector);
                        self.hideLayers(layerID);
                        layer.show();
                        self.boxChecked(layerID, true);

                        if (type === "cog") {
                            self.cogLayers(open);
                        }

                    } else {
                        $choiceDiv.hide();
                        layer.hide();
                        self.boxChecked(layerID, false);
                        if (type === "cog") {
                            self.cogLayers();
                        }
                    }
                };
                /**
                 * Checks to see if the layer box is checked in the Layer Options
                 * @param  {String} layerID [description]
                 * @return {[type]}         [description]
                 */
                self.boxChecked = function(layerID, checked) {
                    dom.byId("c" + layerID).checked = checked;
                };
                /**
                 * COG/MPO summary report info
                 * @param  {String} open [description]
                 * @return {[type]}      [description]
                 */
                self.cogLayers = function(open) {
                    var countyId = "countyBoundaries";
                    var countyLayer = mapModel.mapInstance.getLayer(countyId);
                    var cogId = "cogBoundaries";
                    var cogLayer = mapModel.mapInstance.getLayer(cogId);

                    if (open) {
                        legendVM.updateLegendLayers(countyId);
                        countyLayer.show();
                        dom.byId("c" + countyId).checked = true;

                        legendVM.updateLegendLayers(cogId);
                        cogLayer.show();
                        dom.byId("c" + cogId).checked = true;
                    } else {
                        legendVM.updateLegendLayers(countyId);
                        countyLayer.hide();
                        dom.byId("c" + countyId).checked = false;

                        legendVM.updateLegendLayers(cogId);
                        cogLayer.hide();
                        dom.byId("c" + cogId).checked = false;
                    }
                };
                /**
                 * Hide all choice divs except for div id passed in parameter
                 * @param  {String} choice [description]
                 * @return {[type]}        [description]
                 */
                self.hideChoices = function(choice) {
                    var choiceDivs = ["#countyChoiceDiv", "#placeChoiceDiv", "#legislativeChoiceDiv", "#congressionalChoiceDiv", "#zipCodeChoiceDiv", "#cogChoiceDiv", "#supervisorChoiceDiv", "#councilDistrictChoiceDiv"];
                    $.each(choiceDivs, function(i, divID) {
                        if (divID !== choice) {
                            $(divID).hide();
                        }
                    });
                };
                /**
                 * Hides all the layers except for layer passed in parameter
                 * @param  {String} layerID [description]
                 * @return {[type]}         [description]
                 */
                self.hideLayers = function(layerID) {
                    var layerIds = ["countyBoundaries", "congressionalDistricts", "legislativeDistricts", "zipCodes", "cogBoundaries", "supervisorDistricts", "councilDistricts"];
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
                 * Updates the legend with the layer passed in the parameter
                 * @param  {String} layerID [description]
                 * @return {[type]}         [description]
                 */
                // self.legendUpdate = function(layerID) {
                //     var layerIds = ["countyBoundaries", "congressionalDistricts", "legislativeDistricts", "zipCodes", "cogBoundaries", "supervisorDistricts", "councilDistricts"];
                //     $.each(layerIds, function(i, item) {
                //         if (layerID === item) {
                //             legendVM.updateLegendLayers(item);
                //         }
                //     });
                // };

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
                    ga('send', 'event', 'Click', 'Opened Window', 'Summary Window: ' + param);
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
                    self.hideChoices();
                    self.hideLayers();
                    // self.legendUpdate();
                };

                /**
                 * Show/Hide div containing interactive tools.
                 *
                 * @event click
                 */
                self.displayInteractiveDiv = function() {
                    var div = $("#demInteractiveDiv");
                    if (div.length === 0) {
                        interactiveToolsVM.insertAfter("demInteractiveDiv", "launchInteractiveSummaryDiv", demographicVM.interactiveCensusSelectionQueryHandler, demographicVM.interactiveSelectionQueryFault, demographicConfig.reports.blockGroups.ACSRestUrl);
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
