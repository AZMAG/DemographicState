//This file should include logic on initialization of?????

require([
        "dojo/topic",
        "esri/tasks/QueryTask"
    ],
    function (tp, QueryTask) {
        var $summaryReport = $("#summaryReport");
        tp.subscribe("panel-loaded", function (panel) {
            if (panel === "reports") {
                let $reportArea = $("#reportArea");
                $reportArea.on("click", ".returnBtn", function () {
                    $(".reportFormArea").hide();
                    $("#cardContainer").show();
                    $(this).hide();
                    $("#summaryReport").css("display", "none");

                    //Clear Graphics
                    let gfxLayer = app.map.findLayerById("gfxLayer");
                    gfxLayer.removeAll();
                })

                $reportArea.on("click", ".reportBtn", function () {
                    let val = $(this).data("report-form-id");
                    $(".reportFormArea").hide();
                    $("#cardContainer").hide();
                    $(`#${val}`).show();
                    $(".returnBtn").show();
                    $("#summaryReport").css("display", "none");
                    $("#reportForm").show();
                });

                $reportArea.on(".dataSrcToggle", "change", function () {
                    let dataSrc = $(this).data('val');
                    let d = app.selectedReport;

                    if (dataSrc === 'acs') {
                        OpenReportWindow(d.acsData, app.acsFieldsConfig);
                    } else {
                        OpenReportWindow(d.censusData, app.censusFieldsConfig);
                    }
                });
            }
        })

        function OpenReportWindow(res, fields) {
            let features = res.features;
            let displayName = res.displayFieldName;
            let feature = features[0];
            let attr = feature.attributes;

            $reportArea = $("#reportArea");
            let $header = $("#summaryReportHeader");
            $header.html(`${attr[displayName]} Demographics Report`);
            $header.show();

            // let $sumReportTabStrip = $("#sumReportTabStrip");

            if (feature.geometry) {
                AddHighlightGraphic(feature);
            }

            var valsDef = {};
            var vals = [];
            var duplicates = {};

            for (let i = 0; i < fields.length; i++) {
                const fld = fields[i];
                var oldFieldName = fld.fieldName;
                var val = Number(attr[fld.fieldName])
                if (fld.canSum === true || features.length === 1) {
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
                        fieldValueFormatted: Number(val),
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
                        valsDef[fld.fieldName].percentValue = val / percentOf * 100;
                        valsDef[fld.fieldName].percentValueFormatted = (val / percentOf * 100).MagFormat() + '%';
                        if (valsDef[fld.fieldName].percentValueFormatted.indexOf('.') > -1 && valsDef[fld.fieldName].percentValueFormatted.length === 3) {
                            valsDef[fld.fieldName].percentValueFormatted = '0' + valsDef[fld.fieldName].percentValueFormatted;
                        }
                    }
                    if (fld.densityAreaField !== '' || fld.densityAreaField !== undefined) {
                        var densityArea = Number(attr[fld.densityAreaField]);
                        valsDef[fld.fieldName].densityValue = val / densityArea;
                        valsDef[fld.fieldName].densityValueFormatted = (val / densityArea).MagFormat()
                    }

                    if (valsDef[fld.fieldName].percentValueFormatted === 'NaN%') {
                        valsDef[fld.fieldName].percentValueFormatted = '-';
                    }
                    vals.push(valsDef[fld.fieldName])
                }
                fld.fieldName = oldFieldName;
            }

            tp.publish("create-grid", vals, "gridTarget")
            tp.publish("create-charts", vals, "chartsTarget");

            if (attr['AFFECTED_DISABILITY_COUNT']) {
                SetupTitle6Grid(attr);
            } else {
                $('#title6Grid').html('');
            }
            $("#summaryReport").show();
        }

        function SetupTitle6Grid(attr) {

            $("#title6Toggle").click(function () {
                $('#title6Grid').toggle();
                $(this).toggleClass("k-i-expand k-i-collapse");
            })

            var fivePlus = attr['TOTAL_POP'] - attr['UNDER5'];
            var totalPop = attr['TOTAL_POP'];
            var totalBlockCount = attr['TOT_BLOCKGROUP_COUNT'];
            var age65Plus = attr['AGE65TO74'] + attr['AGE75TO84'] + attr['AGE85PLUS']

            var dataSrc = [{
                    Category: 'Population Base',
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
                    Percent: attr['DISABILITY'] / attr['CIV_NON_INST_POP'],
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
            $('#title6Grid').kendoGrid({
                dataSource: {
                    data: dataSrc
                },
                //height: 200,
                columns: [{
                        title: 'Population and Households',
                        width: '235px',
                        columns: [{
                                field: 'Category',
                                template: '#:Category#', //<sup>#:Footnote#</sup>
                                title: 'Category',
                                width: '95px'
                            },
                            {
                                field: 'Total',
                                title: 'Total',
                                width: '80px',
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
                                title: 'Number of block groups >= Area Percentage',
                                width: '90px',
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
                                width: '75px',
                                format: '{0:n0}'
                            },
                            {
                                field: 'PercentAffectedCaptured',
                                title: '% of Affected Population Captured in Census Block Groups',
                                width: '95px',
                                format: '{0:p1}'
                            }
                        ]
                    }
                ]
            });
        }

        function CreateKendoGrid(src, id) {

            var $grid = $('#' + id);
            if ($grid && $grid.data("kendoGrid")) {
                $grid.data("kendoGrid").destroy();
                $grid.empty();
            }
            const expandHTML = 'Expand Topics<i style="margin-left: 5px;" class="fa fa-expand" aria-hidden="true"></i>';
            const collapseHTML = 'Collapse Topics<i style="margin-left: 5px;" class="fa fa-compress" aria-hidden="true"></i>';

            // Kendo-ize
            $grid.kendoGrid({
                toolbar: [{
                    template: `
                        <div class="gridToolbar">
                            <button class="btn btn-sm gridGroupToggle" id="expandBtn">${expandHTML}</button>
                            <button class="btn btn-sm" id="exportToExcelBtn">Export to Excel<i style="margin-left: 5px;" class="fa fa-table" aria-hidden="true"></i></button>
                        </div>
                    `
                }],
                dataSource: {
                    data: src,
                    group: [{
                        field: 'fieldGroup'
                    }],
                    sort: {
                        field: 'fieldRowSort',
                        dir: 'asc'
                    }
                },
                // height: "10em",
                selectable: false,
                scrollable: false,
                sortable: false,
                resizable: true,
                columnMenu: false,
                columns: [{
                        field: 'fieldGroup',
                        title: 'Category',
                        hidden: true,
                        groupHeaderTemplate: '#=value#'
                    },
                    {
                        field: 'tableHeader',
                        title: 'Topic',
                        width: '300px'
                    },
                    {
                        field: 'fieldValueFormatted',
                        title: 'Estimate',
                        format: '{0:n1}'
                    },
                    {
                        field: 'percentValueFormatted',
                        title: 'Percent'
                    }
                    //{field: "densityValueFormatted", title: "Per Sq Mile", format: "{0:n1}"}
                ],
                dataBound: function (e) {
                    //if (this.wrapper[0].id !== "demCensusDataGrid") {
                    var rowCollection = e.sender.tbody[0].children;
                    var data = e.sender._data;
                    var realRows = [];

                    $.each(data, function (i, el) {
                        var foundElement = $('td').filter(function () {
                            return $(this).text() === el.tableHeader;
                        });
                        var finalElement = foundElement;
                        if (foundElement.length > 1) {
                            $.each(foundElement, function (i, row) {
                                if ($(row)[0].previousSibling) {
                                    if ($(row)[0].previousSibling.innerText.indexOf(el.fieldCategory) !== -1) {
                                        finalElement = $(row);
                                    }
                                }
                            });
                        } else if (foundElement.length === 1) {
                            finalElement = foundElement;
                        }
                        var indent = el.indentLevel * 20;
                        if (indent === 0) {
                            indent = 3;
                        }
                        finalElement.css('padding-left', indent + 'px');

                        $(finalElement).next().css('text-align', 'right');
                        $(finalElement).next().next().css('text-align', 'right');

                        var parentElement = $(finalElement[0].parentElement);

                        if (el.universeField === 1) {
                            var universeColor = '#06c';
                            parentElement.css({
                                'background-color': universeColor,
                                'font-weight': 'bold',
                                'font-style': 'italic',
                                'font-size': '12px',
                                'color': 'white'
                            });
                        } else if (el.universeField === 2) {
                            var universeColor = '#808080';
                            var nextSib = $(finalElement[0].nextSibling);
                            var finalSib = $(nextSib[0].nextSibling);
                            parentElement.css({
                                'background-color': universeColor,
                                'font-weight': 'bold',
                                'font-size': '11.5px',
                                'color': 'white'
                            });

                            if (nextSib[0].innerText === "-") {
                                nextSib.empty();
                            }
                            if (finalSib[0].innerText === "-") {
                                finalSib.empty();
                            }
                        } else if (el.universeField === 0) {
                            parentElement.css({
                                'font-weight': 'normal',
                                'font-size': '11.5px'
                            });
                        }
                    });
                    var grid = $('#' + this.wrapper[0].id).data('kendoGrid');
                    grid.tbody.find('tr.k-grouping-row').each(function (index) {
                        grid.collapseGroup(this);
                    });
                    $('.gridGroupToggle').click(function (e) {
                        $.each($('.k-grid'), function (i, val) {
                            if ($(val).is(':visible')) {
                                var grid = $(val).data('kendoGrid');
                                if (e.currentTarget.value === 'collapse') {
                                    e.currentTarget.value = 'expand';
                                    $(e.currentTarget).html(expandHTML);
                                    grid.tbody.find('tr.k-grouping-row').each(function (index) {
                                        grid.collapseGroup(this);
                                    });
                                } else {
                                    e.currentTarget.value = 'collapse';
                                    $(e.currentTarget).html(collapseHTML);
                                    grid.tbody.find('tr.k-grouping-row').each(function (index) {
                                        grid.expandGroup(this);
                                    });
                                }
                            }
                        });
                    });

                    $("#exportToExcelBtn").click(function () {
                        tp.publish("excel-export", {
                            data: data,
                            e: e,
                            grid: grid
                        });
                    });
                }
            });
        }
        tp.subscribe("open-report-window", OpenReportWindow);
        tp.subscribe("create-charts", CreateCharts);
        tp.subscribe("create-grid", CreateKendoGrid);

        function CreateChart(ops) {
            // console.log(ops);
            if (ops.data.length) {
                return ops.element
                    .kendoChart({
                        dataSource: {
                            data: ops.data
                        },

                        //change color of charts vw
                        // seriesColors: config.seriesColors,
                        seriesColors: app.config.seriesColors,

                        legend: {
                            // visible: legendVisible,
                            position: 'bottom',
                            // offsetX: 15,
                            // offsetY: -80,
                            margin: {
                                left: 0,
                                right: 10
                            },
                            labels: {
                                color: 'white'
                            }
                        },
                        series: [{
                            // name: self.groupedItems[0].chartName,
                            // type: self.groupedItems[0].chartType,
                            field: 'fieldValue',
                            categoryField: 'fieldAlias',
                            // padding: padding
                        }],
                        // transitions: animation,
                        seriesDefaults: {
                            labels: {
                                // visible: showLabels,
                                position: 'outsideEnd',
                                background: '#4D4D4D',
                                format: '{0:n}',
                                color: 'white',
                                // template: '#= wrapText(category) #'
                            },
                            tooltip: {
                                visible: true,
                                color: 'black',
                                // template: templateString
                            }
                        },
                        plotArea: {
                            margin: {
                                right: 30
                            }
                        },
                        chartArea: {
                            background: '#4D4D4D',
                            margin: {
                                left: 15,
                                top: 5,
                                right: 15
                            }
                        },
                        categoryAxis: {
                            //title: { text: "test"},
                            field: 'fieldAlias',
                            color: 'white',
                            labels: {
                                visible: true,
                                rotation: {
                                    angle: 45
                                },
                                // template: '#= wrapText(value) #'
                            },
                            majorGridLines: {
                                visible: false
                            },
                            line: {
                                visible: false
                            }
                        },
                        valueAxis: {
                            //title: { text: "test"},
                            color: 'white',
                            labels: {
                                // template: valueAxisTemplate
                            },
                            title: {
                                text: '*Values shown in thousands',
                                font: '10px Arial,Helvetica,sans-serif',
                                // visible: largeValue
                            }
                        }
                    })
                    .data('kendoChart');
            } else {
                ops.element.html("No data available for this chart.")
            }
        }

        function CreateCharts(data, target) {
            //Filter list
            var categories = {};
            var $target = $("#" + target);

            var $chartsList = $target.find("#chartsList");
            var $chartsArea = $target.find(".chartsArea");

            $chartsArea.html('');
            $chartsList.html('');

            data.forEach(function (row) {
                if (row.chartCategory) {
                    if (!categories[row.chartCategory]) {
                        categories[row.chartCategory] = {};
                    }
                    if (categories[row.chartCategory]["data"]) {
                        categories[row.chartCategory]["data"].push(row);
                    } else {
                        categories[row.chartCategory]["data"] = [row];
                        // $chartsList.append(`<button type="button" class="btn btn-secondary">${row.chartCategory}</button><br>`);
                        $chartsList.append(`<option>${row.chartCategory}</option>`);
                    }
                }
            })

            // $chartsList.find("button").click(function () {
            $chartsList.on('change', function () {
                var category = $(this).find(":selected").text();

                var chart = $chartsArea.data('kendoChart');

                if (chart !== null && chart !== undefined) {
                    chart.destroy();
                    chart.element.html('');
                }
                var chartData = categories[category];

                CreateChart({
                    element: $chartsArea,
                    category: category,
                    data: chartData.data
                });
            })

            $chartsList.find("option").first().prop("selected", "selected")
            $chartsList.find("option").first().change();

        }

        function AddHighlightGraphic(graphic) {
            let gfxLayer = app.map.findLayerById("gfxLayer");

            if (gfxLayer.graphics && gfxLayer.graphics.items.length > 0) {} else {
                gfxLayer.removeAll();

                var tempGraphic = $.extend({}, graphic);

                tempGraphic.symbol = {
                    type: "simple-fill",
                    color: [0, 255, 255, .5],
                    opacity: .5,
                    outline: {
                        color: "cyan",
                        width: "3"
                    }
                };

                gfxLayer.add(tempGraphic);

                //Zoom to highlighted graphic, but expand to give some context.
                app.view.goTo(graphic.geometry.extent.expand(1.5));
            }

        }
        dataCache = {};

        app.GetData = async function (conf, geoid) {

            if (dataCache[conf.id + geoid]) {
                app.selectedReport = dataCache[conf.id + geoid];
                return app.selectedReport;
            }

            let q = {
                returnGeometry: true,
                outFields: ["*"],
                where: `GEOID10 = '${geoid}'`
            }

            let qt = new QueryTask({
                url: app.config.mainUrl + "/" + conf.ACSIndex
            });
            let acsPromise = qt.execute(q);

            qt.url = app.config.mainUrl + "/" + conf.censusIndex;
            q.where = `GEOID = '${geoid}'`;
            q.returnGeometry = false;

            let censusPromise = qt.execute(q);

            app.selectedReport = {
                conf: conf,
                acsData: await acsPromise,
                censusData: await censusPromise
            }

            dataCache[conf.id + geoid] = app.selectedReport;

            return app.selectedReport;
        }
    }
)
