'use strict';
define([
        'dojo/topic',
        '../config/config',
        'magcore/utils/charts'
        
    ],
    function(
        tp,
        config,
        charts
    ){
    tp.subscribe('create-charts', CreateCharts);
    tp.subscribe('create-compare-charts', CreateCharts);

    function CreateChart(ops) {
        if (ops.data.length) {
            var params = charts.createChartParams(ops, config.seriesColors)

            return ops.element
                .kendoChart(params)
                .data('kendoChart');
        } else {
            ops.element.html('No data available for this chart.');
        }
    }

    function CreateCharts({ data, compareData, target, names }) {
        //Filter list
        let $target = $('#' + target);
        let $chartsArea = $target.find('.chartsArea');
        $chartsArea.html('');

        let categories = charts.GetCategories(data);
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
