// Context menu for quick saving
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveBookmark",
    title: "Save this page to Bookmark Organizer",
    contexts: ["page"]
  });
});

// Add bookmark from context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveBookmark") {
    chrome.bookmarks.create({
      parentId: "1",
      title: tab.title,
      url: tab.url
    });
  }
});

// Reminder notifications
chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "Bookmark Reminder",
    message: `Time to revisit your bookmark: ${alarm.name}`
  });
});
