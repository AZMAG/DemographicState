<<<<<<< HEAD
'use strict';
require(['dojo/topic'], function(tp) {
=======
"use strict";
require(["dojo/topic"], function (tp) {
>>>>>>> Jack-Develop-Branch
    // tp.subscribe("layers-added", initReports);
    tp.subscribe("panel-loaded", function (panel) {
        if (panel === "reports") {
            initReports();

            function initReports() {
                var html = '<option value="default">Select a Type</option>';
                for (let i = 0; i < app.config.layers.length; i++) {
                    const layer = app.config.layers[i];
                    if (layer.showReport) {
                        html += `<option data-id="${i}">${layer.title}</option>`;
                    }
                }
                $("#reportType").html(html);
                $("#reportType option").each(function (i, el) {
                    let id = $(el).data("id");
                    $(el).data("conf", app.config.layers[id]);
                });
            }

            function hideReportLayers() {
                app.config.layers.forEach(function (conf) {
                    const layer = app.map.findLayerById(conf.id);
                    if (layer && conf.showReport) {
                        layer.visible = false;
                    }
                });
            }

            function updateReportDDL(layer, conf) {
                let displayField = "NAME";
                let optionalFields = conf.displayFields || [displayField];
                let outFields = ["OBJECTID", "GEOID"].concat(optionalFields);

                const q = {
                    where: "1=1",
                    outFields: outFields,
                    returnGeometry: false,
                    distinct: true,
                    orderByFields: optionalFields
                };

                layer.queryFeatures(q).then(function (res) {
                    $("#specificReport").html("");
                    $("#specificReportComparison").html("");

                    for (let i = 0; i < res.features.length; i++) {
                        const feature = res.features[i];
                        const attr = feature.attributes;

                        let displayTemplate = "";
                        optionalFields.forEach(function (field) {
                            displayTemplate += attr[field] + " - ";
                        });

                        $("#specificReport").append(
                            `<option data-geo-id="${attr["GEOID"]}" data-object-id="${
                                attr["OBJECTID"]
                            }">${displayTemplate.slice(0, -3)}</option>`
                        );
                        $("#specificReportComparison").append(
                            `<option data-geo-id="${attr["GEOID"]}" data-object-id="${
                                attr["OBJECTID"]
                            }">${displayTemplate.slice(0, -3)}</option>`
                        );
                    }
                    $("#specificReport").combobox();
                });
            }

            let $specificReportComparison = $("#specificReportComparison");
            let $specificReportComparisonLabel = $("#specificReportComparisonLabel");
            let $standardComparison = $("#standardComparison");
            let $specificReportComparisonSmall = $("#specificReportComparisonSmall");

            $standardComparison.change(function () {
                if (this.checked) {
                    $specificReportComparison.show();
                    $specificReportComparisonLabel.show();
                    $specificReportComparisonSmall.show();
                } else {
                    $specificReportComparison.hide();
                    $specificReportComparisonLabel.hide();
                    $specificReportComparisonSmall.hide();
                }
            });

            $("#reportType").change(function () {
                let $selectedItem = $(this).find(":selected");
                let text = $selectedItem.text();
                if (text !== "Select a Type") {
                    let conf = $selectedItem.data("conf");
                    let layer = app.map.findLayerById(conf.id);
                    updateReportDDL(layer, conf);
                    $("#specificReportDiv").show();
                    $("#standardBtnSubmit").show();
                } else {
                    ResetForm();
                }
            });

            $("#reportForm").submit(function (e) {
                e.preventDefault();
                $("#summaryReport").hide();
                let conf = $("#reportType")
                    .find(":selected")
                    .data("conf");
                let GEOID = $("#specificReport")
                    .find(":selected")
                    .data("geo-id");

                let GEOIDs = [GEOID];

                if ($standardComparison.is(":checked")) {
                    let comparisonGEOID = $specificReportComparison
                        .find(":selected")
                        .data("geo-id");
                    GEOIDs.push(comparisonGEOID);
                }

                OpenReportByGEOIDs(conf, GEOIDs);
            });
        }
    });

    function ResetForm() {
        $("#specificReportDiv").hide();
        $("#standardBtnSubmit").hide();
        $("#reportType").val("default");
    }
    tp.subscribe("openReport-by-geoids", OpenReportByGEOIDs);

    function OpenReportByGEOIDs(conf, GEOIDs) {
        app.GetData(conf, GEOIDs).then(function (data) {
            app.AddHighlightGraphics(data.acsData.features, true);

<<<<<<< HEAD
                    ResetForm();
                    $('#reportLoader').hide();
                    tp.publish('toggle-panel', 'reports');
                });
=======
            app.view.goTo(data.acsData.features[0].geometry.extent.expand(1.5));

            if (data) {
                tp.publish("open-report-window", data, "acs");
            } else {
                console.error("No matching features for: " + q);
>>>>>>> Jack-Develop-Branch
            }
            $("#reportForm").hide();
            ResetForm();
            $("#cardContainer").hide();
            $(".returnBtn").show();
        });
    }
});
