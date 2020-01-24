"use strict";
define([
    "../config/config",
    '../utilities',
    "../maps/maps-utils",
    'magcore/utils/reports',
    'magcore/utils/data',
    'magcore/utils/application',
    "dojo/topic"
], function (
    config,
    utilities,
    mapsutils,
    reportUtils,
    dataUtils,
    appUtils,
    tp
) {
    // references to dom elements
    var $reportForm,
        $reportType,
        $specificReportDiv,
        $specificReport,
        $standardBtnSubmit,
        $comparisonContainer,
        $compareCheckbox,
        $specificReportComparison;
    tp.subscribe("panel-loaded", initReports);
    tp.subscribe("openReport-by-geoids", openReportByGEOIDs);

    //Initializes the standard reports dropdowns, events, etc.
    function initReports(panel) {
        if (panel !== "reports-view") {
            return;
        }
        //set references to dom elements
        $reportForm = $("#reportForm");
        $reportType = $reportForm.find("#reportType");
        $specificReportDiv = $reportForm.find("#specificReportDiv");
        $specificReport = $specificReportDiv.find("#specificReport");
        $standardBtnSubmit = $reportForm.find("#standardBtnSubmit");
        $comparisonContainer = $reportForm.find("#comparisonContainer");
        $compareCheckbox = $reportForm.find("#compareCheckbox");
        $specificReportComparison = $comparisonContainer.find("#specificReportComparison");

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
            select: onReportTypeChanged
        });

        //Bind comparison checkbox change event
        $compareCheckbox.change(function () {
            $comparisonContainer.toggle();
        })

        $reportForm.submit(submit);
    }
    //Update the kendo comboboxes when the report type is changed
    async function onReportTypeChanged(e) {
        const dataItem = e.dataItem;

        if (dataItem.id === "default") {
            reset();
        } else if (dataItem.id === "state") {
            $standardBtnSubmit.show();
            $specificReportDiv.hide();
        } else {
            let displayField = "NAME";
            let optionalFields = dataItem.displayFields || [displayField];
            let outFields = ["OBJECTID", "GEOID"].concat(optionalFields.slice());

            let layer = mapsutils.map.findLayerById(dataItem.id);

            const q = {
                where: "1=1",
                outFields: outFields,
                returnGeometry: false,
                distinct: true,
                orderByFields: optionalFields
            }
            let dataSrc = await dataUtils.query(layer, q, { attributesOnly: true });
            let compareSrc = dataSrc.slice();
            compareSrc.shift();

            let template = getTemplate(dataItem);
            $specificReport.kendoComboBox({
                dataSource: dataSrc,
                value: dataSrc[0].GEOID,
                dataBound: highLightSelection,
                dataValueField: "GEOID",
                dataTextField: "NAME",
                select: onReportSelected,
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
    function onReportSelected(e) {
        if (e && e.dataItem) {
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
    }
    function openReportByGEOIDs(conf, geoIds) {
        appUtils.showLoading('.loading-container', 'flex');
        reportUtils.getReportData(config.mainUrl, conf, geoIds).then(function (data) {
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
            reset();
        }).finally(() => appUtils.hideLoading('.loading-container'));
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
    function submit(e) {
        e && e.preventDefault();
        $("#summaryReport").hide();

        let kendoItem = $reportType.data('kendoDropDownList').dataItem();
        let conf = config.layerDef[kendoItem.id];

        if (conf.id === "state") {
            openReportByGEOIDs(conf, ["04"]);
        } else {
            let specificReport = $specificReport.data('kendoComboBox').dataItem();
            let GEOIDs = [specificReport["GEOID"]];

            if ($compareCheckbox.is(":checked")) {
                let specificReportComparison = $specificReportComparison.data('kendoComboBox').dataItem();
                let comparisonGEOID = specificReportComparison["GEOID"];
                GEOIDs.push(comparisonGEOID);
            }

            openReportByGEOIDs(conf, GEOIDs);
        }
    }
    function reset() {
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
