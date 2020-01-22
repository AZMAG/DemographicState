"use strict";
define([
        "../config/config",
        "../maps/maps-utils",
        "dojo/topic",
        "esri/widgets/Print/PrintViewModel"
    ], 
    (
        config,
        mapsutils,
        tp,
        PrintVM
    ) => {
    let $printWidget = $("#printWidget");
    let $printWidgetModal = $("#printWidgetModal");

    tp.subscribe("widget-basemapToggle-loaded", function () {
        let $printForm = $("#printForm");
        let $formInputs = $("#printForm :input");
        let $printMapTitle = $("#printMapTitle");
        let $printMapNotes = $("#printMapNotes");
        let $printMapLayout = $("#printMapLayout");
        let $printMapFormat = $("#printMapFormat");
        let $printLoader = $("#printLoader");
        let $printResult = $("#printResult");

        let printVM = new PrintVM({
            printServiceUrl: config.printUrl,
            updateDelay: 300,
            view: mapsutils.view
        });
        // $printWidget.tooltip('show');
        mapsutils.view.ui.add($printWidget[0], "bottom-right");

        $printWidget.click(function () {
            // SetupPrintForm();
            alert("The print functionality for this tool is currently out of service.  Sorry for the inconvenience.")
        })

        function print(printObj) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: `${config.printUrl}/submitJob`,
                    data: printObj,
                    success: function (res) {
                        let jobId = JSON.parse(res).jobId;
                        let checkCompleteUrl = `${config.printUrl}/jobs/${jobId}`;
                        let outputUrl = `${checkCompleteUrl}/results/Output_File?f=json&returnType=data`;

                        function CheckComplete() {
                            setTimeout(function () {
                                $.getJSON(`${checkCompleteUrl}?f=pjson`, function (status) {
                                    if (status.jobStatus === "esriJobSucceeded") {
                                        $.getJSON(outputUrl, function (data) {
                                            resolve(data);
                                        })
                                    } else if (status.jobStatus === "esriJobExecuting") {
                                        CheckComplete();
                                    } else if (status.jobStatus !== "esriJobSubmitted") {
                                        reject(status);
                                    } else {
                                        CheckComplete();
                                    }
                                })
                            }, 300);
                        }
                        CheckComplete();
                    }
                });
            })
        }


        $printForm.submit(async function (e) {
            e.preventDefault();
            let q = GetFormData();
            q.view = mapsutils.view;

            //Disable form
            $formInputs.prop("disabled", true);
            $printLoader.show();
            $printResult.hide();

            let printParams = await printVM._printTask._getGpPrintParams(q);

            let Web_Map_as_JSON = JSON.parse(printParams.Web_Map_as_JSON);

            //Set custom layout params
            Web_Map_as_JSON.layoutOptions = q.layoutOptions;

            //Filter out the graphics layer from showing in print
            Web_Map_as_JSON.operationalLayers = Web_Map_as_JSON.operationalLayers.filter((layer) => {
                return layer.id !== "gfxLayer";
            })


            q.Web_Map_as_JSON = JSON.stringify(Web_Map_as_JSON);
            q.f = "json";

            delete q.view;

            // let res = await printVM.print(q);
            let res = await print(q);
            let url = res.value.url;

            //Try to open the link in a new window
            window.open(url, '_blank');

            $printResult.attr("href", url);
            $printResult.show();

            //Re-enable form
            $formInputs.prop("disabled", false);
            $printLoader.hide();
        });



        function GetFormData() {
            let currentMap = mapsutils.GetActiveMapData();
            let legendLayers = [];
            let visibleLayers = mapsutils.map.layers.filter(layer => layer.visible);

            if (visibleLayers.length > 2) {
                legendLayers = [{
                    "id": "blockGroups",
                    "subLayerIds": [0]
                }]
            } else {
                visibleLayers.forEach(function (layer) {
                    if (layer.visible && layer.type !== "tile" && layer.type !== "graphics") {
                        if (layer.sublayers && layer.sublayers.length > 0) {
                            let subLayerIds = [];
                            layer.sublayers.items.forEach((subLayer) => {
                                if (subLayer.visible) {
                                    subLayerIds.push(subLayer.id);
                                }
                            })
                            legendLayers.push({
                                id: layer.id,
                                subLayerIds: subLayerIds
                            });

                        } else {
                            legendLayers.push({
                                id: layer.id
                            });
                        }
                    }
                })
            }

            let data = {
                layoutOptions: {
                    titleText: $printMapTitle.val(),
                    authorText: "Made by:  MAG GIS Group",
                    copyrightText: "<copyright info here>",
                    customTextElements: [{
                        txtLegendHeader: `${currentMap.category} - ${currentMap.Name}\n<_BOL>${config.LegendSource}</_BOL>`
                    }, {
                        txtComments: $printMapNotes.val()
                    }],
                    scaleBarOptions: {
                        metricUnit: "esriKilometers",
                        metricLabel: "km",
                        nonMetricUnit: "esriMiles",
                        nonMetricLabel: "mi"
                    },
                    legendOptions: {
                        operationalLayers: legendLayers
                    }
                },
                exportOptions: {
                    dpi: 96
                },
                Layout_Template: $printMapLayout.find(":selected").val(),
                Format: $printMapFormat.find(":selected").val()
            }
            // used to change the icon on the map link
            if (data.Format === "PDF") {
                $("#print-icon").attr("class", "fas fa-file-pdf");
            } else {
                $("#print-icon").attr("class", "fas fa-file-image");
            }

            return data;
        }

        function setupPrintTitle() {
            let currentMap = mapsutils.GetActiveMapData();
            $printMapTitle.val(`${currentMap.category} - ${currentMap.Name}`);
        }

        let printInit = false;

        async function InitializePrintForm() {
            setupPrintTitle();
            if (!printInit) {
                $.getJSON(config.printUrl + "/?f=pjson", function (data, textStatus, jqXHR) {
                    //Setup Layout List
                    let printMapLayoutOptions = data.parameters[3].choiceList.map(choice => {
                        if (!choice.includes('MAP_ONLY')) {
                            return `<option value="${choice}">${choice}</option>`;
                        }
                    });
                    $printMapLayout.html(printMapLayoutOptions);
                    printInit = true;
                    return true;
                });
            }
        }

        async function SetupPrintForm() {
            $printForm[0].reset();
            await InitializePrintForm();
            $printWidgetModal.modal("show");
        }

        tp.publish("widget-print-loaded");
    });
});
