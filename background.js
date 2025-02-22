chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveBookmark",
    title: "Save to Bookmark Organizer",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveBookmark") {
    chrome.bookmarks.create({
      parentId: "1",
      title: tab.title,
      url: tab.url
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "assets/icon48.png",
    title: "Bookmark Reminder",
    message: `Time to revisit: ${alarm.name}`
  });
});
