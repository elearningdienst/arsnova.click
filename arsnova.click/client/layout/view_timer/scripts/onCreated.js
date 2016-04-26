import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import * as localData from '/client/lib/local_storage.js';

Template.createTimerView.onCreated(function () {
    Session.set("slider", 0);

    this.subscribe('AnswerOptions.instructor', localData.getPrivateKey(), Session.get("hashtag"));
    this.subscribe('QuestionGroup.authorizeAsOwner', localData.getPrivateKey(), Session.get("hashtag"));
    this.subscribe("EventManager.join", Session.get("hashtag"));

});