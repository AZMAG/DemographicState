require([
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (tp) {
        tp.subscribe("map-loaded", initReports);
        var $summaryReport = $("#summaryReport");

        function initReports() {
            var html = '';
            for (let i = 0; i < app.config.layers.length; i++) {
                const layer = app.config.layers[i];
                html += `<option data-layer-id="${layer.id}">${layer.title}</option>`;
            }
            $("#reportType").html(html);
            $summaryReport.kendoWindow({
                visible: false,
                actions: [
                    "Close"
                ],
                width: "50vw"
            });
        }

        $("#reportType").change(function () {
            var layerId = $(this).find(":selected").data("layer-id");
            let layer = app.map.findLayerById(layerId);
            let sumField = layer.displayField;
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
        })

        $("#reportForm").submit(function (e) {
            e.preventDefault();
            var layerId = $("#reportType").find(":selected").data("layer-id");
            let layer = app.map.findLayerById(layerId);
            let OBJECTID = $("#specificReport").find(":selected").data("object-id");

            let q = {
                objectIds: [Number(OBJECTID)],
                returnGeometry: true,
                outFields: ["*"]
            }

            app.view.whenLayerView(layer).then(function (lyrView) {
                // lyrView.queryFeatures(q).then(function (res) {
                //     if (res.features && res.features.length > 0) {
                //         OpenReportWindow(res);
                //     } else {
                //         console.error("No matching features for: " + q);
                //     }
                // });
            });

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
            graphic.symbol = {
                type: "simple-fill",
                color: [0, 255, 255, .5],
                opacity: .5,
                outline: {
                    color: "cyan",
                    width: "3"
                }
            };

            gfxLayer.add(graphic);
        }

        function CreateCharts(src, id) {
            var $chartContainer = $("#" + id);
            console.log($chartContainer)
            var $chartArea = $chartContainer.find(".chartArea");
            var $chartList = $chartContainer.find(".chartList");

            console.log(src);

            var categories = [];

            for (let i = 0; i < src.length; i++) {
                const category = src[i].chartCategory;
                if (category && category !== "" && categories.indexOf(category) > -1) {
                    categories.push({
                        chartCategory: category
                    });
                }
            }


            console.log($chartList)
            $chartList.kendoListView({
                dataSource: {
                    data: categories
                },
                selectable: 'single',
                template: `
                <div class="chartCategoryBtn">
                    <div class="k-button button">#:chartCategory#</div>
                </div>
                `
            })

        }

        function CreateKendoGrid(src, id) {


            // if (type === 'census') {
            //     dataGridName = 'demCensusDataGrid';
            //     demoOptionsRowName = 'demCensusSummaryOptionsRow';
            //     dataSource = self.aggCensusValuesArray;
            //     visibility = '';
            //     if (dataSource[3] && dataSource[2] && dataSource[17]) {
            //         dataSource[3].fieldValueFormatted = dataSource[2].fieldValueFormatted;
            //         dataSource[17].fieldValueFormatted = dataSource[2].fieldValueFormatted;
            //         dataSource[25].fieldValueFormatted = dataSource[2].fieldValueFormatted;
            //     }
            // }

            // $.each(dataSource, function (i, value) {
            //     if (value['fieldType'] === 'Currency') {
            //         value['fieldValueFormatted'] = '$ ' + value['fieldValue'];
            //     } else if (value['fieldType'] === 'Rate') {
            //         value['percentValueFormatted'] = value['fieldValue'] + '%';
            //         value['fieldValueFormatted'] = '-';
            //     }
            // });

            console.log(src)

            // Create the div element for the grid
            // dc.create(
            //     'div', {
            //         id: dataGridName,
            //         style: 'margin: 5px 0 0 0; font-size: small; ' + visibility
            //     },
            //     demoOptionsRowName,
            //     'after'
            // );

            // Kendo-ize
            $('#' + id).kendoGrid({
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
                        width: '350px'
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
                                'font-size': '12px'
                            });
                        } else if (el.universeField === 2) {
                            var universeColor = '#808080';
                            var nextSib = $(finalElement[0].nextSibling);
                            var finalSib = $(nextSib[0].nextSibling);
                            parentElement.css({
                                'background-color': universeColor,
                                'font-weight': 'bold',
                                'font-size': '11.5px'
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
            let features = res.features;
            let displayName = res.displayFieldName;
            let feature = features[0];
            let attr = feature.attributes;

            let $sumReportTabStrip = $("#sumReportTabStrip");

            AddHighlightGraphic(feature);

            //Zoom to highlighted graphic, but expand to give some context.
            app.view.goTo(features[0].geometry.extent.expand(3));

            var win = $summaryReport.data("kendoWindow");
            win.title(attr[displayName]);
            win.center();
            win.open();

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
                        valsDef[fld.fieldName].percentValueFormatted = (val / percentOf * 100) + '%'; //magNumberFormatter.formatValue(
                        if (valsDef[fld.fieldName].percentValueFormatted.indexOf('.') > -1 && valsDef[fld.fieldName].percentValueFormatted.length === 3) {
                            valsDef[fld.fieldName].percentValueFormatted = '0' + valsDef[fld.fieldName].percentValueFormatted;
                        }
                    }
                    if (fld.densityAreaField !== '' || fld.densityAreaField !== undefined) {
                        var densityArea = Number(attr[fld.densityAreaField]);
                        valsDef[fld.fieldName].densityValue = val / densityArea;
                        valsDef[fld.fieldName].densityValueFormatted = val / densityArea //magNumberFormatter.formatValue(
                    }

                    if (valsDef[fld.fieldName].percentValueFormatted === 'NaN%') {
                        valsDef[fld.fieldName].percentValueFormatted = '-';
                    }
                    vals.push(valsDef[fld.fieldName])
                }
                fld.fieldName = oldFieldName;
            }
            // console.log(vals)
            CreateKendoGrid(vals, "acsGrid");
            CreateCharts(vals, "acsCharts");
        }
    }
)
