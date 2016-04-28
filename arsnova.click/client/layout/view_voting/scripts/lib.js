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
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManager} from '/lib/eventmanager.js';
import {QuestionGroup} from '/lib/questions.js';
import {splashscreenError} from '/client/plugins/splashscreen/scripts/lib.js';

export let countdown = null;
export let currentButton = 0;
export let countdownRunning = false;

export function deleteCountdown() {
	countdown = null;
}

export function startCountdown(index) {
	Session.set("hasSendResponse", false);
	Session.set("hasToggledResponse", false);

	countdownRunning = true;

	Meteor.call('Question.isSC', {
		hashtag: Session.get("hashtag"),
		questionIndex: EventManager.findOne().questionIndex
	}, (err, res) => {
		if (!err && res) {
			Session.set("questionSC", res);
		}
	});

	var questionDoc = QuestionGroup.findOne().questionList[index];
	Session.set("sessionCountDown", questionDoc.timer);
	countdown = new ReactiveCountdown(questionDoc.timer / 1000, {
		interval: 1000,
		tick: function () {
			var buttonsCount = $('.answer-row').children().length;
			var lastButton = 0;
			var secondsUntilNextRound = 3;

			if (currentButton <= 0) {
				lastButton = buttonsCount - 1;
			} else {
				lastButton = currentButton - 1;
			}

			/* skip the selected answer options */
			while ($('#' + currentButton).hasClass('answer-selected')) {
				currentButton++;
				if (currentButton >= buttonsCount) {
					currentButton = 0 - secondsUntilNextRound;
				}
			}

			$('#' + lastButton).removeClass('button-green-transition').addClass('button-purple-transition');
			$('#' + currentButton).addClass('button-green-transition').removeClass('button-purple-transition');

			currentButton++;

			if (currentButton >= buttonsCount) {
				currentButton = 0 - secondsUntilNextRound;
			}
		}
	});
	countdown.start(function () {
		if (index + 1 >= QuestionGroup.findOne().questionList.length) {
			Session.set("sessionClosed", true);
		}
		Session.set("countdownInitialized", false);
		Router.go("/results");
		countdownRunning = false;
	});
	Session.set("countdownInitialized", true);
}

export function makeAndSendResponse(answerOptionNumber) {
	Meteor.call('Responses.addResponse', {
		hashtag: Session.get("hashtag"),
		questionIndex: EventManager.findOne().questionIndex,
		answerOptionNumber: Number(answerOptionNumber),
		userNick: Session.get("nick")
	}, (err) => {
		if (err) {
			splashscreenError.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason));
			splashscreenError.open();
		}
	});
}

function calculateAnswerRowHeight() {
	return $(window).height() - $('.header-title').height() - $('#appTitle').height() - $('.voting-scripts-buttons').height() - $('.navbar-fixed-bottom').height() - 15;
}

export function formatAnswerButtons() {
	var answerRow = $('.answer-row');
	var answerButtonContainerHeight = calculateAnswerRowHeight();
	answerRow.css('height', answerButtonContainerHeight + 'px');

	var answerOptionsCount = answerRow.children().length;
	if (answerOptionsCount === 0) {
		setTimeout(function () {
			formatAnswerButtons();
		}, 100);
		return;
	}

	answerRow.children().removeClass('col-xs-12').removeClass('col-xs-6').removeClass('col-xs-4');
	if ($(window).width() < 300) {
		answerRow.children().addClass('col-xs-12');
	} else if (answerOptionsCount <= 6 || $(window).width() < 500) {
		answerRow.children().addClass('col-xs-6');
	} else {
		answerRow.children().addClass('col-xs-4');
	}

	answerRow.find('button').css('height', $('#0').width() + 'px');
}
