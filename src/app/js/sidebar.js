//This file includes all of the code and logic for controlling the side/bottom navigation bar
require(['dojo/topic', 'dojo/domReady!'], function(tp) {
    let $sidebar = $('#sidebar');
    let $sidebarCollapse = $('#sidebarCollapse');

    let $links = $('.components li');
    let $arrows = $('.arrow-left');
    let $panelDivs = $('.panelDiv');
    let $content = $('#content');
    let $legendToggle = $('.legendToggle');

    $('.sidebarCollapse').on('click', function() {
        $sidebar.toggleClass('active');
        $sidebarCollapse.toggleClass('active');
    });

    tp.subscribe('toggle-panel', TogglePanel);

    let loadedLayers = [];
    function TogglePanel(target, e) {
        console.log(target, e);

        $('#viewDiv').css('visibility', 'visible');
        $('#container').css('flex', '1');
        if (target === 'legend') {
            toggleLegend();
        } else if (target === 'share') {
            if ($content.is(':visible') && window.outerWidth < 780) {
                $('#container').css('flex', 'none');
                $('#viewDiv').css('visibility', 'hidden');
            }
        } else {
            let isActive = $(e).hasClass('active');
            $links.removeClass('active');
            $arrows.hide();
            $panelDivs.hide();
            app.clearDrawnGraphics();

            if (isActive) {
                $content.hide();
                tp.publish('panel-hidden', target);
            } else {
                // tp.publish('panel-shown', target);
                $('.shareWidget').popover('hide');
                $content.show();
                var $allLinks = $(`[panel-target=${target}]`);

                $allLinks.addClass('active');
                $allLinks.find('.arrow-left').show();

                if (window.outerWidth < 780) {
                    $('#viewDiv').css('visibility', 'hidden');
                    $('#container').css('flex', 'none');
                }

                if (loadedLayers.indexOf(target) === -1) {
                    $(`div[panel-id="${target}"]`).load(`app/views/${target}.html`, function() {
                        tp.publish('panel-loaded', target);
                    });
                    loadedLayers.push(target);
                }

                $(`div[panel-id=${target}]`).fadeIn(400);
            }
        }
    }

    $links.on('click', function(e) {
        let target = $(this).attr('panel-target');

        // <!-- comments:uncomment // -->
        // ga("send", "event", "Click", "Panel Opened", target);
        // <!-- endcomments -->
        TogglePanel(target, this);
    });

    $legendToggle.click(function(e) {
        return false;
    });

    $('#content').on('click', '.closePanel', function() {
        $('#viewDiv').css('visibility', 'visible');
        $('#container').css('flex', 1);
        $links.removeClass('active');
        $arrows.hide();
        $panelDivs.hide();
        $content.hide();
        app.clearDrawnGraphics();
    });

    function toggleLegend() {
        if (window.innerWidth < 768) {
            $('#content').hide();
            $('.components li').removeClass('active');
        }
        $('#legend').fadeToggle();
        $legendToggle.prop('checked', !$legendToggle.prop('checked'));
    }
});
