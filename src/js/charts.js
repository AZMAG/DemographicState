function CreateCharts(src, id) {
    var $chartContainer = $("#" + id);


    // console.log($chartContainer)
    var $chartArea = $chartContainer.find(".chartArea");

    if ($chartArea && $chartArea.data("kendoChart")) {
        $chartArea.data("kendoChart").destroy();
        $chartArea.empty();
    }
    var $chartList = $chartContainer.find(".chartList");

    var categories = [];

    for (let i = 0; i < src.length; i++) {
        const category = src[i].chartCategory;
        if (category && category !== "" && categories.indexOf(category) === -1) {
            categories.push(category);
        }
    }

    $chartList.kendoListView({
        dataSource: {
            data: categories
        },
        selectable: 'single',
        template: '<div class="k-button button chartCategoryBtn">#:data#</div>'
    })

    function FilterByCategory(e, i, arr) {
        return e.chartCategory === this.cat;
    }

    window.wrapText = function (value) {
        var wrapLength = 12;
        var returnLabel = "";
        var lineLength = 0;

        if (value.length >= wrapLength) {
            var wordsList = value.split(" ");
            $.each(wordsList, function (index, word) {
                var separator = " ";
                if (lineLength >= wrapLength) {
                    separator = "\n";
                    lineLength = 0;
                }
                returnLabel += separator + word;
                lineLength += word.length;
            });
        } else {
            returnLabel = value;
        }
        return returnLabel;
    }

    $(".chartCategoryBtn").click(function () {
        var cat = $(this).text();

        var filteredData = src.filter(FilterByCategory, {
            cat: cat
        })

        var dataSrc = {
            data: filteredData
        };

        if ($chartArea.data("kendoChart")) {
            console.log("already got one");
        }

        $chartArea.kendoChart({
            dataSource: dataSrc,
            legend: {
                visible: false
            },
            chartArea: {
                // background: '#4D4D4D',
                margin: {
                    left: 15,
                    top: 5,
                    right: 15
                }
            },
            seriesDefaults: {
                labels: {
                    visible: true,
                    position: 'outsideEnd',
                    background: '#4D4D4D',
                    format: '{0:n}',
                    color: 'white',
                    template: '#= wrapText(category) #',
                    // distance: 70
                },
                tooltip: {
                    visible: true,
                    color: 'black'
                }
            },
            seriesColors: app.config.seriesColors,
            series: [{
                padding: 75,
                type: filteredData[0].chartType,
                field: "fieldValue",
                categoryField: 'fieldAlias'
            }],
            tooltip: {
                visible: true,
                background: "green"
            }
        });

    });
    // console.log(src.length, filteredData.length);
    // console.log(src, filteredData);



}
