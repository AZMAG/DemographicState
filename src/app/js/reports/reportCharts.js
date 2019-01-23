require(['dojo/topic'], function (tp) {
    tp.subscribe('create-charts', CreateCharts);

    function CreateChart(ops) {
        if (ops.data.length) {
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
                    series: [{
                        field: 'fieldValue',
                        categoryField: 'fieldAlias',
                        type: ops.type,
                        gap: 0.5
                    }],
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
                            template: '#= app.chartTooltip(value, category) # <br> #= kendo.format("{0:P}", percentage) #'
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
        let categories = {};
        let $target = $('#' + target);
        let $chartsArea = $target.find('.chartsArea');
        $chartsArea.html('');

        data.forEach(function (row) {
            if (row.chartCategory) {
                if (!categories[row.chartCategory]) {
                    categories[row.chartCategory] = [];
                }
                categories[row.chartCategory].push(row);
            }
        });

        Object.keys(categories).forEach(function (category) {
            let data = categories[category];
            $chartsArea.append(`
                    <div class="bs-callout bs-callout-primary">
                        <h4>${category}</h4>
                    </div>
                    <div class="chartTarget" data-id="${category}"></div>
                    <hr>
            `).get(0);

            CreateChart({
                element: $chartsArea.find(`.chartTarget[data-id="${category}"]`),
                category: category,
                data: data,
                type: data[0].chartType
            })
        })

        // TODO: Refactor this at some point.
        // This doesn't seem like an appropriate way to handle the resize event.
        setTimeout(() => {
            tp.publish('report-charts-created');
        }, 10);
    }
});
