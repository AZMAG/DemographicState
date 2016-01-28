/**
 * Provides view-model implementation of the Query Builder module.
 *
 * @class QueryBulder
 */
(function() {

    "use strict";

    define([
            "dojo",
            "dojo/dom-construct",
            "dojo/dom",
            "dojo/topic",
            "esri/tasks/query",
            "esri/tasks/QueryTask",
            "dojo/text!app/views/queryBuilder-view.html",
            "app/helpers/layer-delegate",
            "dojo/text!app/views/queryBuilderHelp-view.html",
            "app/vm/help-vm",
            "app/vm/demographic-vm",
            "app/config/demographicConfig",
            "app/config/cbrConfig"
        ],
        function(dj, dc, dom, tp, Query, QueryTask, view, layerDelegate, helpView, helpVM, demographicVM, demographicConfig, cbrConfig) {

            var QBVM = new function() {

                var self = this;

                /**
                 * Used if calling layer info to get field Aliases from map service.
                 * @type {Array}
                 */
                var tempFields = [];

                /**
                 Title for the module's window

                 @property windowTitle
                 @type String
                 **/
                //self.windowTitle = "Selection Criteria";
                self.windowTitle = "Advanced Query";

                /**
                 * Store fields used for subject dropdown list.
                 * @type {*}
                 */
                self.fields = ko.observableArray();

                /**
                 * Store join types.
                 * @type {*}
                 */
                self.joins = ko.observableArray(["NONE", "AND", "OR"]);

                /**
                 * Store criteria rows created by user.
                 * @type {*}
                 */
                self.queryRows = ko.observableArray();

                /**
                 * Store comparison operators from config file.
                 * @type {{}}
                 */
                self.compareOperators = {};

                /**
                 * Keep track of the current row being worked on by user.
                 * @type {null}
                 */
                self.currentQueryRow = null;

                self.dataItemSelected = null;

                self.layerUrl = "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/" + 0;

                /**
                 * This id value should match up with the unique id binding handlers.
                 * @type {number}
                 */
                self.currentId = 0;

                self.queryItems = [];

                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;

                if (self.winWidth <= 668) {
                    self.newWindowWidth = "1000px";
                    self.newWindowHeight = "732px";
                } else if (self.winWidth <= 800) {
                    self.newWindowWidth = "1000px";
                    self.newWindowHeight = "732px";
                } else if (self.winWidth <= 1024) {
                    self.newWindowWidth = "1000px";
                    self.newWindowHeight = "732px";
                } else if (self.winWidth <= 1200) {
                    self.newWindowWidth = "1000px";
                    self.newWindowHeight = "732px";
                } else {
                    self.newWindowWidth = "1000px";
                    self.newWindowHeight = "732px";
                }

                /**
                 Initilization function for the module window.
                 Configures all UI components using Kendo libraries, and binds all events and data sources.

                 @method init
                 @param {string} relatedElement - name of the element to attach the module window to.
                 @param {string} relation - relationship of the window to the relatedElement.
                 **/
                self.init = function(relatedElement, relation) {
                    var node = dc.place(view, relatedElement, relation);
                    // ko.applyBindings(self, node);

                    var qbWindow2 = $("#qbWindow2").kendoWindow({
                        width: self.newWindowWidth, // "620px"
                        //height: self.newWindowHeight, // "320px"
                        title: self.windowTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: false,
                        resizable: false,
                        deactivate: function() {
                                self.queryItems = [];
                                this.destroy();
                            }
                    }).data("kendoWindow");

                    var helpButton = qbWindow2.wrapper.find(".k-i-help");
                    helpButton.click(function() {
                        helpVM.openWindow(helpView);
                    });

                    tp.subscribe("QBState", function() {
                        self.openWindow();
                    });

                }; // end init
                //****************************************************************
                /**
                 Method for opening the window.

                 @method openWindow
                 **/
                self.openWindow = function() {
                    //reinit window
                    self.init("display", "after");

                    $("#runQuery").click(self.runQuery);
                    $("#cancelQuery").click(self.closeWindow);

                    var win = $("#qbWindow2").data("kendoWindow");
                    win.restore();
                    win.center();
                    win.open();
                    $("#dropPrompt").hide();

                    $(".k-item").removeClass("k-state-selected");

                    var combinedFieldList = cbrConfig.thematicMaps.concat(demographicConfig.queryFields);

                    var fieldDataSource = new kendo.data.HierarchicalDataSource({
                        data: combinedFieldList
                    });

                    var treeView = $("#treeView").kendoTreeView({
                        dataSource: fieldDataSource,
                        dataTextField: ["ShortName"]
                    });
                    treeView.data("kendoTreeView").expand("li:first");

                    $("#treeView").on("dblclick", function (e) {
                        var treeView = $("#treeView").data("kendoTreeView");
                        var dataItem = treeView.dataItem(e.target);
                        self.dataItemSelected = dataItem;

                        if (dataItem !== undefined) {
                            if (dataItem.ShortName) {
                                self.addRow(dataItem);
                            }
                        }
                    });

                    $("#treeView").kendoDraggable({
                        filter: ".k-in", //specify which items will be draggable
                        hint: function(element) { //create a UI hint, the `element` argument is the dragged item
                          return element.clone().css({
                            "opacity": 0.4,
                            "padding": "5px",
                            "cursor": "move"
                        });
                      },
                        dragstart: function(e) {
                            var treeView = $("#treeView").data("kendoTreeView");
                            var dataItem = treeView.dataItem(e.currentTarget);
                            self.dataItemSelected = dataItem;

                            if (dataItem.Type !== undefined) {
                                $("#target").css("backgroundColor", "grey");
                                $("#target").children().hide();
                                $("#dropPrompt").show();
                                $(this).addClass("k-add");
                            }
                        },
                        dragend: function(e) {
                            $("#target").css("backgroundColor", "transparent");
                            $("#target").children().show();
                            $("#dropPrompt").hide();
                        }
                    });
                  
                    $("#target").kendoDropTarget({
                        dragenter: function(e) {
                            if (self.dataItemSelected.Type !== undefined) {
                              e.draggable.hint.css("opacity", 1);
                              $("#target").css("backgroundColor", "darkgrey");
                            }
                        },
                        dragleave: function(e) {
                            if (self.dataItemSelected.Type !== undefined) {
                              e.draggable.hint.css("opacity", 0.5);
                              $("#target").css("backgroundColor", "grey");
                            }
                        },
                        drop: self.onDrop
                    });

                    $("body").on('click', '.removeRowBtn', function() {
                        var str = $(this).parents("div:first")[0].innerText.toString();
                        var fieldName = str.substring(0, str.indexOf(':'));
                        var previousDropdown = $(this).parent().parent().prevAll(".joinDDLClass:first");

                        if (previousDropdown.length > 0) {
                            //remove dropdown
                            previousDropdown.remove();
                        }
                        else{
                            $(this).parent().parent().nextAll(".joinDDLClass:first").remove();
                        }

                        //remove row
                        $(this).parents("div:first").remove();

                        //update array
                        $.each(self.queryItems, function( index, queryItem ) {
                            if (queryItem.name === fieldName) {
                                self.queryItems.splice(index, 1);
                                return false;
                            }
                        });
                        self.verifyQuery();
                        return false;
                    });
                    $("body").on('click', '.clearRowBtn', function() {
                        var selector = $(this).parents("div:first")[0].id;
                        var textBoxes = $("#" + selector + " .style1");
                        $.each(textBoxes, function( index, textBox ) {
                            var tb = $(textBox).data("kendoNumericTextBox");
                            if (tb) {
                                tb._old = tb._value;
                                tb._value = null;
                                tb._text.val(tb._value);
                                tb.element.val(tb._value);
                            }
                        });
                        self.verifyQuery();
                        return false;
                    });
                };

                /**
                 Method for closing the window.

                 @method closeWindow
                 **/
                self.closeWindow = function() {
                    var win = $("#qbWindow2").data("kendoWindow");
                    win.close();
                };

                self.onDrop = function(e) {
                    var dataItem = self.dataItemSelected;
                    self.addRow(dataItem);
                };

                self.addRow = function(dataItem)
                {
                    var count = self.queryItems.length + 1;
                    var target = $( "#target" );

                    if (dataItem.Type !== undefined) {
                        if (count > 1) {

                            target.append("<select class='joinDDLClass' id='joinDDL" + count + "'></select>");

                            var joinDropDown = $("#joinDDL" + count).kendoDropDownList({
                                dataSource: [
                                    { name: "AND" },
                                    { name: "OR" }
                                ],
                                dataTextField: "name",
                                dataValueField: "name",
                                value: "AND",
                                change: self.verifyQuery
                            });
                        }
                        var queryItem = {};

                        if (dataItem.Type === "number" || dataItem.Type === "percent") {
                            target.append("<div class='demo-section k-header' id='" + dataItem.uid + count + "'>" + "<input class='hiddenFld' type='hidden' value='" + dataItem.Type + "' placeholder='" + dataItem.Placeholder + "'>" +
                            "<span class='queryItem'>" + dataItem.ShortName + ": </span>" + '<span class="inputBoxes"><select class="operatorDDL" id="operatorDDL' + count + '"></select><input class="style1" placeholder="min">' +
                            '</input><input placeholder="max" class="style1"></input><button class="removeRowBtn">Remove</button><button class="clearRowBtn">Clear</button></span>' +
                            "</div>");

                            var operatorDropDown = $("#operatorDDL" + count).kendoDropDownList({
                                dataSource: demographicConfig.CompareOperators.number,
                                dataTextField: "Name",
                                dataValueField: "Sign",
                                index: 0,
                                change: self.onChange
                            });

                            var selector = dataItem.uid.toString() + count;

                            var maxValue = dataItem.Placeholder;

                            if (dataItem.Type === "percent") {
                                $('#' + selector + " .style1").kendoNumericTextBox({
                                    spinners: false,
                                    min: 0,
                                    max: 100,
                                    format: "# \\%",
                                    change: self.verifyQuery
                                }).data("kendoNumericTextBox");
                                maxValue = 1;
                            }
                            else{
                                $('#' + selector + " .style1").kendoNumericTextBox({
                                    spinners: false,
                                    min: 0,
                                    max: maxValue,
                                    change: self.verifyQuery
                                }).data("kendoNumericTextBox");
                            }
                            queryItem = {
                                "id": "#" + dataItem.uid + count,
                                "operator": "#operatorDDL" + count,
                                "join": "#joinDDL" + (count + 1),
                                "fieldName": dataItem.FieldName,
                                "name": dataItem.ShortName,
                                "maxVal": maxValue,
                                "type": dataItem.Type,
                                "strDDL": ""
                            };
                        }
                        else{
                            target.append("<div class='demo-section k-header' id='" + dataItem.uid + count + "'>" +
                            "<span class='queryItem'>" + dataItem.ShortName + ": </span>" + '<span class="inputBoxes"><select class=strMultiselect id="strMS' + count + '"></select><button class="removeRowBtn">Remove</button></span>' +
                            "</div>");

                            queryItem = {
                                "id": "#" + dataItem.uid + count,
                                "operator": "#operatorDDL" + count,
                                "join": "#joinDDL" + (count + 1),
                                "fieldName": dataItem.FieldName,
                                "name": dataItem.ShortName,
                                "maxVal": dataItem.Placeholder,
                                "type": dataItem.Type,
                                "strDDL": "#strMS"+ count
                            };

                            layerDelegate.query(self.layerUrl, self.populateStringDropdowns, self.errBack, undefined, "1=1", false, [dataItem.FieldName], [dataItem.FieldName], true);
                        }
                        self.queryItems.push(queryItem);
                        self.verifyQuery();
                    }
                };

                self.onChange = function(e){
                    var item = $('#' + e.sender.element[0].id).parent();
                    var selector = item.parent().parent()[0].id.toString();
                    var hiddenData = $('#' + selector + ' .hiddenFld')[0];
                    var type = hiddenData.value;
                    var maxValue = hiddenData.placeholder;
                    var dataItem = this.dataItem(e.item);
                    
                    $(item).siblings(".style1").remove();
                    if (dataItem.Sign !== "between") {
                        $( '<input class="style1" placeholder="value"></input>').insertAfter(item);
                    }
                    else{
                        $( '<input class="style1" placeholder="min"></input><input placeholder="max" class="style1"></input>').insertAfter(item);
                    }

                    if (type === "percent") {
                                $('#' + selector + " .style1").kendoNumericTextBox({
                                    spinners: false,
                                    min: 0,
                                    max: 100,
                                    format: "# \\%",
                                    change: self.verifyQuery
                                });
                                maxValue = 1;
                            }
                            else{
                                $('#' + selector + " .style1").kendoNumericTextBox({
                                    spinners: false,
                                    min: 0,
                                    max: maxValue,
                                    change: self.verifyQuery
                                });
                            }
                    self.verifyQuery();
                };

                /**
                 Method for executing the constructed query.

                 @method runQuery
                 **/
                self.runQuery = function() {
                    var queryString = self.buildQueryString();
                    layerDelegate.query(self.layerUrl, demographicVM.interactiveSelectionQueryHandler, demographicVM.interactiveSelectionQueryFault, undefined, queryString, true);
                    esri.show(dojo.byId("loadingImg"));
                    self.closeWindow();
                };

                self.populateStringDropdowns = function(results) {
                    var count = self.queryItems.length;
                    var sourceArray = [];
                    $.each(results.features, function(index, feature) {
                        for (var id in feature.attributes) {
                            if (feature.attributes.hasOwnProperty(id)) {
                                sourceArray.push(feature.attributes[id]);
                            }
                        }
                    });

                    var strMultiselect = $("#strMS" + count).kendoDropDownList({
                        dataSource: sourceArray,
                        change: self.verifyQuery
                    });
                    self.verifyQuery();
                };

                self.buildQueryString = function() {
                    var queryString = "";
                    for (var i = 0; i < self.queryItems.length; i++) {
                        var fieldName = self.queryItems[i].fieldName;
                        var join = $(self.queryItems[i].join).val();
                        if (self.queryItems[i].type === "number" || self.queryItems[i].type === "percent") {
                            var operator = $(self.queryItems[i].operator).val();
                            var inputBoxes = $(self.queryItems[i].id + " input.style1.k-formatted-value.k-input");
                            var min = 0;
                            var max = self.queryItems[i].maxVal;
                            var inputValue = 0;
                            if (inputBoxes.length > 1) {

                                if (inputBoxes[0].value) {
                                    min = inputBoxes[0].value.replace(/,/g,'');
                                    if (self.queryItems[i].type === "percent") {
                                        min = min.replace("%", "");
                                        min = (min/100);
                                    }
                                }
                                if (inputBoxes[1].value) {
                                    max = inputBoxes[1].value.replace(/,/g,'');
                                    if (self.queryItems[i].type === "percent") {
                                        max = max.replace("%", "");
                                        max = (max/100);
                                    }
                                }
                                if (i !== (self.queryItems.length - 1)) {
                                    queryString += "(" + fieldName + " >= " + min + " AND  " + fieldName + " <= " + max + ") " + join + " ";
                                }
                                else{
                                    queryString += "(" + fieldName + " >= " + min + " AND  " + fieldName + " <= " + max + ")";
                                }
                            }
                            else{
                                if (inputBoxes[0].value) {
                                    inputValue = inputBoxes[0].value.replace(/,/g,'');
                                    if (self.queryItems[i].type === "percent") {
                                        inputValue = inputValue.replace("%", "");
                                        inputValue = (inputValue/100);
                                    }
                                }
                                if (i !== (self.queryItems.length - 1)) {
                                    queryString += "(" + fieldName + " " + operator + " " + inputValue + ") " + join + " ";
                                }
                                else{
                                    queryString += "(" + fieldName + " " + operator + " " + inputValue + ") ";
                                }
                            }
                        }
                        else if (self.queryItems[i].type === "string"){
                            var dropdownValue = $(self.queryItems[i].strDDL).val();
                            if (i !== (self.queryItems.length - 1)) {
                                    queryString += "(" + fieldName + " = '" + dropdownValue + "') " + join + " ";
                                }
                                else{
                                    queryString += "(" + fieldName + " = '" + dropdownValue + "') ";
                                }
                        }
                    }
                    return queryString;
                };

                /**
                 Method for executing the constructed query.

                 @method verifyQuery
                 **/
                self.verifyQuery = function() {
                    var queryString = self.buildQueryString();
                    layerDelegate.verify(self.layerUrl, self.verifyCallback, self.errBack, undefined, queryString, true);
                };

                self.verifyCallback = function(count){
                    $("#fCount1").text(count);
                    $("#fCountSpan").show();
                };
            };
            return QBVM;
        }
    );
}());

