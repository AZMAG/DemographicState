require(['dojo/topic'], function(tp) {
    tp.subscribe('create-charts', CreateCharts);
    function CreateChart(ops) {
        // console.log(ops);
        if (ops.data.length) {
            let total = 0;
            if (ops.type === 'pie') {
                console.log(ops.data);
            }
            console.log(app.config.seriesColors);

            return ops.element
                .kendoChart({
                    dataSource: {
                        data: ops.data
                    },
                    seriesColors: app.config.seriesColors,
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'black'
                        }
                    },
                    series: [
                        {
                            field: 'fieldValue',
                            categoryField: 'fieldAlias',
                            type: ops.type,
                            gap: 0.5
                        }
                    ],
                    seriesDefaults: {
                        labels: {
                            position: 'outsideEnd',
                            background: '#4D4D4D',
                            format: '{0:n}',
                            color: 'black',
                            template: '#= kendo.format("{0:P}", percentage) #'
                            // visible: true
                        },
                        tooltip: {
                            visible: true,
                            // color: 'white',
                            template:
                                '#= app.chartTooltip(value, category) # <br> #= kendo.format("{0:P}", percentage) #'
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
                            template: '#= app.wrapText(value) #'
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
                            template: '#= app.valueAxisTemplate(value) #',
                            step: 2
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
            let category = $chartsList.find(':selected').text();
            let chartData = categories[category];

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
