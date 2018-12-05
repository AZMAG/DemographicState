require([
        "dojo/topic"
    ],
    function (tp) {
        tp.subscribe("layers-added", InitAdvancedQuery);

        function InitAdvancedQuery() {

        }

    })
