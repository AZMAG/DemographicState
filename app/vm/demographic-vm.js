/**
 * Demographic report window
 *
 * @class demographic-vm
 */

(function () {

    "use strict";

    define([
        "dojo/dom-construct",
        "dojo/dom",
        "dojo/topic",
        "dojo/_base/array",
        "dojo/on",
        "dojo/text!app/views/demographic-view.html",
        "dojo/text!app/views/selectedFeaturesTabPage-view.html",
        "dojo/text!app/views/demographicChartHelp-view.html",
        "dojo/text!app/views/demographicSummaryHelp-view.html",
        "dojo/text!app/views/demographicSelFeaturesHelp-view.html",
        "app/vm/help-vm",
        "dojo/text!app/views/alert1-view.html",
        "dojo/text!app/views/alert2-view.html",
        "app/vm/alert1-vm",
        "app/vm/alert2-vm",
        "app/helpers/layer-delegate",
        "app/helpers/printMap-delegate",
        "app/helpers/magNumberFormatter",
        "app/models/map-model",
        "app/config/demographicConfig",
        "esri/graphicsUtils",
        "vendor/kendo/web/js/jquery.min",
        "vendor/kendo/web/js/kendo.web.min",
        "vendor/kendo/dataviz/js/kendo.dataviz.min",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "dojo/_base/Color"
    ],
        function (dc, dom, tp, da, on, view, selFeatsView, chartHelpView, summaryHelpView,
                    selFeatHelpView, helpVM, alertView1, alertView2, alert1VM, alert2VM, layerDelegate, printMapDelegate,
                    magNumberFormatter, mapModel, demographicConfig, graphicsUtils) {

            var DemographicVM = new function () {

                /**
                 * Store reference to module this object.
                 *
                 * @property self
                 * @type {*}
                 */
                var self = this;

                /**
                 * Open state of the Kendo window.
                 *
                 * @property windowIsOpen
                 * @type {boolean}
                 */
                var windowIsOpen = false;

                /**
                 * Redraw the default chart when the window first opens.
                 *
                 * @property redrawChart
                 * @type {boolean}
                 */
                var redrawChart = false;

                /**
                 * Name of the county for County Summary
                 *
                 * @property county
                 * @type {string}
                 */
                 // vern change - moved to 2 county map
                //var county = "Maricopa County";

                /**
                 * Current community name.
                 * Used for display and to determine functionality.
                 *
                 * @property communityName
                 * @type {string}
                 */
                self.communityName = "";

                /**
                 * Base title for the window.
                 *
                 * @property windowTitle
                 * @type {string}
                 */
                self.windowTitle = "Report Results for ";

                /**
                 * Current report configuration object.
                 *
                 * @property reportConfigItem
                 * @type {Object}
                 */
                self.reportConfigItem = {};

                /**
                 * Array of aggregate values based on the current report configuration object.
                 *
                 * @property aggValuesArray
                 * @type {Array}
                 */
                self.aggValuesArray = [];

                /**
                 * Object containing agg values grouped by chart categories.
                 *
                 * @property aggValuesGroupedByChartCategory
                 * @type {Object}
                 */
                self.aggValuesGroupedByChartCategory = {};

                /**
                 * Object containing agg values grouped by field categories.
                 *
                 * @property aggValuesGroupedByFieldCategory
                 * @type {Object}
                 */
                self.aggValuesGroupedByFieldCategory = {};

                /**
                 * Array of chart categories for list view.
                 *
                 * @property chartCategories
                 * @type {Array}
                 */
                self.chartCategories = [];

                /**
                 * Currently selected chart category.
                 *
                 * @property selectedCategoryObj
                 * @type {Object}
                 */
                self.selectedCategoryObj = undefined;

                /**
                 * Array of grouped agg values for the currently selected chart category.
                 *
                 * @property groupedItems
                 * @type {undefined}
                 */
                self.groupedItems = undefined;

                /**
                 * Keep track of chart legend visibility
                 *
                 * @property legendVisible
                 * @type {boolean}
                 */
                self.legendVisible = false;

                /**
                 * Name of compare to community.
                 *
                 * @property compareToName
                 * @type {string}
                 */
                self.compareToName = "";

                /**
                 * Keep track of whether or not there are selected features.
                 *
                 * @property hasSelectedFeatures
                 * @type {boolean}
                 */
                self.hasSelectedFeatures = false;

                /**
                 * Currently selected features.
                 *
                 * @property selectedFeatures
                 * @type {null}
                 */
                self.selectedFeatures = null;

                /**
                 * Array of feature attributes for display in the grid.
                 *
                 * @property featureAttributeArray
                 * @type {Array}
                 */
                self.featureAttributeArray = [];

                /**
                 * Feature used for comparison values.
                 *
                 * @property compareFeature
                 * @type {null}
                 */
                self.compareFeature = null;

                // used for reporting export progress. scott
                self.progressInterval = null;
                self.progressDots = null;
                self.progressText= null;

                // used to size window for mobile. vw
                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;

                    if (self.winWidth <= 668) {
                        self.newWindowWidth = "600px";
                        self.newWindowHeight = "300px";
                    } else if (self.winWidth <= 800) {
                        self.newWindowWidth = "630px";
                        self.newWindowHeight = "auto";
                    } else if (self.winWidth <= 1024) {
                      self.newWindowWidth = "630px";
                        self.newWindowHeight = "auto";
                    } else if (self.winWidth <= 1200) {
                        self.newWindowWidth = "630px";
                        self.newWindowHeight = "auto";
                    } else {
                        self.newWindowWidth = "630px";
                        self.newWindowHeight = "auto";
                    }

                /**
                 * Initialize the class.
                 *
                 * @method init
                 */
                self.init = function () {
                    // Place the HTML from the view into the main application after the map div.
                    dc.place(view, "map", "after");

                    // Create the Kendo Window
                    var chartWindow = $("#demographicView").kendoWindow({
                        width: self.newWindowWidth,  // "630px"
                        height: self.newWindowHeight,  // "auto"
                        title: self.windowTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: false,
                        resizable: false,
                        close: self.windowClosed
                    }).data("kendoWindow").center();

                    // Display legend checkbox click event
                    $("#displayLegend").bind("click", function () {
                        self.legendVisible = this.checked;

                        if (self.selectedCategoryObj !== undefined && self.groupedItems !== undefined) {
                            var kendoChart = $("#demChartArea").data("kendoChart");
                            if (kendoChart !== undefined) {
                                kendoChart.destroy();
                                kendoChart.element.remove();
                            }
                            self.createChart();
                        }
                    });

                    // Use Compare checkbox click event
                    $("#demUseComp").bind("click", self.useCompareClicked);

                    // Set up summary export types
                    $("#demExportSummary").kendoDropDownList({
                        index: 0,
                        dataSource: {
                            data: [ "Excel", "CSV" ]
                        }
                    });

                    // Get the help button and assign the click event.
                    var helpButton = chartWindow.wrapper.find(".k-i-help");
                    helpButton.click(function () {
                        var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                        var tab = tabStrip.select();

                        if (tab[0].textContent === "Charts") {
                            helpVM.openWindow(chartHelpView);
                        } else if (tab[0].textContent === "Summary Report") {
                            helpVM.openWindow(summaryHelpView);
                        } else {
                            helpVM.openWindow(selFeatHelpView);
                        }
                    });

                }; // end Init
//****************************************************************
                /**
                 * Fired when the window closes
                 *
                 * @event close
                 * @param e - event arguments.
                 */
                self.windowClosed = function () {
                    windowIsOpen = false;
                    redrawChart = false;
                    mapModel.clearGraphics();

                    if(self.hasSelectedFeatures) {
                        self.selectedFeatures = null;
                        self.hasSelectedFeatures = false;
                        mapModel.clearGraphics();


                        var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                        if (tabStrip !== undefined && tabStrip !== null) {
                            var firstTab = tabStrip.tabGroup.children("li:first");
                            if(firstTab[0].textContent === "Selected Block Groups") {
                                tabStrip.remove(0);
                                tabStrip.select(1);
                            }
                        }
                    }
                };

                /**
                 * Open the window and initialize the contents.
                 *
                 * @method openWindow
                 * @param {string} communityName - name of the community for the report.
                 * @param {string} sumName - name of the config for the report type. vw
                 */
                self.openWindow = function (communityName, sumName) {
                    self.hasSelectedFeatures = false;
                    self.commChanged = (self.communityName !== undefined && self.communityName !== "" && self.communityName !== communityName);
                    self.communityName = communityName;

                     // Set the summary report config item
                    switch(sumName) {
                        case "county":
                            self.reportConfigItem = demographicConfig.reports.countySummary;
                            break;
                        case "place":
                            self.reportConfigItem = demographicConfig.reports.placeSummary;
                            break;
                        case "supervisor":
                            self.reportConfigItem = demographicConfig.reports.supervisorSummary;
                            break;
                        case "council":
                            self.reportConfigItem = demographicConfig.reports.councilSummary;
                            break;
                    }

                    // Get the window and open it.
                    var win = $("#demographicView").data("kendoWindow");
                        win.title(self.windowTitle + communityName);
                        if(!windowIsOpen) {
                            win.restore();
                            win.center();
                            redrawChart = true;
                        }
                        win.restore();
                        win.center();
                        win.open();
                        windowIsOpen = true;

                    // Set the source
                    $("#demSource").text("Source: " + self.reportConfigItem.source);

                    // Create the Kendo tab strip
                    var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                    if(tabStrip === undefined) {
                        $("#demTabStrip").kendoTabStrip({
                            activate: self.tabActivated
                        });
                    }

                    // Create the splitter
                    var splitter = $("#demSplitContainer").data("kendoSplitter");
                    if(splitter === undefined) {
                        $("#demSplitContainer").kendoSplitter({
                            panes: [
                                { collapsible: false, resizable: false },
                                { collapsible: false, resizable: false, size: "30%" }
                            ]
                        });
                    }

                    self.getData();

                    if(redrawChart) {
                        setTimeout(function () {
                            var chart = $("#demChartArea").data("kendoChart");
                            if(chart) {
                                chart.redraw();
                            }
                        }, 500);
                        redrawChart = false;
                    }
                };

                /**
                 * Callback method for interactive/query errors.
                 *
                 * @method interactiveSelectionQueryFault
                 * @param {Error} error - error object
                 */
                self.interactiveSelectionQueryFault = function (error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for interactive/query results.
                 *
                 * @method interactiveSelectionQueryHandler
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.interactiveSelectionQueryHandler = function (results) {
                    self.selectedFeatures = results.features;
                    // counts number of selected block groups. vw
                    var num = queryCountGlobal;
                    var numFeatures = magNumberFormatter.formatValue(num);

                        // test for results. vw
                        if (num === 0) {
                            // Get the alert window and open it. vw
                            alert2VM.openWindow(alertView2);
                            esri.hide(dojo.byId("loading"));
                            return;
                        }

                        // if (num >= 1000) {
                        //     // Get the alert window and open it. vw
                        //     alert1VM.openWindow(alertView1);
                        //     // adds count of features to alert window. vw
                        //     document.getElementById("fCount2").innerHTML = numFeatures;
                        //         if ("AlertCancel" == "Cancel") {
                        //             return;
                        //         }
                        //         if ("AlertYes" == "Yes") {
                        //             alert("YES");
                        //            return;
                        //         }
                        // }

                    self.hasSelectedFeatures = true;

                    // Add the graphics
                    mapModel.addGraphics(self.selectedFeatures);

                    // Perform actions similar to the openWindow method
                    var communityName = "Selected Block Groups";
                    self.commChanged = (self.communityName !== undefined && self.communityName !== "" && self.communityName !== communityName);
                    self.communityName = communityName;
                    self.reportConfigItem = demographicConfig.reports.censusTracts;

                    // Get the window and open it.
                    var win = $("#demographicView").data("kendoWindow");
                        win.title(self.windowTitle + communityName);
                        if(!windowIsOpen) {
                            win.restore();
                            win.center();
                            redrawChart = true;
                        }
                        win.restore();
                        win.center();
                        win.open();
                        windowIsOpen = true;

                    // hide loading gif when window opens. vw
                    esri.hide(dojo.byId("loading"));

                    // Set the source
                    $("#demSource").text("Source: " + self.reportConfigItem.source);

                    // Create the Kendo tab strip
                    var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                    if(tabStrip === undefined) {
                        $("#demTabStrip").kendoTabStrip({
                            activate: self.tabActivated
                        });
                    }
                    tabStrip = $("#demTabStrip").data("kendoTabStrip");

                    // Create the splitter
                    var splitter = $("#demSplitContainer").data("kendoSplitter");
                    if(splitter === undefined) {
                        $("#demSplitContainer").kendoSplitter({
                            panes: [
                                { collapsible: false, resizable: false },
                                { collapsible: false, resizable: false, size: "30%" }
                            ]
                        });
                    }

                    // We already have the data, so handle it.
                    self.dataQueryHandler(results);

                    // Create the feature attribute array
                    self.featureAttributeArray = [];
                    $.each(self.selectedFeatures, function (index, feature) {
                        self.featureAttributeArray.push(feature.attributes);
                    });

                    // Check to see if the tab is already present
                    var firstTab = tabStrip.tabGroup.children("li:first");
                    if(firstTab[0].textContent !== "Selected Block Groups") {
                        // Add the Selected Block Groups tab
                        tabStrip.insertBefore({
                            text: "Selected Block Groups",
                            content: selFeatsView
                        }, tabStrip.tabGroup.children("li:first"));
                    }

                    // add feature count span to selected block groups tab. vw
                    dom.byId("fCount").innerHTML = numFeatures;


                    // Make sure grid doesn't already exist
                    var kendoGrid = $("#demFeatGrid").data("kendoGrid");
                    if(kendoGrid !== undefined && kendoGrid !== null) {
                        kendoGrid.destroy();
                        kendoGrid.element.remove();
                    }

                    // Add the grid
                    dc.create("div", {id: "demFeatGrid", style: "margin: 5px 0 0 0; font-size: small;"}, "demSelFeatOptionsRow", "after");

                    // grid for Selected Block Groups Tab vw
                    // Kendo-ize the grid
                    $("#demFeatGrid").kendoGrid({
                        dataSource: {
                            data: self.featureAttributeArray
                        },
                        selectable: true,
                        sortable: true,
                        scrollable: true,
                        resizable: false,
                        columnMenu: false,
                        columns: [
                            {field: "OBJECTID", hidden: true},
                            {field: "COUNTYFP10", title: "County", width: "55px"},
                            {field: "TRACTCE10", title: "Tract", width: "55px"},
                            {field: "BLKGRPCE10", title: "Block Group", width: "60px"},
                            {field: "SQ_MI", title: "Square Miles*", width: "60px", format: "{0:n2}"},
                            {field: "TOT_POP", title: "Total Population*", width: "80px", format: "{0:n0}"},
                            {field: "MINORITY_POP", title: "Minority Population*", width: "80px", format: "{0:n0}"},
                            {field: "MEDIAN_AGE", title: "Median Age*", width: "55px", format: "{0:n2}"},
                            {field: "Under5", title: "Under 5*", width: "55px", format: "{0:n0}"},
                            {field: "Age5to17", title: "Age 5 to 17*", width: "80px", format: "{0:n0}"},
                            {field: "Age18to34", title: "Age 18 to 34*", width: "80px", format: "{0:n0}"},
                            {field: "Age35to49", title: "Age 35 to 49*", width: "80px", format: "{0:n0}"},
                            {field: "Age50to64", title: "Age 50 to 64*", width: "80px", format: "{0:n0}"},
                            {field: "Age65to84", title: "Age 65 to 84*", width: "80px", format: "{0:n0}"},
                            {field: "Age85Plus", title: "Age 85 and Over*", width: "80px", format: "{0:n0}"},
                            {field: "Age50Plus", title: "Age 50 Plus*", width: "80px", format: "{0:n0}"},
                            {field: "Age60Plus", title: "Age 60 Plus*", width: "80px", format: "{0:n0}"},
                            {field: "Age65Plus", title: "Age 65 Plus*", width: "80px", format: "{0:n0}"},
                            {field: "Age70Plus", title: "Age 70 Plus*", width: "80px", format: "{0:n0}"},
                            {field: "Age75Plus", title: "Age 75 Plus*", width: "80px", format: "{0:n0}"},
                            {field: "WHITE", title: "White*", width: "55px", format: "{0:n0}"},
                            {field: "BLACK", title: "Black*", width: "55px", format: "{0:n0}"},
                            {field: "NATIVE", title: "Native*", width: "55px", format: "{0:n0}"},
                            {field: "ASIAN", title: "Asian*", width: "55px", format: "{0:n0}"},
                            {field: "PACIFIC", title: "Pacific*", width: "55px", format: "{0:n0}"},
                            {field: "TWO_OR_MORE", title: "Two or More*", width: "55px", format: "{0:n0}"},
                            {field: "OTHER", title: "Other*", width: "55px", format: "{0:n0}"},
                            {field: "HISPANIC", title: "Hispanic*", width: "60px", format: "{0:n0}"},
                            {field: "NOT_HISPANIC", title: "Not Hispanic*", width: "60px", format: "{0:n0}"},
                            {field: "TOTAL_HOUSEHOLDS", title: "Total Households^", width: "80px", format: "{0:n0}"},
                            {field: "MEDIAN_HOUSEHOLD_INCOME", title: "Median Household Income^", width: "100px", format: "{0:c}"},
                            {field: "HOUSEHOLDS_LESS_THAN_25000", title: "Households Less than $25,000^", width: "80px", format: "{0:n0}"},
                            {field: "HOUSEHOLDS_25000_TO_49999", title: "Households $25,000 to $49,999^", width: "80px", format: "{0:n0}"},
                            {field: "HOUSEHOLDS_50000_TO_99999", title: "Households $50,000 to $99,999^", width: "80px", format: "{0:n0}"},
                            {field: "HOUSEHOLDS_100000_OR_MORE", title: "Households $100,000 or More^", width: "80px", format: "{0:n0}"},
                            {field: "TOTAL_FAMILY", title: "Total Family^", width: "55px", format: "{0:n0}"},
                            {field: "INCOME_BELOW_POVERTY_LEVEL", title: "Income Below  Poverty Level^", width: "80px", format: "{0:n0}"},
                            {field: "POPULATION_25_YEARS_AND_OVER", title: "Population 25yrs and Over^", width: "80px", format: "{0:n0}"},
                            {field: "LT9GRADE", title: "Less than 9th Grade^", width: "80px", format: "{0:n0}"},
                            {field: "NOHSDIPLOMA", title: "No HS Diploma^", width: "80px", format: "{0:n0}"},
                            {field: "HSGRAD", title: "High School Grad^", width: "80px", format: "{0:n0}"},
                            {field: "SOMECOLLEGE", title: "Some College^", width: "55px", format: "{0:n0}"},
                            {field: "ASSOCIATES", title: "Associates^", width: "80px", format: "{0:n0}"},
                            {field: "BACHELORS", title: "Bachelors^", width: "80px", format: "{0:n0}"},
                            {field: "GRADPROF", title: "Graduates^", width: "80px", format: "{0:n0}"},
                            {field: "TOTAL_HU", title: "Total Housing Units*", width: "55px", format: "{0:n0}"},
                            {field: "OCCUPIED_HU", title: "Occupied Housing Units*", width: "80px", format: "{0:n0}"},
                            {field: "VACANT_HU", title: "Vacant Housing Units*", width: "80px", format: "{0:n0}"},
                            {field: "OWNER_OCC_HU", title: "Owner Occupied Housing Units*", width: "80px", format: "{0:n0}"},
                            {field: "RENTER_OCC_HU", title: "Renter Occupited Housing Units*", width: "80px", format: "{0:n0}"},
                            {field: "MEDIAN_VALUE", title: "Median Value^", width: "100px", format: "{0:c}"},
                            {field: "MEDIAN_GROSS_RENT", title: "Median Gross Rent^", width: "80px", format: "{0:c}"}
                        ],
                        dataBound: self.gridRowHover
                    });

                    // Size the grid
                    self.sizeGrid("#demFeatGrid");

                    // Set up summary export types
                    $("#demExportSelectedFeatures").kendoDropDownList({
                        index: 0,
                        dataSource: {
                            data: [ "Excel", "CSV" ]
                        }
                    });

                    // Bind the export button
                    $("#demExportSelFeatResults").bind("click", self.exportSelectedFeatures);

                    // Reload the chart to update to current data
                    var tab = tabStrip.select();
                    if(tab[0].textContent === "Charts") {
                        self.reloadChart();
                    }

                    if(redrawChart) {
                        setTimeout(function () {
                            var chart = $("#demChartArea").data("kendoChart");
                            if(chart) {
                                chart.redraw();
                            }
                        }, 1500);
                        redrawChart = false;
                    }
                };

                /**
                 * Creates the hover effect on the grid and highlights the related graphic.
                 *
                 * @method gridRowHover
                 */
                self.gridRowHover = function () {
                    $(".k-grid table tbody tr").hover(
                        function () {
                            var thisObj = $(this);

                            // Highlight the row
                            thisObj.toggleClass("k-state-hover");

                            // Highlight the graphic
                            var objectId = thisObj[0].childNodes[0].innerHTML;
                            var objID = Number(objectId);
                            $.each(mapModel.getGraphics().graphics, function (index, graphic) {
                                if(graphic.attributes.OBJECTID === objID) {
                                    var color = "cyan";
                                    if(thisObj.hasClass("k-state-hover")) {
                                        color = "yellow";
                                    }
                                    mapModel.setSymbol(graphic, color);
                                }
                            });
                        }
                    );
                };

                /**
                 * Fires when a tab is activated.
                 *
                 * @event activate
                 * @param e - event arguments
                 */
                self.tabActivated = function () {
                    var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                    var tab = tabStrip.select();

                    // Reload the chart to ensure it is up-to-date
                    if(tab[0].textContent === "Charts" && self.commChanged) {
                        self.reloadChart();
                    }
                    else {
                        $("#demChartArea").data("kendoChart").redraw();
                    }
                };

                /**
                 * Call the layer delegate to query the appropriate map service for the current community.
                 *
                 * @method getData
                 */
                self.getData = function () {
                    var url = self.reportConfigItem.restUrl;
                    var whereClause = self.reportConfigItem.summaryField + " = '" + self.communityName + "'";

                    layerDelegate.query(url, self.dataQueryHandler, self.dataQueryFault, null, whereClause, true);
                };

                /**
                 * Callback method for query errors from getData method.
                 *
                 * @method dataQueryFault
                 * @param {Error} error - error object
                 */
                self.dataQueryFault = function (error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for query results from getData method.
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.dataQueryHandler = function (results) {
                    var features = results.features;
                    var featuresCount = features.length;
                    //var feature = features[0];  // There should only be one feature returned from query

					// scott change set report output back to default and remove selected features if necessary
					self.setReportExportBackToDefault();

                    // Clear the current graphics
                    mapModel.clearGraphics();

                    // Add the new graphics. vw
                    if(features[0].geometry !== null) {
                        mapModel.addGraphics(features);

                        // Zoom to selected graphics. vw
                        var zoomExtent = graphicsUtils.graphicsExtent(features);
                        mapModel.setMapExtent(zoomExtent);
                    }

                    var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                    if(tabStrip !== undefined && tabStrip !== null) {
                        var firstTab = tabStrip.tabGroup.children("li:first");
                        if(firstTab[0].textContent === "Selected Block Groups") {
                            tabStrip.remove(0);
                            tabStrip.select(1);
                        }
                    }

                    // Summarize the features
                    var sumAttributes = {};
                    $.each(features, function (index, feature) {
                        for(var attribute in feature.attributes) {
                            if(attribute in sumAttributes) {
                                var val = sumAttributes[attribute];
                                sumAttributes[attribute] = val + feature.attributes[attribute];
                            }
                            else {
                                var newVal = feature.attributes[attribute];
                                if($.isNumeric(newVal)) {
                                    sumAttributes[attribute] = newVal;
                                }
                            }
                        }
                    });

                    // Get the configuration
                    var aggValues = {};
                    $.each(self.reportConfigItem.fields, function(index, field) {
                        var attribute = sumAttributes[field.fieldName];
                        var attrValue = Number(attribute);

                        if(field.canSum === true || featuresCount === 1) {
                            aggValues[field.fieldName] = {
                                fieldCategory: field.category,
                                fieldGroup: field.groupID, // added to sort order in data grid. vw
                                fieldRowSort: field.rowID,  // added to sort row order in data grid. vw
                                fieldName: field.fieldName,
                                tableHeader: field.tableHeader,
                                fieldAlias: field.fieldAlias,
                                fieldClass: field.class,
                                fieldValue: attrValue,
                                fieldValueFormatted: magNumberFormatter.formatValue(attrValue),
                                chartCategory: field.chartCategory,
                                chartType: field.chartType,
                                chartName: field.chartName, // added to give name to series for legend. vw
                                timePeriod: field.timePeriod,
                                derivedTargetField: field.fieldName,
                                derivedPercentOfField: field.percentOfField,
                                percentValue: 0,
                                percentValueFormatted: "0",
                                derivedDensityAreaField: field.densityAreaField,
                                densityValue: 0,
                                densityValueFormatted: "0"
                            };

                            // checks for NaN in the data and blanks out field. vw
                            if (isNaN(attrValue)) {
                                // console.log("is TRUE");
                                aggValues[field.fieldName].fieldValue = "-";
                                aggValues[field.fieldName].fieldValueFormatted = "-";
                            }

                            // checks for "0" in data to return null. vw added?
                            if (field.percentOfField === "") {
                                var percentOf = Number(sumAttributes[field.percentOfField]);
                                aggValues[field.fieldName].percentValueFormatted = "-";
                            }

                            if(field.percentOfField !== "") {
                                var percentOf = Number(sumAttributes[field.percentOfField]);
                                aggValues[field.fieldName].percentValue = (attrValue / percentOf) * 100;
                                aggValues[field.fieldName].percentValueFormatted = magNumberFormatter.formatValue((attrValue / percentOf) * 100) + "%";
                            }

                            if(field.densityAreaField !== "") {
                                var densityArea = Number(sumAttributes[field.densityAreaField]);
                                aggValues[field.fieldName].densityValue = attrValue / densityArea;
                                aggValues[field.fieldName].densityValueFormatted = magNumberFormatter.formatValue(attrValue / densityArea);
                            }
                        }
                    });

                    // Filter and group for chart categories
                    self.chartCategories = [];
                    self.aggValuesArray = [];
                    self.aggValuesGroupedByChartCategory = {};
                    self.aggValuesGroupedByFieldCategory = {};
                    $.each(aggValues, function(index, item) {
                        self.aggValuesArray.push(aggValues[item.fieldName]);

                        // Chart Categories
                        if(item.chartCategory !== "") {
                            if(item.chartCategory in self.aggValuesGroupedByChartCategory) {
                                self.aggValuesGroupedByChartCategory[item.chartCategory].push(aggValues[item.fieldName]);
                            }
                            else {
                                self.chartCategories.push({chartCategory: item.chartCategory});
                                self.aggValuesGroupedByChartCategory[item.chartCategory] = [ aggValues[item.fieldName] ];
                            }
                        }

                        // Field Categories
                        if(item.fieldCategory !== "") {
                            if(item.fieldCategory in self.aggValuesGroupedByFieldCategory) {
                                self.aggValuesGroupedByFieldCategory[item.fieldCategory].push(aggValues[item.fieldName]);
                            }
                            else {
                                self.aggValuesGroupedByFieldCategory[item.fieldCategory] = [ aggValues[item.fieldName] ];
                            }
                        }
                    });

                    if(self.compareFeature !== null) {
                        self.addCompareValues();
                    }

                    // Create the Kendo list view
                    var chartListDivObj = $("#demChartList");
                    var kendoListView = chartListDivObj.data("kendoListView");

                    if(kendoListView === undefined || kendoListView === null) {
                        chartListDivObj.kendoListView({
                            dataSource: {
                                data: self.chartCategories
                            },
                            selectable: "single",
                            change: self.onChartListSelectionChanged,
                            template: kendo.template($("#demChartListTemplate").html())
                        });

                        // Select the first item
                        var listView = chartListDivObj.data("kendoListView");
                        listView.select(listView.element.children().first());
                    }

                    // Reset comparison if community has changed
                    if(self.commChanged) {
                        // Clear the comparison checkbox
                        $("#demUseComp").prop("checked", false);

                        // Reload the chart if on the charts tab
                        var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                        var tab = tabStrip.select();
                        if(tab[0].textContent === "Charts") {
                            self.reloadChart();
                        }

                        // Reload the comparison places
                        self.reloadCompareComboBox();
                    }

                    // Create the summary grid
                    var kendoGrid = $("#demDataGrid").data("kendoGrid");
                    if(kendoGrid !== null) {
                        kendoGrid.destroy();
                        kendoGrid.element.remove();
                    }

                    var useCompare = dojo.byId("demUseComp").checked;
                    if(useCompare) {
                        self.createKendoGridWithCompare();
                    }
                    else {
                        self.createKendoGrid();
                    }
                };

                /**
                 * Initiate query for contents of comparison combo box.
                 *
                 * @method reloadCompareComboBox
                 */
                self.reloadCompareComboBox = function () {
                    var compareComboBoxInput = $("#demCompareComboBox");
                    var compareComboBoxObj = compareComboBoxInput.data("kendoComboBox");

                    if(compareComboBoxObj !== undefined && compareComboBoxObj !== null) {
                        compareComboBoxObj.enable(false);

                        // Get the place names
                        var url = self.reportConfigItem.compareUrl;
                        var whereClause = self.reportConfigItem.compareWhereClause;
                        // var outFields = self.reportConfigItem.comparePlaceField;

                        layerDelegate.query(url, self.placeListQueryHandler, self.placeListQueryFault, null, whereClause, false);
                    }
                };

                /**
                 * Fired when user clicks the comparison check box.
                 *
                 * @event click
                 * @param e - event arguments
                 */
                self.useCompareClicked = function () {
                    // Toggle the compare combobox
                    var compareComboBoxInput = $("#demCompareComboBox");
                    var compareComboBoxObj = compareComboBoxInput.data("kendoComboBox");

                    if(compareComboBoxObj === undefined || compareComboBoxObj === null) {
                        // Get the place names
                        var url = self.reportConfigItem.compareUrl;
                        var whereClause = self.reportConfigItem.compareWhereClause;
                        // var outFields = self.reportConfigItem.comparePlaceField;

                        layerDelegate.query(url, self.placeListQueryHandler, self.placeListQueryFault, null, whereClause, false);
                    }
                    else {
                        var kendoGrid = $("#demDataGrid").data("kendoGrid");

                        if($(this).is(":checked")) {
                            compareComboBoxObj.enable(true);

                            var selectedIndex = compareComboBoxObj.select();
                            if(selectedIndex > 0) {
                                // Update the Grid

                                if(kendoGrid !== undefined) {
                                    kendoGrid.destroy();
                                    kendoGrid.element.remove();
                                }
                                self.createKendoGridWithCompare();
                            }
                        }
                        else {
                            compareComboBoxObj.enable(false);
                            self.compareFeature = null;

                            // this block removes from the dom vw
                            // compareComboBoxObj.destroy();
                            // compareComboBoxObj.wrapper.remove();

                            // Update the Grid
                            if(kendoGrid !== undefined) {
                                kendoGrid.destroy();
                                kendoGrid.element.remove();
                            }
                            self.createKendoGrid();
                        }
                    }
                };

                /**
                 * Callback method for errors returned by place query.
                 *
                 * @method placeListQueryFault
                 * @param {Error} error - error object
                 */
                self.placeListQueryFault = function (error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for results returned by place query.
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.placeListQueryHandler = function (results) {
                    var features = results.features;

                    // Create array of names
                    var placeField = self.reportConfigItem.comparePlaceField;
                    var nameArray = [];
                    nameArray.push({ Name: " Compare with..." });
                    $.each(features, function (index, feature) {
                        var name = feature.attributes[placeField];
                        nameArray.push({ Name: name });
                    });

                    // used to sort attributes and put into Array. vw
                        function compare(a,b) {
                            if (a.Name < b.Name) {
                                return -1;
                            }
                            if (a.Name > b.Name) {
                                return 1;
                            }
                            return 0;
                        }
                        nameArray.sort(compare);

                    var compareComboBoxInput = $("#demCompareComboBox");
                    var compareComboBoxObj = compareComboBoxInput.data("kendoComboBox");

                    if(self.commChanged && compareComboBoxObj !== undefined) {
                        var kendoComboBox = $("#demCompareComboBox").data("kendoComboBox");
                        kendoComboBox.setDataSource(nameArray);
                        kendoComboBox.select(0);
                    }
                    else {
                        dc.create("input", {id: "demCompareComboBox"}, "demUseCompLabel", "after");
                        $("#demCompareComboBox").kendoComboBox({
                            index: 0,
                            dataTextField: "Name",
                            dataValueField: "Name",
                            filter: "contains",
                            dataSource: {
                                data: nameArray
                            },
                            select: self.compareNameSelected
                        });
                    }
                };

                /**
                 * Fired when users selects a comparison name from the combo box.
                 *
                 * @event select
                 * @param e - event arguments
                 */
                self.compareNameSelected = function (e) {
                    if(e.item.index() > 0) {
                        var selectedName = this.dataItem(e.item.index());
                        self.compareToName = selectedName.Name;

                        // Query for the place record
                        var url = self.reportConfigItem.compareUrl;
                        var whereClause = self.reportConfigItem.comparePlaceField + " = '" + self.compareToName + "'";

                        layerDelegate.query(url, self.placeQueryHelper, self.placeQueryFault, null, whereClause, true);
                    }
                    else {
                        self.compareFeature = null;
                        // Update the Grid
                        var kendoGrid = $("#demDataGrid").data("kendoGrid");
                        if(kendoGrid !== undefined) {
                            kendoGrid.destroy();
                            kendoGrid.element.remove();
                        }
                        self.createKendoGrid();
                    }
                };

                /**
                 * Callback method for errors returned by place comparison query.
                 *
                 * @method placeQueryFault
                 * @param {Error} error - error object
                 */
                self.placeQueryFault = function (error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for results returned by place comparison query.
                 *
                 * @method placeQueryHelper
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.placeQueryHelper = function (results) {
                    var features = results.features;
                    self.compareFeature = features[0]; // There should only be one feature returned from query

                    self.addCompareValues(self.compareFeature);

                    // Update the Grid
                    var kendoGrid = $("#demDataGrid").data("kendoGrid");
                    if(kendoGrid !== undefined) {
                        kendoGrid.destroy();
                        kendoGrid.element.remove();
                    }
                    self.createKendoGridWithCompare();
                };

                /**
                 * Add the comparison values to the aggregated values of the current community or Selected Block Groups.
                 *
                 * @method addCompareValues
                 */
                self.addCompareValues = function () {
                    if(self.compareFeature === null) {
                        return;
                    }

                    // Iterate through existing values to add the comparison properties
                    $.each(self.aggValuesArray, function(index, item) {
                        var fieldValue = self.compareFeature.attributes[item.fieldName];
                        item.compareValue = fieldValue;
                        item.compareValueFormatted = magNumberFormatter.formatValue(fieldValue);
                        item.comparePercentValue = 0;
                        item.comparePercentValueFormatted = "0";
                        item.compareDensityValue = 0;
                        item.compareDensityValueFormatted = "0";

                        if(item.derivedTargetField !== undefined && item.derivedTargetField !== null && item.derivedTargetField !== "") {
                            var curTarget = self.compareFeature.attributes[item.derivedTargetField];

                            // checks for "0" in data to return null. vw added?
                            if (item.derivedPercentOfField === "") {
                                var percentOf = Number(self.compareFeature.attributes[item.derivedPercentOfField]);
                                 item.comparePercentValueFormatted = "-";
                            }

                            if(item.derivedPercentOfField !== undefined && item.derivedPercentOfField !== null && self.derivedPercentOfField !== "") {
                                var percentOf = Number(self.compareFeature.attributes[item.derivedPercentOfField]);
                                var percentValue = (curTarget / percentOf) * 100;
                                item.comparePercentValue = percentValue;
                                if(!isNaN(percentValue)) {
                                    item.comparePercentValueFormatted = magNumberFormatter.formatValue(percentValue) + "%";
                                }
                            }

                            if(item.derivedDensityAreaField !== undefined && item.derivedDensityAreaField !== null && item.derivedDensityAreaField !== "") {
                                var densityArea = Number(self.compareFeature.attributes[item.derivedDensityAreaField]);
                                var densityValue = (curTarget / densityArea);
                                item.compareDensityValue = densityValue;
                                if(!isNaN(densityValue)) {
                                    item.compareDensityValueFormatted = magNumberFormatter.formatValue(densityValue);
                                }
                            }
                        }
                    });
                };

                /**
                 * Create the Summary Report div element and Kendo-ize it as a Grid.
                 * Uses self.aggValuesArray as dataSource.
                 *
                 * @method createKendoGrid
                 */
                self.createKendoGrid = function () {
                    // Create the div element for the grid
                    dc.create("div", {id: "demDataGrid", style: "margin: 5px 0 0 0; font-size: small;"}, "demSummaryOptionsRow", "after");

                    // Kendo-ize
                    $("#demDataGrid").kendoGrid({
                        dataSource: {
                            data: self.aggValuesArray,
                            group: { field: "fieldGroup" },
                            sort: { field: "fieldRowSort", dir: "asc" }
                        },
                        selectable: true,
                        scrollable: true,
                        sortable: false,
                        resizable: true,
                        columnMenu: false,
                        columns: [
                            {field: "fieldGroup", title: "Category", hidden: true, groupHeaderTemplate: "#=value#"},
                            {field: "tableHeader", title: " ", width: "150px"},
                            {field: "fieldValueFormatted", title: "Total", format: "{0:n1}"},
                            {field: "percentValueFormatted", title: "Percent"},
                            //{field: "densityValueFormatted", title: "Per Sq Mile", format: "{0:n1}"}
                        ]
                    });

                    self.sizeGrid("#demDataGrid");
                    // console.log(self.aggValuesArray);
                };

                /**
                 * Create the Summary Report div element and Kendo-ize it as a Grid with comparison columns.
                 * Uses self.aggValuesArray as dataSource.
                 *
                 * @method createKendoGrid
                 */
                self.createKendoGridWithCompare = function () {
                    // Create the div element for the grid
                    dc.create("div", {id: "demDataGrid", style: "margin: 5px 0 0 0; font-size: small;"}, "demSummaryOptionsRow", "after");
                    var gridObj = $("#demDataGrid");
                    // Kendo-ize

                    gridObj.kendoGrid({
                        dataSource: {
                            data: self.aggValuesArray,
                            group: { field: "fieldGroup" },
                            sort: { field: "fieldRowSort", dir: "asc" }
                        },
                        selectable: true,
                        scrollable: true,
                        sortable: false,
                        resizable: true,
                        columnMenu: false,
                        columns: [
                            {field: "fieldGroup", title: "Category", hidden: true, groupHeaderTemplate: "#=value#"},
                            {field: "tableHeader", title: " ", width: "120px"},
                            {field: "fieldValueFormatted", title: "Total", format: "{0:n1}"},
                            {field: "percentValueFormatted", title: "Percent"},
                            //{field: "densityValueFormatted", title: "Per Sq Mile", format: "{0:n1}"},
                            {field: "compareValueFormatted", title: "Total", format: "{0:n1}"},
                            {field: "comparePercentValueFormatted", title: "Percent"},
                            //{field: "compareDensityValueFormatted",title: "Per Sq Mile", format: "{0:n1}"}
                        ]
                    });

                    // Add the categories
                    // Found a post from Brian Seekford at the URL below on how to do this.
                    //http://brianseekford.com/index.php/2013/05/14/how-to-add-complex-headers-to-a-kendo-grid-using-simple-jquery-javascript/
                    gridObj.find("thead").first().prepend("<tr><th></th><th></th><th class='colT' scope='colgroup' colspan='2'>" + self.communityName + "</th><th class='colT' scope='colgroup' colspan='2'>" + self.compareToName + "</th></tr>");

                    self.sizeGrid("#demDataGrid");
                };

                /**
                 * Fired when user selects an item in the chart category list view
                 *
                 * @event change
                 * @param e - event arguments
                 */
                self.onChartListSelectionChanged = function () {
                    self.selectedCategoryObj = this.select();
                    self.groupedItems = self.aggValuesGroupedByChartCategory[self.selectedCategoryObj[0].childNodes[1].innerHTML];

                    // Update the chart
                    var kendoChart = $("#demChartArea").data("kendoChart");
                    if(kendoChart !== null) {
                        kendoChart.destroy();
                        kendoChart.element.remove();
                    }
                    self.createChart();
                };

                /**
                 * Reload the current chart.
                 *
                 * @method reloadChart
                 */
                self.reloadChart = function () {
                    var chartListDivObj = $("#demChartList");
                    var kendoListView = chartListDivObj.data("kendoListView");

                    if(kendoListView !== undefined && kendoListView !== null) {
                        self.selectedCategoryObj = kendoListView.select();
                        self.groupedItems = self.aggValuesGroupedByChartCategory[self.selectedCategoryObj[0].childNodes[1].innerHTML];

                        // Update the chart
                        var kendoChart = $("#demChartArea").data("kendoChart");
                        if(kendoChart !== null) {
                            kendoChart.destroy();
                            kendoChart.element.remove();
                        }
                        self.createChart();
                    }
                };

                /**
                 * Create Kendo chart.
                 * Uses self.groupedItems as dataSource
                 *
                 * @method createChart
                 */
                self.createChart = function () {
                    // Create the div element for the chart
                    dc.create("div", {id: "demChartArea"}, "demChartAreaPane", "first");
                    var chartObj = $("#demChartArea");

                    // Set the height
                    chartObj.css({height: 300, overflow: "hidden"});

                    // Kendo-ize
                    var chart = chartObj.kendoChart({
                        dataSource: {
                            data: self.groupedItems
                        },

                        //change color of charts vw
                        seriesColors: appConfig.seriesColors,

                        legend: {
                            visible: self.legendVisible,
                            position: "bottom",
                            // offsetX: 15,
                            // offsetY: -80,
                            margin: {
                                left: 0,
                            },
                            labels: {
                                color: "white"
                            }
                        },
                        series: [{
                            name: self.groupedItems[0].chartName,
                            type: self.groupedItems[0].chartType,
                            field: "fieldValue",
                            categoryField: "fieldAlias"
                        }],
                        seriesDefaults: {
                            labels: {
                                visible: true,
                                position: "outsideEnd",
                                background: "#4D4D4D",
                                format: "{0:n}",
                                color: "white",
                                // template: "#= category #"
                                template: "#= category # - #= kendo.format('{0:n0}', value) #"
                            },
                            tooltip: {
                                visible: true,
                                //background: "#4D4D4D",
                                color: "black",
                                // border: {
                                //     width: 1,
                                //     color: "white"
                                // },
                                // template: "#= kendo.format('{0:n0}', value) # - #= kendo.format('{0:P}', percentage) #"
                                // template: "#= kendo.format('{0:P}', percentage) #"
                                template: "#= category #<br>#= kendo.format('{0:P}', percentage) #"
                            }
                        },
                        plotArea: {
                            margin: 5
                        },
                        chartArea: {
                            background: "#4D4D4D",
                            margin: {
                                left: 15,
                                top: 10
                            }
                        },
                        categoryAxis: {
                            //title: { text: "test"},
                            field: "fieldAlias",
                            color: "white",
                            labels: {
                                visible: false,
                                rotation: 45
                            },
                            majorGridLines: {
                                visible: false
                            },
                            line: {
                                visible: false
                            }
                        },
                        valueAxis: {
                            //title: { text: "test"},
                            color: "white",
                            labels: {
                                template: "#= kendo.format('{0} K', value / 1000) #"
                            }
                        }
                    }).data("kendoChart");
                };

                /**
                 * This method is intended to dynamically resize the chart based on the size of it's parent and sibling contents.
                 * It was not working as expected, so it has been essentially reduced to setting a static height.
                 *
                 * @method sizeGrid
                 * @param {string} selector - id of the div element representing the grid.
                 */
                self.sizeGrid = function (selector) {
                    var gridElement = $(selector),
                        newHeight = 270,
                        otherElements = gridElement.children().not(".k-grid-content"),
                        otherElementsHeight = 0;

                    otherElements.each(function () {
                        otherElementsHeight += $(this).outerHeight();
                    });

                    if(otherElementsHeight < 28) {
                        otherElementsHeight = 28;
                    }

                    if(selector === "#demFeatGrid") {
                        newHeight = 250;
                    }

                    //console.log("newHeight: " + newHeight);
                    gridElement.children(".k-grid-content").height(newHeight); // - (otherElementsHeight - 28));     //newHeight - otherElementsHeight);
                };

                /**
                 * Get the ObjectIDs of the Selected Block Groups and send the Ajax export request to the web service.
                 *
                 * @method exportSelectedFeatures
                 */
                self.exportSelectedFeatures = function () {
                    var kendoDropDownList = $("#demExportSelectedFeatures").data("kendoDropDownList");
                    var type = kendoDropDownList.value();

                    // Create array of ObjectIDs
                    var objectIds = [];
                    $.each(self.selectedFeatures, function (index, feature) {
                        objectIds.push(feature.attributes.OBJECTID);
                    });

                    // jQuery Ajax call to web service
                    var jqXHR = $.ajax(demographicConfig.exportSelectedFeaturesUrl, {
                        type : "POST",
                        data : JSON.stringify({ passcode: appConfig.webServicePasscode, type: type, objectids: objectIds }),
                        contentType: "application/json; charset=utf-8",
                        error : function (jqXHR, status) {
                            alert("Export failed with status: " + status);
                        },
                        success: function (data, status, jqXHR) {
                            var err = data["Error"];
                            if(err) {
                                alert("Export returned an error: " + err);
                            }
                            else {
                                var link = data["Result"];
                                //window.open(link, "Summary Export");
                                self.downloadURL(link);
                            }
                        }
                    });
                };

                /**
                 * Send Ajax export request to the web service for Summary Report.
                 *
                 * @method exportSummary
                 */
                self.exportSummary = function () {
                    var kendoDropDownList = $("#demExportSummary").data("kendoDropDownList");
                    var type = kendoDropDownList.value();
                    var useCompare = dojo.byId("demUseComp").checked;

                    var communities = [ self.communityName ];
                    if(useCompare) {
                        communities.push(self.compareToName);
                    }

                    // Execute call to service
                    var jqXHR = $.ajax(demographicConfig.exportSummaryGridUrl, {
                        type : "POST",
                        data : JSON.stringify({ passcode: appConfig.webServicePasscode, type: type, source: self.reportConfigItem.source, communities: communities, aggValues: self.aggValuesArray }),
                        contentType: "application/json; charset=utf-8",
                        error : function (jqXHR, status) {
                            alert("Export failed with status: " + status);
                        },
                        success: function (data, status, jqXHR) {
                            var err = data["Error"];
                            if(err) {
                                alert("Export returned an error: " + err);
                            }
                            else {
                                var link = data["Result"];
                                //window.open(link, "Summary Export");
                                self.downloadURL(link);
                            }
                        }
                    });
                };

                /**
                 * Initiate report export by printing the existing map.
                 * The rest of the export will be handled in the callback.
                 *
                 * @method exportReport
                 */
                self.exportReport = function () {
                    // added by scott, hide print button and show progress
					$("#exportReportRequest").hide();
					self.progressInterval = setInterval(self.showProgressWithDots, 96);
					self.progressDots = 0;
					self.progressText = "Generating report";

					// Print the map first then finish in the handler
                    printMapDelegate.printJpgMap(appConfig.exportWebMapUrl, self.printMapHandler, self.printMapError);
                };

				// added by scott, used to indicate progress
				self.showProgressWithDots = function(){
					if (self.progressDots <= 4){
						self.progressText += ".";
						self.progressDots++;
					}
					else {
						self.progressText = "Generating report";
						self.progressDots = 0;
					}
					$("#exportReportResponse").html(self.progressText);
				};

				// added by scott, used to take export view back to default
				self.setReportExportBackToDefault = function() {
					clearInterval(self.progressInterval);
					$("#exportReportResponse").html("");
					$("#exportReportRequest").show();
				};

                /**
                 * Callback method for errors returned by the print export.
                 *
                 * @method printMapError
                 * @param {Error} error - error object
                 */
                self.printMapError = function (error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for results returned by the print export.
                 *
                 * @method printMapHandler
                 * @param {Object} result - result object (url property contains the link to the print output).
                 */
                self.printMapHandler = function (result) {

					var useCompare = dojo.byId("demUseComp").checked;

                    // Set up the communities
                    var communities = [ self.communityName ];
                    if(useCompare) {
                        communities.push(self.compareToName);
                    }

                    // Set up chart categories
                    var chartCategories = [];
                    $.each(self.chartCategories, function(index, item) {
                        chartCategories.push(item.chartCategory);
                    });

                    // Get the charts
                    var svgCharts = self.createReportChartsSvgArray();

                    // Execute call to service
                    var jqXHR = $.ajax(demographicConfig.exportReportUrl, {
                        type : "POST",
                        data : JSON.stringify({ passcode: appConfig.webServicePasscode, mapImageUrl: result.url, source: self.reportConfigItem.source, communities: communities, aggValues: self.aggValuesArray, chartCategories: chartCategories, charts: svgCharts }),
                        contentType: "application/json; charset=utf-8",
                        error : function (jqXHR, status) {
                            alert("Export failed with status: " + status);
                        },
                        success: function (data, status, jqXHR) {
                            var err = data["Error"];
                            if(err) {
                                alert("Export returned an error: " + err);
                            }
                            else {
                                var link = data["Result"];
                                //window.open(link, "Demographic Report");
                                //self.downloadURL(link);
								// updated by scott
								clearInterval(self.progressInterval);
								$("#exportReportResponse").html("<a class='link' target='_blank' href='" + link + "'>Report complete, click here to view</a>");
								$("#exportReportRequest").show();
                            }
                        }
                    });
                };

                /**
                 * Loop through chart categories rendering a chart for each category using the default theme.
                 * Store the resulting SVG string for the chart in an array to pass to the web service.
                 *
                 * @method createReportChartsSvgArray
                 * @returns {Array}
                 */
                self.createReportChartsSvgArray = function () {
                    var svgCharts = [];

                    $.each(self.aggValuesGroupedByChartCategory, function (index, groupedItem) {
                        // Create the div element for the chart
                        dc.create("div", {id: "demReportChartArea"}, "demChartArea", "after");
                        var chartObj = $("#demReportChartArea");

                        // Kendo-ize
                        var chart = chartObj.kendoChart({
                            dataSource: {
                                data: groupedItem
                            },
                            theme: "Default",

                    //add seriescolor here to change charts
                    seriesColors: appConfig.seriesColors,

                            legend: {
                                visible: true,
                                labels: {
                                    color: "black"
                                }
                            },
                            series: [{
                                name: groupedItem[0].chartName,
                                type: groupedItem[0].chartType,
                                field: "fieldValue",
                                categoryField: "fieldAlias"
                            }],
                            seriesDefaults: {
                                labels: {
                                    visible: true,
                                    position: "outsideEnd",
                                    background: "#FFFFFF",
                                    format: "{0:n}",
                                    color: "black",
                                    //template: "#= category #"
                                    template: "#= category # - #= kendo.format('{0:n0}', value) #"
                                },
                                tooltip: {
                                    visible: false,
                                    background: "#FFFFFF",
                                    color: "black",
                                    format: "{0:n0}"
                                }
                            },
                            plotArea: {
                                margin: {
                                    right: 0,
                                    left: 0,
                                    top: 20
                                }
                            },
                            chartArea: {
                                background: "#FFFFFF",
                                margin: {
                                    right: 0,
                                    top: 20
                                }
                            },
                            categoryAxis: {
                                field: "fieldAlias",
                                color: "black",
                                labels: {
                                    visible: false,
                                    rotation: 45

                                },
                                majorGridLines: {
                                    visible: false
                                },
                                line: {
                                    visible: false
                                }
                            },
                            valueAxis: {
                                color: "black",
                                labels: {
                                    template: "#= kendo.format('{0} K', value / 1000) #"
                                }
                            }
                        }).data("kendoChart");

                        // Set the height
                        chartObj.css({width: 800, height: 600});
                        chart.redraw();

                        svgCharts.push(encodeURI(chart.svg()));

                        chart.destroy();
                        dc.destroy("demReportChartArea");
                    });

                    return svgCharts;
                };

                /**
                 * Create an iFrame, if it does not already exist, for downloading files.
                 *
                 * @method downloadURL
                 * @param {string} url - url to the document to be downloaded.
                 */
                self.downloadURL = function (url) {
                    var hiddenIFrameID = "hiddenDownloader",
                        iframe = document.getElementById(hiddenIFrameID);
                    if (iframe === null) {
                        iframe = document.createElement("iframe");
                        iframe.id = hiddenIFrameID;
                        iframe.style.display = "none";
                        document.body.appendChild(iframe);
                    }
                    iframe.src = url;
                };

            }; //end DemographicVM

            return DemographicVM;
        } // end function
    );
} ());