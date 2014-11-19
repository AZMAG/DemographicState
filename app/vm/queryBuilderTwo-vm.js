/**
 * Provides view-model implementation of the Query Builder module.
 *
 * @class QueryBulder
 */
(function () {

    "use strict";

    define([
        "dojo",
        "dojo/dom-construct",
        "dojo/topic",
        "esri/tasks/QueryTask",
        "dojo/text!app/views/queryBuilderTwo-view.html",
        "app/helpers/layer-delegate",
        "dojo/text!app/views/queryBuilderHelp-view.html",
        "app/vm/help-vm",
        "app/helpers/join-bindingHandler",
        "app/helpers/operation-bindingHandler",
        "app/helpers/subject-bindingHandler",
        "app/helpers/value-bindingHandler",

        "vendor/kendo/web/js/jquery.min",
        "vendor/kendo/web/js/kendo.web.min"
    ],
        function (dj, dc, tp, QueryTask, view, layerDelegate, helpView, helpVM) {

            var QBVM = new function () {

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
                self.joins = ko.observableArray([ "NONE", "AND", "OR" ]);

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

                /**
                 * This id value should match up with the unique id binding handlers.
                 * @type {number}
                 */
                self.currentId = 0;

                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;

                    if (self.winWidth <= 668) {
                        self.newWindowWidth = "600px";
                        self.newWindowHeight = "225px";
                    } else if (self.winWidth <= 800) {
                        self.newWindowWidth = "620px";
                        self.newWindowHeight = "300px";
                    } else if (self.winWidth <= 1024) {
                      self.newWindowWidth = "620px";
                        self.newWindowHeight = "320px";
                    } else if (self.winWidth <= 1200) {
                        self.newWindowWidth = "620px";
                        self.newWindowHeight = "320px";
                    } else {
                        self.newWindowWidth = "620px";
                        self.newWindowHeight = "320px";
                    }

                /**
                 Initilization function for the module window.
                 Configures all UI components using Kendo libraries, and binds all events and data sources.

                 @method init
                 @param {string} relatedElement - name of the element to attach the module window to.
                 @param {string} relation - relationship of the window to the relatedElement.
                 **/
                self.init = function (relatedElement, relation) {
                    var node = dc.place(view, relatedElement, relation);
                    ko.applyBindings(self, node);

                    var qbWindow2 = $("#qbWindow2").kendoWindow({
                        width: self.newWindowWidth,  // "620px"
                        height: self.newWindowHeight, // "320px"
                        title: self.windowTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: false,
                        resizable: false
                    }).data("kendoWindow");

                    var helpButton = qbWindow2.wrapper.find(".k-i-help");
                    helpButton.click(function () {
                        helpVM.openWindow(helpView);
                    });

                    tp.subscribe("QBState", function (event) { self.openWindow(); });

                    // If using Q3 2013 (version 2013.3.1119) of Kendo UI you can uncomment the 6 lines below and remove
                    // the two click events below to turn the buttons into Kendo buttons.
                    // $("#runQuery").kendoButton({
                    // click: self.runQuery
                    // });
                    // $("#cancelQuery").kendoButton({
                    // click: self.closeWindow
                    // });
                    $("#runQuery").click(self.runQuery);
                    $("#cancelQuery").click(self.closeWindow);
                    $("#verifyQuery").click(self.verifyQuery);

                }; // end init
//****************************************************************
                /**
                 Method for opening the window.

                 @method openWindow
                 **/
                self.openWindow = function () {
                    if (self.queryRows().length === 0) {
                        self.addCriteria();
                    }

                    var win = $("#qbWindow2").data("kendoWindow");
                    win.restore();
                    win.center();
                    win.open();
                };

                /**
                 Method for closing the window.

                 @method closeWindow
                 **/
                self.closeWindow = function () {
                    var win = $("#qbWindow2").data("kendoWindow");
                    win.close();

                };

                /**
                 * Store the "this" object returned by KnockoutJS as the user moves the mouse over an item row.
                 *
                 * @method rowMouseover
                 */
                self.rowMouseover = function () {
                    self.currentQueryRow = this;
                };

                /**
                 * Update the operators when the user changes the subject / field.
                 *
                 * @method fieldChanged
                 */
                self.fieldChanged = function () {
                    if (this.selectedIndex > -1) {
                        self.currentQueryRow.field(self.fields()[this.selectedIndex]);
                        self.setOperators(this.selectedIndex);
                    }
                };

                /**
                 * Set the operators based on selected field type.
                 *
                 * @method setOperators
                 * @param fieldIndex
                 */
                self.setOperators = function (fieldIndex) {
                    var fldObj = self.fields()[fieldIndex];

                    if (!self.currentQueryRow) {
                        self.currentQueryRow = self.queryRows()[0];
                    }

                    self.currentQueryRow.value(null);
                    self.currentQueryRow.type(fldObj.Type);
                    self.currentQueryRow.operators(self.compareOperators[fldObj.Type]);
                    self.currentQueryRow.operator(self.currentQueryRow.operators()[0].Sign);
                    var operId = "#queryOperation" + self.currentQueryRow.id;
                    $(operId).data("kendoDropDownList").setDataSource(self.currentQueryRow.operators());

                    //shows placeholder value vw
                    // var fldObj2 = fldObj.Placeholder;
                    var valueId = "#valueId" + self.currentQueryRow.id;
                    // console.log(valueId);
                    // var v = document.createTextNode(valueId);
                    // document.body.appendChild(v);
                    // document.getElementById(valueId).innerHTML = fldObj2;
                };

                /**
                 * Track when user changes operators and update the data item.
                 *
                 * @method operatorChanged
                 */
                self.operatorChanged = function () {
                    self.currentQueryRow.operator(self.currentQueryRow.operators()[this.selectedIndex]);
                };

                /**
                 * Track when user changes join to add new row when AND or OR are selected.
                 *
                 * @method joinChanged
                 */
                self.joinChanged = function () {
                    self.currentQueryRow.join(self.joins()[this.selectedIndex]);
                    if (this.selectedIndex > 0) {
                        self.addCriteria();
                    }
                    // console.log("index - " + this.selectedIndex);
                    // console.log("queryRow0 - " + self.queryRows().length);

                };

                /**
                 * Adds new criteria row and creates Kendo controls.
                 *
                 * @method addCriteria
                 */
                self.addCriteria = function () {
                    var id = ++self.currentId;
                    self.currentQueryRow = {
                        id: id,
                        field: ko.observable(),
                        operators: ko.observableArray(),
                        operator: ko.observable(),
                        join: ko.observable(),
                        type: ko.observable(),
                        value: ko.observable(),
                        placeholder: ko.observable()
                    };
                    self.queryRows.push(self.currentQueryRow);

                    // Kendo-ize
                    var joinId = "#queryJoin" + id;
                    $(joinId).kendoDropDownList({
                        change: self.joinChanged
                    });

                    var subjectId = "#querySubject" + id;
                    $(subjectId).kendoDropDownList({
                        dataTextField: "Field",
                        dataValueField: "Name",
                        change: self.fieldChanged
                    });

                    var operId = "#queryOperation" + id;
                    $(operId).kendoDropDownList({
                        dataTextField: "Name",
                        dataValueField: "Sign",
                        change: self.operatorChanged
                    });

                    var valueId = "#queryValue" + id;
                    $(valueId).kendoAutoComplete({
                        dataSource: [],
                        placeholder: "Enter query text..."
                    });

                    self.setOperators(0);
                };

                /**
                 * Remove the current criteria row
                 *
                 * @method removeCriteria
                 */
                self.removeCriteria = function () {
                    if (self.queryRows().length > 1) {
                        // Destroy Kendo controls first
                        var joinId = "#queryJoin" + this.id;
                        $(joinId).data("kendoDropDownList").destroy();

                        var subjectId = "#querySubject" + this.id;
                        $(subjectId).data("kendoDropDownList").destroy();

                        var operId = "#queryOperation" + this.id;
                        $(operId).data("kendoDropDownList").destroy();

                        var valueId = "#queryValue" + this.id;
                        $(valueId).data("kendoAutoComplete").destroy();

                        // Remove the row (item)
                        self.queryRows.remove(this);

                        // Make sure the last join condition is set to NONE
                        self.queryRows()[self.queryRows().length - 1].join("NONE");
                        joinId = "#queryJoin" + self.queryRows()[self.queryRows().length - 1].id;
                        $(joinId).data("kendoDropDownList").value("NONE");
                    }
                };

                /**
                 Method for executing the constructed query.

                 @method runQuery
                 **/
                self.runQuery = function () {
                    // added loading icon. vw
                    esri.show(dojo.byId("loading"));
                    var queryString = "";
                    $.each(self.queryRows(), function (index, queryRow) {
                        var whereClause = queryRow.field().Name + " ";

                        var type = queryRow.type();
                        var operator = queryRow.operator();
                        if (type === "number") {
                            whereClause += operator + " " + queryRow.value();
                        } else {
                            if (operator.indexOf("%") >= 0) {
                                switch (operator) {
                                    case "%[value]":
                                        whereClause += "LIKE '%" + queryRow.value() + "'";
                                        break;
                                    case "[value]%":
                                        whereClause += "LIKE '" + queryRow.value() + "%'";
                                        break;
                                    default:
                                        whereClause += "LIKE '%" + queryRow.value() + "%'";
                                }
                            } else {
                                whereClause += operator + " '" + queryRow.value() + "'";
                            }
                        }

                        if (index < (self.queryRows().length - 1)) {
                            var join = queryRow.join();
                            whereClause += join === "NONE" ? "" : " " + join + " ";
                        }

                        if (queryString === "") {
                            queryString = whereClause;
                        } else {
                            queryString += whereClause;
                        }
                    });
                    // console.log(queryString);

                    layerDelegate.query(self.layerUrl, self.callBack, self.errBack, undefined, queryString, true);
                    self.closeWindow();
                };

                // added to verify query without returning results. vw
                /**
                 Method for executing the constructed query.

                 @method verifyQuery
                 **/
                self.verifyQuery = function () {
                    var queryString = "";
                    $.each(self.queryRows(), function (index, queryRow) {
                        var whereClause = queryRow.field().Name + " ";
                        var type = queryRow.type();
                        var operator = queryRow.operator();
                        if (type === "number") {
                            whereClause += operator + " " + queryRow.value();
                        } else {
                            if (operator.indexOf("%") >= 0) {
                                switch (operator) {
                                    case "%[value]":
                                        whereClause += "LIKE '%" + queryRow.value() + "'";
                                        break;
                                    case "[value]%":
                                        whereClause += "LIKE '" + queryRow.value() + "%'";
                                        break;
                                    default:
                                        whereClause += "LIKE '%" + queryRow.value() + "%'";
                                }
                            } else {
                                whereClause += operator + " '" + queryRow.value() + "'";
                            }
                        }

                        if (index < (self.queryRows().length - 1)) {
                            var join = queryRow.join();
                            whereClause += join === "NONE" ? "" : " " + join + " ";
                        }

                        if (queryString === "") {
                            queryString = whereClause;
                        } else {
                            queryString += whereClause;
                        }
                    });
                    // console.log(queryString);

                    layerDelegate.verify(self.layerUrl, self.callBack, self.errBack, undefined, queryString, true);

                };


                /**
                 Method for initializing query builder workflow.

                 @method buildQuery
                 @param {function} callBack - callback method for successful query execution
                 @param {function} errBack - callback method for error result from query
                 @param {string} url - map service url
                 @param {Array} fields - array of field definitions to build the query from
                 @param {Array} compareOperators - array of comparison operators based on field type
                 **/
                self.buildQuery = function (callBack, errBack, url, fields, compareOperators) {
                    self.callBack = callBack;
                    self.errBack = errBack;
                    self.layerUrl = url;
                    self.compareOperators = compareOperators;

                    // Uncomment the two rows below to call the map service to get the field aliases.
                    // tempFields = fields;
                    // layerDelegate.layerInfo(url, self.aliasCallback, self.aliasError);

                    // Comment out the two rows below if the call is made to layer info.
                    self.fields(fields);
                    self.openWindow();
                };


                /**
                 Method for handling valid results from layer info request.

                 @method aliasCallback
                 @param {object} result - the result JSON object
                 **/
                self.aliasCallback = function (result) {
                    for (var i = 0; i < result.fields.length; i++) {
                        if (self.fieldConfigByName(result.fields[i].name)) {
                            var currField = self.fieldConfigByName(result.fields[i].name);
                            currField.Alias = result.fields[i].alias;
                        }
                    }
                    self.fields(tempFields);
                    self.openWindow();
                };

                /**
                 Method for finding a field configuration object based on field name.

                 @method fieldConfigByName
                 @param {string} fieldName - the name of the field to find
                 @return {object} - the configuration object for the field
                 **/
                self.fieldConfigByName = function (fieldName) {
                    for (var i = 0; i < tempFields.length; i++) {
                        if (tempFields[i].Name === fieldName) {
                            return tempFields[i];
                        }
                    }
                };

                /**
                 Method for finding a field configuration object based on field alias.

                 @method fieldConfigByAlias
                 @param {string} alias - the alias of the field to find
                 @return {object} - the configuration object for the field
                 **/
                self.fieldConfigByAlias = function (alias) {
                    for (var i = 0; i < tempFields.length; i++) {
                        if (tempFields[i].Alias === alias) {
                            return tempFields[i];
                        }
                    }
                };
            };

            return QBVM;
        }
    );
} ());