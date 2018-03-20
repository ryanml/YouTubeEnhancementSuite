/**
 * events.js 
 * Watches and handle various tab events
 */

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.tabs.sendMessage(tabId, 'route-updated');
});