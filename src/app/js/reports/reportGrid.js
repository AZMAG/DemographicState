'use strict';
define([
    'mag/reports/reports-utils',
    'dojo/topic'
],
function (
    reportsutils,
    tp
    ){
    const expandHTML = 'Expand Topics<i style="margin-left: 5px;" class="fa fa-expand" aria-hidden="true"></i>';
    const collapseHTML = 'Collapse Topics<i style="margin-left: 5px;" class="fa fa-compress" aria-hidden="true"></i>';
    const toolbarTemplate = `
        <div class="gridToolbar">
            <button class="btn btn-sm gridGroupToggle expandCollapseBtn" value="collapse">${collapseHTML}</button>
            <button class="btn btn-sm" id="exportToExcelBtn">Export to Excel<i style="margin-left: 5px;" class="fa fa-table" aria-hidden="true"></i></button>
        </div>
    `;

    function RemoveOldGrid($grid) {
        if ($grid && $grid.data('kendoGrid')) {
            $grid.data('kendoGrid').destroy();
            $grid.empty();
        }
    }

    function CreateComparisonKendoGrid({
        data,
        compareData,
        target
    }) {
        let $grid = $('#' + target);

        for (let i = 0; i < data.length; i++) {
            let val = data[i];
            let compareVal = compareData[i];
            val['compareValueFormatted'] = compareVal['fieldValueFormatted'];
            val['comparePercentValueFormatted'] = compareVal['percentValueFormatted'];
        }

        RemoveOldGrid($grid);
        let cols = [{
                field: 'fieldGroup',
                title: 'Category',
                hidden: true,
                groupHeaderTemplate: '#=value#'
            },
            {
                headerTemplate: 'Topic',
                field: 'tableHeader',
                template: '#=tableHeader#',
                width: '120px'
            },
            {
                field: 'fieldValueFormatted',
                title: 'Estimate',
                format: '{0:n1}'
            },
            {
                field: 'percentValueFormatted',
                title: 'Percent'
            },
            {
                field: 'compareValueFormatted',
                title: 'Estimate',
                format: '{0:n1}'
            },
            {
                field: 'comparePercentValueFormatted',
                title: 'Percent'
            }
        ];

        CreateKendoGrid({
            data,
            target,
            cols
        });
        let features = reportsutils.selectedReport.acsData.features;

        $grid
            .find('thead')
            .first()
            .prepend(
                `
                <tr>
                    <th class="k-header"></th>
                    <th class="k-header"></th>
                    <th class="k-header compareHeader" colspan="2">${features[0].attributes['NAME']}</th>
                    <th class="k-header compareHeader" colspan="2">${features[1].attributes['NAME']}</th>
                </tr>
                `
            );
    }

    function CreateKendoGrid({
        data,
        target,
        cols
    }) {
        let $grid = $('#' + target);
        RemoveOldGrid($grid);

        if (!cols) {
            cols = [{
                    field: 'fieldGroup',
                    title: 'Category',
                    hidden: true,
                    groupHeaderTemplate: '#=value#'
                },
                {
                    headerTemplate: 'Topic',
                    field: 'tableHeader',
                    template: '#=tableHeader#',
                    title: 'Topic',
                    width: '300px'
                },
                {
                    field: 'fieldValueFormatted',
                    title: 'Estimate'
                },
                {
                    field: 'percentValueFormatted',
                    title: 'Percent'
                }
            ];
        }
        try {

            $grid.kendoGrid({
                toolbar: [{
                    template: toolbarTemplate
                }],
                dataSource: {
                    data: data,
                    group: [{
                        field: 'fieldGroup'
                    }],
                    sort: {
                        field: 'fieldRowSort',
                        dir: 'asc'
                    }
                },
                selectable: false,
                scrollable: false,
                sortable: false,
                resizable: true,
                columnMenu: false,
                columns: cols,
                dataBound: DataBound
            });
        } catch (error) {
            console.log(error);

        }

    }

    function DataBound(e) {
        var rowCollection = e.sender.tbody[0].children;
        var data = e.sender._data;
        var realRows = [];

        $.each(data, function (i, el) {
            var foundElement = $('td').filter(function () {
                let html = $(this).html();
                if (html.includes("Minority is defined a") && el.tableHeader.includes("minorityTooltip")) {
                    return true;
                }

                return html === el.tableHeader;
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

            $(finalElement)
                .next()
                .css('text-align', 'right');
            $(finalElement)
                .next()
                .next()
                .css('text-align', 'right');


            if (finalElement[0]) {
                var parentElement = $(finalElement[0].parentElement);

                if (el.universeField === 1) {
                    var universeColor = '#06c';
                    parentElement.css({
                        'background-color': universeColor,
                        'font-weight': 'bold',
                        'font-style': 'italic',
                        'font-size': '12px',
                        color: 'white'
                    });
                } else if (el.universeField === 2) {
                    var universeColor = '#808080';
                    var nextSib = $(finalElement[0].nextSibling);
                    var finalSib = $(nextSib[0].nextSibling);
                    parentElement.css({
                        'background-color': universeColor,
                        'font-weight': 'bold',
                        'font-size': '11.5px',
                        color: 'white'
                    });

                    if (nextSib[0].innerText === '-') {
                        nextSib.empty();
                    }
                    if (finalSib[0].innerText === '-') {
                        finalSib.empty();
                    }
                } else if (el.universeField === 0) {
                    parentElement.css({
                        'font-weight': 'normal',
                        'font-size': '11.5px'
                    });
                }
            }
        });
        var grid = $('#' + this.wrapper[0].id).data('kendoGrid');

        let $title6Grid = $('#title6Grid');
        let $title6Toggle = $('#title6Toggle');

        //This defaults the grid to a collapsed state.
        // grid.tbody.find("tr.k-grouping-row").each(function (index) {
        // grid.collapseGroup(this);
        // });

        $('.gridGroupToggle')
            .off('click')
            .on('click', function (e) {
                $.each($('.k-grid'), function (i, val) {
                    if ($(val).is(':visible') && val.id === 'gridTarget') {
                        var grid = $(val).data('kendoGrid');
                        if (e.currentTarget.value === 'collapse') {
                            e.currentTarget.value = 'expand';
                            $(e.currentTarget).html(expandHTML);
                            grid.tbody.find('tr.k-grouping-row').each(function (index) {
                                grid.collapseGroup(this);
                            });
                            $title6Grid.hide();
                            $title6Toggle.addClass('k-i-expand').removeClass('k-i-collapse');
                        } else {
                            e.currentTarget.value = 'collapse';
                            $(e.currentTarget).html(collapseHTML);
                            grid.tbody.find('tr.k-grouping-row').each(function (index) {
                                grid.expandGroup(this);
                            });
                            $title6Grid.show();
                            $title6Toggle.addClass('k-i-collapse').removeClass('k-i-expand');
                        }
                    }
                });
            });

        $('#exportToExcelBtn').click(function () {
            tp.publish('excel-export', {
                data,
                e,
                grid,
                title: $('#summaryReportHeader')
                    .text()
                    .trim()
            });
        });

        $('#minorityTooltip').tooltip();
    }

    tp.subscribe('create-grid', CreateKendoGrid);
    tp.subscribe('create-compare-grid', CreateComparisonKendoGrid);
});
