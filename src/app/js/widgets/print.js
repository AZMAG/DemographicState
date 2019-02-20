"use strict";
require([
    "dojo/topic",
    "esri/widgets/Print/PrintViewModel"
], function (
    tp,
    PrintVM
) {
    let $printWidget = $("#printWidget");
    let $printWidgetModal = $("#printWidgetModal");

    tp.subscribe("widget-basemapToggle-loaded", function () {
        let $printForm = $("#printForm");
        let $formInputs = $("#printForm :input");
        let $printMapTitle = $("#printMapTitle");
        let $printMapNotes = $("#printMapNotes");
        let $printMapLayout = $("#printMapLayout");
        let $printMapFormat = $("#printMapFormat");
        let $printLoader = $("#printLoader");
        let $printResult = $("#printResult");

        let printVM = new PrintVM({
            printServiceUrl: app.config.printUrl,
            updateDelay: 300,
            view: app.view
        });

        app.view.ui.add($printWidget[0], "bottom-right");

        $printWidget.click(function () {
            SetupPrintForm();
        })


        $printForm.submit(async function (e) {
            e.preventDefault();
            let q = GetFormData();

            //Disable form
            $formInputs.prop("disabled", true);
            $printLoader.show();
            $printResult.hide();

            let res = await printVM.print(q);

            //Try to open the link in a new window
            window.open(res.url, '_blank');

            $printResult.attr("href", res.url);
            $printResult.show();

            //Re-enable form
            $formInputs.prop("disabled", false);
            $printLoader.hide();
        });



        function GetFormData() {
            let currentMap = app.GetActiveMapData();
            let data = {
                layoutOptions: {
                    titleText: $printMapTitle.val(),
                    notes: $printMapNotes.val(),
                    scalebarUnit: "Miles",
                    copyrightText: "<copyright info here>",
                    authorText: "Made by:  MAG GIS Group",
                    customTextElements: [{
                        txtLegendHeader: `${currentMap.category} - ${currentMap.Name}\n<_BOL>${app.config.LegendSource}</_BOL>`
                    }, {
                        txtComments: $printMapNotes.val()
                    }]
                },
                exportOptions: {
                    dpi: 96
                },
                layout: $printMapLayout.find(":selected").val(),
                format: $printMapFormat.find(":selected").val()
            }
            return data;
        }

        let printInit = false;

        async function InitializePrintForm() {
            if (!printInit) {
                $.getJSON(app.config.printUrl + "/?f=pjson", function (data, textStatus, jqXHR) {
                    //Setup Layout List
                    let printMapLayoutOptions = data.parameters[3].choiceList.map(choice => {
                        if (!choice.includes('MAP_ONLY')) {
                            return `<option value="${choice}">${choice}</option>`;
                        }
                    });

                    let currentMap = app.GetActiveMapData();
                    $printMapTitle.val(`${currentMap.category} - ${currentMap.Name}`);
                    $printMapLayout.html(printMapLayoutOptions);
                    printInit = true;
                    return true;
                });
            }
        }

        async function SetupPrintForm() {
            await InitializePrintForm();
            $printForm[0].reset();
            $printWidgetModal.modal("show");
        }

        tp.publish("widget-print-loaded");
    });
});
