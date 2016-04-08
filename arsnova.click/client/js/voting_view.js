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

var countdown = null;
var nextQuestionCountdown = null;
Template.votingview.onCreated(function () {
    Session.set("sessionClosed", undefined);

    this.autorun(() => {
        this.subscribe('AnswerOptions.public', Session.get("hashtag"), function () {
            var answerOptionCount = AnswerOptions.find().count();
            var responseArr = [];
            for (var i = 0; i <answerOptionCount; i++) {
                responseArr[i] = false;
            }
            Session.set("responses", JSON.stringify(responseArr));
        });
        this.subscribe('QuestionGroup.questionList', Session.get("hashtag"), function () {
            if(!Session.get("sessionClosed")) {
                startCountdown(0);
            }
        });
    });
    Meteor.call('Question.isSC', {
        hashtag: Session.get("hashtag")
    }, (err, res) => {
        if (!err && res) {
            Session.set("questionSC", res);
        }
    });
});

Template.votingview.onDestroyed(function () {
    Session.set("questionSC", undefined);
    Session.set("responses", undefined);
    Session.set("countdownInitialized", undefined);
    Session.set("nextQuestionCountdownInitialized", undefined);
    countdown.stop();
    nextQuestionCountdown.stop();
});

Template.votingview.onRendered(function () {
    $(window).resize(function () {
        formatAnswerButtons();
    });
    formatAnswerButtons();
});

Template.votingview.helpers({
    answerOptions: function () {
        return AnswerOptions.find({questionIndex: Session.get("questionIndex")}, {sort:{answerOptionNumber: 1}});
    },
    showForwardButton: function () {
        return Session.get("hasToggledResponse");
    },
    answerOptionLetter: function (number) {
        return String.fromCharCode((number.hash.number + 65));
    },
    getCountdown: function () {
        if (Session.get("countdownInitialized")) {
            if(countdown.get() === 1) {
                return "Noch 1 Sekunde!";
            }
            return "Noch " + countdown.get() + " Sekunden!";
        }
    },
    isWaitingForNextQuestion: function() {
        return Session.get("nextQuestionCountdownInitialized");
    },
    getTimeUntilNextQuestion: function() {
        return "Nächste Quizfrage in " + nextQuestionCountdown.get();
    }
});

Template.votingview.events({
    "click #js-btn-showQuestionModal": function (event) {
        event.stopPropagation();
        $('.questionContentSplash').parents('.modal').modal();
        var questionDoc = QuestionGroup.findOne();
        var content = "";
        if (questionDoc) {
            mathjaxMarkdown.initializeMarkdownAndLatex();
            var questionText = questionDoc.questionText;
            content = mathjaxMarkdown.getContent(questionText);
        }

        $('#questionText').html(content);
    },
    "click #js-showAnswerTexts": function (event) {
        event.stopPropagation();
        mathjaxMarkdown.initializeMarkdownAndLatex();
        $('.answerTextSplash').parents('.modal').modal();
        var content = "";

        AnswerOptions.find({}, {sort:{answerOptionNumber: 1}}).forEach(function (answerOption) {
            content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
            content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
        });

        $('#answerOptionsTxt').html(content);
    },
    "click #forwardButton": function () {
        var responseArr = JSON.parse(Session.get("responses"));
        for (var i = 0; i < AnswerOptions.find().count(); i++ ) {
            if (responseArr[i]) {
                makeAndSendResponse(i);
            }
        }
        Session.set("showForwardButton", undefined);
        Session.set("countdownInitialized", undefined);
        Session.set("hasGivenResponse", undefined);
        Session.set("responses", undefined);
        $('.js-splashscreen-end-of-polling').modal('show');
    },
    "click .sendResponse": function (event) {
        if (Session.get("questionSC")) {
            makeAndSendResponse(event.currentTarget.id);
        }
        else {
            var responseArr = JSON.parse(Session.get("responses"));
            var currentId = event.currentTarget.id;
            responseArr[currentId] = responseArr[currentId] ? false : true;
            var hasToggledResponse = false;
            responseArr.forEach(function (number) {
                if (number) {
                    hasToggledResponse = true;
                }
            });
            Session.set("hasToggledResponse", hasToggledResponse);
            Session.set("responses", JSON.stringify(responseArr));
            $(event.target).toggleClass("answer-selected");
        }
    }
    // submit button onclick -> feedback splashscreen + redirect
});

function startCountdown(index) {
    Session.set("questionIndex", index);
    Session.set("nextQuestionCountdownInitialized", false);
    var questionDoc = QuestionGroup.findOne().questionList[index];
    Session.set("sessionCountDown", questionDoc.timer);
    countdown = new ReactiveCountdown(questionDoc.timer / 1000);
    countdown.start(function () {
        index++;
        if(index < QuestionGroup.findOne().questionList.length) {
            nextQuestionCountdown = new ReactiveCountdown(5);
            nextQuestionCountdown.start(function () {
                startCountdown(index);
            });
            Session.set("nextQuestionCountdownInitialized", true);
        } else {
            $("#end-of-polling-text").html("Game over");
            $('.js-splashscreen-end-of-polling').modal('show');
            Session.set("nextQuestionCountdownInitialized", false);
            Session.set("sessionClosed", true);
        }
    });
    Session.set("countdownInitialized", true);
}

function makeAndSendResponse(answerOptionNumber) {
    Meteor.call('Responses.addResponse', {
        hashtag: Session.get("hashtag"),
        questionIndex: Session.get("questionIndex"),
        answerOptionNumber: Number(answerOptionNumber),
        userNick: Session.get("nick")
    }, (err, res) => {
        if (err) {
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html(err.reason);
        } else {
            if (res) {
                if (res.instantRouting) {
                    // singlechoice
                    $('.js-splashscreen-end-of-polling').modal('show');
                    Session.set("hasGivenResponse", undefined);
                    Session.set("countdownInitialized", undefined);
                    Session.set("responses", undefined);
                }
            }
        }
    });
}

function calculateAnswerRowHeight () {
    return $(window).height() - $('.header-title').height() - $('#appTitle').height() - $('.voting-helper-buttons').height() - $('.navbar-fixed-bottom').height() - 15;
}

function formatAnswerButtons () {
    var answerRow = $('.answer-row');
    var answerButtonContainerHeight = calculateAnswerRowHeight();
    answerRow.css('height', answerButtonContainerHeight + 'px');

    var answerOptionsCount = answerRow.children().length;
    if (answerOptionsCount == 0) {
        setTimeout(function () {
            formatAnswerButtons();
        }, 100);
        return;
    }

    var buttonHeight = 0;
    answerRow.children().removeClass('col-xs-12').removeClass('col-xs-6').removeClass('col-xs-4');

    if (answerOptionsCount <= 3) {
        answerButtonContainerHeight -= answerOptionsCount * 30;
        answerRow.children().addClass('col-xs-12');
        buttonHeight = answerButtonContainerHeight / answerOptionsCount;
    } else if (answerOptionsCount <= 6) {
        answerButtonContainerHeight -= Math.ceil((answerOptionsCount / 2)) * 30;
        answerRow.children().addClass('col-xs-6');
        buttonHeight = answerButtonContainerHeight / (Math.ceil(answerOptionsCount / 2));
    } else {
        answerButtonContainerHeight -= Math.ceil((answerOptionsCount / 3)) * 30;
        answerRow.children().addClass('col-xs-4');
        buttonHeight = answerButtonContainerHeight / (Math.ceil(answerOptionsCount / 3));
    }

    answerRow.find('button').css('height', buttonHeight + 'px');
}