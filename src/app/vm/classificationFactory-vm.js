/**
 * Provides view-model implementation of the Custom Class Breaks window.
 *
 * @class ClassificationFactory
 */
(function () {

    "use strict";

    define([
            "dojo",
            "dojo/dom-construct",
            "dojo/topic",
            "app/helpers/magNumberFormatter",
            "dojo/text!app/views/classBreaksHelp-view.html",
            "app/vm/help-vm",
            "dojo/text!app/views/classBreaks-view.html"
        ],
        function (dj, dc, tp, magNum, helpView, helpVM, view) {

            var ClassificationFactoryVM = new function () {

                var self = this;

                self.winWidth = document.documentElement.clientWidth;
                self.newWindowWidth = self.winWidth;

                if (self.winWidth <= 668) {
                    self.newWindowWidth = "600px";
                } else if (self.winWidth <= 800) {
                    self.newWindowWidth = "600px";
                } else if (self.winWidth <= 1024) {
                    self.newWindowWidth = "800px";
                } else if (self.winWidth <= 1200) {
                    self.newWindowWidth = "1000px";
                } else {
                    self.newWindowWidth = "1000px";
                }

                /**
                Title for the module's window

                @property windowTitle
                @type String
                **/
                self.windowTitle = "Custom Breaks";

                /**
                Initilization function for the module window.
                Configures all UI components using Kendo libraries, and binds all events and data sources.

                @method init
                @param {string} relatedElement - name of the element to attach the module window to.
                @param {string} relation - relationship of the window to the relatedElement.
                **/
                self.init = function (relatedElement, relation, loadInitCustomBreaks) {
                    dc.place(view, relatedElement, relation);

                    var colRampWindow = $("#classDefWindow").kendoWindow({
                        width: self.newWindowWidth,
                        height: "135px",
                        title: self.windowTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: true,
                        visible: false,
                        resizable: false,
                        resize: self.RedrawSliders
                    }).data("kendoWindow");

                    var helpButton = colRampWindow.wrapper.find(".k-i-help");
                    helpButton.click(function () {
                        helpVM.openWindow(helpView);
                    });

                    $("#okButton").click(self.applyBreaks);

                    $("#classBreakSliders").kendoTooltip({
                        content: self.drawClassBreakTooltip,
                        filter: ".k-splitbar",
                        showOn: "click",
                        show: self.populateClassBreakTooltip,
                        autoHide: false
                    });
                    tp.subscribe("ClassificationMethodChanged", self.ClassificationMethodChanged);

                    self.loadInitialCustomBreaks = loadInitCustomBreaks;
                };

                /**
                Method for handling "OK" button click.
                Distributes new class breaks to all listeners.

                @method applyBreaks
                @param {event} e - click event data.
                **/
                self.applyBreaks = function () {
                    tp.publish("CustomBreaksUpdated", null);
                    self.closeWindow();
                };

                /**
                Method for opening the window.

                @method openWindow
                **/
                self.openWindow = function () {
                    var win = $("#classDefWindow").data("kendoWindow");
                    win.restore();
                    win.center();
                    win.open();
                    self.RedrawSliders();
                };

                /**
                Method for closing the window.

                @method closeWindow
                **/
                self.closeWindow = function () {
                    var win = $("#classDefWindow").data("kendoWindow");
                    win.close();
                };

                /**
                Method for handling a new set of renderer breaks set from outside this module.

                @method ClassificationMethodChanged
                @param {ClassBreaksRenderer} renderer - The new updated renderer
                **/
                self.ClassificationMethodChanged = function (renderer) {
                    self.Renderer = renderer;
                    if (!self.loadInitialCustomBreaks) {
                        self.openWindow();
                    } else {
                        self.applyBreaks();
                    }
                };

                self.drawClassBreakTooltip = function (e) {
                    var breakIdx = e.target[0].previousSibling.id.substring(6);
                    return "<input id=\"ttip" + breakIdx + "\" ></input>";
                };

                self.populateClassBreakTooltip = function () {
                    var me = this.content[0].firstChild.id;
                    var myIndex = parseInt(me.substring(4));
                    var numSettings = {
                        min: self.Renderer.infos[myIndex].minValue,
                        max: self.Renderer.infos[myIndex + 1].maxValue,
                        value: self.Renderer.infos[myIndex].maxValue,
                        change: self.spinnerChange
                    };
                    if (self.Renderer.asPercent) {
                        //numSettings.format = "p0";
                        numSettings.step = 0.01;
                    } else {
                        numSettings.format = "n0";
                    }
                    $("#" + me).kendoNumericTextBox(
                        numSettings
                    );
                };

                self.spinnerChange = function (e) {
                    var numIndex = parseInt(e.sender.element[0].id.substring(4));
                    var boxObject = $("#" + e.sender.element[0].id).data("kendoNumericTextBox");
                    var actualValue = boxObject.value();
                    self.Renderer.infos[numIndex].maxValue = actualValue;
                    self.Renderer.infos[numIndex + 1].minValue = actualValue;
                    self.Renderer.infos[numIndex].classMaxValue = actualValue;
                    self.RedrawSliders();
                };

                /**
                Method for redrawing the slider bars after some properties have changed.

                @method RedrawSliders
                **/
                self.RedrawSliders = function () {
                    self.redrawingSliders = true;
                    dc.empty("classBreakSliders");
                    var windowWidth = $("#classBreakSliders")[0].clientWidth - (self.Renderer.infos.length - 1) * 7;
                    self.ScaleFactor = windowWidth / self.Renderer.infos[self.Renderer.infos.length - 1].maxValue;
                    var panes = [];

                    for (var j = 0; j < self.Renderer.infos.length; j++) {
                        var paneSize = Math.round((self.Renderer.infos[j].maxValue - self.Renderer.infos[j].minValue) * self.ScaleFactor);
                        var currDiv = "cbPane" + j;
                        dc.place("<div id=\"" + currDiv + "\" style=\"text-align:center; line-height:58px; white-space: nowrap\" ></div>", "classBreakSliders", "last");
                        $("#" + currDiv).kendoTooltip({
                            content: function (e) {
                                return e.target[0].textLabel;
                            }
                        });
                        var newPane = {
                            size: paneSize + "px",
                            resizable: true,
                            idx: j,
                            scrollable: false
                        };
                        panes.push(newPane);
                    }
                    $("#classBreakSliders").kendoSplitter({
                        orientation: "horizontal",
                        panes: panes,
                        resize: self.updateRangeSliders
                    });
                    self.redrawingSliders = false;
                };

                /**
                Method to handle slider updates from user interaction with the custom controls.

                @method updateRangeSliders
                @param {event} e - event data
                **/
                self.updateRangeSliders = function (e) {
                    var panes = e.sender.options.panes;
                    if (!self.redrawingSliders) {
                        for (var i = 1; i < self.Renderer.infos.length; i++) {
                            var sizeUnitIndex = panes[i - 1].size.indexOf("px");
                            var paneSize = parseInt(panes[i - 1].size.substring(0, sizeUnitIndex));
                            self.Renderer.infos[i - 1].maxValue = parseFloat((paneSize / self.ScaleFactor + self.Renderer.infos[i - 1].minValue.valueOf()));
                            if (!self.Renderer.asPercent) {
                                self.Renderer.infos[i - 1].maxValue = Math.round(self.Renderer.infos[i - 1].maxValue);
                            }
                            self.Renderer.infos[i].minValue = self.Renderer.infos[i - 1].maxValue;
                            self.Renderer.infos[i - 1].classMaxValue = self.Renderer.infos[i - 1].maxValue;
                        }
                    }
                    for (var j = 0; j < self.Renderer.infos.length; j++) {
                        var start;
                        var end;
                        if (self.Renderer.asPercent) {
                            start = Math.round(self.Renderer.infos[j].minValue * 100);
                            end = Math.round(self.Renderer.infos[j].maxValue * 100) + "%";
                        } else {
                            start = magNum.formatValue(Math.round(self.Renderer.infos[j].minValue));
                            end = magNum.formatValue(Math.round(self.Renderer.infos[j].maxValue));
                        }
                        var panelName = "cbPane" + (j);
                        dc.empty(panelName);
                        dc.place("<strong>" + start + " - " + end + "</string>", panelName, "last");

                        var currPane = $("#" + panelName);
                        currPane[0].textLabel = start + " - " + end;

                        var currToolTip = $("#" + panelName).data("kendoTooltip");
                        currToolTip.refresh();

                        var sizeUnitIndex1 = panes[j].size.indexOf("px");
                        var paneSize1 = parseInt(panes[j].size.substring(0, sizeUnitIndex1));
                        if (currPane[0].children[0].offsetWidth > paneSize1) {
                            dc.empty(panelName);
                        }
                    }
                };
            };
            return ClassificationFactoryVM;
        }
    );
}());
