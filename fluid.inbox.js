'use strict';
// https://inbox.google.com/*

console.log('Loading fluid.inbox.js...')
var ycInbox = window.ycInbox = window.ycInbox || {};

/** @type {number} */
ycInbox.unreadCount = 0;

/** @type {!Array<!Notification>} */
ycInbox.notifications = [];

/** @type {!Array<string>} */
ycInbox.senders = [];


/**
 * Loads the jQuery library.
 * @param {boolean=} opt_min Whether to load the minified version.
 */
ycInbox.loadJQuery = function(opt_min) {
  if (window.jQuery) return;
  var x = document.createElement('script');
  x.src = opt_min
      ? 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js'
      : 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.js';
  document.body.appendChild(x);
};


/**
 * Finds whether the page is looking at the 'Inbox'.
 * @return {boolean}
 */
ycInbox.atInbox = function() {
  var navigationTitle = jQuery(
      '[jsaction="global.navigate_and_refresh"]').text();
  return navigationTitle.trim() == 'Inbox';
};


/**
 * Finds how many email "items" contain unread emails. Note that an "item"
 * can be either an email thread or a bundle of email threads. In latter case,
 * an unread "item" can contain one or more unread email threads.
 * @return {number} >=0 values for success, <0 values for failure.
 */
ycInbox.getUnreadCount = function() {
  if (!ycInbox.atInbox()) return -1;
  var unreadDivs = jQuery('div:contains(Unread):visible')
      .filter(function(index, el) { return !$('*', el).length; });
  return unreadDivs.length;
};


/**
 * Finds all senders for unread emails.
 * @return {?Array<string>} An array for success, a null value for failure.
 */
ycInbox.getAllSenders = function() {
  if (!ycInbox.atInbox()) return null;
  var emailSpans = jQuery('span[email]').filter(function(index, el) {
    return $(el).css('font-weight') == 'bold';
  });
  var senders = emailSpans.toArray().map(function(el) {
    return $(el).text();
  });
  return senders;
};


/**
 * Returns the strings from an array that are not present in the other arrays.
 * Eg. [a,a,b,c,d] - [a,c,e] = [a,b,d]
 * @param {!Array<string>} left
 * @param {!Array<string>} right
 * @return {!Array<string>}
 */
ycInbox.arrayDifference = function(left, right) {
  var obj = {};
  for (var i = 0, ii = left.length; i < ii; ++i) {
    obj[left[i]] = (obj[left[i]] || 0) + 1;
  }
  for (var i = 0, ii = right.length; i < ii; ++i) {
    obj[right[i]] = (obj[right[i]] || 0) - 1;
  }
  var result = [];
  for (var key in obj) {
    for (var i = 0, ii = obj[key]; i < ii; ++i) {
      result.push(key);
    }
  }
  return result;
};


/**
 * Updates the badge and sends notification based on unread emails.
 */
ycInbox.updateUnread = function() {
  if (!window.jQuery) return;

  // Remove all existing notifications if the window has focus.
  if (document.hasFocus()) {
    for (var i = 0, noti; noti = ycInbox.notifications[i]; ++i) {
      noti.close();
    }
    ycInbox.notifications = [];
  }

  // Fetch unread emails' information.
  var currentCount = ycInbox.getUnreadCount();
  var currentSenders = ycInbox.getAllSenders();

  if (currentCount < 0) {
    // If not at the Inbox page:
    // only update the badge as '?' when having no focus.
    if (!document.hasFocus()) {
      window.fluid.dockBadge = '?';
    }

  } else {
    // If at the Inbox page:
    // 1. update the badge;
    // 2. send a notification when having no focus.
    window.fluid.dockBadge = currentCount || '';

    if (ycInbox.unreadCount < currentCount && !document.hasFocus()) {
      var newSenders = ycInbox.arrayDifference(currentSenders, ycInbox.senders)
          .sort().join(', ');
      var body = newSenders
          ? ('From ' + newSenders + '.')
          : "You've got new email(s).";
      ycInbox.notifications.push(
          new Notification('Inbox: New Email', {'body': body}));
    }

    ycInbox.unreadCount = currentCount;
    ycInbox.senders = currentSenders;
  }
};


ycInbox.hideHangouts = function() {
  if (!window.jQuery) return;
  jQuery('[src^="https://hangouts.google.com"]')
      .hide().attr('src', 'about:blank');
};


/** @const {number} */
ycInbox.loadJQueryTimeout = ycInbox.loadJQueryTimeout ||
    window.setTimeout(ycInbox.loadJQuery, 1000);

/** @const {number} */
ycInbox.updateUnreadInterval = ycInbox.updateUnreadInterval ||
    window.setInterval(ycInbox.updateUnread, 2000);

/** @const {number} */
ycInbox.hideHangoutsInterval = ycInbox.hideHangoutsInterval ||
    window.setInterval(ycInbox.hideHangouts, 2000);


console.log('Loaded fluid.inbox.js.')
