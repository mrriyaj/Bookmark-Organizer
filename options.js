document.addEventListener("DOMContentLoaded", () => {
  const syncCheckbox = document.getElementById("syncBookmarks");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const autoCategorization = document.getElementById("autoCategorization");
  const saveBtn = document.getElementById("saveSettings");
  const exportBtn = document.getElementById("exportBookmarks");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importBookmarks");
  const folderColorPicker = document.getElementById("folderColor");

  // Load stored settings
  chrome.storage.sync.get(["syncEnabled", "darkMode", "autoCategorization", "folderColor"], (data) => {
    syncCheckbox.checked = data.syncEnabled || false;
    darkModeToggle.checked = data.darkMode || false;
    autoCategorization.checked = data.autoCategorization || false;
    folderColorPicker.value = data.folderColor || "#ff914d";

    if (data.darkMode) {
      document.body.classList.add("dark-mode");
    }
  });

  // Save settings
  saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set({
      syncEnabled: syncCheckbox.checked,
      darkMode: darkModeToggle.checked,
      autoCategorization: autoCategorization.checked,
      folderColor: folderColorPicker.value
    }, () => {
      alert("✅ Settings saved successfully!");
    });
  });

  // Dark Mode Toggle
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);
  });

  // Export Bookmarks
  exportBtn.addEventListener("click", () => {
    chrome.bookmarks.getTree((bookmarks) => {
      const json = JSON.stringify(bookmarks, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bookmarks_backup.json";
      a.click();
    });
  });

  // Import Bookmarks
  importBtn.addEventListener("click", () => {
    importFile.click();
  });

  importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const importedData = JSON.parse(e.target.result);
      processImportedBookmarks(importedData);
    };
    reader.readAsText(file);
  });

  // Function to process imported bookmarks
  function processImportedBookmarks(bookmarks, parentId = "1") {
    bookmarks.forEach((bookmark) => {
      if (bookmark.children) {
        chrome.bookmarks.create({ parentId, title: bookmark.title }, (newFolder) => {
          processImportedBookmarks(bookmark.children, newFolder.id);
        });
      } else {
        chrome.bookmarks.create({ parentId, title: bookmark.title, url: bookmark.url });
      }
    });
  }
});
