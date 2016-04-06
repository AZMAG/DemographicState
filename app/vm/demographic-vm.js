/**
 * Demographic report window
 *
 * @class demographic-vm
 */

(function() {

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
            "app/config/acsFieldsConfig",
            "app/config/censusFieldsConfig",
            "esri/graphicsUtils",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/SimpleFillSymbol",
            "dojo/_base/Color"
        ],
        function(dc, dom, tp, da, on, view, selFeatsView, chartHelpView, summaryHelpView,
            selFeatHelpView, helpVM, alertView1, alertView2, alert1VM, alert2VM, layerDelegate, printMapDelegate,
            magNumberFormatter, mapModel, demographicConfig, acsFieldsConfig, censusFieldsConfig, graphicsUtils) {

            var DemographicVM = new function() {

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
                self.init = function() {
                    // Place the HTML from the view into the main application after the map div.
                    dc.place(view, "mapContainer", "after");

                    // Create the Kendo Window
                    var chartWindow = $("#demographicView").kendoWindow({
                        width: self.newWindowWidth, // "630px"
                        height: self.newWindowHeight, // "auto"
                        title: self.windowTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: false,
                        resizable: false,
                        close: self.windowClosed
                    }).data("kendoWindow");

                    // Initial window placement
                    $("#demographicView").closest(".k-window").css({
                        top: 70,
                        left: (self.winWidth / 2) - 300
                    });

                    // Display legend checkbox click event
                    $("#displayLegend").bind("click", function() {
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
                            data: ["Excel", "CSV"]
                        }
                    });

                    // Get the help button and assign the click event.
                    var helpButton = chartWindow.wrapper.find(".k-i-help");
                    helpButton.click(function() {
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
                self.windowClosed = function() {
                    windowIsOpen = false;
                    redrawChart = false;
                    mapModel.clearGraphics();

                    if (self.hasSelectedFeatures) {
                        self.selectedFeatures = null;
                        self.hasSelectedFeatures = false;
                        mapModel.clearGraphics();


                        var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                        if (tabStrip !== undefined && tabStrip !== null) {
                            var firstTab = tabStrip.tabGroup.children("li:first");
                            if (firstTab[0].textContent === "Selected Block Groups") {
                                tabStrip.remove(0);
                                tabStrip.select(1);
                            }
                        }
                    }

                    //remove combobox on closing.
                    var compareComboBoxInput = $("#demCompareComboBox");
                    var compareComboBoxObj = compareComboBoxInput.data("kendoComboBox");

                    if (compareComboBoxObj) {
                        compareComboBoxObj.destroy();
                        compareComboBoxObj.wrapper.remove();
                    }
                };

                /**
                 * Open the window and initialize the contents.
                 *
                 * @method openWindow
                 * @param {string} communityName - name of the community for the report.
                 * @param {string} sumName - name of the config for the report type. vw
                 */
                self.openWindow = function(communityName, sumName) {
                    self.hasSelectedFeatures = false;
                    self.commChanged = (self.communityName !== undefined && self.communityName !== "" && self.communityName !== communityName);
                    self.communityName = communityName;

                    // Set the summary report config item
                    switch (sumName) {
                        case "state":
                            self.reportConfigItem = demographicConfig.reports.stateSummary;
                            break;
                        case "county":
                            self.reportConfigItem = demographicConfig.reports.countySummary;
                            break;
                        case "legislative":
                            self.reportConfigItem = demographicConfig.reports.legislativeSummary;
                            break;
                        case "congressional":
                            self.reportConfigItem = demographicConfig.reports.congressionalSummary;
                            break;
                        case "place":
                            self.reportConfigItem = demographicConfig.reports.placeSummary;
                            break;
                    }

                    // Get the window and open it.
                    var win = $("#demographicView").data("kendoWindow");
                    win.title(self.windowTitle + communityName);
                    if (!windowIsOpen) {
                        win.restore();
                        // win.center();
                        redrawChart = true;
                    }
                    win.restore();
                    // win.center();
                    win.open();
                    windowIsOpen = true;

                    // Initial window placement
                    $("#demographicView").closest(".k-window").css({
                        top: 70,
                        left: (self.winWidth / 2) - 300
                    });

                    // Set the source
                    $("#demSource").text("Source: " + self.reportConfigItem.source);

                    // Create the Kendo tab strip
                    var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                    if (tabStrip === undefined) {
                        $("#demTabStrip").kendoTabStrip({
                            activate: self.tabActivated
                        });
                    }

                    // Create the splitter
                    var splitter = $("#demSplitContainer").data("kendoSplitter");
                    if (splitter === undefined) {
                        $("#demSplitContainer").kendoSplitter({
                            panes: [{
                                collapsible: false,
                                resizable: false
                            }, {
                                collapsible: false,
                                resizable: false,
                                size: "30%"
                            }]
                        });
                    }

                    self.getData();

                    if (redrawChart) {
                        setTimeout(function() {
                            var chart = $("#demChartArea").data("kendoChart");
                            if (chart) {
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
                self.interactiveSelectionQueryFault = function(error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for interactive/query results.
                 *
                 * @method interactiveSelectionQueryHandler
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.interactiveSelectionQueryHandler = function(results) {
                    self.selectedFeatures = results.features;
                    // counts number of selected block groups. vw
                    var num = queryCountGlobal;
                    var numFeatures = magNumberFormatter.formatValue(num);

                    // test for results. vw
                    if (num === 0) {
                        // Get the alert window and open it. vw
                        alert2VM.openWindow(alertView2);
                        esri.hide(dom.byId("loading"));
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
                    mapModel.addGraphics(self.selectedFeatures, undefined, true);

                    // Perform actions similar to the openWindow method
                    var communityName = "Selected Block Groups";
                    self.commChanged = (self.communityName !== undefined && self.communityName !== "" && self.communityName !== communityName);
                    self.communityName = communityName;
                    self.reportConfigItem = demographicConfig.reports.censusTracts;

                    // Get the window and open it.
                    var win = $("#demographicView").data("kendoWindow");
                    win.title(self.windowTitle + communityName);
                    if (!windowIsOpen) {
                        win.restore();
                        win.center();
                        redrawChart = true;
                    }
                    win.restore();
                    win.center();
                    win.open();
                    windowIsOpen = true;

                    // hide loading gif when window opens. vw
                    esri.hide(dom.byId("loading"));

                    // enables the infoWindow after interactive summary selection is done.
                    mapModel.showInfoWindow();

                    // Set the source
                    $("#demSource").text("Source: " + self.reportConfigItem.source);

                    // Create the Kendo tab strip
                    var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                    if (tabStrip === undefined) {
                        $("#demTabStrip").kendoTabStrip({
                            activate: self.tabActivated
                        });
                    }
                    tabStrip = $("#demTabStrip").data("kendoTabStrip");

                    // Create the splitter
                    var splitter = $("#demSplitContainer").data("kendoSplitter");
                    if (splitter === undefined) {
                        $("#demSplitContainer").kendoSplitter({
                            panes: [{
                                collapsible: false,
                                resizable: false
                            }, {
                                collapsible: false,
                                resizable: false,
                                size: "30%"
                            }]
                        });
                    }

                    // We already have the data, so handle it.
                    self.dataQueryHandler(results);

                    // Create the feature attribute array
                    self.featureAttributeArray = [];
                    $.each(self.selectedFeatures, function(index, feature) {
                        self.featureAttributeArray.push(feature.attributes);
                    });

                    // Check to see if the tab is already present
                    var firstTab = tabStrip.tabGroup.children("li:first");
                    if (firstTab[0].textContent !== "Selected Block Groups") {
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
                    if (kendoGrid !== undefined && kendoGrid !== null) {
                        kendoGrid.destroy();
                        kendoGrid.element.remove();
                    }

                    // Add the grid
                    dc.create("div", {
                        id: "demFeatGrid",
                        style: "margin: 5px 0 0 0; font-size: small;"
                    }, "demSelFeatOptionsRow", "after");

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
                        columns: demographicConfig.selectedBlockGroups,
                        dataBound: self.gridRowHover
                    });

                    // Size the grid
                    self.sizeGrid("#demFeatGrid");

                    // Set up summary export types
                    $("#demExportSelectedFeatures").kendoDropDownList({
                        index: 0,
                        dataSource: {
                            data: ["Excel", "CSV"]
                        }
                    });

                    // Bind the export button
                    $("#demExportSelFeatResults").bind("click", self.exportToExcel);

                    // Reload the chart to update to current data
                    var tab = tabStrip.select();
                    if (tab[0].textContent === "Charts") {
                        self.reloadChart();
                    }

                    if (redrawChart) {
                        setTimeout(function() {
                            var chart = $("#demChartArea").data("kendoChart");
                            if (chart) {
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
                self.gridRowHover = function() {
                    $(".k-grid table tbody tr").hover(
                        function() {
                            var thisObj = $(this);

                            // Highlight the row
                            thisObj.toggleClass("k-state-hover");

                            // Highlight the graphic
                            var objectId = thisObj[0].childNodes[0].innerHTML;
                            var objID = Number(objectId);
                            // console.log(mapModel.getGraphics().graphics);
                            $.each(mapModel.getGraphics().graphics, function(index, graphic) {
                                if (graphic.attributes === undefined) {
                                    // do nothing!!
                                } else {
                                    if (graphic.attributes.OBJECTID === objID) {
                                        var color = "cyan";
                                        if (thisObj.hasClass("k-state-hover")) {
                                            color = "yellow";
                                        }
                                        mapModel.setSymbol(graphic, color);
                                    }
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
                self.tabActivated = function() {
                    var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                    var tab = tabStrip.select();

                    // Reload the chart to ensure it is up-to-date
                    if (tab[0].textContent === "Charts" && self.commChanged) {
                        self.reloadChart();
                    } else {
                        $("#demChartArea").data("kendoChart").redraw();
                    }
                };

                /**
                 * Call the layer delegate to query the appropriate map service for the current community.
                 *
                 * @method getData
                 */
                self.getData = function() {
                    var url = self.reportConfigItem.censusRestUrl;
                    var url2 = self.reportConfigItem.ACSRestUrl;
                    var whereClause = self.reportConfigItem.summaryField + " = '" + self.communityName + "'";
                    layerDelegate.query(url, self.dataQueryHandler, self.dataQueryFault, null, whereClause, true);
                    layerDelegate.query(url2, self.dataQueryHandler, self.dataQueryFault, null, whereClause, true);
                };

                /**
                 * Callback method for query errors from getData method.
                 *
                 * @method dataQueryFault
                 * @param {Error} error - error object
                 */
                self.dataQueryFault = function(error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for query results from getData method.
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.dataQueryHandler = function(results) {
                    var features = results.features;
                    var isACS = false;
                    var fieldCount = Object.keys(features[0].attributes).length;
                    //console.log(features);

                    if( fieldCount > 150)
                    {
                        isACS = true;
                    }


                    var featuresCount = features.length;

                    // Clear the current graphics
                    mapModel.clearGraphics();

                    // Add the new graphics. vw
                    if(isACS)
                    {
                        if (features[0].geometry !== null) {
                            mapModel.addGraphics(features, undefined, true);
                            if (($("#demInteractiveDiv").is(":visible") == false) || $("#zoomSelection").prop("checked")) {
                                // Zoom to selected graphics. vw
                                var zoomExtent = graphicsUtils.graphicsExtent(features);
                                mapModel.setMapExtent(zoomExtent);
                            }
                        }
                    }

                    var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                    if (tabStrip !== undefined && tabStrip !== null) {
                        var firstTab = tabStrip.tabGroup.children("li:first");
                        if (firstTab[0].textContent === "Selected Block Groups") {
                            tabStrip.remove(0);
                            tabStrip.select(1);
                        }
                    }

                    // Summarize the features
                    var sumAttributes = {};
                    $.each(features, function(index, feature) {
                        for (var attribute in feature.attributes) {
                            if (attribute in sumAttributes) {
                                var val = sumAttributes[attribute];
                                sumAttributes[attribute] = val + feature.attributes[attribute];
                            } else {
                                var newVal = feature.attributes[attribute];
                                if ($.isNumeric(newVal)) {
                                    sumAttributes[attribute] = newVal;
                                }
                            }
                        }
                    });

                    var fields = censusFieldsConfig.fields;

                    if(isACS)
                    {
                        fields = acsFieldsConfig.fields;
                    }

                    // Get the configuration
                    var aggValues = {};
                    $.each(fields, function(index, field) {
                        var attribute = sumAttributes[field.fieldName];
                        var attrValue = Number(attribute);

                        if (field.canSum === true || featuresCount === 1) {
                            aggValues[field.fieldName] = {
                                fieldCategory: field.category,
                                fieldGroup: field.groupID, // added to sort order in data grid. vw
                                fieldRowSort: field.rowID, // added to sort row order in data grid. vw
                                fieldName: field.fieldName,
                                tableHeader: field.tableHeader,
                                fieldAlias: field.fieldAlias,
                                fieldClass: field.class,
                                fieldValue: attrValue,
                                fieldValueFormatted: magNumberFormatter.formatValue(attrValue),
                                chartCategory: field.chartCategory,
                                chartType: field.chartType,
                                chartName: field, // added to give name to series for legend. vw
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
                            if(isACS === false)
                            {
                                // checks for "0" in data to return null. vw added?
                                if (field.percentField === "") {
                                    // var percentOf = Number(sumAttributes[field.percentField]);
                                    aggValues[field.fieldName].percentValueFormatted = "-";
                                }

                                if (field.percentField !== "") {
                                    var percentOf = Number(sumAttributes[field.percentField]);
                                    aggValues[field.fieldName].percentValue = sumAttributes[field.percentField] * 100;
                                    aggValues[field.fieldName].percentValueFormatted = magNumberFormatter.formatValue(sumAttributes[field.percentField] * 100) + "%";
                                }
                            }
                            else{
                                if (field.percentField !== "") {
                                    aggValues[field.fieldName].percentValue = sumAttributes[field.percentField];
                                    aggValues[field.fieldName].percentValueFormatted = magNumberFormatter.formatValue(sumAttributes[field.percentField]) + "%";
                                }
                                else{
                                    aggValues[field.fieldName].percentValueFormatted = "-";
                                }
                            }

                            if (field.densityAreaField !== "") {
                                var densityArea = Number(sumAttributes[field.densityAreaField]);
                                aggValues[field.fieldName].densityValue = attrValue / densityArea;
                                aggValues[field.fieldName].densityValueFormatted = magNumberFormatter.formatValue(attrValue / densityArea);
                            }
                        }
                    });
                    // 
                        // Filter and group for chart categories
                        self.chartCategories = [];
                        self.aggValuesArray = [];
                        self.aggValuesGroupedByChartCategory = {};
                        self.aggValuesGroupedByFieldCategory = {};
                        $.each(aggValues, function(index, item) {
                            self.aggValuesArray.push(aggValues[item.fieldName]);
                                // Chart Categories
                                if (item.chartCategory !== "") {
                                    if (item.chartCategory in self.aggValuesGroupedByChartCategory) {
                                        self.aggValuesGroupedByChartCategory[item.chartCategory].push(aggValues[item.fieldName]);
                                    } else {
                                        self.chartCategories.push({
                                            chartCategory: item.chartCategory
                                        });
                                        self.aggValuesGroupedByChartCategory[item.chartCategory] = [aggValues[item.fieldName]];
                                    }
                                }
                            
                            // Field Categories
                            if (item.fieldCategory !== "") {
                                if (item.fieldCategory in self.aggValuesGroupedByFieldCategory) {
                                    self.aggValuesGroupedByFieldCategory[item.fieldCategory].push(aggValues[item.fieldName]);
                                } else {
                                    self.aggValuesGroupedByFieldCategory[item.fieldCategory] = [aggValues[item.fieldName]];
                                }
                            }
                        });

                    if (self.compareFeature !== null) {
                        self.addCompareValues();
                    }


                    //console.log(self.chartCategories);

                    // Create the Kendo list view
                    var chartListDivObj = $("#demChartList");
                    var kendoListView = chartListDivObj.data("kendoListView");

                    console.log(self.chartCategories);

                    if (kendoListView === undefined || kendoListView === null) {
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
                    if (self.commChanged) {
                        // Clear the comparison checkbox
                        $("#demACSUseComp").prop("checked", false);

                        // Reload the chart if on the charts tab
                        var tabStrip = $("#demTabStrip").data("kendoTabStrip");
                        var tab = tabStrip.select();
                        if (tab[0].textContent === "Charts") {
                            self.reloadChart();
                        }

                        // Reload the comparison places
                        self.reloadCompareComboBox();
                    }
                    var gridName = "#demCensusDataGrid";
                    var compareName = "demCensusUseComp";
                    var gridType = "census";
                    if(isACS)
                    {
                        gridName = "#demACSDataGrid";
                        compareName = "demACSUseComp";
                        gridType = "ACS";
                    }

                    // Create the summary grid
                    var kendoGrid = $(gridName).data("kendoGrid");
                    if (kendoGrid !== null) {
                        kendoGrid.element.remove();
                        kendoGrid.destroy();
                    }

                    var useCompare = dom.byId(compareName).checked;
                    if (useCompare) {
                        self.createKendoGridWithCompare(gridType);
                    } else {
                        self.createKendoGrid(gridType);
                    }
                };

                /**
                 * Initiate query for contents of comparison combo box.
                 *
                 * @method reloadCompareComboBox
                 */
                self.reloadCompareComboBox = function(type) {
                    var compareComboBoxInput = $("#demCompareComboBox");
                    var compareComboBoxObj = compareComboBoxInput.data("kendoComboBox");

                    if (compareComboBoxObj !== undefined && compareComboBoxObj !== null) {
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
                self.useCompareClicked = function() {
                    // Toggle the compare combobox
                    var compareComboBoxInput = $("#demCompareComboBox");
                    var compareComboBoxObj = compareComboBoxInput.data("kendoComboBox");

                    if (compareComboBoxObj === undefined || compareComboBoxObj === null) {
                        // Get the place names
                        var url = self.reportConfigItem.compareUrl;
                        var whereClause = self.reportConfigItem.compareWhereClause;
                        // var outFields = self.reportConfigItem.comparePlaceField;

                        layerDelegate.query(url, self.placeListQueryHandler, self.placeListQueryFault, null, whereClause, false);
                    } else {
                        var kendoGrid = $("#demDataGrid").data("kendoGrid");

                        if ($(this).is(":checked")) {
                            //compareComboBoxObj.enable(true);

                            var selectedIndex = compareComboBoxObj.select();
                            if (selectedIndex > 0) {
                                // Update the Grid

                                if (kendoGrid !== undefined) {
                                    kendoGrid.element.remove();
                                    kendoGrid.destroy();
                                }
                                self.createKendoGridWithCompare();
                            }
                        } else {
                            //compareComboBoxObj.enable(false);
                            self.compareFeature = null;

                            // this block removes from the dom vw
                            compareComboBoxObj.destroy();
                            compareComboBoxObj.wrapper.remove();

                            // Update the Grid
                            if (kendoGrid !== undefined) {
                                kendoGrid.element.remove();
                                kendoGrid.destroy();
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
                self.placeListQueryFault = function(error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for results returned by place query.
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.placeListQueryHandler = function(results) {
                    var features = results.features;

                    // Create array of names
                    var placeField = self.reportConfigItem.comparePlaceField;
                    var nameArray = [];
                    nameArray.push({
                        Name: " Compare with..."
                    });
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

                    var compareComboBoxInput = $("#demCompareComboBox");
                    var compareComboBoxObj = compareComboBoxInput.data("kendoComboBox");

                    if (compareComboBoxObj) {
                        compareComboBoxObj.destroy();
                        compareComboBoxObj.wrapper.remove();
                    }
                    dc.create("input", {
                        id: "demCompareComboBox"
                    }, "demUseCompLabel", "after");
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
                    //}
                };

                /**
                 * Fired when users selects a comparison name from the combo box.
                 *
                 * @event select
                 * @param e - event arguments
                 */
                self.compareNameSelected = function(e) {
                    if (e.item.text() !== " Compare with...") {
                        if (e.item.index() > 0) {
                            var selectedName = this.dataItem(e.item.index());
                            self.compareToName = selectedName.Name;

                            // Query for the place record
                            var url = self.reportConfigItem.compareUrl;
                            var whereClause = self.reportConfigItem.comparePlaceField + " = '" + self.compareToName + "'";

                            layerDelegate.query(url, self.placeQueryHelper, self.placeQueryFault, null, whereClause, true);
                        } else {
                            self.compareFeature = null;
                            // Update the Grid
                            var kendoGrid = $("#demDataGrid").data("kendoGrid");
                            if (kendoGrid !== undefined) {
                                kendoGrid.destroy();
                                kendoGrid.element.remove();
                            }
                            self.createKendoGrid();
                        }
                    }
                };

                /**
                 * Callback method for errors returned by place comparison query.
                 *
                 * @method placeQueryFault
                 * @param {Error} error - error object
                 */
                self.placeQueryFault = function(error) {
                    console.log(error.message);
                };

                /**
                 * Callback method for results returned by place comparison query.
                 *
                 * @method placeQueryHelper
                 * @param {FeatureSet} results - feature set returned by query.
                 */
                self.placeQueryHelper = function(results) {
                    var features = results.features;
                    self.compareFeature = features[0]; // There should only be one feature returned from query

                    self.addCompareValues(self.compareFeature);

                    // Update the Grid
                    var kendoGrid = $("#demDataGrid").data("kendoGrid");
                    if (kendoGrid !== undefined) {
                        kendoGrid.element.remove();
                        kendoGrid.destroy();
                    }
                    self.createKendoGridWithCompare();
                };

                /**
                 * Add the comparison values to the aggregated values of the current community or Selected Block Groups.
                 *
                 * @method addCompareValues
                 */
                self.addCompareValues = function() {
                    if (self.compareFeature === null) {
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

                        if (item.derivedTargetField !== undefined && item.derivedTargetField !== null && item.derivedTargetField !== "") {
                            var curTarget = self.compareFeature.attributes[item.derivedTargetField];

                            // checks for "0" in data to return null. vw added?
                            if (item.derivedPercentOfField === "") {
                                // var percentOf = Number(self.compareFeature.attributes[item.derivedPercentOfField]);
                                item.comparePercentValueFormatted = "-";
                            }

                            if (item.derivedPercentOfField !== undefined && item.derivedPercentOfField !== null && self.derivedPercentOfField !== "") {
                                var percentOf = Number(self.compareFeature.attributes[item.derivedPercentOfField]);
                                var percentValue = (curTarget / percentOf) * 100;
                                item.comparePercentValue = percentValue;
                                if (!isNaN(percentValue)) {
                                    item.comparePercentValueFormatted = magNumberFormatter.formatValue(percentValue) + "%";
                                }
                            }

                            if (item.derivedDensityAreaField !== undefined && item.derivedDensityAreaField !== null && item.derivedDensityAreaField !== "") {
                                var densityArea = Number(self.compareFeature.attributes[item.derivedDensityAreaField]);
                                var densityValue = (curTarget / densityArea);
                                item.compareDensityValue = densityValue;
                                if (!isNaN(densityValue)) {
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
                self.createKendoGrid = function(type) {

                    var dataGridName = "demACSDataGrid";
                    var demoOptionsRowName = "demACSSummaryOptionsRow";

                    if(type === "census")
                    {
                        dataGridName = "demCensusDataGrid";
                        demoOptionsRowName = "demCensusSummaryOptionsRow";
                    }


                    // Create the div element for the grid
                    dc.create("div", {
                        id: dataGridName,
                        style: "margin: 5px 0 0 0; font-size: small;"
                    }, demoOptionsRowName, "after");

                    // Kendo-ize
                    $("#" + dataGridName).kendoGrid({
                        dataSource: {
                            data: self.aggValuesArray,
                            group: {
                                field: "fieldGroup"
                            },
                            sort: {
                                field: "fieldRowSort",
                                dir: "asc"
                            }
                        },
                        selectable: true,
                        scrollable: true,
                        sortable: false,
                        resizable: true,
                        columnMenu: false,
                        columns: [{
                                field: "fieldGroup",
                                title: "Category",
                                hidden: true,
                                groupHeaderTemplate: "#=value#"
                            }, {
                                field: "tableHeader",
                                title: " ",
                                width: "150px"
                            }, {
                                field: "fieldValueFormatted",
                                title: "Total",
                                format: "{0:n1}"
                            }, {
                                field: "percentValueFormatted",
                                title: "Percent"
                            },
                            //{field: "densityValueFormatted", title: "Per Sq Mile", format: "{0:n1}"}
                        ]
                    });

                    self.sizeGrid("#" + dataGridName);
                    // console.log(self.aggValuesArray);
                };

                /**
                 * Create the Summary Report div element and Kendo-ize it as a Grid with comparison columns.
                 * Uses self.aggValuesArray as dataSource.
                 *
                 * @method createKendoGrid
                 */
                self.createKendoGridWithCompare = function(type) {

                    var dataGridName = "demACSDataGrid";
                    var demoOptionsRowName = "demACSSummaryOptionsRow";

                    if(type === "census")
                    {
                        dataGridName = "demCensusDataGrid";
                        demoOptionsRowName = "demCensusSummaryOptionsRow";
                    }


                    // Create the div element for the grid
                    dc.create("div", {
                        id: dataGridName,
                        style: "margin: 5px 0 0 0; font-size: small;"
                    }, demoOptionsRowName, "after");
                    var gridObj = $("#" + dataGridName);
                    // Kendo-ize

                    gridObj.kendoGrid({
                        dataSource: {
                            data: self.aggValuesArray,
                            group: {
                                field: "fieldGroup"
                            },
                            sort: {
                                field: "fieldRowSort",
                                dir: "asc"
                            }
                        },
                        selectable: true,
                        scrollable: true,
                        sortable: false,
                        resizable: true,
                        columnMenu: false,
                        columns: [{
                                field: "fieldGroup",
                                title: "Category",
                                hidden: true,
                                groupHeaderTemplate: "#=value#"
                            }, {
                                field: "tableHeader",
                                title: " ",
                                width: "120px"
                            }, {
                                field: "fieldValueFormatted",
                                title: "Total",
                                format: "{0:n1}"
                            }, {
                                field: "percentValueFormatted",
                                title: "Percent"
                            },
                            //{field: "densityValueFormatted", title: "Per Sq Mile", format: "{0:n1}"},
                            {
                                field: "compareValueFormatted",
                                title: "Total",
                                format: "{0:n1}"
                            }, {
                                field: "comparePercentValueFormatted",
                                title: "Percent"
                            },
                            //{field: "compareDensityValueFormatted",title: "Per Sq Mile", format: "{0:n1}"}
                        ]
                    });

                    // Add the categories
                    // Found a post from Brian Seekford at the URL below on how to do this.
                    //http://brianseekford.com/index.php/2013/05/14/how-to-add-complex-headers-to-a-kendo-grid-using-simple-jquery-javascript/
                    gridObj.find("thead").first().prepend("<tr><th></th><th></th><th class='colT' scope='colgroup' colspan='2'>" + self.communityName + "</th><th class='colT' scope='colgroup' colspan='2'>" + self.compareToName + "</th></tr>");

                    self.sizeGrid("#" + dataGridName);
                };

                /**
                 * Fired when user selects an item in the chart category list view
                 *
                 * @event change
                 * @param e - event arguments
                 */
                self.onChartListSelectionChanged = function() {
                    self.selectedCategoryObj = this.select();
                    console.log(self.aggValuesGroupedByChartCategory);
                    self.groupedItems = self.aggValuesGroupedByChartCategory[self.selectedCategoryObj[0].childNodes[1].innerHTML];

                    // Update the chart
                    var kendoChart = $("#demChartArea").data("kendoChart");
                    if (kendoChart !== null) {
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
                self.reloadChart = function() {
                    var chartListDivObj = $("#demChartList");
                    var kendoListView = chartListDivObj.data("kendoListView");

                    if (kendoListView !== undefined && kendoListView !== null) {
                        self.selectedCategoryObj = kendoListView.select();
                        self.groupedItems = self.aggValuesGroupedByChartCategory[self.selectedCategoryObj[0].childNodes[1].innerHTML];

                        // Update the chart
                        var kendoChart = $("#demChartArea").data("kendoChart");
                        if (kendoChart !== null) {
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
                self.createChart = function() {
                    // Create the div element for the chart

                    //console.log(self.groupedItems);

                    dc.create("div", {
                        id: "demChartArea"
                    }, "demChartAreaPane", "first");
                    var chartObj = $("#demChartArea");

                    // Set the height
                    chartObj.css({
                        height: 300,
                        overflow: "hidden"
                    });

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
                                right: 10
                            },
                            labels: {
                                color: "white"
                            }
                        },
                        series: [{
                            name: self.groupedItems[0].chartName,
                            type: self.groupedItems[0].chartType,
                            field: "fieldValue",
                            categoryField: "fieldAlias",
                            padding: 75
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
                            margin: {
                                right: 30,

                            }
                        },
                        chartArea: {
                            background: "#4D4D4D",
                            margin: {
                                left: 15,
                                top: 5,
                                right: 15
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
                self.sizeGrid = function(selector) {
                    var gridElement = $(selector),
                        newHeight = 270,
                        otherElements = gridElement.children().not(".k-grid-content"),
                        otherElementsHeight = 0;

                    otherElements.each(function() {
                        otherElementsHeight += $(this).outerHeight();
                    });

                    if (otherElementsHeight < 28) {
                        otherElementsHeight = 28;
                    }

                    if (selector === "#demFeatGrid") {
                        newHeight = 250;
                    }

                    //console.log("newHeight: " + newHeight);
                    gridElement.children(".k-grid-content").height(newHeight); // - (otherElementsHeight - 28));     //newHeight - otherElementsHeight);
                };

                /**
                 * Exports the kendo grid to excel.  See (http://demos.telerik.com/kendo-ui/grid/excel-export) for more info
                 *
                 * @method exportToExcel
                 */
                self.exportToExcel = function(sender) {
                    var exportButtonId = sender.currentTarget.id;
                    var grid;
                    var fileName;
                    var headerValue = self.communityName;
                    var colSpan;
                    var rowSpan;

                    if (exportButtonId === "demExportResults")
                    {
                        //Summary report export button clicked
                        grid = $("#demDataGrid").data("kendoGrid");
                        headerValue = self.communityName + " Demographics";
                        fileName = self.communityName + ".xlsx";
                        if(self.compareFeature === null){
                            colSpan = 4;
                            rowSpan = 25; 
                        }
                        else{
                            colSpan = 6;
                            rowSpan = 20;
                        }
                    }
                    else if (exportButtonId === "demExportSelFeatResults")
                    {
                        //Block group export clicked
                        grid = $("#demFeatGrid").data("kendoGrid");
                        headerValue = "Selected Block Groups";
                        fileName = self.communityName + ".xlsx";
                        colSpan = 51;
                        rowSpan = 4;
                    }
                    grid.bind("excelExport", function(e) {
                            var rows = e.workbook.sheets[0].rows;
                            var columns = e.workbook.sheets[0].columns;
                            columns[1].width = 290;
                            console.log(columns);

                            $.each(rows, function(index, row) {
                                if(row.type === "group-header")
                                {
                                    row.cells[0].value = row.cells[0].value.substring(37);
                                }
                            });

                            e.workbook.sheets[0]["name"] = "Demographic Data";
                            e.workbook.sheets[0]["frozenRows"] = 2;

                            var headerRow = {
                                cells: [{
                                    background: "#000",
                                    colSpan: colSpan,
                                    color: "#fff",
                                    rowSpan: 1,
                                    fontSize: 14,
                                    value: headerValue,
                                    hAlign: "center"
                                }],
                                height: 30,
                                headerRow: "added"
                            };

                            var sourceRow = {
                                cells: [{
                                    background: "#000",
                                    colSpan: colSpan,
                                    color: "#fff",
                                    rowSpan: 1,
                                    fontSize: 11,
                                    value: appConfig.sourceLabel,
                                    hAlign: "left",
                                    wrap: true
                                }]
                            };

                            var footerRow = {
                                cells: [{
                                    background: "#d3d3d3",
                                    colSpan: colSpan,
                                    color: "#000",
                                    rowSpan: rowSpan,
                                    fontSize: 8,
                                    value: appConfig.legalDisclaimer,
                                    hAlign: "center",
                                    wrap: true
                                }]
                            };

                            if (rows[0].headerRow !== "added") {
                                //Add custom header row
                                rows.unshift(headerRow);
                                rows.push(sourceRow);
                                rows.push(footerRow);
                            }

                            e.workbook.fileName = fileName;
                        });
                        grid.saveAsExcel();
                };

                self.exportPDFReport = function() {
                    var parameterString = "";
                    if (self.compareFeature) {
                        if (self.communityName === "Selected Block Groups") {
                            var tractIdArray = "";

                            for (var i = 0; i < self.selectedFeatures.length; i++) {
                                tractIdArray += self.selectedFeatures[i].attributes.OBJECTID + ",";
                            }
                            parameterString = "Interactive";
                            localStorage.city1 = tractIdArray.substring(0, tractIdArray.length - 1);
                        } else {
                            parameterString = self.communityName;
                        }

                        self.reportURL = encodeURI(demographicConfig.exportPDFCompareReportUrl + "?city1=" + parameterString + "&?city2=" + self.compareToName);
                        var newWindow = window.open(self.reportURL, "_new");
                    } else {
                        if (self.communityName.indexOf("County") > -1) {
                            self.reportURL = encodeURI(demographicConfig.exportPDFReportUrl + "?county=" + self.communityName);
                            newWindow = window.open(self.reportURL, "_new");
                        } else if (self.communityName.indexOf("Legislative") > -1) {
                            self.reportURL = encodeURI(demographicConfig.exportPDFReportUrl + "?legislative=" + self.communityName.slice(-2));
                            newWindow = window.open(self.reportURL, "_new");
                        } else if (self.communityName.indexOf("Congressional") > -1) {
                            self.reportURL = encodeURI(demographicConfig.exportPDFReportUrl + "?congressional=" + self.communityName.slice(-2));
                            newWindow = window.open(self.reportURL, "_new");
                        } else if (self.communityName.indexOf("Supervisor") > -1) {
                            self.reportURL = encodeURI(demographicConfig.exportPDFReportUrl + "?supervisor=" + self.communityName.slice(-2));
                            newWindow = window.open(self.reportURL, "_new");
                        } else if (self.communityName.indexOf("District") > -1) {
                            self.reportURL = encodeURI(demographicConfig.exportPDFReportUrl + "?council=" + self.communityName);
                            newWindow = window.open(self.reportURL, "_new");
                        } else if (self.communityName === "Selected Block Groups") {
                            var tractIdArray = "";

                            for (var i = 0; i < self.selectedFeatures.length; i++) {
                                if (i !== self.selectedFeatures.length & self.selectedFeatures.length !== 1) {
                                    tractIdArray += self.selectedFeatures[i].attributes.OBJECTID + ",";
                                } else {
                                    tractIdArray += self.selectedFeatures[i].attributes.OBJECTID;
                                }
                            }

                            localStorage.TractID = tractIdArray;
                            self.reportURL = encodeURI(demographicConfig.exportPDFReportUrl + "?stateInteractive");
                            var newWindow = window.open(self.reportURL, "_new");
                        } else if(self.communityName === "Arizona") {
                            self.reportURL = encodeURI(demographicConfig.exportPDFReportUrl + "?state=" + self.communityName);
                            var newWindow = window.open(self.reportURL, "_new");
                        }
                        else{
                            self.reportURL = encodeURI(demographicConfig.exportPDFReportUrl + "?city=" + self.communityName);
                            var newWindow = window.open(self.reportURL, "_new");
                        }
                    }
                };

                /**
                 * Callback method for errors returned by the print export.
                 *
                 * @method printMapError
                 * @param {Error} error - error object
                 */
                self.printMapError = function(error) {
                    console.log(error.message);
                };


                /**
                 * Create an iFrame, if it does not already exist, for downloading files.
                 *
                 * @method downloadURL
                 * @param {string} url - url to the document to be downloaded.
                 */
                self.downloadURL = function(url) {
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
}());