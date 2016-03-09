var countdown = null;
Template.votingview.onCreated(function () {
    this.autorun(() => {
        this.subscribe('AnswerOptions.public', Session.get("hashtag"));
        this.subscribe('Sessions.question', Session.get("hashtag"), function () {
            countdown = new ReactiveCountdown(Sessions.findOne().timer / 1000);
            countdown.start(function () {
                // show feedback splashscreen?
                Router.go("/results");
            });
            Session.set("countdownInitialized", true);
        });
    });
});

Template.votingview.helpers({
    answerOptions: function () {
        return AnswerOptions.find({}, {sort:{answerOptionNumber: 1}});
    },
    showForwardButton: function () {
        return Session.get("hasGivenResponse");
    },
    answerOptionLetter: function (number) {
        return String.fromCharCode((number.hash.number + 65));
    },
    getCountdown: function () {
        if (Session.get("countdownInitialized")) {
            return countdown.get() + " Sekunden übrig!";
        }
    }
});

Template.votingview.events({
    "click #js-btn-showQuestionModal": function () {
        $('.questionContentSplash').parents('.modal').modal();
    },
    "click #js-showAnswerTexts": function () {
        $('.answerTextSplash').parents('.modal').modal();
    },
    "click #forwardButton": function () {
        Session.set("showForwardButton", undefined);
        Session.set("countdownInitialized", undefined)
        Router.go("/results");
        Session.set("hasGivenResponse", undefined);
        Session.set("countdownInitialized", undefined);
    },
    "click .sendResponse": function (event) {
        Meteor.call('Responses.addResponse', {
            hashtag: Session.get("hashtag"),
            answerOptionNumber: event.target.id,
            userNick: Session.get("nick")
        }, (err, res) => {
            if (err) {
                alert(err);
            } else {
                if (res.instantRouting) {
                    // singlechoice
                    Router.go("/results");
                }
                else {
                    Session.set("hasGivenResponse", true);
                    Session.set("hasGivenResponse", undefined);
                    Session.set("countdownInitialized", undefined);
                }
            }

        });

    }
    // submit button onclick -> feedback splashscreen + redirect
});

Template.questionContentSplash.helpers({
    questionContent: function () {
        mySessions = Sessions.find();
        return mySessions;
    }
});

Template.answerOptionsSplash.onCreated(function () {
    this.autorun(() => {
        this.subscribe('AnswerOptions.public', Session.get("hashtag"));
    });
});

Template.answerOptionsSplash.helpers({
    answerOptions: function () {
        return AnswerOptions.find();
    }
});

Template.questionContentSplash.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Sessions.question', Session.get("hashtag"));
    });
});

Template.questionContentSplash.helpers({
    questionText: function () {
        return Sessions.findOne().questionText;
    }
});

Template.correctSplash.helpers({
    correctAnswer: function () {
        return "mesodunno";
    }
});