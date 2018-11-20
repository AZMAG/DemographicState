//This file should include logic on initialization of?????

require([
        "dojo/topic"
    ],
    function (tp) {
        var $summaryReport = $("#summaryReport");

        $(".returnBtn").click(function () {
            $(".reportFormArea").hide();
            $("#cardContainer").show();
        })

        $(".reportBtn").click(function () {
            let val = $(this).data("report-form-id");
            $(".reportFormArea").hide();
            $("#cardContainer").hide();
            $(`#${val}`).show();
            $("#summaryReport").css("visibility", "hidden");
        });

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
    }
)
