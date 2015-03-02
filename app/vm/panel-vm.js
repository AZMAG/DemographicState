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
            "app/vm/queryBuilderTwo-vm",

            "vendor/kendo/web/js/jquery.min",
            "vendor/kendo/web/js/kendo.web.min"
        ],
        function(dj, dc, tp, dom, mapModel, helpView, helpVM, view, layerDelegate, demographicVM, demographicConfig, interactiveToolsVM, qbVM) {

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
                    dc.place(view, "map", "after");

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

                    // Hide the county div for now
                    $("#countyChoiceDiv").hide();
                    // Hide the places div for now
                    $("#placeChoiceDiv").hide();
                    // Hide the supervisor div for now
                    $("#legislativeChoiceDiv").hide();
                    // Hide the council div for now
                    $("#congressionalChoiceDiv").hide();

                    // Load the county names
                    var url1 = demographicConfig.reports.countySummary.restUrl;
                    var whereClause1 = demographicConfig.reports.countySummary.whereClause;
                    layerDelegate.query(url1, self.countyQueryHandler, self.countyQueryFault, null, whereClause1, false);
                    qbVM.init("display", "after");

                    // Load the place names
                    var url2 = demographicConfig.reports.placeSummary.restUrl;
                    var whereClause2 = demographicConfig.reports.placeSummary.whereClause;
                    layerDelegate.query(url2, self.placeQueryHandler, self.placeQueryFault, null, whereClause2, false);
                    qbVM.init("display", "after");

                    //  // Load the legislative names
                    var url3 = demographicConfig.reports.legislativeSummary.restUrl;
                    var whereClause3 = demographicConfig.reports.legislativeSummary.whereClause;
                    layerDelegate.query(url3, self.legislativeQueryHandler, self.legislativeQueryFault, null, whereClause3, false);
                    qbVM.init("display", "after");

                    //  // Load the congressional names
                    var url4 = demographicConfig.reports.congressionalSummary.restUrl;
                    var whereClause4 = demographicConfig.reports.congressionalSummary.whereClause;
                    layerDelegate.query(url4, self.congressionalQueryHandler, self.congressionalQueryFault, null, whereClause4, false);
                    qbVM.init("display", "after");

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
                 * Callback method for errors returned by county query.
                 *
                 * @method countyQueryFault
                 * @param {Error} error - error object
                 */
                self.stateQueryFault = function(error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for errors returned by county query.
                 *
                 * @method countyQueryFault
                 * @param {Error} error - error object
                 */
                self.countyQueryFault = function(error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for results returned by county query.
                 *
                 * @method countyQueryHelper
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.countyQueryHandler = function(results) {
                    var features = results.features;
                    // console.log(features);
                    var nameArray = [];
                    var countyField = demographicConfig.reports.countySummary.summaryField;
                    $.each(features, function(index, feature) {
                        var name = feature.attributes[countyField];
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

                    $("#countyComboBox").kendoComboBox({
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
                 * Callback method for errors returned by place query.
                 *
                 * @method placeQueryFault
                 * @param {Error} error - error object
                 */
                self.placeQueryFault = function(error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for results returned by place query.
                 *
                 * @method placeQueryHelper
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.placeQueryHandler = function(results) {
                    var features = results.features;

                    var nameArray = [];
                    var placeField = demographicConfig.reports.placeSummary.summaryField;
                    $.each(features, function(index, feature) {
                        var name = feature.attributes[placeField];
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

                    $("#placeComboBox").kendoComboBox({
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
                 * Callback method for errors returned by legislative query.
                 *
                 * @method legislativeQueryFault
                 * @param {Error} error - error object
                 */
                self.legislativeQueryFault = function(error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for results returned by legislative query.
                 *
                 * @method legislativeQueryHelper
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.legislativeQueryHandler = function(results) {
                    var features = results.features;

                    var nameArray = [];
                    var legislativeField = demographicConfig.reports.legislativeSummary.summaryField;
                    $.each(features, function(index, feature) {
                        var name = feature.attributes[legislativeField];
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

                    $("#legislativeComboBox").kendoComboBox({
                        index: 0,
                        dataTextField: "Name",
                        dataValueField: "Name",
                        filter: "contains",
                        dataSource: {
                            data: nameArray
                        }
                    });
                };

                // *
                //  * Callback method for results returned by congressional query.
                //  *
                self.congressionalQueryFault = function(error) {
                    console.log(error.message);
                };
                //  * @method congressionalQueryHelper
                //  * @param {FeatureSet} results - feature set returned by query.

                self.congressionalQueryHandler = function(results) {
                    var features = results.features;

                    var nameArray = [];
                    var councilField = demographicConfig.reports.congressionalSummary.summaryField;
                    $.each(features, function(index, feature) {
                        var name = feature.attributes[councilField];
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

                    $("#congressionalComboBox").kendoComboBox({
                        index: 0,
                        dataTextField: "Name",
                        dataValueField: "Name",
                        filter: "contains",
                        dataSource: {
                            data: nameArray
                        }
                    });
                };

                self.displayStateChoice = function() {
                    $("#countyChoiceDiv, #placeChoiceDiv, #legislativeChoiceDiv, #congressionalChoiceDiv, #demInteractiveDiv").hide();
                };

                /**
                 * Show/Hide div containing county combo box.
                 *
                 * @event click
                 */
                self.displayCountyChoice = function() {
                    if ($("#countyChoiceDiv").is(":hidden")) {
                        $("#countyChoiceDiv").show();
                        $("#placeChoiceDiv, #legislativeChoiceDiv, #congressionalChoiceDiv, #demInteractiveDiv").hide();
                    } else {
                        $("#countyChoiceDiv").hide();
                    }
                };

                /**
                 * Show/Hide div containing place combo box.
                 *
                 * @event click
                 */
                self.displayPlaceChoice = function() {
                    if ($("#placeChoiceDiv").is(":hidden")) {
                        $("#placeChoiceDiv").show();
                        $("#countyChoiceDiv, #legislativeChoiceDiv, #congressionalChoiceDiv, #demInteractiveDiv").hide();
                    } else {
                        $("#placeChoiceDiv").hide();
                    }
                };

                // /**
                //  * Show/Hide div containing legislative combo box.
                //  *
                //  * @event click
                //  */
                self.displayLegislativeChoice = function() {
                    var layer = mapModel.mapInstance.getLayer("legislativeDistricts");
                    var countyLayer = mapModel.mapInstance.getLayer("countyBoundaries");
                    var boxChecked = dom.byId("clegislativeDistricts").checked;

                    if ($("#legislativeChoiceDiv").is(":hidden")) {
                        $("#legislativeChoiceDiv").show();
                        $("#countyChoiceDiv, #placeChoiceDiv, #congressionalChoiceDiv, #demInteractiveDiv").hide();

                        // used to turn on and off layer in the layer options.
                        // turns on the Legislative Districts and turns off County Boundaries
                        if (layer.visible === false && boxChecked === false) {
                            layer.show();
                            countyLayer.hide();
                            dom.byId("clegislativeDistricts").checked = true;
                            dom.byId("ccountyBoundaries").checked = false;
                        }
                    } else {
                        $("#legislativeChoiceDiv").hide();

                        if (layer.visible === true && boxChecked === true) {
                            layer.hide();
                            countyLayer.show();
                            dom.byId("clegislativeDistricts").checked = false;
                            dom.byId("ccountyBoundaries").checked = true;
                        }
                    }
                };

                // /**
                //  * Show/Hide div containing congressional combo box.
                //  *
                //  * @event click
                //  */
                self.displayCongressionalChoice = function() {
                    var layer = mapModel.mapInstance.getLayer("congressionalDistricts");
                    var countyLayer = mapModel.mapInstance.getLayer("countyBoundaries");
                    var boxChecked = dom.byId("ccongressionalDistricts").checked;

                    if ($("#congressionalChoiceDiv").is(":hidden")) {
                        $("#congressionalChoiceDiv").show();
                        $("#countyChoiceDiv, #placeChoiceDiv, #legislativeChoiceDiv, #demInteractiveDiv").hide();

                        // used to turn on and off layer in the layer options.
                        // turns on the Congressional Districts and turns off County Boundaries
                        if (layer.visible === false && boxChecked === false) {
                            layer.show();
                            countyLayer.hide();
                            dom.byId("ccongressionalDistricts").checked = true;
                            dom.byId("ccountyBoundaries").checked = false;
                        }
                    } else {
                        $("#congressionalChoiceDiv").hide();

                        if (layer.visible === true && boxChecked === true) {
                            layer.hide();
                            countyLayer.show();
                            dom.byId("ccongressionalDistricts").checked = false;
                            dom.byId("ccountyBoundaries").checked = true;
                        }
                    }
                };

                /**
                 * Get the selected county name and call open method on demographicVM.
                 *
                 * @event click
                 */
                self.openStateSummaryWindow = function() {
                    // Get the place name selected
                    var placeName = "Arizona";

                    // Open the window
                    demographicVM.openWindow(placeName, "state");
                };

                /**
                 * Get the selected county name and call open method on demographicVM.
                 *
                 * @event click
                 */
                self.openCountySummaryWindow = function() {
                    // Get the place name selected
                    var selectedName = $("#countyComboBox").data("kendoComboBox").dataItem();
                    var countyName = selectedName.Name;

                    // Open the window
                    demographicVM.openWindow(countyName, "county");
                };

                /**
                 * Get the selected place name and call open method on demographicVM.
                 *
                 * @event click
                 */
                self.openPlaceSummaryWindow = function() {
                    // Get the place name selected
                    var selectedName = $("#placeComboBox").data("kendoComboBox").dataItem();
                    var placeName = selectedName.Name;

                    // Open the window
                    demographicVM.openWindow(placeName, "place");
                };

                // /**
                //  * Get the selected place name and call open method on demographicVM.
                //  *
                //  * @event click
                //  */
                self.openLegislativeSummaryWindow = function() {
                    // Get the place name selected
                    var selectedName = $("#legislativeComboBox").data("kendoComboBox").dataItem();
                    var legislativeName = selectedName.Name;

                    // Open the window
                    demographicVM.openWindow(legislativeName, "legislative");
                };

                // /**
                //  * Get the selected place name and call open method on demographicVM.
                //  *
                //  * @event click
                //  */
                self.openCongressionalSummaryWindow = function() {
                    // Get the place name selected
                    var selectedName = $("#congressionalComboBox").data("kendoComboBox").dataItem();
                    var congressionalName = selectedName.Name;

                    // Open the window
                    demographicVM.openWindow(congressionalName, "congressional");
                };

                /**
                 * Show/Hide div containing interactive tools.
                 *
                 * @event click
                 */
                self.displayInteractiveDiv = function() {
                    var div = $("#demInteractiveDiv");

                    if (div.length === 0) {
                        interactiveToolsVM.insertAfter("demInteractiveDiv", "launchInteractiveSummaryDiv", demographicVM.interactiveSelectionQueryHandler, demographicVM.interactiveSelectionQueryFault, demographicConfig.reports.censusTracts.restUrl);
                    } else {
                        if (div.is(":hidden")) {
                            $("#demInteractiveDiv").show();
                            $("#countyChoiceDiv, #placeChoiceDiv, #legislativeChoiceDiv, #congressionalChoiceDiv").hide();
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
                    qbVM.buildQuery(demographicVM.interactiveSelectionQueryHandler, demographicVM.interactiveSelectionQueryFault, demographicConfig.reports.censusTracts.restUrl, demographicConfig.queryFields, demographicConfig.CompareOperators);
                    $("#countyChoiceDiv, #placeChoiceDiv, #legislativeChoiceDiv, #demInteractiveDiv, #demInteractiveDiv").hide();
                };

            }; // End of PanelVM

            return PanelVM;

        }); // End function
}());