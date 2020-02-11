//This file should include logic on initialization of?????
'use strict';

define([
    '../config/appConfig',
    '../config/censusFieldsConfig',
    '../config/acsFieldsConfig',
    '../utilities',
    'magcore/utils/formatter',
    'magcore/utils/reports',
    'dojo/topic'
], function (
    config,
    censusFieldsConfig,
    acsFieldsConfig,
    utilities,
    formatter,
    reports,
    tp
) {

    let $reportArea = $('#reportArea');
    let $subHeaderTitle = $('#summaryReportHeader');
    let $dataSrcSelector = $('#dataSrcSelector');
    let $title6Area = $('#title6Area');

    function resetReportForm() {
        tp.publish('reset-reports');
        $('.reportFormArea').hide();
        $('#cardContainer').css('display', 'flex');
        $('.returnBtn').hide();
        $('#summaryReport').css('display', 'none');
        $dataSrcSelector.find('button:first').addClass('active');
        $dataSrcSelector.find('button:last').removeClass('active');
        $subHeaderTitle.hide();
        $title6Area.show();

        //Reset Buffer Area in custom
        $('#bufferOptions').hide();
        $('#useBuffer').prop('checked', false);

        let reportTypeDDL = $('#reportType').data('kendoDropDownList');

        if (reportTypeDDL) {
            reportTypeDDL.select(0);
        }

        let specificReportCbox = $('#specificReport').data('kendoComboBox');
        if (specificReportCbox) {
            specificReportCbox.select(0);
        }

        $('#specificReportDiv').hide();
        $('#comparisonContainer').hide();
        $('#compareCheckbox').prop('checked', false);
        $('#useZoom').prop('checked', true);
    }

    tp.subscribe('panel-shown', function (panel) {
        resetReportForm();
        // utilities.clearDrawnGraphics();
    });

    tp.subscribe('panel-hidden', function (panel) {
        resetReportForm();
        // utilities.clearDrawnGraphics();
    });

    $reportArea.on('click', '.returnBtn', function () {
        resetReportForm();
        utilities.clearDrawnGraphics();
    });

    $reportArea.on('click', '.card', function () {
        let val = $(this).data('report-form-id');
        $('.reportFormArea').hide();
        $('#cardContainer').hide();
        $(`#${val}`).show();
        $('.returnBtn').show();
        $('#summaryReport').css('display', 'none');
        $('#reportForm').show();
    });

    $reportArea.on('click', '.dataSrcToggle', function () {
        //This seems hacky..  It removes the active class from the other buttons
        //https://stackoverflow.com/questions/9262827/twitter-bootstrap-onclick-event-on-buttons-radio
        $(this)
            .addClass('active')
            .siblings()
            .removeClass('active');

        let dataSrc = $(this).data('val');
        let d = reports.getSelectedReport();

        if (dataSrc === 'acs') {
            //Show Title 6 data
            $title6Area.show();
        } else {
            //Hide Title 6 Data
            $title6Area.hide();
        }

        OpenReportWindow(d, dataSrc);
    });

    function resizeCharts() {
        $('.chartTarget').each(function (i, val) {
            $(val)
                .data('kendoChart')
                .resize();
        });
    }

    function GetNameArray(d) {
        //Always use ACS 2017 data to pull the name.  This field isn't always reliable in census 2010
        if (d.acsData && d.acsData.features && d.acsData.features.length > 0) {
            return d.acsData.features.map(f => f.attributes.NAME);
        }
    }

    function GetTitle(d) {
        let names = GetNameArray(d);
        if (names.length === 1) {
            let feature = d.acsData.features[0];
            if (feature.count > 0) {
                return `<span style="flex: 1;">Block Groups (${feature.count} Selected) Report</span>`;
            }
            return `<span style="flex: 1;">${names[0]} Report</span>`;
        } else {
            return `<span style="flex: 1;">${names[0]} & ${names[1]} Comparitive Report</span>`;
        }
    }

    function ExportReportToPDF(conf, ids) {
        let idStr = ids.join(',');
        let url = `${config.pdfService.defaultUrl}layer=${conf.layerName}&ids=${idStr}`;
        if (ids.length > 1) {
            if (conf.id === 'blockGroups') {
                localStorage.setItem('magDemoSelectedGEOIDs', idStr);
                url = `${config.pdfService.defaultUrl}layer=${conf.layerName}&ids=interactive`;
            } else {
                url = `${config.pdfService.compareUrl}layer=${conf.layerName}&ids=${idStr}`;
            }
        }

        window.open(url, '_blank');
    }

    function GetValsFromData(attr, fields) {
        let valsDef = {};
        let vals = [];
        let duplicates = {};

        for (let i = 0; i < fields.length; i++) {
            const fld = fields[i];
            let oldFieldName = fld.fieldName;
            let val = Number(attr[fld.fieldName]);
            if (valsDef[fld.fieldName]) {
                if (duplicates[fld.fieldName]) {
                    duplicates[fld.fieldName]++;
                } else {
                    duplicates[fld.fieldName] = 1;
                }
                fld.fieldName += duplicates[fld.fieldName];
            }
            valsDef[fld.fieldName] = {
                fieldCategory: fld.category,
                fieldGroup: fld.groupID,
                fieldRowSort: fld.rowID,
                fieldName: fld.fieldName,
                tableHeader: fld.tableHeader,
                fieldAlias: fld.fieldAlias,
                fieldType: fld.fieldType,
                fieldClass: fld.class,
                fieldValue: Number(val),
                fieldValueFormatted: formatter.numberWithCommas(Number(val).toFixed(1)).replace('.0', ''),
                chartCategory: fld.chartCategory,
                chartType: fld.chartType,
                chartName: fld.chartCategory,
                parentField: fld.parentField,
                timePeriod: fld.timePeriod,
                percentOfField: fld.percentOfField,
                derivedTargetField: fld.fieldName,
                indentLevel: fld.indentLevel,
                universeField: fld.universeField,
                derivedPercentOfField: fld.percentOfField,
                percentValue: 0,
                percentValueFormatted: '0',
                derivedDensityAreaField: fld.densityAreaField,
                densityValue: 0,
                densityValueFormatted: '0'
            };
            if (isNaN(val)) {
                valsDef[fld.fieldName].fieldValue = '-';
                valsDef[fld.fieldName].fieldValueFormatted = '-';
            }
            if (fld.percentOfField === '' || fld.percentOfField === undefined) {
                valsDef[fld.fieldName].percentValueFormatted = '-';
            } else if (fld.percentOfField !== undefined) {
                var percentOf = Number(attr[fld.percentOfField]);
                valsDef[fld.fieldName].percentValue = (val / percentOf) * 100;
                valsDef[fld.fieldName].percentValueFormatted = ((val / percentOf) * 100).MagFormat() + '%';
                if (
                    valsDef[fld.fieldName].percentValueFormatted.indexOf('.') > -1 &&
                    valsDef[fld.fieldName].percentValueFormatted.length === 3
                ) {
                    valsDef[fld.fieldName].percentValueFormatted = '0' + valsDef[fld.fieldName].percentValueFormatted;
                }
            }
            if (fld.densityAreaField !== '' || fld.densityAreaField !== undefined) {
                var densityArea = Number(attr[fld.densityAreaField]);
                valsDef[fld.fieldName].densityValue = val / densityArea;
                valsDef[fld.fieldName].densityValueFormatted = (val / densityArea).MagFormat();
            }

            if (valsDef[fld.fieldName].percentValueFormatted === 'NaN%') {
                valsDef[fld.fieldName].percentValueFormatted = '-';
            }
            vals.push(valsDef[fld.fieldName]);
            fld.fieldName = oldFieldName;
        }
        return vals;
    }

    function OpenReportWindow(data, type) {
        let fields = censusFieldsConfig;
        let res = data.censusData;

        if (type === 'acs') {
            fields = acsFieldsConfig;
            res = data.acsData;
        }
        
        let features = res.features;
        let attr = features.length ? features[0].attributes : {};
        let title = GetTitle(data);

        $reportArea.find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            resizeCharts();
        });

        let $header = $('#summaryReportHeader');
        $header.html(`
            ${title}
            <button title="Export report to PDF" data-placement="right" class="btn btn-sm btnExportPDF"><i class="far fa-file-pdf"></i></button>
        `);
        $header.css('display', 'Flex');

        let ids = features.map(feature => feature.attributes['GEOID']);

        if (features.length && features[0].ids) {
            ids = features[0].ids;
        }

        let $btnExportPDF = $header.find('.btnExportPDF');
        $btnExportPDF.tooltip();
        $btnExportPDF.off('click').on('click', function () {
            ExportReportToPDF(reports.getSelectedReport().options, ids);
        });

        let vals = GetValsFromData(attr, fields);
        if (features.length > 1) {
            let compareVals = GetValsFromData(features[1].attributes, fields);
            tp.publish('create-compare-grid', {
                data: vals,
                compareData: compareVals,
                target: 'gridTarget'
            });
            tp.publish('create-compare-charts', {
                data: vals,
                compareData: compareVals,
                target: 'chartsTarget',
                names: GetNameArray(data)
            });
        } else {
            tp.publish('create-grid', {
                data: vals,
                target: 'gridTarget'
            });
            tp.publish('create-charts', {
                data: vals,
                target: 'chartsTarget'
            });
        }

        if (res.blockGroups) {
            SetupBlockGroupGrid(res.blockGroups);
            $("#tabs-tab").find("li").first().find("a").tab("show");
        }

        if (attr['AFFECTED_DISABILITY_COUNT'] && attr['TOTAL_POP'] > 5000) {
            SetupTitle6Grid(attr);
            $('#title6Area').show();
        } else {
            $('#title6Grid').html('');
            $('#title6Area').hide();
        }

        $("div[panel-id='reports-view']").show();
        $('#summaryReport').show();
    }
    tp.subscribe('report-charts-created', refreshCharts);
    
    function refreshCharts() {
        let activeTab = $reportArea.find('.nav-link.active').text();

        if (activeTab === 'Charts') {
            $('.chartTarget').each(function (i, val) {
                $(val)
                    .data('kendoChart')
                    .resize();
            });
        }
    }

    function SetupBlockGroupGrid(blockGroups) {
        RemoveBlockGroupsGrid();
        $("#tabsContainer").css("flex", "2");
        $("#tabs-tab").append(`
            <li id="bg-tab" class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#bgTab" role="tab"
                    aria-controls="bgTab" aria-selected="false">Block Group Data</a>
            </li>
        `);

        $("#pills-tabContent").append(`
        <div class="tab-pane fade" id="bgTab" role="tabpanel" aria-labelledby="bgTab">
            <div id="bgGrid"></div>
        </div>`);

        const data = blockGroups.map((bg) => {
            return bg.attributes;
        });

        const template = `
            <div class="gridToolbar">
                <button class="btn btn-sm" id="exportBG">Export to Excel<i style="margin-left: 5px;" class="fa fa-table" aria-hidden="true"></i></button>
            </div>
        `;

        let fields = acsFieldsConfig;

        if (!data[0]["MEDIAN_HOUSEHOLD_INCOME"]) {
            fields = censusFieldsConfig;
        }

        let columns = fields.filter(({ universeField }) => universeField !== 2).map(({ fieldName, tableHeader, fieldType }) => {
            return {
                field: fieldName,
                title: tableHeader.includes("Minority") ? "Minority" : tableHeader,
                format: fieldType ? `{0:${fieldType[0].toLowerCase()}0}` : undefined,
                width: 150
            }
        })

        columns.unshift({
            field: "GEOID",
            title: "ID",
            width: 100
        });

        $("#bgGrid").kendoGrid({
            dataSource: data,
            sortable: true,
            columns,
            toolbar: [{
                template
            }],
            excel: {
                fileName: "Block Groups Report.xlsx"
            },
            // dataBound: GridRowHover
        });

        $("#bgGrid").data("kendo-grid").bind("excelExport", function (e) {
            console.log(e);

        });

        $("#bgTab").on("click", "#exportBG", (e) => {
            $("#bgGrid").data("kendo-grid").saveAsExcel();
        })
    }

    function GridRowHover(evt) {
        let ds = evt.sender.dataSource;
        let highlight;
        let $grid = $(evt.sender.element);

        $grid.find("table tbody tr").off('mouseenter').on("mouseenter", (e) => {
            const uid = $(e.currentTarget).data("uid");
            const { OBJECTID } = ds.getByUid(uid);

            if (highlight) {
                highlight.remove();
            }
            highlight = blockGroupLyrView.highlight(OBJECTID);
        });

        $grid.find("table tbody tr").off('mouseleave').on("mouseleave", (e) => {
            if (highlight) {
                highlight.remove();
            }
        })
    }

    function RemoveBlockGroupsGrid() {
        $("#tabsContainer").css("flex", "1");
        $("#bg-tab").remove();
        $("#bgTab").remove();
    }

    function SetupTitle6Grid(attr) {
        if ($('#title6Area').length === 0) {
            alert('jquery element not found?');
        }

        let $title6Grid = $('#title6Grid');
        let $title6Toggle = $('#title6Toggle');
        let $title6Tooltip = $('#title6Tooltip');

        $title6Tooltip.tooltip({
            title: `
            <div class="title6TooltipTitle">The data used in this analysis are generated using an enhanced method of interpolation based on the ACS 2015 block groups and using the 2010 Census block data.  In order to approximate the population, housing and workforce data for these custom areas, the following enhanced method was used:</div>
            <ul>
                <li class="legal">The counts are redistributed to a more detailed geography (Census Block Group data or Census Tracts), that better nests within the MPO boundaries.</li>
                <li class="legal">The counts are proportionally redistributed to blocks based on the Census 2010 counts for population, households or housing units.</li>
                <li class="legal">The blocks are then assigned to the MPO containing their center, and summed by the MPO, to obtain the final counts.This is a test</li>
            <ul>
            `,

            html: true

        });

        //Setup title 6 to be expanded on initial load.
        $title6Grid.show();
        $title6Toggle.addClass('k-i-collapse').removeClass('k-i-expand');

        $('#title6Area')
            .off('click')
            .on('click', function () {
                $title6Grid.toggle();
                $title6Toggle.toggleClass('k-i-expand k-i-collapse');
            });

        let fivePlus = attr['TOTAL_POP'] - attr['UNDER5'];
        let totalPop = attr['TOTAL_POP'];
        let totalBlockCount = attr['TOT_BLOCKGROUP_COUNT'];
        let age65Plus = attr['AGE65TO74'] + attr['AGE75TO84'] + attr['AGE85PLUS'];

        let dataSrc = [{
            Category: 'Population',
            Footnote: '',
            Total: totalPop,
            Percent: 'N/A',
            NumberOfBlocks: totalBlockCount,
            PercentOfBlocks: totalBlockCount / totalBlockCount,
            AffectedPopulation: 'N/A',
            PercentAffectedCaptured: 'N/A'
        },
        {
            Category: 'Minority',
            Footnote: 'a',
            Total: attr['MINORITY_POP'],
            Percent: attr['MINORITY_POP'] / totalPop,
            NumberOfBlocks: attr['AFFECTED_MINORITY_POP_COUNT'],
            PercentOfBlocks: attr['AFFECTED_MINORITY_POP_COUNT'] / totalBlockCount,
            AffectedPopulation: attr['AFFECTED_MINORITY_POP'],
            PercentAffectedCaptured: attr['AFFECTED_MINORITY_POP'] / attr['MINORITY_POP']
        },
        {
            Category: 'Age 65+',
            Footnote: '',
            Total: age65Plus,
            Percent: age65Plus / totalPop,
            NumberOfBlocks: attr['AFFECTED_AGE65PLUS_COUNT'],
            PercentOfBlocks: attr['AFFECTED_AGE65PLUS_COUNT'] / totalBlockCount,
            AffectedPopulation: attr['AFFECTED_AGE65PLUS'],
            PercentAffectedCaptured: attr['AFFECTED_AGE65PLUS'] / age65Plus
        },
        {
            Category: 'Below Poverty Level',
            Footnote: 'b',
            Total: attr['INCOME_BELOW_POVERTY'],
            Percent: attr['INCOME_BELOW_POVERTY'] / attr['POP_FOR_POVERTY'],
            NumberOfBlocks: attr['AFFECTED_INCOME_BELOW_POVERTY_COUNT'],
            PercentOfBlocks: attr['AFFECTED_INCOME_BELOW_POVERTY_COUNT'] / totalBlockCount,
            AffectedPopulation: attr['AFFECTED_INCOME_BELOW_POVERTY'],
            PercentAffectedCaptured: attr['AFFECTED_INCOME_BELOW_POVERTY'] / attr['INCOME_BELOW_POVERTY']
        },
        {
            Category: 'Population with a Disability',
            Footnote: 'c',
            Total: attr['DISABILITY'],
            Percent: attr['DISABILITY'] / attr['CIV_NONINST_POP'],
            NumberOfBlocks: attr['AFFECTED_DISABILITY_COUNT'],
            PercentOfBlocks: attr['AFFECTED_DISABILITY_COUNT'] / totalBlockCount,
            AffectedPopulation: attr['AFFECTED_DISABILITY'],
            PercentAffectedCaptured: attr['AFFECTED_DISABILITY'] / attr['DISABILITY']
        },
        {
            Category: 'Limited English Proficient Persons (LEP)',
            Footnote: 'd',
            Total: attr['LIMITED_ENG_PROF'],
            Percent: attr['LIMITED_ENG_PROF'] / fivePlus,
            NumberOfBlocks: attr['AFFECTED_LIMITED_ENG_PROF_COUNT'],
            PercentOfBlocks: attr['AFFECTED_LIMITED_ENG_PROF_COUNT'] / totalBlockCount,
            AffectedPopulation: attr['AFFECTED_LIMITED_ENG_PROF'],
            PercentAffectedCaptured: attr['AFFECTED_LIMITED_ENG_PROF'] / attr['LIMITED_ENG_PROF']
        }
        ];

        $title6Grid.kendoGrid({
            dataSource: {
                data: dataSrc
            },
            //height: 200,
            columns: [{
                title: 'Population',
                columns: [{
                    field: 'Category',
                    template: '#:Category#', //<sup>#:Footnote#</sup>
                    title: 'Category',
                    width: '85px'
                },
                {
                    field: 'Total',
                    title: 'Total',
                    width: '55px',
                    format: '{0:n0}'
                },
                {
                    field: 'Percent',
                    title: 'Percent',
                    format: '{0:p1}',
                    width: '60px'
                }
                ]
            },
            {
                title: 'Census Block Groups',
                width: '325px',
                columns: [{
                    field: 'NumberOfBlocks',
                    title: 'Number of block groups >= Area Pct',
                    width: '70px',
                    format: '{0:n0}'
                },
                {
                    field: 'PercentOfBlocks',
                    title: '% Block Groups',
                    format: '{0:p1}',
                    width: '65px'
                },
                {
                    field: 'AffectedPopulation',
                    title: 'Affected Population',
                    width: '68px',
                    format: '{0:n0}'
                },
                {
                    field: 'PercentAffectedCaptured',
                    title: '% of Affected Population Captured in Census Block Groups',
                    width: '85px',
                    format: '{0:p1}'
                }
                ]
            }
            ]
        });
    }

    tp.subscribe('open-report-window', OpenReportWindow);

});
