require([
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (tp) {
        let $mapsList = $("#mapsList");
        let $classType = $("#classType");
        let $colorRamp = $("#colorRamp");
        let $rampType = $("#rampType");
        let $classBreaksCount = $("#classBreaksCount");
        let $colorRampModal = $("#colorRampModal");

        let $sequentialRamps = $("#sequentialRamps");
        let $divergingRamps = $("#divergingRamps");

        let configLookup = [];
        let counter = 0;

        function GetMapsHTML(items) {
            let rtnHTML = '';
            for (let i = 0; i < items.length; i++) {
                const conf = items[i];
                if (conf.items) {
                    rtnHTML +=
                        `
                        <div class="categoryItem">
                            <span class="expandBtn"><i class="fas fa-caret-right"></i></span>
                            <span>${conf.Name}</span>
                        </div>
                        <div class="mapSubItemList" style="display:none;">${GetMapsHTML(conf.items)}</div>
                        `
                } else {
                    rtnHTML += `<div class="mapItem" data-lookup-id="${counter}">${conf.Name}</div>`;
                    configLookup.push(conf);
                    counter++;
                }
            }
            return rtnHTML;
        }

        $mapsList.append(GetMapsHTML(app.mapsConfig));

        $mapsList.find(".mapSubItemList").first().show().find(".mapItem").first().addClass("activeMapItem");
        $mapsList.find(".fa-caret-right").first().toggleClass("fa-caret-right fa-caret-down");

        // $mapsList.find(".expandBtn").click(function () {
        //     $(this).parent().next().toggle();
        //     let $icon = $(this).find("i");
        //     $icon.toggleClass("fa-caret-right fa-caret-down");
        // });

        $("#mapsListToggle").click(function () {
            var btnStatus = $(this).data("status");

            if (btnStatus === "expand") {
                $(this).text("Collapse All");
                $(this).data("status", "collapse");
                $mapsList.find(".mapSubItemList").show()
                $mapsList.find(".fa-caret-right").removeClass("fa-caret-right").addClass("fa-caret-down");
            } else {
                $(this).text("Expand All");
                $(this).data("status", "expand");
                $mapsList.find(".mapSubItemList").hide()
                $mapsList.find(".fa-caret-down").removeClass("fa-caret-down").addClass("fa-caret-right");
            }
        })

        $mapsList.find(".categoryItem").click(function () {
            let $clickedSubList = $(this).next();
            let isVisible = $clickedSubList.is(":visible");

            let hasParent = $(this).closest(".mapSubItemList");

            if (hasParent.length === 0) {
                console.log(hasParent);

                // Resets all other categories
                // $mapsList.find(".categoryItem").css("background-color", "");
                $mapsList.find(".mapSubItemList").slideUp(50);
                $mapsList.find(".fa-caret-down").removeClass("fa-caret-down").addClass("fa-caret-right");
            } else {
                if (!isVisible) {
                    $clickedSubList.slideDown(100);
                    let $icon = $(this).find("i");
                    $icon.toggleClass("fa-caret-right fa-caret-down");
                } else {

                }
            }

            if (!isVisible) {
                $clickedSubList.slideDown(100);
                let $icon = $(this).find("i");
                $icon.toggleClass("fa-caret-right fa-caret-down");
            }

            // $(this).css("background-color", "blue");
        });

        $mapsList.find(".mapItem").click(function () {
            $mapsList.find(".activeMapItem").removeClass("activeMapItem");
            $(this).addClass("activeMapItem");
            UpdateMapRenderer();
        });

        $colorRamp.click(function () {
            $sequentialRamps.html(GetRampsHTMLByType("Sequential"));
            $divergingRamps.html(GetRampsHTMLByType("Diverging"));
            $colorRampModal.modal('show');
        });

        $("#selectionRamps").on("click", ".cRamp", function () {
            $colorRampModal.modal('hide');
            $colorRamp.html($(this)[0].outerHTML);
            UpdateMapRenderer();
        });

        $rampType.change(function () {
            $sequentialRamps.toggle();
            $divergingRamps.toggle();
        });

        $classType.change(function () {
            UpdateMapRenderer();
        });

        $classBreaksCount.change(function () {
            UpdateMapRenderer();
        });

        function GetColorRamp(type, rampKey, numBreaks) {
            const ramps = GetRampsByNumAndType(type, numBreaks);
            return ramps[rampKey];
        }

        function GetRampsByNumAndType(type, numBreaks) {
            let classBreakSet = app.colorRampConfig[type]["ClassBreakSets"][numBreaks];
            let allRamps = app.colorRampConfig[type]["ColorRamps"];
            let returnRamps = {};

            Object.keys(allRamps).forEach(function (rampKey) {
                let ramp = allRamps[rampKey];
                let filteredRamp = [];

                Object.keys(ramp).forEach(function (letterKey) {
                    if (classBreakSet.indexOf(letterKey) > -1) {
                        filteredRamp.push(ramp[letterKey]);
                    }
                });
                returnRamps[rampKey] = filteredRamp;
            });
            return returnRamps;
        }

        function GetSelectedConfig() {
            let $activeItem = $mapsList.find(".activeMapItem");
            if ($activeItem) {
                let luID = $activeItem.data("lookup-id");
                let conf = configLookup[luID];
                return conf;
            }
        }

        function GetRampsHTMLByType(type) {
            let rampsHtml = ''
            let numBreaks = $classBreaksCount.val();
            let ramps = GetRampsByNumAndType(type, numBreaks);

            Object.keys(ramps).forEach(function (key) {
                const ramp = ramps[key];
                let html = ColorRampToHTML(ramp, key, type);
                rampsHtml += html;
            });
            return rampsHtml;
        }

        function UpdateMapRenderer() {
            let cbInfos = [];
            let conf = GetSelectedConfig() || configLookup[0];

            let numBreaks = $classBreaksCount.val() || 5;
            let breaksType = $classType.val() || "Jenks";
            let rampKey = $colorRamp.find(".cRamp").data("id") || conf.DefaultColorRamp;
            let type = $colorRamp.find(".cRamp").data("type") || conf.DefaultColorScheme;

            let breaks = conf.breaks[breaksType + numBreaks];
            let colorRamp = GetColorRamp(type, rampKey, numBreaks);
            UpdateColorRampControl(colorRamp, rampKey, type);

            for (let i = 0; i < breaks.length - 1; i++) {
                const min = breaks[i];
                const max = breaks[i + 1];

                let minLabel = min;
                let maxLabel = max;

                if (conf.Type === "percent") {
                    minLabel = Math.round(minLabel * 1000) / 10 + "%";
                    maxLabel = Math.round(maxLabel * 1000) / 10 + "%";
                } else if (conf.Type === "number") {
                    minLabel = Math.round(minLabel).toLocaleString('en-US');
                    maxLabel = Math.round(maxLabel).toLocaleString('en-US');
                }

                cbInfos.push({
                    minValue: min,
                    maxValue: max,
                    symbol: {
                        type: "simple-fill",
                        color: colorRamp[i]
                    },
                    label: `${minLabel} - ${maxLabel}`
                })
            }
            let renderer = {
                type: "class-breaks",
                field: conf.FieldName,
                normalizationField: conf.NormalizeField,
                classBreakInfos: cbInfos,
                legendOptions: {
                    title: conf.ShortName
                }
            };
            let layer = app.map.findLayerById("blockGroups").findSublayerById(0);
            layer.renderer = renderer;
        }

        function ColorRampToHTML(ramp, rampKey, rampType) {
            let html = `<div data-type="${rampType}" data-id="${rampKey}" class="cRamp">`;
            for (let i = 0; i < ramp.length; i++) {
                const rampColor = ramp[i];
                html += `<div style="background-color:rgb(${rampColor})" class="colorRampSquare"></div>`
            }
            return html += "</div>";
        }

        function UpdateColorRampControl(newRamp, rampKey, type) {
            $colorRamp.html(ColorRampToHTML(newRamp, rampKey, type));
        }

        tp.subscribe("layers-added", function () {
            UpdateMapRenderer();
        });
    })
