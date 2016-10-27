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
import {Template} from 'meteor/templating';
import {NicknameCategoriesCollection} from '/lib/nickname_categories/collection.js';
import * as localData from '/lib/local_storage.js';

Template.nicknameCategories.events({
	"click #backButton": function () {
		if (Session.get("questionGroup")) {
			Meteor.call("SessionConfiguration.setConfig", Session.get("questionGroup").getConfiguration().serialize());
			Router.go("/" + Session.get("questionGroup").getHashtag() + "/memberlist");
		} else {
			history.back();
		}
	},
	"click .nickCategory": function (event) {
		$('.nickCategory').removeClass("selectedCategory");
		$(event.currentTarget).addClass("selectedCategory");
		Session.set("selectedCategory", $(event.currentTarget).attr("id").replace("nickCategory_", ""));
		sessionStorage.setItem(Router.current().params.quizName + "_selectedCategory", Session.get("selectedCategory"));
	},
	"click .nickName": function (event) {
		const questionGroup = Session.get("questionGroup");
		if ($(event.currentTarget).attr("id") === "select_all") {
			if ($(event.currentTarget).hasClass("selectedNickName")) {
				NicknameCategoriesCollection.find({nickCategory: Session.get("selectedCategory")}).fetch().forEach(function (item) {
					questionGroup.getConfiguration().getNickSettings().removeSelectedNickByName(item.nick);
				});
			} else {
				NicknameCategoriesCollection.find({nickCategory: Session.get("selectedCategory")}).fetch().forEach(function (item) {
					questionGroup.getConfiguration().getNickSettings().addSelectedNick(item.nick);
				});
			}
		} else {
			if ($(event.currentTarget).hasClass("selectedNickName")) {
				questionGroup.getConfiguration().getNickSettings().removeSelectedNickByName(NicknameCategoriesCollection.findOne({nick: $(event.currentTarget).attr("id").replace("nickName_", "")}).nick);
				$(event.currentTarget).removeClass("selectedNickName");
			} else {
				questionGroup.getConfiguration().getNickSettings().addSelectedNick(NicknameCategoriesCollection.findOne({nick: $(event.currentTarget).attr("id").replace("nickName_", "")}).nick);
				$(event.currentTarget).addClass("selectedNickName");
			}
		}
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(Session.get("questionGroup"));
	},
	"click .chosenNickName": function (event) {
		if ($(event.currentTarget).attr("id") === "no_nick_selected") {
			return;
		}
		if ($(event.currentTarget).attr("id") === "remove_all") {
			const questionGroup = Session.get("questionGroup");
			questionGroup.getConfiguration().getNickSettings().removeSelectedNicks();
			Session.set("questionGroup", questionGroup);
			localData.addHashtag(questionGroup);
			return;
		}
		const nickname = $(event.currentTarget).attr("id").replace("chosen_nickName_", "");
		$('#nickName_' + nickname).removeClass("selectedNickName");
		const questionGroup = Session.get("questionGroup");
		questionGroup.getConfiguration().getNickSettings().removeSelectedNickByName(NicknameCategoriesCollection.findOne({nick: nickname}).nick);
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(Session.get("questionGroup"));
	}
});
