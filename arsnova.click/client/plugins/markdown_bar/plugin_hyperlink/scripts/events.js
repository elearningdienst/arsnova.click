import {insertInQuestionText} from './../../scripts/lib.js';

Template.hyperlinkInsertSplash.events({
    "click #js-btn-saveHyperlink": function () {
        var linkText = document.getElementById('hyperlinkText').value;
        var linkDestination = document.getElementById('hyperlinkDestination').value;
        insertInQuestionText('[' + linkText + '](' + linkDestination + ')');
        $('#hyperlinkText').val("");
        $('#hyperlinkDestination').val("");
        closeSplashscreen();
    },
    "click #js-btn-closeHyperlink": function () {
        $('#hyperlinkText').val("");
        $('#hyperlinkDestination').val("");
        closeSplashscreen();
    }
});