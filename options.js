document.addEventListener("DOMContentLoaded", () => {
  const allBookmarksContainer = document.getElementById("allBookmarks");
  const pinnedBookmarksContainer = document.getElementById("pinnedBookmarks");
  const searchInput = document.getElementById("searchBookmarks");
  const darkModeToggle = document.getElementById("darkModeToggle");

  function loadBookmarks() {
    chrome.bookmarks.getTree((bookmarks) => {
      allBookmarksContainer.innerHTML = "";
      pinnedBookmarksContainer.innerHTML = "";
      displayBookmarks(bookmarks, allBookmarksContainer);
    });
  }

  function displayBookmarks(bookmarks, container) {
    bookmarks.forEach((bookmark) => {
      if (bookmark.children) {
        displayBookmarks(bookmark.children, container);
      } else {
        const li = document.createElement("li");
        li.classList.add("bookmark-item");
        li.draggable = true;

        // 🌍 Website Favicon
        const favicon = document.createElement("img");
        favicon.src = `https://www.google.com/s2/favicons?sz=32&domain=${bookmark.url}`;
        favicon.alt = "🔖";

        // 📝 Bookmark Title
        const text = document.createElement("span");
        text.textContent = bookmark.title;
        text.classList.add("bookmark-text");

        // 📌 Pin Button
        const pinBtn = document.createElement("button");
        pinBtn.textContent = "📌";
        pinBtn.classList.add("pin-btn");
        pinBtn.addEventListener("click", () => {
          if (container === allBookmarksContainer) {
            pinnedBookmarksContainer.appendChild(li);
          } else {
            allBookmarksContainer.appendChild(li);
          }
        });

        // 🗑️ Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${bookmark.title}"?`)) {
            chrome.bookmarks.remove(bookmark.id, loadBookmarks);
          }
        });

        // Append Elements
        const actions = document.createElement("div");
        actions.classList.add("actions");
        actions.appendChild(pinBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(favicon);
        li.appendChild(text);
        li.appendChild(actions);
        li.dataset.url = bookmark.url;

        // Open Bookmark on Click
        li.addEventListener("click", () => {
          chrome.tabs.create({ url: bookmark.url });
        });

        container.appendChild(li);
      }
    });
  }

  // 🌙 Dark Mode Toggle
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);
    localStorage.setItem("darkMode", darkModeToggle.checked);
  });

  loadBookmarks();
});
