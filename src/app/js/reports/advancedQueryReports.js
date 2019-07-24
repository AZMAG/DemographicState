'use strict';
require(['dojo/topic', 'esri/tasks/QueryTask'], function (tp, QueryTask) {
    tp.subscribe('panel-loaded', function (panel) {
        if (panel === 'reports-view') {
            InitAdvancedQuery();
        }
    });

    tp.subscribe('reset-reports', ClearQueryItems);

    let QueryItems = [];
    let CompareOperators = {
        string: [{
                Name: 'Equals',
                Sign: '='
            },
            {
                Name: 'Starts With',
                Sign: '%[value]'
            },
            {
                Name: 'Contains',
                Sign: '%[value]%'
            },
            {
                Name: 'Ends With',
                Sign: '[value]%'
            }
        ],
        number: [{
                Name: 'Between',
                Sign: 'between'
            },
            {
                Name: 'Equals',
                Sign: '='
            },
            {
                Name: 'Less Than',
                Sign: '<'
            },
            {
                Name: 'Less Than Or Equal To',
                Sign: '<='
            },
            {
                Name: 'Greater Than Or Equal To',
                Sign: '>='
            },
            {
                Name: 'Greater Than',
                Sign: '>'
            }
        ],
        date: [{
                Name: 'Equals',
                Sign: '='
            },
            {
                Name: 'Less Than',
                Sign: '<'
            },
            {
                Name: 'Less Than Or Equal To',
                Sign: '<='
            },
            {
                Name: 'Greater Than Or Equal To',
                Sign: '>='
            },
            {
                Name: 'Greater Than',
                Sign: '>'
            }
        ]
    };

    function ClearQueryItems() {
        QueryItems = [];
        $('.joinDDLClass').remove();
        $('.advancedRow').remove();
        $('#advancedCount').html('');
    }

    function InitAdvancedQuery() {
        let $advancedTreeview = $('#advancedTreeview');
        let $advancedQueryTarget = $('#advancedQueryTarget');
        let $dropPrompt = $advancedQueryTarget.find('#dropPrompt');
        let $advancedCount = $('#advancedCount');
        let $btnAdvancedSubmit = $('#btnAdvancedSubmit');
        let resultCount = 0;

        let DataItemSelected = null;

        $dropPrompt.hide();

        let areaQFields = [{
            Name: 'Area',
            ShortName: 'Area',
            expanded: false,
            items: [{
                    FieldName: 'COUNTY',
                    Name: 'County',
                    ShortName: 'County',
                    Type: 'string'
                },
                {
                    FieldName: 'LEGDIST',
                    Name: 'Legislative District',
                    ShortName: 'Legislative District',
                    Type: 'string'
                },
                {
                    FieldName: 'CONDIST',
                    Name: 'Congressional District',
                    ShortName: 'Congressional District',
                    Type: 'string'
                },
                {
                    FieldName: 'UNIFIED_DIST',
                    Name: 'Unified School District',
                    ShortName: 'Unified School District',
                    Type: 'string'
                },
                {
                    FieldName: 'SEC_DIST',
                    Name: 'Secondary School District',
                    ShortName: 'Secondary School District',
                    Type: 'string'
                },
                {
                    FieldName: 'ELEM_DIST',
                    Name: 'Elementary School District',
                    ShortName: 'Elementary School District',
                    Type: 'string'
                },
                {
                    FieldName: 'TRACTCE',
                    Name: 'Tract',
                    ShortName: 'Tract',
                    Type: 'string'
                },
                {
                    FieldName: 'BLKGRPCE',
                    Name: 'Block Group',
                    ShortName: 'Block Group',
                    Type: 'string'
                },
                {
                    FieldName: 'SQMI',
                    Name: 'Square Miles',
                    ShortName: 'Square Miles',
                    Type: 'number'
                }
            ]
        }];

        let fieldDataSource = new kendo.data.HierarchicalDataSource({
            data: areaQFields.concat(app.mapsConfig)
        });

        var treeView = $advancedTreeview.kendoTreeView({
            dataSource: fieldDataSource,
            dataTextField: ['ShortName']
        });

        $advancedTreeview.on('dblclick', function (e) {
            var treeView = $advancedTreeview.data('kendoTreeView');
            var dataItem = treeView.dataItem(e.target);
            DataItemSelected = dataItem;
            if (dataItem !== undefined) {
                if (dataItem.ShortName) {
                    AddRow(dataItem);
                }
            }
        });

        $advancedTreeview.kendoDraggable({
            filter: '.k-in', //specify which items will be draggable
            hint: function (element) {
                //create a UI hint, the `element` argument is the dragged item
                return element.clone().css({
                    opacity: 0.4,
                    padding: '5px',
                    cursor: 'move'
                });
            },
            dragstart: function (e) {
                var treeView = $advancedTreeview.data('kendoTreeView');
                var dataItem = treeView.dataItem(e.currentTarget);
                DataItemSelected = dataItem;

                if (dataItem.Type !== undefined) {
                    $advancedQueryTarget.css('backgroundColor', 'grey');
                    $advancedQueryTarget.children().hide();
                    $dropPrompt.show();
                    $(this).addClass('k-add');
                }
            },
            dragend: function (e) {
                $advancedQueryTarget.css('backgroundColor', 'transparent');
                $advancedQueryTarget.children().show();
                $dropPrompt.hide();
            }
        });

        $advancedQueryTarget.kendoDropTarget({
            dragenter: function (e) {
                if (DataItemSelected.Type !== undefined) {
                    e.draggable.hint.css('opacity', 1);
                    $advancedQueryTarget.css('backgroundColor', 'darkgrey');
                }
            },
            dragleave: function (e) {
                if (DataItemSelected.Type !== undefined) {
                    e.draggable.hint.css('opacity', 0.5);
                    $advancedQueryTarget.css('backgroundColor', 'grey');
                }
            },
            drop: OnDrop
        });

        $('body').on('click', '.removeRowBtn', function () {
            var str = $(this)
                .parents('div:first')[0]
                .innerText.toString();
            var fieldName = str.substring(0, str.indexOf(':'));
            var nextDropdown = $(this)
                .parent()
                .parent()
                .nextAll('.joinDDLClass:first');

            if (nextDropdown.length > 0) {
                nextDropdown.remove();
            } else {
                $(this)
                    .parent()
                    .parent()
                    .prevAll('.joinDDLClass:first')
                    .remove();
            }

            //remove row
            $(this)
                .parents('div:first')
                .remove();

            //update array
            $.each(QueryItems, function (index, queryItem) {
                if (queryItem.name === fieldName) {
                    QueryItems.splice(index, 1);
                    return false;
                }
            });
            VerifyQuery();
            return false;
        });

        $('body').on('click', '.clearRowBtn', function () {
            var selector = $(this).parents('div:first')[0].id;
            var textBoxes = $('#' + selector + ' .style1');
            $.each(textBoxes, function (index, textBox) {
                var tb = $(textBox).data('kendoNumericTextBox');
                if (tb) {
                    tb._old = tb._value;
                    tb._value = null;
                    tb._text.val(tb._value);
                    tb.element.val(tb._value);
                }
            });
            VerifyQuery();
            return false;
        });

        $btnAdvancedSubmit.click(submitQuery);

        // treeView.data('kendoTreeView').expand('li:first');

        function OnDrop(e) {
            AddRow(DataItemSelected);
        }

        function submitQuery() {
            if (resultCount === 0) {
                alert('0 block groups meet your current criteria.  Please refine your query and try again.');
            } else if (resultCount > 500) {
                let answer = window.confirm(
                    `You have selected ${resultCount} block groups.  It may take some time to generate this report.  Are you sure you wish to proceed?`
                );
                if (answer) {
                    RunQuery();
                }
            } else {
                RunQuery();
            }
        }

        /**
            Method for executing the constructed query.
            @method runQuery
            **/
        function RunQuery() {
            let q = {
                where: BuildQueryString(),
                returnGeometry: false,
                outFields: ['GEOID']
            };

            let qt = new QueryTask({
                url: app.config.mainUrl + '/0'
            });

            qt.execute(q).then(function (res) {
                let geoids = [];

                res.features.forEach(feature => {
                    geoids.push(feature.attributes['GEOID']);
                });

                app.GetData(app.config.layerDef['blockGroups'], geoids).then(function (data) {
                    var acsdata = app.summarizeFeatures(data.acsData);
                    var censusdata = app.summarizeFeatures(data.censusData);

                    app.selectedReport.acsData = {
                        features: [{
                            attributes: acsdata,
                            count: data.acsData.features.length,
                            ids: data.acsData.features.map(feature => feature.attributes["GEOID"])
                        }]
                    };

                    app.selectedReport.censusData = {
                        features: [{
                            attributes: censusdata,
                            count: data.acsData.features.length,
                            ids: data.censusData.features.map(feature => feature.attributes["GEOID"])
                        }]
                    };
                    tp.publish('open-report-window', app.selectedReport, 'acs');
                    app.AddHighlightGraphics(data.acsData.features, true);
                    $('.reportFormArea').hide();
                });
            });
        }

        function BuildQueryString() {
            var queryString = '';
            for (var i = 0; i < QueryItems.length; i++) {
                var fieldName = QueryItems[i].fieldName;
                var join = $(QueryItems[i].join).val();
                if (QueryItems[i].type === 'number' || QueryItems[i].type === 'percent') {
                    var operator = $(QueryItems[i].operator).val();
                    var inputBoxes = $(QueryItems[i].id + ' input.style1.k-formatted-value.k-input');
                    var min = 0;
                    var max = QueryItems[i].maxVal;
                    var inputValue = 0;
                    if (inputBoxes.length > 1) {
                        if (inputBoxes[0].value) {
                            min = inputBoxes[0].value.replace(/,/g, '');
                            if (QueryItems[i].type === 'percent') {
                                min = min.replace('%', '');
                            }
                        }
                        if (inputBoxes[1].value) {
                            max = inputBoxes[1].value.replace(/,/g, '');
                            if (QueryItems[i].type === 'percent') {
                                max = max.replace('%', '');
                            }
                        }

                        if (i !== QueryItems.length - 1) {
                            queryString +=
                                '(' +
                                fieldName +
                                ' >= ' +
                                min +
                                ' AND  ' +
                                fieldName +
                                ' <= ' +
                                max +
                                ') ' +
                                join +
                                ' ';
                        } else {
                            queryString += '(' + fieldName + ' >= ' + min + ' AND  ' + fieldName + ' <= ' + max + ')';
                        }
                    } else {
                        if (inputBoxes[0]) {
                            if (inputBoxes[0].value) {
                                inputValue = inputBoxes[0].value.replace(/,/g, '');

                                if (QueryItems[i].type === 'percent') {
                                    inputValue = inputValue.replace('%', '');
                                    //inputValue = (inputValue/100);
                                }
                            }

                            if (QueryItems[i].type === 'number') {
                                if (inputValue === 0) {
                                    inputValue = 0.0001;
                                }
                            }

                            if (i !== QueryItems.length - 1) {
                                queryString += '(' + fieldName + ' ' + operator + ' ' + inputValue + ') ' + join + ' ';
                            } else {
                                queryString += '(' + fieldName + ' ' + operator + ' ' + inputValue + ') ';
                            }
                        }
                    }
                } else if (QueryItems[i].type === 'string') {
                    var dropdownValue = $(QueryItems[i].strDDL).val();
                    if (i !== QueryItems.length - 1) {
                        queryString += '(' + fieldName + " = '" + dropdownValue + "') " + join + ' ';
                    } else {
                        queryString += '(' + fieldName + " = '" + dropdownValue + "') ";
                    }
                }
            }
            if (queryString === '' || queryString.indexOf('null') > -1) {
                queryString = '1=1';
            }
            return queryString;
        }

        /**
            Method for executing the constructed query.

            @method verifyQuery
            **/
        function VerifyQuery() {
            var queryString = BuildQueryString();

            let q = {
                where: queryString
            };

            let qt = new QueryTask({
                url: app.config.mainUrl + '/0'
            });

            qt.executeForCount(q).then(function (count) {
                $advancedCount.text(count).show();
                resultCount = count;
            });
        }

        function OnChange(e) {
            var item = $('#' + e.sender.element[0].id).parent();
            var selector = item
                .parent()
                .parent()[0]
                .id.toString();
            var hiddenData = $('#' + selector + ' .hiddenFld')[0];
            var type = hiddenData.value;
            var maxValue = hiddenData.placeholder;
            var dataItem = this.dataItem(e.item);

            $(item)
                .siblings('.style1')
                .remove();
            if (dataItem.Sign !== 'between') {
                $('<input class="style1" placeholder="value"></input>').insertAfter(item);
            } else {
                $(
                    '<input class="style1" placeholder="min"></input><input placeholder="max" class="style1"></input>'
                ).insertAfter(item);
            }

            if (type === 'percent') {
                $('#' + selector + ' .style1').kendoNumericTextBox({
                    spinners: false,
                    min: 0,
                    max: 100,
                    format: '# \\%',
                    change: VerifyQuery
                });
                maxValue = 100;
            } else {
                $('#' + selector + ' .style1').kendoNumericTextBox({
                    spinners: false,
                    min: 0,
                    max: maxValue,
                    format: 'n0',
                    decimals: 1,
                    change: VerifyQuery
                });
            }
            VerifyQuery();
        }

        function AddRow(dataItem) {
            var count = QueryItems.length + 1;
            var target = $advancedQueryTarget;

            if (dataItem.Type !== undefined) {
                if (count > 1) {
                    target.append("<select class='joinDDLClass' id='joinDDL" + count + "'></select>");

                    var joinDropDown = $('#joinDDL' + count).kendoDropDownList({
                        dataSource: [{
                                name: 'AND'
                            },
                            {
                                name: 'OR'
                            }
                        ],
                        dataTextField: 'name',
                        dataValueField: 'name',
                        value: 'AND',
                        change: VerifyQuery
                    });
                }
                var queryItem = {};

                if (dataItem.Type === 'number' || dataItem.Type === 'percent') {
                    if (dataItem.Type === 'percent') {
                        dataItem.FieldName = '((' + dataItem.FieldName + ' / ' + dataItem.NormalizeField + ') * 100)';
                    }

                    target.append(`
                        <div class="advancedRow k-header" id="${dataItem.uid}${count}">
                        <input class="hiddenFld" type="hidden" value="${dataItem.Type}" placeholder="${
                        dataItem.Placeholder
                    }"><span class="queryItem">${
                        dataItem.ShortName
                    }: </span><span class="inputBoxes"><select class="operatorDDL" id="operatorDDL${count}"></select>
                        <input class="style1" placeholder="min"></input>
                        <input placeholder="max" class="style1"></input>
                        <button title="Remove row" class="btn removeRowBtn"><i class="fas fa-trash"></i></button>
                        <button title="Clear Row" class="btn clearRowBtn"><i class="fas fa-times-circle"></i></button></span>
                        </div>`);

                    var operatorDropDown = $('#operatorDDL' + count).kendoDropDownList({
                        dataSource: CompareOperators.number,
                        dataTextField: 'Name',
                        dataValueField: 'Sign',
                        index: 0,
                        change: OnChange
                    });

                    var selector = dataItem.uid.toString() + count;

                    var maxValue = dataItem.Placeholder;

                    if (dataItem.Type === 'percent') {
                        $('#' + selector + ' .style1')
                            .kendoNumericTextBox({
                                spinners: false,
                                min: 0,
                                max: 100,
                                format: '# \\%',
                                change: VerifyQuery
                            })
                            .data('kendoNumericTextBox');
                        maxValue = 100;
                    } else {
                        $('#' + selector + ' .style1')
                            .kendoNumericTextBox({
                                spinners: false,
                                min: 0,
                                format: 'n0',
                                decimals: 1,
                                max: maxValue,
                                change: VerifyQuery
                            })
                            .data('kendoNumericTextBox');
                    }
                    queryItem = {
                        id: '#' + dataItem.uid + count,
                        operator: '#operatorDDL' + count,
                        join: '#joinDDL' + (count + 1),
                        fieldName: dataItem.FieldName,
                        name: dataItem.ShortName,
                        maxVal: maxValue,
                        type: dataItem.Type,
                        strDDL: ''
                    };
                } else {
                    target.append(`
                        <div class="advancedRow k-header" id="${dataItem.uid}${count}">
                        <span class="queryItem">${dataItem.ShortName}: </span>
                        <span class="inputBoxes">
                            <select class="strMultiselect" id="strMS${count}"></select>
                            <button title="Remove row" class="btn removeRowBtn"><i class="fas fa-trash"></i></button>
                        </span>
                        </div>`);

                    queryItem = {
                        id: '#' + dataItem.uid + count,
                        operator: '#operatorDDL' + count,
                        join: '#joinDDL' + (count + 1),
                        fieldName: dataItem.FieldName,
                        name: dataItem.ShortName,
                        maxVal: dataItem.Placeholder,
                        type: dataItem.Type,
                        strDDL: '#strMS' + count
                    };

                    let qt = new QueryTask({
                        url: app.config.mainUrl + '/0'
                    });

                    qt.execute({
                        returnGeometry: false,
                        outFields: [dataItem.FieldName],
                        orderByFields: [dataItem.FieldName],
                        returnDistinctValues: true,
                        where: '1=1'
                    }).then(function (res) {
                        let ddlSrc = res.features.reduce((ddlSrc, f) => {
                            if (f.attributes[dataItem.FieldName]) {
                                ddlSrc.push(f.attributes[dataItem.FieldName]);
                            }
                            return ddlSrc;
                        }, []);

                        $('#strMS' + count).kendoDropDownList({
                            dataSource: ddlSrc,
                            change: VerifyQuery
                        });
                        VerifyQuery();
                    });
                }
                QueryItems.push(queryItem);
                VerifyQuery();
            }
        }
    }
});
