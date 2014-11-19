/**
 * Social Media Window
 *
 * @class social-vm
 */

(function() {

  "use strict";

  define([
      "dojo/dom-construct",
      "dojo/topic",
      "app/vm/help-vm",
      "dojo/text!app/views/socialHelp-view.html",
      "dojo/text!app/views/social-view.html"
    ],
    function(dc, tp, helpVM, helpView, socialView) {

      var SocialVM = new function() {

        /**
         * Store reference to module this object.
         *
         * @property self
         * @type {*}
         */
        var self = this;
        self.Title = "Share";

        self.winWidth = document.documentElement.clientWidth;

        /**
         * Initialize the class.
         *
         * @method init
         */
        self.init = function() {
          dc.place(socialView, "map", "after");

          tp.subscribe("shareStateO", function() {
            self.openWindow();
          });
          tp.subscribe("shareStateC", function() {
            self.closeWindow();
          });

          var shareWindow = $("#shareWindowDiv").kendoWindow({
            width: "475", //465px
            height: "215", //255px
            title: self.Title,
            actions: ["Help", "Minimize", "Close"],
            modal: false,
            visible: false,
            resizable: false
          }).data("kendoWindow");

          $("#shareWindowDiv").closest(".k-window").css({
            top: 55,
            left: self.winWidth - 500
          });

          var helpButton = shareWindow.wrapper.find(".k-i-help");
          helpButton.click(function() {
            helpVM.openWindow(helpView);
          });

          // Facebook
          window.fbAsyncInit = function() {
            FB.init({
              appId: '1509296789333308',
              xfbml: true,
              version: 'v2.2'
            });
          };

          (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
              return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));

          // (function(d, s, id) {
          //   var js, fjs = d.getElementsByTagName(s)[0];
          //   if (d.getElementById(id)) {
          //     return;
          //   }
          //   js = d.createElement(s);
          //   js.id = id;
          //   js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=1409314459302648";
          //   fjs.parentNode.insertBefore(js, fjs);
          // }(document, "script", "facebook-jssdk"));

          // Twitter
          ! function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
              p = /^http:/.test(d.location) ? "http" : "https";
            if (!d.getElementById(id)) {
              js = d.createElement(s);
              js.id = id;
              js.src = p + "://platform.twitter.com/widgets.js";
              fjs.parentNode.insertBefore(js, fjs);
            }
          }(document, "script", "twitter-wjs");

          // Google +
          (function() {
            var po = document.createElement("script");
            po.type = "text/javascript";
            po.async = true;
            po.src = "https://apis.google.com/js/plusone.js";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(po, s);
          })();

          // Linked-in
          if (typeof(IN) !== "undefined") {
            IN.parse();
          } else {
            $.getScript("http://platform.linkedin.com/in.js");
          }

        }; // end init

        /**
         * Open the window and initialize the contents.
         *
         * @method openWindow
         * @param {string} content - the content to display in the window.
         */
        self.openWindow = function() {
          var win = $("#shareWindowDiv").data("kendoWindow");
          win.restore();
          // win.center();
          win.open();
        };
        self.closeWindow = function() {
          var win = $("#shareWindowDiv").data("kendoWindow");
          win.close();
        };

      }; //end socialVM

      return SocialVM;

    } //end function
  );
}());