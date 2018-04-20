/**
 * Call the application bootstrapper when ready.
 * Load in view models and bind them to their views via Kendo binding.
 *
 * @module main
 */
define([
        "app/models/map-model",
        "app/vm/mapContainer-vm",
        "app/vm/panel-vm",
        "app/vm/help-vm",
        "app/vm/markupTools-vm",
        "app/vm/markupToolsLaunchbar-vm",
        "app/vm/helpLaunchbar-vm",
        "app/vm/printLaunchbar-vm",
        "app/vm/print-vm",
        "app/vm/contactLaunchbar-vm",
        "app/vm/contact-vm",
        "app/vm/demographic-vm",
        "app/vm/cbr-vm",
        "app/vm/cbrlaunchbar-vm",
        "app/vm/panelLaunchbar-vm",
        "app/vm/interactiveTools-vm",
        "app/vm/legendLaunchbar-vm",
        "app/vm/legend-vm",
        "app/vm/socialLaunchbar-vm",
        "app/vm/social-vm",
        "app/vm/alert1-vm",
        "app/vm/alert2-vm",
        "app/vm/legal-vm",
        "app/vm/search-vm",
        "app/vm/subscribe-vm",
        "app/config/demographicConfig",
        "app/config/searchConfig"
    ],

    function(
        mapModel,
        mapContainerVM,
        panelVM,
        helpVM,
        markupToolsVM,
        markupToolsBarVM,
        helpLaunchVM,
        printLaunchVM,
        printVM,
        contactLaunchVM,
        contactVM,
        demographicVM,
        cbrVM,
        cbrlBarVM,
        panelBarVM,
        interactiveToolsVM,
        legendBarVM,
        legendVM,
        socialLaunchVM,
        socialVM,
        alert1VM,
        alert2VM,
        legalVM,
        searchVM,
        subscribeVM,
        demographicConfig,
        searchConfig
    ) {
        $.get(appConfig.mainURL + "/?f=json", function(data) {
            $.each(JSON.parse(data).layers, function(key, layer) {
                Object.keys(demographicConfig.reports).forEach(function(confName) {
                    var conf = demographicConfig.reports[confName];
                    if ('Census10_' + conf.layerName === layer.name) {
                        conf["censusRestUrl"] = appConfig.mainURL + '/' + layer.id;
                    } else if ('ACS_' + conf.layerName === layer.name) {
                        conf["ACSRestUrl"] = appConfig.mainURL + '/' + layer.id;
                    }
                });
                for (var i = 0; i < appConfig.layerInfo.length; i++) {
                    var confObj = appConfig.layerInfo[i];
                    if ('ACS_' + confObj.layerName === layer.name) {
                        confObj["url"] = appConfig.mainURL + '/' + layer.id;
                        confObj["queryUrl"] = appConfig.mainURL + '/' + layer.id;
                        confObj["layers"] = [layer.id];
                    }
                }
            });
            searchConfig.init();

            mapModel.initialize();

            mapContainerVM.init();

            panelVM.init();
            kendo.bind($("#reportLauncher"), panelVM);

            helpVM.init();
            kendo.bind($("#helpWindow"), helpVM);

            subscribeVM.init();
            kendo.bind($("#subscribeWindow"), subscribeVM);

            demographicVM.init();
            kendo.bind($("#demographicView"), demographicVM);

            legendVM.init();
            kendo.bind($("#legendDiv"), legendVM);

            markupToolsVM.init("display", "after");

            printVM.init();
            kendo.bind($("#printWindow"), printVM);

            socialVM.init();
            kendo.bind($("#shareWindowDiv"), socialVM);

            alert1VM.init();
            kendo.bind($("#alert1Window"), alert1VM);

            alert2VM.init();
            kendo.bind($("#alert2Window"), alert2VM);

            legalVM.init();
            kendo.bind($("legalWindow"), legalVM);

            contactVM.init();
            kendo.bind($("contactsWindowDiv"), contactVM);

            cbrVM.init("display", "after");

            contactLaunchVM.init("menu-bar");
            kendo.bind($("#contactLaunchbar"), contactLaunchVM);

            helpLaunchVM.init("menu-bar");
            kendo.bind($("#helplaunchbar"), helpLaunchVM);

            socialLaunchVM.init("menu-bar");
            kendo.bind($("#sharelaunchbar"), socialLaunchVM);

            printLaunchVM.init("menu-bar");
            kendo.bind($("#printlaunchbar"), printLaunchVM);

            markupToolsBarVM.init("menu-bar");
            kendo.bind($("#mtlaunchbar"), markupToolsBarVM);

            panelBarVM.init("menu-bar");
            kendo.bind($("#rplaunchbar"), panelBarVM);

            legendBarVM.init("menu-bar");
            kendo.bind($("#leglaunchbar"), legendBarVM);

            cbrlBarVM.init("menu-bar");
            kendo.bind($("#cbrlaunchbar"), cbrlBarVM);

            searchVM.init("menu-bar");
            kendo.bind($("#searchView"), searchVM);

            interactiveToolsVM.init();
            kendo.bind($("#pnlInteractiveDiv"), interactiveToolsVM);
        });


    }
);
