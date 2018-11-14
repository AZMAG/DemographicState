require([
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (tp) {

        let $customClassBreaksModal = $("#customClassBreaksModal");
        let $classBreakSliders = $("#classBreakSliders");
        let $classBreakSliderTooltips = $("#classBreakSliderTooltips");
        let sliders = [];
        let maxVal = 0;
        const minLabelSize = 13;

        tp.subscribe("BlockGroupRendererUpdated", function () {
            console.log("test");

            setupSliders();
            setupCharts();
        });

        function setupSliders() {
            const lyr = app.map.findLayerById("blockGroups");
            const rend = lyr.sublayers.getItemAt(0).renderer;
            const infos = rend.classBreakInfos;
            maxVal = infos[infos.length - 1].maxValue;

            let sliderHeight = $classBreakSliders.height() - (infos.length - 1) * 7;

            //Clear out old class break sliders
            $classBreakSliders.html('');
            $classBreakSliderTooltips.html('');

            //Loop through class breaks and calculate pane size
            const panes = [];
            for (let i = infos.length - 1; i >= 0; i--) {
                const info = infos[i];
                const clr = info.symbol.color;
                const pct = (info.maxValue - info.minValue) / maxVal;
                const paneSize = Math.floor(sliderHeight * pct);

                sliders.push({
                    info: info,
                    clr: clr,
                    paneSize: paneSize
                })

                let minLabel = Math.round(info.minValue).toLocaleString('en-US');
                let maxLabel = Math.round(info.maxValue).toLocaleString('en-US');

                if (info.label.includes("%")) {
                    minLabel = `${(Math.round(info.minValue * 1000) / 10).toLocaleString('en-US')}%`;
                    maxLabel = `${(Math.round(info.maxValue * 1000) / 10).toLocaleString('en-US')}%`;
                }

                if (i === infos.length - 1) {
                    $classBreakSliderTooltips.append(`
                    <div style="margin-top: 3px;" id="sliderTooltip${i+1}" class="sliderTooltip">${maxLabel}</div>
                    `);
                }
                //Add Tooltip
                $classBreakSliderTooltips.append(`
                <div class="sliderTooltip" id="sliderTooltip${i}" style="margin-top: ${paneSize - 10}px">${minLabel}</div>
                `);

                let showLabel = 'none';
                if (paneSize > minLabelSize) {
                    showLabel = 'inline-block';
                }

                //Add pane
                $classBreakSliders.append(`
                    <div class="cbPane" id="cbPane${i}" 
                    style="display: flex; background-color:rgba(${clr.r},${clr.g},${clr.b},${lyr.opacity});">
                    <div class="paneLabel" style="display: ${showLabel}; margin: auto; font-size: 10.5px;">${info.label}</div>
                    </div>
                `)

                $classBreakSliders.find("#cbPane" + i).data("info", info);


                const newPane = {
                    size: paneSize + "px",
                    resizable: true,
                    idx: i,
                    scrollable: false
                }
                panes.push(newPane);
            }

            $classBreakSliders.kendoSplitter({
                orientation: "vertical",
                panes: panes,
                resize: updateRangeSliders
            });

            function updateRangeSliders() {
                if (this.resizing) {
                    //Get Jquery elements for panes involved
                    let $prevPane = $(this.resizing.previousPane);
                    let $nextPane = $(this.resizing.nextPane);

                    let prevInfo = $prevPane.data("info");
                    let nextInfo = $nextPane.data("info");

                    // Get heights
                    let prevHeight = $prevPane.outerHeight();
                    let nextHeight = $nextPane.outerHeight();

                    //Get a pixel height for the total
                    //of the two affected panes
                    let totalHeight = prevHeight + nextHeight;

                    let prevMax = prevInfo.maxValue;
                    let nextMin = nextInfo.minValue;

                    let prevMin = (nextHeight / totalHeight) * (prevMax - nextMin) + nextMin;
                    let nextMax = prevMin;

                    //Update outside label
                    let $prevTooltip = $(`#sliderTooltip${$prevPane.attr("id").slice(-1)}`);
                    let $nextTooltip = $(`#sliderTooltip${$nextPane.attr("id").slice(-1)}`);

                    //Adjust height of the affected panes to properly align outside label
                    //Adding 7 to each height because of the height of the slider.
                    $prevTooltip.css("margin-top", prevHeight - 10);
                    $nextTooltip.css("margin-top", nextHeight - 10);


                    let $prevInnerLabel = $prevPane.find(".paneLabel");
                    let $nextInnerLabel = $nextPane.find(".paneLabel");

                    // update tooltip on left side of sliders

                    // Update inner label
                    if (prevInfo.label.includes("%")) {
                        $prevInnerLabel.html(`${(Math.round(prevMin*1000)/10).toLocaleString('en-US')}% - ${(Math.round(prevMax*1000)/10).toLocaleString('en-US')}%`);
                        $nextInnerLabel.html(`${(Math.round(nextMin*1000)/10).toLocaleString('en-US')}% - ${(Math.round(nextMax*1000)/10).toLocaleString('en-US')}%`);
                        $prevTooltip.html(`${(Math.round(prevMin * 1000) / 10).toLocaleString('en-US')}%`);
                    } else {
                        $prevInnerLabel.html(`${Math.round(prevMin).toLocaleString('en-US')} - ${Math.round(prevMax).toLocaleString('en-US')}`);
                        $nextInnerLabel.html(`${Math.round(nextMin).toLocaleString('en-US')} - ${Math.round(nextMax).toLocaleString('en-US')}`);
                        $prevTooltip.html(Math.round(prevMin).toLocaleString('en-US'));
                    }

                    //Update infos for next time...
                    prevInfo.minValue = prevMin;
                    prevInfo.maxValue = prevMax;
                    nextInfo.minValue = nextMin;
                    nextInfo.maxValue = nextMax;

                    $prevPane.data("info", prevInfo);
                    $nextPane.data("info", nextInfo);

                    //If pane height is greater than minimum minLabelSize, show label.
                    //Otherwise, hide
                    if (prevHeight > minLabelSize) {
                        $prevInnerLabel.show();
                    } else {
                        $prevInnerLabel.hide();
                    }
                    if (nextHeight > minLabelSize) {
                        $nextInnerLabel.show();
                    } else {
                        $nextInnerLabel.hide();
                    }
                }
            }
        }

        $("#customClassBreaksButton").click(function () {
            // app.customClassBreaksVal =
            let classBreaks = [];
            $classBreakSliders.find(".cbPane").each(function (i, val) {
                let dataInfo = $(val).data('info');
                classBreaks.push(dataInfo);
            });
            tp.publish("customClassBreaks-selected", classBreaks.reverse());
            $customClassBreaksModal.modal('hide');
        })



        function setupCharts() {
            let numberOfCharts = 20;
            let totalHeight = $classBreakSliders.height() + 2;
            let chartHeight = totalHeight / numberOfCharts;

            //Gets active map item    
            let $activeItem = $("#mapsList").find(".activeMapItem");
            if ($activeItem) {
                //Pull jquery data object from active map item
                let conf = $activeItem.data("mapsConfig");
                const lyr = app.map.findLayerById("blockGroups").sublayers.getItemAt(0);
                let $classBreakCharts = $("#classBreakCharts");
                $classBreakCharts.html('');
                let dataBins = {};
                let wFactor = .2;
                let q = {
                    where: "1=1",
                    outFields: [conf.FieldName],
                    returnGeometry: false
                }

                if (conf.NormalizeField) {
                    q.outFields.push(conf.NormalizeField);
                }

                lyr.queryFeatures(q).then(function (res) {
                    let binInterval = maxVal / numberOfCharts;
                    // console.log(conf);
                    res.features.forEach(row => {

                        let binNum = Math.floor(row.attributes[conf.FieldName] / binInterval);
                        if (conf.NormalizeField) {
                            binNum = Math.floor((row.attributes[conf.FieldName] / row.attributes[conf.NormalizeField]) / binInterval);
                        }

                        if (dataBins[binNum]) {
                            dataBins[binNum]++;
                        } else {
                            dataBins[binNum] = 1;
                        }
                    });

                    for (let i = numberOfCharts - 1; i >= 0; i--) {
                        let count = dataBins[i] || 0;
                        let w = Math.floor(count * wFactor);

                        //Adding a high limit to the width of the chart.
                        //This should probably be refactored at some point.
                        if (w > 300) {
                            w = 300;
                        }
                        $classBreakCharts.append(`
                        <div class="classBreakChart" style="font-size:10px;height:${chartHeight}px; width: ${w}px;"></div>
                        `)
                        // ${count}
                    }
                })
            }
        }

        tp.subscribe("layers-added", CbrParamChanged);
        tp.subscribe("map-selected", CbrParamChanged);
        tp.subscribe("classType-change", CbrParamChanged);
        tp.subscribe("classBreaksCount-change", CbrParamChanged);

        function CbrParamChanged() {
            let type = $("#classType").val();
            if (type == 'Custom') {
                $customClassBreaksModal.modal('show');
                setupSliders();
                setupCharts();
            }
        }

    })
