"use strict";
require(["dojo/topic", "esri/tasks/QueryTask"], function (tp, QueryTask) {
    let $share = $(".shareWidget");

    let oldUrl = "";

    tp.subscribe("layers-added", function () {

        GetSmallShareLink().then(function (url) {
            ShareWidgetInit(url);
        });

        function ShareWidgetInit(url) {
            if (url) {
                oldUrl = url;
            } else {
                url = oldUrl;
            }

            let baseUrl = "https://twitter.com/intent/tweet";
            let text = "Arizona Demographics";
            let hashTag = "MAGmaps";
            let via = "MAGregion";

            let twitterHref = `${baseUrl}?text=${text}&url=${url}&hastag=${hashTag}&via=${via}`;
            let mailTo = `mailto:?subject=MAG Demographics&amp;body=%0A%0AHere is the map I made using Arizona Demographics:%0A%0A${url}%0A`;

            $share.attr(
                "data-content",
                `<div id="sharePopup">
    <div class="shareLinks">
        <ul>
            <li>
                <a id="EMshareButton" href="${mailTo}" title="MAG|Demographics">
                    <em class="fa fa-envelope"></em>
                </a>
            </li>
            <li>
                <a id="FBshareButton" title="Share on Facebook">
                    <em class="fab fa-facebook-f"></em>
                </a>
            </li>
            <li>
                <a href="${twitterHref}" id="TWshareButton" title="Share on Twitter">
                    <em class="fab fa-twitter"></em>
                </a>
            </li>
            <li>
                <a id="INshareButton" title="Share on LinkedIn">
                    <em class="fab fa-linkedin"></em>
                </a>
            </li>
        </ul>
        <div class="flexCenter">
            <input readonly id="bitlyUrlInput" class="linkReplace" style="width: 90%;" value="${url}">
            <button data-toggle="tooltip" data-trigger="click hover" data-placement="auto" title="Click to copy link to clipboard"
                id="shareLinkCopy">
                <i class="far fa-copy"></i>
            </button>
        </div>
    </div>
</div>`
            );

            $("#shareLinkCopy").tooltip();

            $("body").on("click", "#shareLinkCopy", function () {
                $("#bitlyUrlInput").select();
                document.execCommand("copy");
                window.getSelection().removeAllRanges();
                let tt = $(this);
                tt.attr("data-original-title", "Link copied to clipboard").tooltip("show");
                setTimeout(function () {
                    tt.attr("data-original-title", "Click to copy link to clipboard").tooltip("hide");
                }, 1500);
            });

            $share.off("show.bs.popover").on("show.bs.popover", function () {
                let $shareLinkCopy = $("#shareLinkCopy");
                $shareLinkCopy.tooltip();
                // $("#sharePopup").html("<span>loading...</span>");
                GetSmallShareLink().then(function (url) {
                    console.log(url);

                    $("#bitlyUrlInput").val(url);
                    ShareWidgetInit(url);
                });
            });

            $share.popover({
                html: true
            });

            !(function (d, s, id) {
                var js,
                    fjs = d.getElementsByTagName(s)[0],
                    p = /^http:/.test(d.location) ? "http" : "https";
                if (!d.getElementById(id)) {
                    js = d.createElement(s);
                    js.id = id;
                    js.src = p + "://platform.twitter.com/widgets.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }
            })(document, "script", "twitter-wjs");

            //LinkedIn
            $(document).on("click", "#INshareButton", function () {
                window.open(
                    `https://www.linkedin.com/shareArticle?url=${url}`,
                    "shareLinkedIn",
                    "width=650, height=700"
                );
            });

            // facebook
            //share dialog - use on("click") for it to work afte loading html
            $(document).on("click", "#FBshareButton", function () {
                FB.ui({
                        method: "share",
                        mobile_iframe: true,
                        href: "https://geo.azmag.gov/maps/azdemographics/"
                    },
                    function (response) {}
                );
            });

            window.fbAsyncInit = function () {
                FB.init({
                    appId: "929950963769905",
                    cookie: true,
                    xfbml: true,
                    version: "v2.12"
                });
            };

            (function (d, s, id) {
                var js,
                    fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            })(document, "script", "facebook-jssdk");
        }

        function GetVisibleLayers() {
            let rtnArr = [];
            app.map.layers.items.forEach((lyr) => {
                if (lyr.visible) {
                    rtnArr.push(lyr.id);
                }
            });
            return rtnArr;
        }

        function GetRoundedExtent() {
            let e = app.view.extent;
            return {
                spatialReference: {
                    wkid: 102100
                },
                xmax: Math.floor(e.xmax),
                xmin: Math.floor(e.xmin),
                ymax: Math.floor(e.ymax),
                ymin: Math.floor(e.ymin)
            };
        }

        function GetActivePanel() {
            return $(".components li.active").attr("panel-target");
        }

        function GetTransparency() {
            const layer = app.map.findLayerById("blockGroups");
            return layer.opacity;
        }

        async function GetBigShareLink() {
            let shareObj = await GetShareObject();
            let queryString = "?init=" + encodeURIComponent(JSON.stringify(shareObj));
            return location.origin + location.pathname + queryString;
        }

        async function GetSmallShareLink() {
            return new Promise(async function (resolve, reject) {
                let longUrl = await GetBigShareLink();
                $.getJSON("https://api-ssl.bitly.com/v3/shorten?callback=?", {
                        format: "json",
                        login: app.config.bitly.login,
                        apiKey: app.config.bitly.apiKey,
                        longUrl: longUrl
                    },
                    function (res) {
                        resolve(res.data.url);
                    }
                );
            });
        }

        function GetLegendStatus() {
            return !$("#legendDiv").is(":hidden");
        }

        async function GetShareObject() {
            return app.GetCurrentMapsParams().then(function (mapData) {
                let exportObj = {
                    extent: GetRoundedExtent(),
                    panel: GetActivePanel(),
                    legend: GetLegendStatus(),
                    mapData: {
                        classType: mapData.classType,
                        rampKey: mapData.rampKey,
                        type: mapData.type,
                        FieldName: mapData.conf.FieldName,
                        breaks: mapData.classType === "Custom" ? mapData.cbInfos : []
                    },
                    basemap: app.map.basemap.id,
                    transparency: GetTransparency(),
                    visibleLayers: GetVisibleLayers(),
                    openReport: false
                }
                return exportObj;
            })
        }
    })
});
