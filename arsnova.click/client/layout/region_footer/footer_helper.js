/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import * as localData from '/client/lib/local_storage.js';

Template.footer.onRendered(function () {
    Session.set("footerIsHidden", true);
});

Template.footer.helpers({
    isInHomePath: function () {
        return Router.current().route.path() === '/';
    },
    isInMemberlistOrPollingPathAndIsInstructor: function () {
        var currentRouterPath = Router.current().route.path();

        if (Session.get("isOwner") && (currentRouterPath === '/memberlist' || currentRouterPath === '/results' || currentRouterPath === '/statistics')) {
            // TODO currently not working in IE and Webkit
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");
            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
                // is IE
                return false;
            } else {
                return !((/Safari/.test(ua) && /Apple Computer/.test(navigator.vendor)) || (/Chrome/.test(ua) && /Google Inc/.test(navigator.vendor)));
            }
        } else {
            return false;
        }
    },
    footerIsHidden: function () {
        var isFooterHidden = Session.get("footerIsHidden");
        if (!isFooterHidden) {
            return true;
        } else {
            return isFooterHidden;
        }
    },
    isBackButton: function () {
        var showHome = [
            "/",
            "agb",
            "datenschutz",
            "impressum",
            "ueber"
        ];
        var showHomeSl = [
            "/agb",
            "/datenschutz",
            "/impressum",
            "/ueber"
        ];
        return (showHomeSl.indexOf(Router.current().route.path()) !== -1) && (Session.get("lastPage") !== undefined) && (showHome.indexOf(Session.get("lastPage")) === -1) && (Router.current().route.path() !== '/');
    },
    getLastPage: function () {
        return Session.get("lastPage");
    }
});

Template.footer.events({
    "click #toPrevPage": function () {
        Session.set("lastPage", undefined);
    },
    "click #hideShowFooterBar": function () {
        if ($("#footerBar").hasClass("hide")) {
            $("#footerBar").removeClass("hide");
            $("#hideShowFooterBar").addClass("hide");
            $("#footer-info-div").removeClass("hiddenStyle");
            $("#footer-info-div").addClass("showStyle");

            Session.set("footerIsHidden", false);
        }
    },
    "click #js-activate-fullscreen": function () {
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
                // TODO webkit is currently not working!
            } /*else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }*/
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
                // TODO webkit is currently not working!
            } /*else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }*/
        }
    },
    "click .js-import-home": function () {
        $(".js-import-input-home").trigger('click');
    },
    "click .js-import-input-home": function (event) {
        var fileList = event.target.files;
        var fileReader = new FileReader();
        fileReader.onload = function () {
            var asJSON = JSON.parse(fileReader.result);
            Meteor.call("Hashtags.import",
                {
                    privateKey: localData.getPrivateKey(),
                    data: asJSON
                },
                (err) => {
                    if (err) {
                        $('.errorMessageSplash').parents('.modal').modal('show');
                        $("#errorMessage-text").html("Diese Sitzung existiert bereits!");
                    }
                    else {
                        localData.importFromFile(asJSON);
												Meteor.call('EventManager.add', localData.getPrivateKey(), asJSON.hashtagDoc.hashtag, function () {
		                        Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), asJSON.hashtagDoc.hashtag, 2,
		                            (err) => {
		                                if (err) {
		                                    $('.errorMessageSplash').parents('.modal').modal('show');
		                                    $("#errorMessage-text").html("Es ist ein Fehler bei der Aktualisierung ihrer Frage aufgetreten.");
		                                }
		                                else {
		                                    Session.set("hashtag", asJSON.hashtagDoc.hashtag);
		                                    Session.set("isOwner", true);
		                                    Router.go("/memberlist");
		                                }
		                            }
		                        );
												});
                    }
                }
            );
        };
        for (var i = 0; i < fileList.length; i++) {
            fileReader.readAsBinaryString(fileList[i]);
        }
    }
});
