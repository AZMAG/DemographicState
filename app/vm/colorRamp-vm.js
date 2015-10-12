/**
 * Provides view-model implementation of the Color Ramp selector window.
 *
 * @class ColorRamp
 */
(function() {

    "use strict";

    define([
            "dojo",
            "dojo/dom-construct",
            "dojo/topic",
            "app/config/colorRampConfig",
            "dojo/text!app/views/colorRampHelp-view.html",
            "app/vm/help-vm",
            "app/models/map-model",
            "dojo/text!app/views/colorRamp-view.html"
        ],
        function(dj, dc, tp, conf, helpView, helpVM, mapModel, view) {

            var ColorRampVM = new function() {

                var self = this;

                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;

                if (self.winWidth <= 668) {
                    self.newWindowHeight = 250;
                } else if (self.winWidth <= 800) {
                    self.newWindowHeight = 400;
                } else if (self.winWidth <= 1024) {
                    self.newWindowHeight = 400;
                } else if (self.winWidth <= 1200) {
                    self.newWindowHeight = 400;
                } else {
                    self.newWindowHeight = 400;
                }
                /**
                Title for the module's window

                @property windowTitle
                @type String
                **/
                self.windowTitle = "Color Schemes";

                self.bookmarkDelegate = null;

                /**
                Initilization function for the module window.
                Configures all UI components using Kendo libraries, and binds all events and data sources.

                @method init
                @param {string} relatedElement - name of the element to attach the module window to.
                @param {string} relation - relationship of the window to the relatedElement.
                @param {string} initScheme - the scheme to use when initializing the color ramp selection.
                @param {string} initRamp - the color ramp to use when initializing the color ramp selection.
                @param {string} initBreaks - the number of breaks to use when initializing the window.
                **/
                self.init = function(relatedElement, relation, initScheme, initRamp, initBreaks, bmDelegate) {
                    dc.place(view, relatedElement, relation);
                    self.bookmarkDelegate = bmDelegate;
                    var colRampWindow = $("#colRampWindow").kendoWindow({
                        width: "auto", //310px
                        height: self.newWindowHeight,
                        title: self.windowTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: false,
                        resizable: false
                    }).data("kendoWindow");

                    var helpButton = colRampWindow.wrapper.find(".k-i-help");
                    helpButton.click(function() {
                        helpVM.openWindow(helpView);
                    });

                    self.schemeTypeSelector = $("#schemeTypeSelector").kendoDropDownList({
                        dataTextField: "Name",
                        dataValueField: "Name",
                        dataSource: conf.ColorSchemes,
                        change: self.schemeTypeSelected
                    }).data("kendoDropDownList");
                    self.schemeTypeSelector.value(initScheme);

                    tp.subscribe("SelectColorRamp", function() {
                        self.openWindow();
                    });
                    tp.subscribe("SetNumBreaks", self.setNumBreaks);
                    tp.subscribe("NewMapThemeSelected", self.setMapDefaults);
                    tp.subscribe("AdditionalMapInitialized", self.loadInitializedMap);

                    self.Current = {
                        Ramp: initRamp,
                        Breaks: initBreaks
                    };
                    self.showRamps();
                    self.broadcastCurrentRamp();
                    self.broadcastRampBreakOptions();
                }; // end init

                /**
                Method for opening the window.

                @method openWindow
                **/
                self.openWindow = function() {
                    var win = $("#colRampWindow").data("kendoWindow");
                    win.restore();
                    win.center();
                    win.open();
                };

                /**
                Method for closing the window.

                @method closeWindow
                **/
                self.closeWindow = function() {
                    var win = $("#colRampWindow").data("kendoWindow");
                    win.close();
                };

                /**
                Method to render the color ramps in the window based on the current selected scheme and number of breaks.

                @method showRamps
                **/
                self.showRamps = function() {
                    dc.empty("colRampsList");
                    var schemeElements = [];
                    var curr = self.schemeTypeSelector.dataItem();
                    for (var num in curr.ClassBreakSets) {
                        if (num == parseInt(num)) {
                            schemeElements = curr.ClassBreakSets[num];
                            if (num == self.Current.Breaks) {
                                break;
                            }
                        }
                    }
                    self.Current.Breaks = schemeElements.length;
                    for (var i = 0; i < curr.ColorRamps.length; i++) {
                        var schemeRamp = curr.ColorRamps[i].Colors; //color id
                        var rampColorsName = curr.ColorRamps[i].Name; //color Name
                        var rampColors = [];
                        for (var j = 0; j < schemeElements.length; j++) {
                            var currCol = schemeRamp[schemeElements[j]];
                            var kenCol = "rgb(" + currCol.join() + ")";
                            rampColors.push(kenCol);
                        }
                        var currColRampId = "colRamp" + i;

                        dc.place("<div \" style=\"padding-top: 5px\"><div id=\"" + currColRampId + "\" ></div></div>", "colRampsList", "last");
                        var tileSize = 280 / rampColors.length;
                        tileSize = Math.min(tileSize, 30);
                        self.colorRamp = $("#" + currColRampId).kendoColorPalette({
                            palette: rampColors,
                            tileSize: tileSize,
                            columns: rampColors.length,
                            value: null,
                            change: self.colorPickerClicked
                        }).data("kendoColorPalette");
                    }
                };

                self.loadInitializedMap = function(ramp, numBreaks) {
                    self.Current = {
                        Ramp: ramp,
                        Breaks: numBreaks
                    };
                    self.showRamps();
                    self.broadcastCurrentRamp();
                    self.broadcastRampBreakOptions();
                };

                /**
                Method to handle user selecting a color ramp.

                @method colorPickerClicked
                @param {event} e - click event data
                **/
                self.colorPickerClicked = function(e) {
                    var element = e.sender.element["0"].id;
                    var colorRamp = $("#" + element).data("kendoColorPalette");
                    colorRamp.value(null);
                    var rampIndex = parseInt(element.substring(7));
                    var curr = self.schemeTypeSelector.dataItem();
                    self.Current.Ramp = curr.ColorRamps[rampIndex].Name;
                    self.broadcastCurrentRamp();
                    self.broadcastRampBreakOptions();
                    self.closeWindow();
                };

                /**
                Method for handling selection the the schemes dropdown.

                @method schemeTypeSelected
                @param {event} e - select event data
                **/
                self.schemeTypeSelected = function(e) {
                    self.showRamps();
                };

                /**
                Method to set the number of breaks.

                @method setNumBreaks
                @param {number} newNumBreaks - the new number of class breaks
                **/
                self.setNumBreaks = function(newNumBreaks) {
                    self.Current.Breaks = newNumBreaks;
                    self.showRamps();
                    self.broadcastCurrentRamp();
                };

                /**
                Method to set default color ramp settings based on a newly selected map.

                @method setMapDefaults
                @param {thematicMap} newMap - an object containing configuration information for the selected map
                **/
                self.setMapDefaults = function(newMap) {
                    if (newMap && !mapModel.initializing) {
                        self.schemeTypeSelector.select(function(dataItem) {
                            return dataItem.Name == newMap.DefaultColorScheme;
                        });
                        self.schemeTypeSelected(null);
                        self.Current.Ramp = newMap.DefaultColorRamp;
                        self.broadcastCurrentRamp();
                        self.broadcastRampBreakOptions();
                    }
                };

                /**
                Method for distributing the list of options for number of breaks for the current color scheme.

                @method broadcastRampBreaksOptions
                **/
                self.broadcastRampBreakOptions = function() {
                    var rampBreakOptions = [];
                    var curr = self.schemeTypeSelector.dataItem();
                    for (var num in curr.ClassBreakSets) {
                        if (num == parseInt(num)) {
                            rampBreakOptions.push(num);
                        }
                    }
                    tp.publish("ClassBreakOptions", rampBreakOptions);
                };

                /**
                Method for broadcasting the currently selected color ramp.

                @method broadcastCurrentRamp
                **/
                self.broadcastCurrentRamp = function() {
                    var schemeElements = [];
                    var curr = self.schemeTypeSelector.dataItem();
                    for (var num in curr.ClassBreakSets) {
                        if (num == self.Current.Breaks) {
                            schemeElements = curr.ClassBreakSets[num];
                            break;
                        }
                    }
                    if (schemeElements.length < 1) {
                        return;
                    }

                    var schemeRamp = null;
                    for (var i = 0; i < curr.ColorRamps.length; i++) {
                        if (curr.ColorRamps[i].Name == self.Current.Ramp) {
                            schemeRamp = curr.ColorRamps[i].Colors;
                            break;
                        }
                    }
                    if (schemeRamp == null) {
                        return;
                    }

                    var rampColors = [];
                    for (var i = 0; i < schemeElements.length; i++) {
                        var currCol = schemeRamp[schemeElements[i]];
                        var kenCol = "rgb(" + currCol.join() + ")";
                        rampColors.push(kenCol);
                    }
                    tp.publish("NewColorRamp", rampColors, self.Current);
                };
            };

            return ColorRampVM;
        }
    );
}());