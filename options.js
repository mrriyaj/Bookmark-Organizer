document.addEventListener("DOMContentLoaded", () => {
  const syncCheckbox = document.getElementById("syncBookmarks");
  const saveBtn = document.getElementById("saveSettings");

  chrome.storage.sync.get(["syncEnabled"], (data) => {
    syncCheckbox.checked = data.syncEnabled || false;
  });

  saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set({ syncEnabled: syncCheckbox.checked }, () => {
      alert("Settings saved!");
    });
  });
});
