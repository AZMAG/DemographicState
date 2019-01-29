require([
    // "esri/views/2d/draw/Draw",
    // "esri/Graphic",
    "dojo/topic"
], function (
    // Draw,
    // Graphic,
    tp
) {
    let $printWidget = $("#printWidget");
    let $screenshotDiv = $("#screenshotDiv");

    tp.subscribe("widget-home-loaded", function () {
        // add the button for drawing polygons underneath zoom buttons
        app.view.ui.add($printWidget[0], "bottom-right");

        let savedScreenshot;

        $printWidget.click(() => {
            app.view.takeScreenshot({
                format: "png"
            }).then((screenshot) => {
                console.log(screenshot)
                savedScreenshot = screenshot;
                showPreview(screenshot);
            })
        })

        $screenshotDiv.find('button').click((e) => {
            if (e.target.id == 'screenshotDownloadBtn') {
                downloadImage('Arizona Demographics Map', savedScreenshot.dataUrl);
            } else {
                returnToMap();
            }
        })

        function downloadImage(filename, dataUrl) {

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
                const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0]
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
        function showPreview(screenshot) {
            screenshotDiv.classList.remove("hide");
            // add the screenshot dataUrl as the src of an image element
            const screenshotImage = document.getElementsByClassName("js-screenshot-image")[0];
            screenshotImage.width = screenshot.data.width;
            screenshotImage.height = screenshot.data.height;
            screenshotImage.src = screenshot.dataUrl;
        }

        tp.publish('widget-print-loaded');

    });
});
