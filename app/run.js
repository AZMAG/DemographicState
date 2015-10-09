/**
 * Load application requirements and set the Esri proxy
 *
 * @module run
 */

function init() {

    esri.config.defaults.io.proxyUrl = "proxy.ashx";
    esri.config.defaults.io.alwaysUseProxy = false;

    require([
            "dojo/parser",
            "dijit/layout/BorderContainer",
            "dijit/layout/ContentPane",
            "app"
        ],

        function(parser) {
            parser.parse();
        }
    );
}