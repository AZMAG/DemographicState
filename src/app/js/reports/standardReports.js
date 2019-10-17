"use strict";
define([
        "mag/config/config",
        'mag/utilities',
        "mag/maps/maps-utils",
        "dojo/topic"
    ],
    function (
        config,
        utilities,
        mapsutils,
        tp
    ) {
    tp.subscribe("panel-loaded", function (panel) {

        if (panel === "reports-view") {
            initReports();
        }

        //Initializes the standard reports dropdowns, events, etc.
        async function initReports() {
            //Get references to dom elements
            let $reportForm = $("#reportForm");
            let $reportType = $reportForm.find("#reportType");
            let $specificReportDiv = $reportForm.find("#specificReportDiv");
            let $specificReport = $specificReportDiv.find("#specificReport");
            let $standardBtnSubmit = $reportForm.find("#standardBtnSubmit");
            let $comparisonContainer = $reportForm.find("#comparisonContainer");
            let $compareCheckbox = $reportForm.find("#compareCheckbox");
            let $specificReportComparison = $comparisonContainer.find("#specificReportComparison");

            //Only include layers with showReport
            let filteredData = config.layers.filter(layer => layer.showReport);

            filteredData.unshift({
                title: "Select a Type of Report",
                id: "default"
            });

            //Setup report type dropdown
            $reportType.kendoDropDownList({
                dataTextField: "title",
                dataValueField: "id",
                dataSource: filteredData,
                select: updateSpecificReport
            })

            //Update the kendo comboboxes when the report type is changed
            async function updateSpecificReport(e) {
                const dataItem = e.dataItem;

                if (dataItem.id === "default") {
                    resetForm();
                } else if (dataItem.id === "state") {
                    $standardBtnSubmit.show();
                    $specificReportDiv.hide();
                } else {
                    let dataSrc = await getSpecificData(dataItem);
                    let compareSrc = dataSrc.slice();
                    compareSrc.shift();

                    let template = getTemplate(dataItem);
                    $specificReport.kendoComboBox({
                        dataSource: dataSrc,
                        value: dataSrc[0].GEOID,
                        dataBound: highLightSelection,
                        dataValueField: "GEOID",
                        dataTextField: "NAME",
                        select: function (e) {
                            if (e.dataItem) {
                                compareSrc = dataSrc.slice().filter((row) => {
                                    if (row.GEOID !== e.dataItem.GEOID) {
                                        return row;
                                    }
                                })
                                let kCompareComboBox = $specificReportComparison.data('kendoComboBox');
                                if (kCompareComboBox) {
                                    kCompareComboBox.setDataSource(compareSrc);
                                    //If compare cbox doesn't have an item selected select the first one.
                                    if (kCompareComboBox.selectedIndex === -1) {
                                        kCompareComboBox.value(compareSrc[0].GEOID)
                                    }
                                }
                            }
                        },
                        template: template,
                        filter: "contains",
                        index: 3
                    })

                    $specificReportComparison.kendoComboBox({
                        dataSource: compareSrc,
                        value: compareSrc[0].GEOID,
                        dataBound: highLightSelection,
                        dataValueField: "GEOID",
                        dataTextField: "NAME",
                        template: template,
                        filter: "contains",
                        index: 3
                    })
                    $specificReportDiv.show();
                    $standardBtnSubmit.show();
                }
            }

            //Bind comparison checkbox change event
            $compareCheckbox.change(function () {
                $comparisonContainer.toggle();
            })

            $reportForm.submit(function (e) {
                e.preventDefault();
                $("#summaryReport").hide();

                let kendoItem = $reportType.data('kendoDropDownList').dataItem();
                let conf = config.layerDef[kendoItem.id];

                if (conf.id === "state") {
                    OpenReportByGEOIDs(conf, ["04"]);
                } else {
                    let specificReport = $specificReport.data('kendoComboBox').dataItem();
                    let GEOIDs = [specificReport["GEOID"]];

                    if ($compareCheckbox.is(":checked")) {
                        let specificReportComparison = $specificReportComparison.data('kendoComboBox').dataItem();
                        let comparisonGEOID = specificReportComparison["GEOID"];
                        GEOIDs.push(comparisonGEOID);
                    }

                    OpenReportByGEOIDs(conf, GEOIDs);
                }
            });
        }

        async function getSpecificData(conf) {
            let displayField = "NAME";
            let optionalFields = conf.displayFields || [displayField];
            let outFields = ["OBJECTID", "GEOID"].concat(optionalFields.slice());

            let layer = mapsutilsi.map.findLayerById(conf.id);

            const q = {
                where: "1=1",
                outFields: outFields,
                returnGeometry: false,
                distinct: true,
                orderByFields: optionalFields
            };

            let res = await layer.queryFeatures(q);
            let rtnFeatures = [];
            res.features.forEach((feature) => {
                rtnFeatures.push(feature.attributes);
            })
            return rtnFeatures;
        }
    });

    tp.subscribe("openReport-by-geoids", OpenReportByGEOIDs);

    function OpenReportByGEOIDs(conf, GEOIDs) {
        app.GetData(conf, GEOIDs).then(function (data) {
            utilities.AddHighlightGraphics(data.acsData.features, true);
            mapsutils.view.goTo(data.acsData.features[0].geometry.extent.expand(1.5));
            if (data) {
                tp.publish("open-report-window", data, "acs");
            } else {
                console.error("No matching features for: " + q);
            }
            $("#reportForm").hide();
            $("#cardContainer").hide();
            $(".returnBtn").show();
            resetForm();
        });
    }

    //Helper Methods for kendo comboboxes
    function getTemplate(conf) {
        if (conf.displayFields) {
            let template = '';
            conf.displayFields.forEach(fld => {
                template += `#: ${fld} # - `;
            });
            return template.slice(0, -3);
        }
    }

    function resetForm() {
        $("#specificReportDiv").hide();
        $("#standardBtnSubmit").hide();
    }

    // https://docs.telerik.com/kendo-ui/knowledge-base/combobox-highlight-matched-text
    function highLightSelection(e) {
        const combo = e.sender;
        const items = combo.items();
        const inputText = $(e.sender.element).prev().find('.k-input').val().toLowerCase();
        if (inputText !== "" && e.sender.selectedIndex === -1) {
            for (let i = 0; i < items.length; i += 1) {
                const item = $(items[i]);
                const itemHtml = item.html();
                const start = itemHtml.toLowerCase().indexOf(inputText);
                const end = start + inputText.length;
                item.html(`${itemHtml.slice(0, start)}<span class="cBoxHighlight">${itemHtml.slice(start, end)}</span>${itemHtml.slice(end)}`)
            }
        }
    }
});
