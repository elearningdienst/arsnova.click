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
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import * as localData from '/lib/local_storage.js';
import * as lib from './lib.js';

Template.createTimerView.events({
	'keydown #slider-timer-input-field, change #slider-timer-input-field': function (event) {
		const questionItem = Session.get("questionGroup");
		const index = Router.current().params.questionIndex;
		questionItem.getQuestionList()[index].setTimer(Math.round($(event.currentTarget).val()));
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
		lib.setSlider(index);
	}
});
