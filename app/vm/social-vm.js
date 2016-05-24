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
            "app/helpers/bookmark-delegate",
            "dojo/text!app/views/socialHelp-view.html",
            "dojo/text!app/views/social-view.html"
        ],
        function(dc, tp, helpVM, bookmarkDelegate, helpView, socialView) {

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
                self.baseURL = window.location.origin;
                self.shareURL = ko.observable("");

                /**
                 * Initialize the class.
                 *
                 * @method init
                 */
                self.init = function() {
                    dc.place(socialView, "mapContainer", "after");

                    tp.subscribe("shareStateO", function() {
                        self.openWindow();
                    });
                    tp.subscribe("shareStateC", function() {
                        self.closeWindow();
                    });

                    bookmarkDelegate.mapInfoList.subscribe(function(value) {
                        if (value && value.length > 0) {
                            // console.log("bookmark info updated");
                        }
                    });

                    var shareWindow = $("#shareWindowDiv").kendoWindow({
                        width: "175", //465px
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

                    self.initFacebook(document, "script", "facebook-jssdk");

                }; // end init

                /**
                 * Open the window and initialize the contents.
                 *
                 * @method openWindow
                 * @param {string} content - the content to display in the window.
                 */
                self.openWindow = function() {
                    var shareURL = window.location.origin + window.location.pathname + bookmarkDelegate.buildMapQueryString();
                    bookmarkDelegate.minifyURL(shareURL, self.changeShareLinks);
                    self.changeShareLinks(shareURL);
                    var win = $("#shareWindowDiv").data("kendoWindow");
                    win.restore();
                    win.open();
                };

                self.closeWindow = function() {
                    var win = $("#shareWindowDiv").data("kendoWindow");
                    win.close();
                };

                self.rebuildShareDom = function() {
                    $("div#shareWindowDiv").remove();
                    self.init();
                };

                /**
                 * Initialize the share functionality.
                 *
                 * @method initializeShareFunctionality
                 */
                self.initializeShareFunctionality = function() {
                    // Facebook
                    self.initFacebook(document, "script", "facebook-jssdk");

                    // Twitter
                    self.initTwitter(document, "script", "twitter-wjs");

                    // Google +
                    self.initGooglePlus();

                    // Linked-in
                    self.initLinkedin();

                };

                /**
                 * Initialize the facebook share functionality.
                 *
                 * @method initFacebook
                 *
                 * @param {object} d - reference to the document object
                 * @param {string} s - tag type
                 * @param {string} id - id of the element created
                 */
                // self.initFacebook = function(d, s, id) {
                //     var js, fjs = d.getElementsByTagName(s)[0];
                //     if (d.getElementById(id)) {
                //         return;
                //     }
                //     js = d.createElement(s);
                //     js.id = id;
                //     js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=1409314459302648";
                //     fjs.parentNode.insertBefore(js, fjs);
                // };

                self.initFacebook = function() {
                    window.fbAsyncInit = function() {
                        FB.init({
                            appId: '1509296789333308',
                            xfbml: true,
                            version: 'v2.6'
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

                };

                /**
                 * Initialize the twitter share functionality.
                 *
                 * @method initTwitter
                 *
                 * @param {object} d - reference to the document object
                 * @param {string} s - tag type
                 * @param {string} id - id of the element created
                 */
                self.initTwitter = function(d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0],
                        p = /^http:/.test(d.location) ? "http" : "https";
                    if (!d.getElementById(id)) {
                        js = d.createElement(s);
                        js.id = id;
                        js.src = p + "://platform.twitter.com/widgets.js";
                        fjs.parentNode.insertBefore(js, fjs);
                    }
                };

                /**
                 * Initialize the google share functionality.
                 *
                 * @method initGooglePlus
                 */
                self.initGooglePlus = function() {
                    var po = document.createElement("script");
                    po.type = "text/javascript";
                    po.async = true;
                    po.src = "https://apis.google.com/js/plusone.js";
                    var s = document.getElementsByTagName("script")[0];
                    s.parentNode.insertBefore(po, s);
                };

                /**
                 * Initialize the linkedin share functionality.
                 *
                 * @method initLinkedin
                 */
                self.initLinkedin = function() {
                    if (typeof(IN) !== "undefined") {
                        IN.parse();
                    } else {
                        $.getScript("http://platform.linkedin.com/in.js");
                    }
                };

                /**
                 * Reinitializes all of the share functionality with the new minimized url.
                 *
                 * @method changeShareLinks
                 *
                 * @param {string} minimizedURL - minimized bookmarking URL
                 */
                self.changeShareLinks = function(minimizedURL) {

                    var replaceToken = "[REPLACE_THIS]";
                    var newShareURL = self.baseURL + bookmarkDelegate.buildMapQueryString();
                    //Facebook
                    var facebookDiv = $("div#facebook");
                    var facebookIframe = $("div#facebook div span iframe");
                    var facebookIframeSrc = $(facebookIframe).attr("src");
                    var indexOfHref = facebookIframeSrc.indexOf("href=");
                    var urlToReplace = facebookIframeSrc.substr(indexOfHref + 5, facebookIframeSrc.indexOf("&", indexOfHref) - indexOfHref - 5);
                    $(facebookIframe).attr("src", facebookIframeSrc.replace(urlToReplace, encodeURIComponent(minimizedURL)));
                    //Twitter
                    $("script#twitter-wjs").remove();
                    var twitterDiv = $("div#twitter");
                    $(twitterDiv).empty();
                    var twitterLink = '<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + replaceToken + '" data-text="MAG | Demographics" data-via="MAGregion" data-hashtags="MAGmaps">Tweet</a>';
                    $(twitterDiv).html(twitterLink.replace(replaceToken, minimizedURL));
                    //Linkedin
                    var linkedinDiv = $("div#linkedin");
                    $(linkedinDiv).empty();
                    var linkedScript = '<script type="IN/Share" data-url="' + replaceToken + '" data-action="share" data-counter="right"></script>';
                    $(linkedinDiv).html(linkedScript.replace(replaceToken, minimizedURL));
                    //Google+
                    var googleDiv = $("div#google");
                    $(googleDiv).empty();
                    var googleStructure = '<div class="g-plusone" data-size="medium" data-url="' + replaceToken + '"></div>';
                    $(googleDiv).html(googleStructure.replace(replaceToken, minimizedURL));
                    //Email
                    var emailDiv = $("div#email");
                    $(emailDiv).empty();
                    var emailStructure = '<a href="mailto:?subject=MAG Demographics Map Viewer&body=%0A%0ACheck out this website.%0A%0AMAG Demographics Map Viewer - #MAGmaps%0A' + replaceToken + '" title="MAG|Demographics"><img id="mailicon" src="app/resources/img/mail-icon.png"></a>';
                    $(emailDiv).html(emailStructure.replace(replaceToken, minimizedURL));

                    self.initTwitter(document, "script", "twitter-wjs");

                    self.initGooglePlus();

                    self.initLinkedin();
                };

            }; //end socialVM

            return SocialVM;

        } //end function
    );
}());