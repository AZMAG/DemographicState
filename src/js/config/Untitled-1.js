function CreateKendoGrid(type) {
    var dataGridName = 'demACSDataGrid';
    var demoOptionsRowName = 'demACSSummaryOptionsRow';
    var dataSource = self.aggACSValuesArray;
    var visibility = 'display:none;';

    if (type === 'census') {
        dataGridName = 'demCensusDataGrid';
        demoOptionsRowName = 'demCensusSummaryOptionsRow';
        dataSource = self.aggCensusValuesArray;
        visibility = '';
        if (dataSource[3] && dataSource[2] && dataSource[17]) {
            dataSource[3].fieldValueFormatted = dataSource[2].fieldValueFormatted;
            dataSource[17].fieldValueFormatted = dataSource[2].fieldValueFormatted;
            dataSource[25].fieldValueFormatted = dataSource[2].fieldValueFormatted;
        }
    }

    $.each(dataSource, function (i, value) {
        if (value['fieldType'] === 'Currency') {
            value['fieldValueFormatted'] = '$ ' + magNumberFormatter.formatValue(value['fieldValue']);
        } else if (value['fieldType'] === 'Rate') {
            value['percentValueFormatted'] = magNumberFormatter.formatValue(value['fieldValue']) + '%';
            value['fieldValueFormatted'] = '-';
        }
    });

    // Create the div element for the grid
    dc.create(
        'div', {
            id: dataGridName,
            style: 'margin: 5px 0 0 0; font-size: small; ' + visibility
        },
        demoOptionsRowName,
        'after'
    );

    // Kendo-ize
    $('#' + dataGridName).kendoGrid({
        dataSource: {
            data: dataSource,
            group: [{
                field: 'fieldGroup'
            }],
            sort: {
                field: 'fieldRowSort',
                dir: 'asc'
            }
        },
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

    self.sizeGrid('#' + dataGridName);
};




/**
 * Callback method for query results from getData method.
 * @param {FeatureSet} results - feature set returned by query.
 */
self.acsDataQueryHandler = function (results) {
    var features = results.features;
    var isACS = false;
    var fieldCount = Object.keys(features[0].attributes).length;
    var fields = acsFieldsConfig.fields;
    var chartListDivObj = $('#demACSChartList');
    var gridName = '#demACSDataGrid';
    var compareName = 'demACSUseComp';
    var gridType = 'ACS';
    var featuresCount = features.length;

    // Clear the current graphics
    mapModel.clearGraphics();

    // Add the new graphics. vw
    if (features[0].geometry !== null) {
        mapModel.addGraphics(features, undefined, true);
        if ($('#demInteractiveDiv').is(':visible') === false || $('#zoomSelection').prop('checked')) {
            // Zoom to selected graphics. vw
            var zoomExtent = graphicsUtils.graphicsExtent(features);
            mapModel.setMapExtent(zoomExtent);
        }
    }
    // self.resetComparisonDropdowns();

    // Summarize the features
    var sumAttributes = self.summarizeAttributes(features);

    // Get the configuration
    var aggValues = {};
    var duplicates = {};

    $.each(fields, function (index, field) {
        var attribute = sumAttributes[field.fieldName];
        var attrValue = Number(attribute);
        var oldFieldName = field.fieldName;

        if (field.canSum === true || featuresCount === 1) {
            if (aggValues[field.fieldName]) {
                if (duplicates[field.fieldName]) {
                    duplicates[field.fieldName]++;
                } else {
                    duplicates[field.fieldName] = 1;
                }

                field.fieldName += duplicates[field.fieldName];
            }

            aggValues[field.fieldName] = {
                fieldCategory: field.category,
                fieldGroup: field.groupID, // added to sort order in data grid. vw
                fieldRowSort: field.rowID, // added to sort row order in data grid. vw
                fieldName: field.fieldName,
                tableHeader: field.tableHeader,
                fieldAlias: field.fieldAlias,
                fieldType: field.fieldType,
                fieldClass: field.class,
                fieldValue: attrValue,
                fieldValueFormatted: magNumberFormatter.formatValue(attrValue),
                chartCategory: field.chartCategory,
                chartType: field.chartType,
                chartName: field.chartCategory, // added to give name to series for legend. vw
                parentField: field.parentField,
                timePeriod: field.timePeriod,
                percentOfField: field.percentOfField,
                derivedTargetField: field.fieldName,
                indentLevel: field.indentLevel,
                universeField: field.universeField,
                derivedPercentOfField: field.percentOfField,
                percentValue: 0,
                percentValueFormatted: '0',
                derivedDensityAreaField: field.densityAreaField,
                densityValue: 0,
                densityValueFormatted: '0'
            };

            // checks for NaN in the data and blanks out field. vw
            if (isNaN(attrValue)) {
                aggValues[field.fieldName].fieldValue = '-';
                aggValues[field.fieldName].fieldValueFormatted = '-';
            }
            if (field.percentOfField === '' || field.percentOfField === undefined) {
                aggValues[field.fieldName].percentValueFormatted = '-';
            } else if (field.percentOfField !== undefined) {
                var percentOf = Number(sumAttributes[field.percentOfField]);
                aggValues[field.fieldName].percentValue = attrValue / percentOf * 100;
                aggValues[field.fieldName].percentValueFormatted = magNumberFormatter.formatValue((attrValue / percentOf * 100)) + '%';
                if (aggValues[field.fieldName].percentValueFormatted.indexOf('.') > -1 && aggValues[field.fieldName].percentValueFormatted.length === 3) {
                    aggValues[field.fieldName].percentValueFormatted = '0' + aggValues[field.fieldName].percentValueFormatted;
                }
            }
            if (field.densityAreaField !== '' || field.densityAreaField !== undefined) {
                var densityArea = Number(sumAttributes[field.densityAreaField]);
                aggValues[field.fieldName].densityValue = attrValue / densityArea;
                aggValues[field.fieldName].densityValueFormatted = magNumberFormatter.formatValue(
                    attrValue / densityArea
                );
            }

            if (aggValues[field.fieldName].percentValueFormatted === 'NaN%') {
                aggValues[field.fieldName].percentValueFormatted = '-';
            }
        }
        field.fieldName = oldFieldName;
    });
    //
    // Filter and group for chart categories
    self.chartCategories = [];
    self.aggACSValuesArray = [];
    self.aggValuesACSGroupedByChartCategory = {};
    self.aggValuesGroupedByFieldCategory = {};
    $.each(aggValues, function (index, item) {
        self.aggACSValuesArray.push(aggValues[item.fieldName]);
        // Chart Categories
        if (item.chartCategory !== '' && item.chartCategory !== undefined) {
            if (item.chartCategory in self.aggValuesACSGroupedByChartCategory) {
                self.aggValuesACSGroupedByChartCategory[item.chartCategory].push(
                    aggValues[item.fieldName]
                );
            } else {
                self.chartCategories.push({
                    chartCategory: item.chartCategory
                });
                self.aggValuesACSGroupedByChartCategory[item.chartCategory] = [
                    aggValues[item.fieldName]
                ];
            }
        }
        // Field Categories
        if (item.fieldCategory !== '') {
            if (item.fieldCategory in self.aggValuesGroupedByFieldCategory) {
                self.aggValuesGroupedByFieldCategory[item.fieldCategory].push(
                    aggValues[item.fieldName]
                );
            } else {
                self.aggValuesGroupedByFieldCategory[item.fieldCategory] = [
                    aggValues[item.fieldName]
                ];
            }
        }
    });

    if (self.compareFeature !== null) {
        self.addCompareValues('acs');
    }

    var kendoListView = chartListDivObj.data('kendoListView');

    if (kendoListView === undefined || kendoListView === null) {
        chartListDivObj.kendoListView({
            dataSource: {
                data: self.chartCategories
            },
            selectable: 'single',
            change: self.onChartListSelectionChanged,
            template: kendo.template($('#demChartListTemplate').html())
        });

        // Select the first item
        var listView = chartListDivObj.data('kendoListView');
        if (listView) {
            listView.select(listView.element.children().first());
        }
    }

    var tabStrip = $('#demTabStrip').data('kendoTabStrip');

    // Reset comparison if community has changed
    if (self.commChanged) {
        // Clear the comparison checkbox
        $('#demACSUseComp').prop('checked', false);
        $('#demCensusUseComp').prop('checked', false);

        // Reload the chart if on the charts tab
        var tab = tabStrip.select();
        if (tab[0]) {
            if (
                tab[0].textContent === 'Census 2010 Charts' || tab[0].textContent === 'ACS 2016 Charts'
            ) {
                self.reloadChart();
            }
        }

        // Reload the comparison places
        self.reloadCompareComboBox();
    }

    // Create the summary grid
    var kendoGrid = $(gridName).data('kendoGrid');
    if (kendoGrid) {
        kendoGrid.element.remove();
        kendoGrid.destroy();
    }

    var useCompare = dom.byId(compareName).checked;
    if (useCompare) {
        self.createKendoGridWithCompare(gridType);
    } else {
        self.createKendoGrid(gridType);
    }

    if (self.selectionGraphic !== '') {
        mapModel.addGraphic(self.selectionGraphic, undefined, true, true);
    }

    var item = tabStrip.tabGroup.find('li:contains("Title VI Data")');
    if (item) {
        tabStrip.remove(item);
        tabStrip.select('li:contains("ACS 2016 Data")');
    }

    $('#demACSSummaryOptionsRow').show();
    $('#demACSDataGrid').show();
    //$("#demTabStrip").show();
    //$("#demTabStrip").css("visibility", "visible");
    $('#reportLoading').hide();
    if (
        (self.reportType === 'cog' ||
            self.reportType == 'county' ||
            self.reportType == 'place' ||
            self.reportType == 'legislative' ||
            self.reportType == 'congressional' ||
            self.reportType == 'zipCode' ||
            self.reportType == 'supervisor' ||
            self.reportType == 'councilDistrict') && features[0].attributes['TOTAL_POP'] > 5000
    ) {
        var attributes = features[0].attributes;
        if (features.length > 1) {
            for (var i = 1; i < features.length; i++) {
                Object.keys(attributes).forEach(function (key) {
                    attributes[key] += features[i].attributes[key];
                });
            }
        }
        var fivePlus = attributes['TOTAL_POP'] - attributes['UNDER5'];
        var totalPop = attributes['TOTAL_POP'];
        var totalBlockCount = attributes['TOT_BLOCKGROUP_COUNT'];
        var age65Plus = attributes['AGE65TO74'] + attributes['AGE75TO84'] + attributes['AGE85PLUS']

        var dataSrc = [{
                Category: 'Population Base',
                Footnote: '',
                Total: totalPop,
                Percent: 'N/A',
                NumberOfBlocks: totalBlockCount,
                PercentOfBlocks: totalBlockCount / totalBlockCount,
                AffectedPopulation: 'N/A',
                PercentAffectedCaptured: 'N/A'
            },
            {
                Category: 'Minority',
                Footnote: 'a',
                Total: attributes['MINORITY_POP'],
                Percent: attributes['MINORITY_POP'] / totalPop,
                NumberOfBlocks: attributes['AFFECTED_MINORITY_POP_COUNT'],
                PercentOfBlocks: attributes['AFFECTED_MINORITY_POP_COUNT'] / totalBlockCount,
                AffectedPopulation: attributes['AFFECTED_MINORITY_POP'],
                PercentAffectedCaptured: attributes['AFFECTED_MINORITY_POP'] / attributes['MINORITY_POP']
            },
            {
                Category: 'Age 65+',
                Footnote: '',
                Total: age65Plus,
                Percent: age65Plus / totalPop,
                NumberOfBlocks: attributes['AFFECTED_AGE65PLUS_COUNT'],
                PercentOfBlocks: attributes['AFFECTED_AGE65PLUS_COUNT'] / totalBlockCount,
                AffectedPopulation: attributes['AFFECTED_AGE65PLUS'],
                PercentAffectedCaptured: attributes['AFFECTED_AGE65PLUS'] / age65Plus
            },
            {
                Category: 'Below Poverty Level',
                Footnote: 'b',
                Total: attributes['INCOME_BELOW_POVERTY'],
                Percent: attributes['INCOME_BELOW_POVERTY'] / attributes['POP_FOR_POVERTY'],
                NumberOfBlocks: attributes['AFFECTED_INCOME_BELOW_POVERTY_COUNT'],
                PercentOfBlocks: attributes['AFFECTED_INCOME_BELOW_POVERTY_COUNT'] / totalBlockCount,
                AffectedPopulation: attributes['AFFECTED_INCOME_BELOW_POVERTY'],
                PercentAffectedCaptured: attributes['AFFECTED_INCOME_BELOW_POVERTY'] / attributes['INCOME_BELOW_POVERTY']
            },
            {
                Category: 'Population with a Disability',
                Footnote: 'c',
                Total: attributes['DISABILITY'],
                Percent: attributes['DISABILITY'] / attributes['CIV_NON_INST_POP'],
                NumberOfBlocks: attributes['AFFECTED_DISABILITY_COUNT'],
                PercentOfBlocks: attributes['AFFECTED_DISABILITY_COUNT'] / totalBlockCount,
                AffectedPopulation: attributes['AFFECTED_DISABILITY'],
                PercentAffectedCaptured: attributes['AFFECTED_DISABILITY'] / attributes['DISABILITY']
            },
            {
                Category: 'Limited English Proficient Persons (LEP)',
                Footnote: 'd',
                Total: attributes['LIMITED_ENG_PROF'],
                Percent: attributes['LIMITED_ENG_PROF'] / fivePlus,
                NumberOfBlocks: attributes['AFFECTED_LIMITED_ENG_PROF_COUNT'],
                PercentOfBlocks: attributes['AFFECTED_LIMITED_ENG_PROF_COUNT'] / totalBlockCount,
                AffectedPopulation: attributes['AFFECTED_LIMITED_ENG_PROF'],
                PercentAffectedCaptured: attributes['AFFECTED_LIMITED_ENG_PROF'] / attributes['LIMITED_ENG_PROF']
            }
        ];

        tabStrip.append({
            text: 'Title VI Data',
            content: title6View
        });

        // $("#povPopFootnote").html(attributes["POP_FOR_POVERTY"].toLocaleString());
        // $(".pop5PlusFootnote").html(fivePlus.toLocaleString());

        var type = attributes['TYPE'];

        $('#title6Grid').kendoGrid({
            dataSource: {
                data: dataSrc
            },
            //height: 200,
            columns: [{
                    title: 'Population and Households',
                    width: '235px',
                    columns: [{
                            field: 'Category',
                            template: '#:Category#', //<sup>#:Footnote#</sup>
                            title: 'Category',
                            width: '95px'
                        },
                        {
                            field: 'Total',
                            title: 'Total',
                            width: '80px',
                            format: '{0:n0}'
                        },
                        {
                            field: 'Percent',
                            title: 'Percent',
                            format: '{0:p1}',
                            width: '60px'
                        }
                    ]
                },
                {
                    title: 'Census Block Groups',
                    width: '325px',
                    columns: [{
                            field: 'NumberOfBlocks',
                            title: 'Number of block groups >= Area Percentage',
                            width: '90px',
                            format: '{0:n0}'
                        },
                        {
                            field: 'PercentOfBlocks',
                            title: '% Block Groups',
                            format: '{0:p1}',
                            width: '65px'
                        },
                        {
                            field: 'AffectedPopulation',
                            title: 'Affected Population',
                            width: '75px',
                            format: '{0:n0}'
                        },
                        {
                            field: 'PercentAffectedCaptured',
                            title: '% of Affected Population Captured in Census Block Groups',
                            width: '95px',
                            format: '{0:p1}'
                        }
                    ]
                }
            ]
        });

        //$("#footnotePanelBar").kendoPanelBar();
    }
};