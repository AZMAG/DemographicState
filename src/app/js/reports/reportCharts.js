'use strict';
define([
        'mag/config/config',
        'mag/utilities',
        'dojo/topic'
    ],
    function(
        config,
        utilities,
        tp
    ){
    tp.subscribe('create-charts', CreateCharts);
    tp.subscribe('create-compare-charts', CreateCharts);

    function CreateChart(ops) {
        if (ops.data.length) {
            let series = [
                {
                    field: 'fieldValue',
                    categoryField: 'fieldAlias',
                    type: ops.compareData ? 'bar' : ops.type,
                    gap: 0.5,
                    data: ops.data,
                    name: ops.names ? ops.names[0] : undefined
                }
            ];

            if (ops.compareData) {
                series.push({
                    field: 'fieldValue',
                    categoryField: 'fieldAlias',
                    type: 'bar',
                    gap: 0.5,
                    data: ops.compareData,
                    name: ops.names ? ops.names[1] : undefined
                });
            }

            return ops.element
                .kendoChart({
                    seriesColors: config.seriesColors,
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'black'
                        }
                    },
                    series,
                    seriesDefaults: {
                        labels: {
                            position: 'outsideEnd',
                            background: '#4D4D4D',
                            format: '{0:n}',
                            color: 'black',
                            template: `#= kendo.format(" {0:P}", percentage) #`
                        },
                        tooltip: {
                            visible: true,
                            template: function (item) {
                                var text = utilities.chartTooltip(item.value, item.category);
                                return text+' <br> '+kendo.format("{0:P}", item.percentage);
                            }
                        }
                    },
                    chartArea: {
                        background: '#fafafa'
                    },
                    categoryAxis: {
                        field: 'fieldAlias',
                        color: 'black',
                        labels: {
                            visible: true,
                            rotation: {
                                angle: ops.type === 'column' ? 45 : 0
                            },
                            template: function (item) {
                                var text = utilities.wrapText(item.value);
                                return text;
                            }
                        },
                        majorGridLines: {
                            visible: false
                        },
                        line: {
                            visible: false
                        }
                    },
                    valueAxis: {
                        color: 'black',
                        labels: {
                            template: function (item) {
                                var text = utilities.valueAxisTemplate(item.value);
                                return text;
                            },
                            step: 2
                        }
                    }
                })
                .data('kendoChart');
        } else {
            ops.element.html('No data available for this chart.');
        }
    }

    function GetCategories(data) {
        return data.reduce((categories, d) => {
            if (!categories.includes(d.chartCategory) && d.chartCategory !== '') {
                categories.push(d.chartCategory);
            }
            return categories;
        }, []);
    }

    function CreateCharts({ data, compareData, target, names }) {
        //Filter list
        let $target = $('#' + target);
        let $chartsArea = $target.find('.chartsArea');
        $chartsArea.html('');

        let categories = GetCategories(data);
        categories.forEach(category => {
            let chartData = data.filter(row => row.chartCategory === category);
            let compareChartData = compareData ? compareData.filter(row => row.chartCategory === category) : undefined;

            $chartsArea
                .append(
                    `
                    <div class="bs-callout bs-callout-primary">
                        <h4>${category}</h4>
                    </div>
                    <div class="chartTarget" data-id="${category}"></div>
                    <hr>
            `
                )
                .get(0);
            CreateChart({
                element: $chartsArea.find(`.chartTarget[data-id="${category}"]`),
                category,
                data: chartData,
                compareData: compareChartData,
                names: compareChartData ? names : undefined,
                type: chartData[0].chartType
            });
        });

        // TODO: Refactor this at some point.
        // This doesn"t seem like an appropriate way to handle the resize event.
        setTimeout(() => {
            tp.publish('report-charts-created');
        }, 100);
    }
});
