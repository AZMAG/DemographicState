"use strict";
require(["esri/widgets/Zoom/ZoomViewModel", "dojo/topic", "dojo/domReady!"], function (ZoomViewModel, tp) {
    tp.subscribe("map-loaded", function () {
        //Zoom
        const zoomId = "zoomWidget";
        let zoomVM = new ZoomViewModel({
            view: app.view
        });
        app.view.ui.add(zoomId, "bottom-right");

        let $zoomArea = $("#" + zoomId);
        $zoomArea.on("click", ".esri-widget--button", function () {
            const direction = $(this).data("id");
            if (direction === "In") {
                zoomVM.zoomIn();
            } else {
                zoomVM.zoomOut();
            }
        });

        let $zoomOutBtn = $zoomArea.find("#zoomOutBtn");
        app.view.watch("zoom", function (zoom) {
            if (zoom === 7) {
                $zoomOutBtn.addClass("disabled");
            } else {
                $zoomOutBtn.removeClass("disabled");
            }
        });
        tp.publish("widget-zoom-loaded");
    });
});
