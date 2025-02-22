document.addEventListener("DOMContentLoaded", () => {
  const bookmarkList = document.getElementById("bookmarkList");
  const searchInput = document.getElementById("searchBookmarks");
  const addBookmarkBtn = document.getElementById("addBookmark");
  const openOptionsBtn = document.getElementById("openOptions");

  function loadBookmarks() {
    chrome.bookmarks.getTree((bookmarks) => {
      bookmarkList.innerHTML = "";
      displayBookmarks(bookmarks, bookmarkList);
    });
  }

  function displayBookmarks(bookmarks, container) {
    bookmarks.forEach((bookmark) => {
      if (bookmark.children) {
        const folder = document.createElement("li");
        folder.classList.add("folder");
        folder.textContent = `📁 ${bookmark.title}`;
        const ul = document.createElement("ul");
        displayBookmarks(bookmark.children, ul);
        folder.appendChild(ul);
        container.appendChild(folder);
      } else {
        const li = document.createElement("li");
        li.classList.add("bookmark");

        const favicon = document.createElement("img");
        favicon.src = `https://www.google.com/s2/favicons?sz=32&domain=${bookmark.url}`;
        favicon.alt = "🔖";

        const text = document.createElement("span");
        text.classList.add("bookmark-text");
        text.textContent = bookmark.title.length > 25 ? bookmark.title.substring(0, 25) + "..." : bookmark.title;

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = `🗑️`;
        deleteBtn.classList.add("delete-btn");

        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          chrome.bookmarks.remove(bookmark.id, loadBookmarks);
        });

        li.appendChild(favicon);
        li.appendChild(text);
        li.appendChild(deleteBtn);
        li.dataset.url = bookmark.url;

        li.addEventListener("click", () => {
          chrome.tabs.create({ url: bookmark.url });
        });

        container.appendChild(li);
      }
    });
  }

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const bookmarks = bookmarkList.querySelectorAll("li");
    bookmarks.forEach((bookmark) => {
      bookmark.style.display = bookmark.textContent.toLowerCase().includes(searchTerm) ? "block" : "none";
    });
  });

  addBookmarkBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.bookmarks.create({
        parentId: "1",
        title: tabs[0].title,
        url: tabs[0].url
      }, loadBookmarks);
    });
  });

  // ✅ Fix: Open the Options Page when Settings Button is Clicked
  openOptionsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  loadBookmarks();
});
