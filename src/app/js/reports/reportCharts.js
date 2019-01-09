require(['dojo/topic'], function(tp) {
    tp.subscribe('create-charts', CreateCharts);
    function CreateChart(ops) {
        // console.log(ops);
        if (ops.data.length) {
            return ops.element
                .kendoChart({
                    dataSource: {
                        data: ops.data
                    },
                    seriesColors: app.config.seriesColors,
                    // seriesDefaults: {
                    //     type: 'line',
                    //     style: 'smooth'
                    // },
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
                            color: 'black'
                        }
                    },
                    series: [
                        {
                            // name: self.groupedItems[0].chartName,
                            // type: self.groupedItems[0].chartType,
                            field: 'fieldValue',
                            categoryField: 'fieldAlias',
                            type: ops.type
                            // padding: padding
                        }
                    ],
                    // transitions: animation,
                    seriesDefaults: {
                        labels: {
                            // visible: showLabels,
                            position: 'outsideEnd',
                            background: '#4D4D4D',
                            format: '{0:n}',
                            color: 'black'
                            // template: '#= wrapText(category) #'
                        },
                        tooltip: {
                            visible: true,
                            color: 'white'
                            // template: templateString
                        }
                    },
                    plotArea: {
                        margin: {
                            // right: 30
                        }
                    },
                    chartArea: {
                        background: '#fafafa'
                        // margin: {
                        //     left: 15,
                        //     top: 5,
                        //     right: 15
                        // }
                    },
                    categoryAxis: {
                        //title: { text: "test"},
                        field: 'fieldAlias',
                        color: 'black',
                        labels: {
                            visible: true,
                            rotation: {
                                angle: ops.type === 'column' ? 45 : 0
                            }
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
                        color: 'black',
                        labels: {
                            // template: valueAxisTemplate
                        },
                        title: {
                            text: '*Values shown in thousands',
                            font: '10px Arial,Helvetica,sans-serif'
                            // visible: largeValue
                        }
                    }
                })
                .data('kendoChart');
        } else {
            ops.element.html('No data available for this chart.');
        }
    }

    function CreateCharts(data, target) {
        //Filter list
        var categories = {};

        var $target = $('#' + target);

        var $chartsList = $target.find('#chartsList');
        var $chartsType = $target.find('#chartsType');
        var $chartsArea = $target.find('.chartsArea');

        $chartsArea.html('');
        $chartsList.html('');

        data.forEach(function(row) {
            if (row.chartCategory) {
                if (!categories[row.chartCategory]) {
                    categories[row.chartCategory] = {};
                }
                if (categories[row.chartCategory]['data']) {
                    categories[row.chartCategory]['data'].push(row);
                } else {
                    categories[row.chartCategory]['data'] = [row];
                    // $chartsList.append(`<button type="button" class="btn btn-secondary">${row.chartCategory}</button><br>`);
                    $chartsList.append(`<option>${row.chartCategory}</option>`);
                }
            }
        });

        $chartsList.off('change').on('change', ChartOptionChanged);
        $chartsType.off('change').on('change', ChartOptionChanged);

        function ChartOptionChanged() {
            ClearCurrentChart();
            let ops = GetChartOptions();
            CreateChart(ops);
        }

        function ClearCurrentChart() {
            var chart = $chartsArea.data('kendoChart');
            if (chart !== null && chart !== undefined) {
                chart.destroy();
                chart.element.html('');
            }
        }

        function GetChartOptions() {
            var category = $chartsList.find(':selected').text();
            var chartData = categories[category];

            return {
                element: $chartsArea,
                category: category,
                data: chartData.data,
                type: chartData.data[0].chartType
            };
        }

        $chartsList
            .find('option')
            .first()
            .prop('selected', 'selected');

        $chartsList
            .find('option')
            .first()
            .change();
    }
});
