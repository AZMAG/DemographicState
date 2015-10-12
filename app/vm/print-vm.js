/**
 * Print div used to print maps
 *
 * @class print-vm
 */
(function() {

    "use strict";

    define([
            "dojo",
            "dojo/dom-construct",
            "dojo/topic",
            "esri/tasks/PrintTask",
            "esri/tasks/PrintTemplate",
            "esri/tasks/PrintParameters",
            "esri/request",
            "esri/config",
            "dojo/_base/array",
            "dojo/text!app/views/printHelp-view.html",
            "app/vm/help-vm",
            "dojo/text!app/views/print-view.html",
            "app/vm/legend-vm",
            "app/models/map-model",
<<<<<<< HEAD
            "app/vm/cbr-vm"
        ],
        function(dj, dc, tp, PrintTask, PrintTemplate, PrintParameters, esriRequest, esriConfig, arrayUtils, helpView, helpVM, view, legendVM, mapModel, cbrVm) {
=======
            "app/vm/cbr-vm",
            "esri/tasks/LegendLayer"
        ],
        function(dj, dc, tp, PrintTask, PrintTemplate, PrintParameters, esriRequest, esriConfig, arrayUtils, helpView, helpVM, view, legendVM, mapModel, cbrVm, LegendLayer) {
>>>>>>> feature/newFeatures


            var printVM = new function() {

                var self = this;

                self.windowTitle = "Print Map";
                esriRequest.setRequestPreCallback(myCallbackFunction);
                self.printUrl = appConfig.exportWebMapUrl;

                // used for reporting export progress
                self.progressInterval = null;
                self.progressDots = null;
                self.progressText = null;

                self.init = function(relatedElement, relation, map) {
<<<<<<< HEAD
                    //dc.place(view, "map", "after");
=======
>>>>>>> feature/newFeatures
                    dc.place(view, "mapContainer", "after");

                    tp.subscribe("printStateO", function() {
                        self.openWindow();
                    });
                    tp.subscribe("printStateC", function() {
                        self.closeWindow();
                    });

                    var printWindow = $("#printWindow").kendoWindow({
                        width: "400px",
                        height: "auto",
                        title: self.windowTitle,
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: false,
                        resizable: false
                    }).data("kendoWindow");

                    var helpButton = printWindow.wrapper.find(".k-i-help");
                    helpButton.click(function() {
                        helpVM.openWindow(helpView);
                    });

                    // wire the print execution to the button
                    $("#executeMapPrint").click(function() {
                        self.executePrintTask();
                    });

                    // for the layout collection
                    $("#scottMapLayouts").kendoDropDownList().data("kendoDropDownList");

                    var printInfo = esriRequest({
                        "url": self.printUrl,
                        "content": {
                            "f": "json"
                        }
                    });
                    printInfo.then(self.handlePrintInfo, self.handleError);

                }; //end init
<<<<<<< HEAD

                /**
                Method for opening the window.

                @method openWindow
                **/
                self.openWindow = function() {
                    // set the title to the currently selected map
                    var thematicMap = cbrVm.toc.dataItem(cbrVm.toc.select());
                    $("#mapTitle").val(thematicMap.Name);

                    // show the window
                    var win = $("#printWindow").data("kendoWindow");
                    win.restore();
                    win.center();
                    win.open();
                };

                self.closeWindow = function() {
                    var win = $("#printWindow").data("kendoWindow");
                    win.close();
                };
=======
>>>>>>> feature/newFeatures

                // get print templates from the export web map task
                self.handlePrintInfo = function(resp) {
                    var layoutTemplate, templateNames, mapOnlyIndex, templates;

                    // get the list templates, remove the MAP_ONLY template, and populate the drop-down
                    layoutTemplate = arrayUtils.filter(resp.parameters, function(param, idx) {
                        return param.name === "Layout_Template";
                    });

                    if (layoutTemplate.length === 0) {
                        console.log("print service parameters name for templates must be \"Layout_Template\"");
                        return;
                    }
                    templateNames = layoutTemplate[0].choiceList;
                    mapOnlyIndex = arrayUtils.indexOf(templateNames, "MAP_ONLY");
                    templateNames.splice(mapOnlyIndex, 1);
                    $("#scottMapLayouts").kendoDropDownList({
                        dataSource: templateNames
                    }).data("kendoDropDownList");
                };

                // i guess this is a generic error handler?
                self.handleError = function(err) {
                    // console.log("Something broke: ", err);
                    // var hi = 1;
                };
<<<<<<< HEAD

                // handles the print execution
                self.executePrintTask = function() {
                    // fetch values from the UI
                    var titleText = $("#mapTitle").val();
                    var notesText = $("#mapNotes").val();
                    var selectedLayout = $("#scottMapLayouts").val();

                    // get info about the current thematic layer
                    var thematicMap = cbrVm.toc.dataItem(cbrVm.toc.select());
                    //alert(thematicMap.Name);
                    //alert(cbrVm.Hello);
                    //var dataItem = self.toc.dataItem(self.toc.select());

                    // set up the print template
                    var printTemplate = new PrintTemplate();
                    printTemplate.layout = selectedLayout;
                    printTemplate.format = "PDF";

                    // these refer to named text elements in the mxd, sb
                    var customLayoutElements = [{
                        "txtLegendHeader": thematicMap.Name + " \n<_BOL> " + thematicMap.Source + "</_BOL>"
                    }, {
                        "txtComments": notesText
                    }];



                    printTemplate.layoutOptions = {
                        "titleText": titleText,
                        "authorText": "Made by:  MAG GIS Group",
                        "copyrightText": "<copyright info here>",
                        "scalebarUnit": "Miles",
                        "customTextElements": customLayoutElements
                    };
                    printTemplate.exportOptions = {
                        dpi: 96
                    };

                    self.progressInterval = setInterval(self.showProgressWithDots, 300);
                    self.progressDots = 0;
                    self.progressText = "Printing";

                    // set up and execute the print task
                    var printPara = new PrintParameters();
                    printPara.map = mapModel.mapInstance;
                    printPara.template = printTemplate;

                    var printTask = new PrintTask(self.printUrl, {
                        async: true
                    });
                    printTask.execute(printPara, self.printComplete, self.printFailed);

                    // hide the execute button and do some kind of animation to indicate progress
                    //$("#executeMapPrint").hide();
                    $("#executeMapPrint").hide();

                    //$("#mapPrintProgress").html("<br><br><p>Printing...</p>");
                };

                // handler when print task executes successively
                self.printComplete = function(result) {
                    clearInterval(self.progressInterval);
                    $("#mapPrintProgress").html("<br><a class='link' target='_blank' href='" + result.url + "'>Map export complete, click here to view</a>");
                    $("#executeMapPrint").show();

                };

                // handler when print task returns an error
                self.printFailed = function(e) {
                    clearInterval(self.progressInterval);
                    $("#executeMapPrint").show();
                    $("#mapPrintProgress").html("<br><p>problem with print!, code:" + e.code + " message: " + e.message + "</p>");
                };

                // used to indicate progress
                self.showProgressWithDots = function() {

                    if (self.progressDots <= 4) {
                        self.progressText += ".";
                        self.progressDots++;
                    } else {
                        self.progressText = "Printing";
                        self.progressDots = 0;
                    }
                    $("#mapPrintProgress").html("<br><p>" + self.progressText + "</p>");
                };


            }; //end printVM

            return printVM;

        } //end function
    );
=======

                // handles the print execution
                self.executePrintTask = function() {
                    // fetch values from the UI
                    var titleText = $("#mapTitle").val();
                    var notesText = $("#mapNotes").val();
                    var selectedLayout = $("#scottMapLayouts").val();

                    // get info about the current thematic layer
                    var thematicMap = cbrVm.toc.dataItem(cbrVm.toc.select());

                    // set up the print template
                    var printTemplate = new PrintTemplate();
                    printTemplate.layout = selectedLayout;
                    printTemplate.format = "PDF";

                    // these refer to named text elements in the mxd, sb
                    var customLayoutElements = [{
                        "txtLegendHeader": thematicMap.Name + " \n<_BOL> " + thematicMap.Source + "</_BOL>"
                    }, {
                        "txtComments": notesText
                    }];

                    var legendLayer = new LegendLayer();
                    legendLayer.layerId = "Census2010byBlockGroup";
                    legendLayer.subLayerIds = [0];

                    printTemplate.layoutOptions = {
                        "titleText": titleText,
                        "authorText": "Made by:  MAG GIS Group",
                        "copyrightText": "<copyright info here>",
                        "scalebarUnit": "Miles",
                        "legendLayers": [legendLayer],
                        "customTextElements": customLayoutElements
                    };
                    printTemplate.exportOptions = {
                        dpi: 96
                    };

                    self.progressInterval = setInterval(self.showProgressWithDots, 300);
                    self.progressDots = 0;
                    self.progressText = "Printing";

                    // set up and execute the print task
                    var printPara = new PrintParameters();
                    printPara.map = mapModel.mapInstance;
                    printPara.template = printTemplate;

                    var printTask = new PrintTask(self.printUrl, {
                        async: true
                    });
                    printTask.execute(printPara, self.printComplete, self.printFailed);

                    // hide the execute button and do some kind of animation to indicate progress
                    //$("#executeMapPrint").hide();
                    $("#executeMapPrint").hide();

                    //$("#mapPrintProgress").html("<br><br><p>Printing...</p>");
                };



                // handler when print task executes successively
                self.printComplete = function(result) {
                    clearInterval(self.progressInterval);
                    $("#mapPrintProgress").html("<br><a class='link' target='_blank' href='" + result.url + "'>Map export complete, click here to view</a>");
                    $("#executeMapPrint").show();

                };

                // handler when print task returns an error
                self.printFailed = function(e) {
                    clearInterval(self.progressInterval);
                    $("#executeMapPrint").show();
                    $("#mapPrintProgress").html("<br><p>problem with print!, code:" + e.code + " message: " + e.message + "</p>");
                };

                /**
                Method for opening the window.

                @method openWindow
                **/
                self.openWindow = function() {
                    // set the title to the currently selected map
                    var thematicMap = cbrVm.toc.dataItem(cbrVm.toc.select());
                    $("#mapTitle").val(thematicMap.Name);

                    if ($('#map2').is(":visible")) {
                        $("#printLabel").show();
                    }
                    else {
                        $("#printLabel").hide();
                    }

                    // show the window
                    var win = $("#printWindow").data("kendoWindow");
                    win.restore();
                    win.center();
                    win.open();
                };

                self.closeWindow = function() {
                    var win = $("#printWindow").data("kendoWindow");
                    win.close();
                };

                // used to indicate progress
                self.showProgressWithDots = function() {

                    if (self.progressDots <= 4) {
                        self.progressText += ".";
                        self.progressDots++;
                    } else {
                        self.progressText = "Printing";
                        self.progressDots = 0;
                    }
                    $("#mapPrintProgress").html("<br><p>" + self.progressText + "</p>");
                };

            }; //end printVM

            return printVM;

        } //end function


    );

            function myCallbackFunction(ioArgs) {

                if (ioArgs.url.indexOf("submit") > -1) {

                    //Store webmapAsJson request in the variable                   
                    var jsontxt = ioArgs.content.Web_Map_as_JSON;

                    //Create a Json object          
                    var tempObj = JSON.parse(jsontxt);

                    tempObj.operationalLayers[1].layers[0].name = "";

                    //Convert Json object to string
                    var modjson = JSON.stringify(tempObj);

                    //assign the string back to WebMapAsJson
                    ioArgs.content.Web_Map_as_JSON = modjson;

                    // don't forget to return ioArgs.
                    return ioArgs;

                    //console.log(tempObj.operationalLayers[1].layers[0].name);
                }
                else {
                    return ioArgs;
                }
            }
>>>>>>> feature/newFeatures
}());