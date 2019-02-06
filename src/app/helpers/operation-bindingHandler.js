(function() {
    "use strict";

    define([

        ],

        function() {

            ko.bindingHandlers.operationUniqueId = {

                init: function(element, valueAccessor) {
                    var value = valueAccessor();
                    value.id = value.id || ko.bindingHandlers.operationUniqueId.prefix + (++ko.bindingHandlers.operationUniqueId.counter);
                    element.id = value.id;
                },
                counter: 0,
                prefix: "queryOperation"
            };
        });
}());