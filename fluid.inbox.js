// https://inbox.google.com/*

console.log('Loading fluid.inbox.js...')

var ycInbox = window.ycInbox = window.ycInbox || {};
ycInbox.unreadCount = 0;
ycInbox.notifications = [];

ycInbox.loadJQuery = function() {
  if (window.jQuery) return;
  var x = document.createElement('script');
  x.src = 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.js';
  document.body.appendChild(x);
};

ycInbox.getUnreadCount = function() {
  var navigationTitle = jQuery(
      '[jsaction="global.navigate_and_refresh"]').text();

  if (navigationTitle.trim() != 'Inbox') {
    return -1;
  }

  var unread = jQuery('div:contains(Unread):visible')
      .filter(function(index, el) { return !$('*', el).length; });

  return unread.length;
};

ycInbox.updateUnread = function() {
  // Remove all existing notifications if the window has focus.
  if (document.hasFocus()) {
    for (var i = 0, noti; noti = ycInbox.notifications[i]; ++i) {
      noti.close();
    }
    ycInbox.notifications = [];
  }

  // Fetch new unread count.
  var newCount = ycInbox.getUnreadCount();

  if (newCount < 0) {
    // If not at the Inbox page: only update the badge as '?'.
    window.fluid.dockBadge = '?';

  } else {
    // If new unread count is got: update the badge and send a notification.
    window.fluid.dockBadge = newCount || '';

    if (ycInbox.unreadCount < newCount && !document.hasFocus()) {
      ycInbox.notifications.push(
          new Notification('Inbox', {'body': 'You\'ve got new email.'}));
    }

    ycInbox.unreadCount = newCount;
  }
};

ycInbox.loadJQueryTimeout = ycInbox.loadJQueryTimeout ||
    window.setTimeout(ycInbox.loadJQuery, 1000);
ycInbox.updateUnreadInterval = ycInbox.updateUnreadInterval ||
    window.setInterval(ycInbox.updateUnread, 2000);

console.log('Loaded fluid.inbox.js.')
