require([
        "dojo/topic"
    ],
    function (tp) {
        tp.subscribe("layers-added", initReports);

        function initReports() {
            var html = '';
            for (let i = 0; i < app.config.layers.length; i++) {
                const layer = app.config.layers[i];

                if (layer.showReport) {
                    html += `<option data-layer-id="${layer.id}">${layer.title}</option>`;
                }
            }
            $("#reportType").html(html);
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

        function OpenReportWindow(res) {

            let features = res.features;
            let displayName = res.displayFieldName;
            let feature = features[0];
            let attr = feature.attributes;

            let $sumReportTabStrip = $("#sumReportTabStrip");

            AddHighlightGraphic(feature);

            //Zoom to highlighted graphic, but expand to give some context.
            app.view.goTo(features[0].geometry.extent.expand(1.5));

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
            // CreateCharts(vals, "acsCharts");
            $("#summaryReport").css("visibility", "visible");
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

    })
