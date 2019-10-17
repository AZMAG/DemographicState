"use strict";
require([
    "mag/maps/maps-utils",
    "dojo/topic"
], function (
    mapsutils,
    tp
) {
    let $printWidget = $("#printWidget");
    let $screenshotDiv = $("#screenshotDiv");

    tp.subscribe("widget-basemapToggle-loaded", function () {
        // add the button for drawing polygons underneath zoom buttons
        app.view.ui.add($printWidget[0], "bottom-right");

        let savedScreenshot;

        $printWidget.click(() => {
            app.view.takeScreenshot({
                format: "png",
                layers: [
                    mapsutils.map.findLayerById("blockGroups"),
                    mapsutils.map.findLayerById("streets"),
                    mapsutils.map.findLayerById("countyBoundaries")
                ]
            }).then((screenshot) => {
                savedScreenshot = screenshot;
                showPreview(screenshot);
            });
        });

        $screenshotDiv.find("button").click((e) => {
            if (e.target.id === "screenshotDownloadBtn") {
                downloadImage("Arizona Demographics Map");
            } else {
                returnToMap();
            }
        });

        async function prepImage(screenshot) {
            let screenSht = savedScreenshot;
            if (screenshot && screenshot.data) {
                screenSht = screenshot;
            }
            const imageData = screenSht.data;

            let mapData = mapsutils.GetActiveMapData();
            const title = mapData.Name;

            // to add the text to the screenshot we create a new canvas element
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.height = imageData.height;
            canvas.width = imageData.width;

            // add the screenshot data to the canvas
            ctx.putImageData(imageData, 0, 0);

            const headerHeight = 75;

            //Add black rectangle to the top of the image
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, imageData.width, headerHeight);

            //Add Title to top of image
            ctx.fillStyle = "#FFF";
            ctx.font = "40px Arial";

            ctx.fillText(title, (imageData.width / 2) - (ctx.measureText(title).width / 2), headerHeight * 0.7);

            $(".slidecontainer").hide();
            let legendCanvas = await html2canvas(document.querySelector("#legendDiv"));
            let legendWidth = legendCanvas.width;
            $(".slidecontainer").show();
            let padding = 20;
            ctx.drawImage(legendCanvas, imageData.width - legendWidth - padding, headerHeight + padding);

            return canvas.toDataURL();
        }


        async function downloadImage(filename) {
            let dataUrl = await prepImage();

            // the download is handled differently in Microsoft browsers
            // because the download attribute for <a> elements is not supported
            if (!window.navigator.msSaveOrOpenBlob) {

                // in browsers that support the download attribute
                // a link is created and a programmatic click will trigger the download
                const element = document.createElement("a");
                element.setAttribute("href", dataUrl);
                element.setAttribute("download", filename);
                element.style.display = "none";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            } else {
                // for MS browsers convert dataUrl to Blob
                const byteString = atob(dataUrl.split(",")[1]);
                const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], {
                    type: mimeString
                });

                // download file
                window.navigator.msSaveOrOpenBlob(blob, filename);
            }

        }

        function returnToMap() {
            $screenshotDiv.addClass("hide");
        }

        // creates an image that will be appended to the DOM
        // so that users can have a preview of what they will download
        async function showPreview(screenshot) {
            screenshot.dataUrl = await prepImage(screenshot);
            screenshotDiv.classList.remove("hide");
            // add the screenshot dataUrl as the src of an image element
            const screenshotImage = document.getElementsByClassName("js-screenshot-image")[0];
            screenshotImage.width = screenshot.data.width;
            screenshotImage.height = screenshot.data.height;
            screenshotImage.src = screenshot.dataUrl;
        }

        tp.publish("widget-print-loaded");

    });
});
