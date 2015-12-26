// https://inbox.google.com/*

console.log('Loading fluid.inbox.js...')
window.fluid.dockBadge = '';
var ycInbox = window.ycInbox = window.ycInbox || {};

ycInbox.updateDockBadge = function() {
  if (!window.jQuery) {
    var x = document.createElement('script');
    x.src = 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.js';
    document.body.appendChild(x);
    return;
  }

  var navigationTitle = jQuery(
      '[jsaction="global.navigate_and_refresh"]').text();

  if (navigationTitle.trim() != 'Inbox') {
    window.fluid.dockBadge = '?';
    return;
  }

  var unread = jQuery('div:contains(Unread):visible')
      .filter(function(index, el) { return !$('*', el).length; });

  window.fluid.dockBadge = unread.length || '';
};

ycInbox.updateDockBadgeTimeout = window.setTimeout(ycInbox.updateDockBadge, 1000);
ycInbox.updateDockBadgeInterval = window.setInterval(ycInbox.updateDockBadge, 3000);
console.log('Loaded fluid.inbox.js.')
