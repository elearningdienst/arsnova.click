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

import {Session} from 'meteor/session';
import {TAPi18n} from 'meteor/tap:i18n';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';

export let validationTrackerHandle = null;

export function setTimer(index, callback) {
	var hasError = false;
	// timer is given in seconds
	const questionItem = Session.get("questionGroup");
	const timer = questionItem.getQuestionList()[index].getTimer();
	if (!isNaN(timer)) {
		questionItem.getQuestionList()[index].setTimer(timer);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	} else {
		hasError = {
			reason: "Timer is not a number"
		};
	}

	if (hasError) {
		new ErrorSplashscreen({
			autostart: true,
			errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + hasError.reason)
		});
	} else if (typeof callback === "function") {
		callback();
	}
}

export function createSlider(index) {
	const questionItem = Session.get("questionGroup");
	if (questionItem.getQuestionList()[index].getTimer() === 0) {
		questionItem.getQuestionList()[index].setTimer(questionItem.getQuestionList()[index].getAnswerOptionList().length * 10);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	}
	$("#slider").noUiSlider({
		start: questionItem.getQuestionList()[index].getTimer(),
		range: {
			'min': 6,
			'max': 260
		}
	}).on('slide', function (ev, val) {
		questionItem.getQuestionList()[index].setTimer(Math.round(val));
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	}).on('change', function (ev, val) {
		questionItem.getQuestionList()[index].setTimer(Math.round(val));
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	});
}

export function setSlider(index) {
	const questionItem = Session.get("questionGroup");
	questionItem.getQuestionList()[index].setTimer(questionItem.getQuestionList()[index].getTimer());
	Session.set("questionGroup", questionItem);
	localData.addHashtag(Session.get("questionGroup"));
	$("#slider").val((questionItem.getQuestionList()[index].getTimer()));
}
