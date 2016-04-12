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

Template.answerOptionsSplash.onCreated(function () {
    this.subscribe("EventManager.join",Session.get("hashtag"));
    this.subscribe('AnswerOptions.public', Session.get("hashtag"));
});

Template.answerOptionsSplash.helpers({
    answerOptions: function () {
        return AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex});
    },
    answerOptionLetter: function (number) {
        return String.fromCharCode((number + 65));
    }
});

Template.answerOptionsSplash.events({
    "click #js-btn-hideAnswerModal": function (event) {
        event.stopPropagation();
        closeSplashscreen();
    }
});