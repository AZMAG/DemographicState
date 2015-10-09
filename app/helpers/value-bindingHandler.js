(function() {
    "use strict";

    define([

        ],

        function() {

            ko.bindingHandlers.valueUniqueId = {

                init: function(element, valueAccessor) {
                    var value = valueAccessor();
                    value.id = value.id || ko.bindingHandlers.valueUniqueId.prefix + (++ko.bindingHandlers.valueUniqueId.counter);
                    element.id = value.id;
                },
                counter: 0,
                prefix: "queryValue"
            };
        });
}());