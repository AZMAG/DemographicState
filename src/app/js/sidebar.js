//This file includes all of the code and logic for controlling the side/bottom navigation bar
"use strict";
define([
        "mag/config/initConfig",
        "mag/utilities",
        "magcore/utils/formatter",
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (
        initConfig,
        utilities, 
        formatter,       
        tp
        ) {

        tp.subscribe("layers-added", function() {

            let $sidebar = $("#sidebar");
            let $sidebarCollapse = $("#sidebarCollapse");

            let $links = $(".components li");
            let $arrows = $(".arrow-left");
            let $panelDivs = $(".panelDiv");
            let $content = $("#content");
            let $legendToggle = $(".legendToggle");

            $(".sidebarCollapse").on("click", function() {
                $sidebar.toggleClass("active");
                $sidebarCollapse.toggleClass("active");
            });

            tp.subscribe("toggle-panel", TogglePanel);

            let loadedLayers = [];

            function TogglePanel(target, e) {
                $("#viewDiv").css("visibility", "visible");
                $("#navContainer").css("flex", "1");
                if (target === "legend") {
                    toggleLegend();
                } else if (target === "share") {
                    if ($content.is(":visible") && window.outerWidth < 780) {
                        $("#navContainer").css("flex", "none");
                        $("#viewDiv").css("visibility", "hidden");
                    }
                } else {
                    let isActive = $(e).hasClass("active");
                    $links.removeClass("active");
                    $arrows.hide();
                    $panelDivs.hide();
                    utilities.clearDrawnGraphics();

                    if (isActive) {
                        $content.hide();
                        // tp.publish("panel-hidden", target);
                    } else {
                        tp.publish("panel-shown", target);

                        $(".shareWidget").popover("hide");
                        $content.show();
                        var $allLinks = $(`[panel-target=${target}]`);

                        $allLinks.addClass("active");
                        $allLinks.find(".arrow-left").show();

                        if (window.outerWidth < 780) {
                            $("#viewDiv").css("visibility", "hidden");
                            $("#navContainer").css("flex", "none");
                            $allLinks.find(".arrow-left").hide();
                        }

                        if (loadedLayers.indexOf(target) === -1) {
                            loadedLayers.push(target);
                        }

                        $(`div[panel-id=${target}]`).fadeIn(400);
                    }
                }
            }

            $links.on("click", function(e) {
                e.preventDefault();
                let target = $(this).attr("panel-target");

                // <!-- comments:uncomment // -->
                // ga("send", "event", "Click", "Panel Opened", target);
                // <!-- endcomments -->
                TogglePanel(target, this);
            });

            $legendToggle.click(function(e) {
                return false;
            });

            $("#content").on("click", ".closePanel", function() {
                let pandelId = $(this).closest(".panelDiv").attr("panel-id");
                $("#viewDiv").css("visibility", "visible");
                $("#navContainer").css("flex", 1);
                $links.removeClass("active");
                $arrows.hide();
                $panelDivs.hide();
                $content.hide();
                utilities.clearDrawnGraphics();
                tp.publish("panel-hidden", pandelId);
            });

            function toggleLegend() {
                if (window.innerWidth < 768) {
                    $("#content").hide();
                    $(".components li").removeClass("active");
                }
                $("#legend").fadeToggle();
                $legendToggle.prop("checked", !$legendToggle.prop("checked"));
            }
            if (initConfig.getPanel()) {
                TogglePanel(initConfig.getPanel());
            }

            let initReport = formatter.qs("bgid");
            if (initReport) {
                TogglePanel("reports-view");
                tp.publish('openReport-by-geoids', app.config.layerDef['blockGroups'], [initReport]);
            }


            $(window).resize(function() {
                $("#legend").css({
                    left: "",
                    top: ""
                });
                if (window.outerWidth < 768 && $("#content").is(":visible") === true) {
                    $("#viewDiv").css("visibility", "visible");
                    $("#navContainer").css("flex", "none");
                } else if (window.outerWidth > 768 && $("#content").is(":visible") === true) {
                    $("#navContainer").css("flex", 1);
                }
            });
        });
    }
);