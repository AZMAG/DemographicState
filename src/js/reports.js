//This file should include logic on initialization of?????

require([
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (tp) {
        tp.subscribe("layers-added", initReports);
        var $summaryReport = $("#summaryReport");

        function initReports() {
            var html = '';
            for (let i = 0; i < app.config.layers.length; i++) {
                const layer = app.config.layers[i];

                if (layer.showReport) {
                    html += `<option data-layer-id="${layer.id}">${layer.title}</option>`;
                }
            }
            $("#reportType").html(html);
            // var initReportID = "cogBoundaries";
            // updateReportDDL(app.map.findLayerById(initReportID), app.config.layerDef[initReportID]);

            // $summaryReport.show();
            // $summaryReport.kendoWindow({
            //     visible: false,
            //     actions: [
            //         "Close"
            //     ],
            //     width: "50vw",
            //     close: function (e) {
            //         let gfxLayer = app.map.findLayerById("gfxLayer");
            //         gfxLayer.removeAll();
            //     }
            // });
        }

        function hideReportLayers() {
            app.config.layers.forEach(function (conf) {
                const layer = app.map.findLayerById(conf.id);
                if (layer && conf.showReport) {
                    layer.visible = false;
                }
            })
        }

        function updateReportDDL(layer, conf) {
            let sumField = conf.displayField || layer.displayField;
            console.log(layer);

            hideReportLayers();
            layer.visible = true;

            const q = {
                where: "1=1",
                outFields: ["OBJECTID", sumField],
                returnGeometry: false,
                distinct: true,
                orderByFields: [sumField]
            }

            layer.queryFeatures(q).then(function (res) {
                console.log(res);

                $("#specificReport").html('');
                for (let i = 0; i < res.features.length; i++) {
                    const feature = res.features[i];
                    $("#specificReport").append(`<option data-object-id="${feature.attributes["OBJECTID"]}">${feature.attributes[sumField]}</option>`);
                }
            })
        }


        $("#reportType").change(function () {
            var layerId = $(this).find(":selected").data("layer-id");
            let layer = app.map.findLayerById(layerId);
            updateReportDDL(layer, app.config.layerDef[layerId]);
        })

        $("#reportForm").submit(function (e) {
            e.preventDefault();
            $("#summaryReport").css("visibility", "hidden");
            var layerId = $("#reportType").find(":selected").data("layer-id");
            let layer = app.map.findLayerById(layerId);
            let OBJECTID = $("#specificReport").find(":selected").data("object-id");

            let q = {
                objectIds: [Number(OBJECTID)],
                returnGeometry: true,
                outFields: ["*"]
            }

            layer.queryFeatures(q).then(function (res) {
                if (res.features && res.features.length > 0) {
                    OpenReportWindow(res);
                } else {
                    console.error("No matching features for: " + q);
                }
            });
        })

        function AddHighlightGraphic(graphic) {
            let gfxLayer = app.map.findLayerById("gfxLayer");
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
        }

        function CreateChart(ops) {
            // console.log(ops);
            if (ops.data.length) {
                return ops.element
                    .kendoChart({
                        dataSource: {
                            data: ops.data
                        },

                        //change color of charts vw
                        // seriesColors: appConfig.seriesColors,

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
                                rotation: 0,
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

            var $chartsList = $target.find(".chartsList");
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
                        $chartsList.append(`<button>${row.chartCategory}</button><br>`);
                    }
                }
            })

            $chartsList.on("click", "button", function () {
                var category = $(this).text();
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

        }


        function CreateKendoGrid(src, id) {
            var $grid = $('#' + id);
            if ($grid && $grid.data("kendoGrid")) {
                $grid.data("kendoGrid").destroy();
                $grid.empty();
            }

            // Kendo-ize
            $grid.kendoGrid({
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
                height: 400,
                selectable: false,
                scrollable: true,
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
                    $('.gridGroupToggle').val('expand').html('Expand All');
                }
            });
        }


        function OpenReportWindow(res) {
            console.log(res)

            let features = res.features;
            let displayName = res.displayFieldName;
            let feature = features[0];
            let attr = feature.attributes;

            let $sumReportTabStrip = $("#sumReportTabStrip");

            AddHighlightGraphic(feature);

            //Zoom to highlighted graphic, but expand to give some context.
            app.view.goTo(features[0].geometry.extent.expand(3));

            // var win = $summaryReport.data("kendoWindow");
            // win.title(attr[displayName]);
            // win.center();
            // win.open();

            var valsDef = {};
            var vals = [];
            var duplicates = {};

            for (let i = 0; i < app.acsFieldsConfig.length; i++) {
                const fld = app.acsFieldsConfig[i];
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
            CreateKendoGrid(vals, "acsGrid");
            CreateCharts(vals, "acsCharts");
            $("#summaryReport").css("visibility", "visible");
        }
    }
)
