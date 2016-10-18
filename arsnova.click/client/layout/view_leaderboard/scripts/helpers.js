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
import {TAPi18n} from 'meteor/tap:i18n';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import {getLeaderBoardItems, getAllNicksWhichAreAlwaysRight} from './lib.js';

Template.leaderBoard.helpers({
	hashtag: ()=> {
		return Router.current().params.quizName;
	},
	getNormalizedIndex: (index)=> {
		return index + 1;
	},
	isNumber: (index)=> {
		return !isNaN(index);
	},
	isOwnNick: (nick) => {
		return nick === localStorage.getItem(Router.current().params.quizName + "nick");
	},
	getTitleText: ()=> {
		if (Session.get("showGlobalRanking")) {
			return TAPi18n.__("view.leaderboard.title.all_questions");
		} else {
			return TAPi18n.__("view.leaderboard.title.single_question", {questionId: (Session.get("showLeaderBoardId") + 1)});
		}
	},
	getPosition: function (index) {
		return (index + 1);
	},
	parseTimeToSeconds: function (milliseconds) {
		let seconds = (milliseconds / 1000).toFixed(2);
		return String((seconds < 10 ? "0" + seconds : seconds)).replace(".",",");
	},
	invisibleResponsesCount: ()=> {
		return Session.get("allMembersCount") - Session.get("maxResponseButtons");
	},
	hasOverridenDefaultButtonCount: ()=> {
		return Session.get("responsesCountOverride");
	},
	hasTooMuchButtons: ()=> {
		return Session.get("responsesCountOverride") || (Session.get("allMembersCount") - Session.get("maxResponseButtons") > 0);
	},
	isGlobalRanking: function () {
		return Session.get("showGlobalRanking");
	},
	leaderBoardSums: function () {
		return getAllNicksWhichAreAlwaysRight();
	},
	noLeaderBoardItems: (index)=> {
		if (Session.get("showGlobalRanking")) {
			return getAllNicksWhichAreAlwaysRight().length <= 0;
		}
		var items = getLeaderBoardItems();
		if (typeof index !== "undefined") {
			if (items[index].value.length > 0) {
				return false;
			}
		} else {
			for (var i = 0; i < items.length; i++) {
				if (items[i].value.length > 0) {
					return false;
				}
			}
		}
		return true;
	},
	leaderBoardItems: ()=> {
		return getLeaderBoardItems();
	},
	isFirstItem: function (index) {
		return index === 0;
	},
	isRestrictedToCAS: function () {
		return SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName}).nicks.restrictToCASLogin;
	},
	exportData: function () {
		const hashtag = Router.current().params.quizName;
		const time = new Date();
		const timeString = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
		const memberlistResult = MemberListCollection.find({hashtag: hashtag}, {fields: {userRef: 1, nick: 1}}).fetch();
		const responseResult = getLeaderBoardItems();
		let csvString = "Nickname,ResponseTime (ms),UserID,Email\n";

		memberlistResult.forEach(function (item) {
			const user = Meteor.users.findOne({_id: item.userRef});
			let responseTime = 0;
			let responseCount = 0;
			responseResult.forEach(function (responseItem) {
				responseItem.value.forEach(function (responseValue) {
					if (responseValue.nick === item.nick) {
						responseTime += responseValue.responseTime;
						responseCount++;
					}
				});
			});
			if (responseTime !== 0) {
				responseTime = responseTime / responseCount;
				const mail = user.profile.mail instanceof Array ? user.profile.mail.join(",") : user.profile.mail;
				csvString += item.nick + "," + responseTime + "," + user.profile.id + "," + mail + "\n";
			}
		});

		return {
			href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString),
			name: hashtag + "_evaluated_" + timeString + ".csv"
		};
	}
});
