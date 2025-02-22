document.addEventListener("DOMContentLoaded", () => {
  const bookmarkList = document.getElementById("bookmarkList");
  const searchInput = document.getElementById("searchBookmarks");
  const addBookmarkBtn = document.getElementById("addBookmark");

  // Load bookmarks
  function loadBookmarks() {
    chrome.bookmarks.getTree((bookmarks) => {
      bookmarkList.innerHTML = "";
      displayBookmarks(bookmarks, bookmarkList);
    });
  }

  // Display bookmarks in UI
  function displayBookmarks(bookmarks, container) {
    bookmarks.forEach((bookmark) => {
      if (bookmark.children) {
        const folder = document.createElement("li");
        folder.textContent = bookmark.title;
        const ul = document.createElement("ul");
        displayBookmarks(bookmark.children, ul);
        folder.appendChild(ul);
        container.appendChild(folder);
      } else {
        const li = document.createElement("li");
        li.textContent = bookmark.title;
        li.dataset.url = bookmark.url;
        li.addEventListener("click", () => {
          chrome.tabs.create({ url: bookmark.url });
        });
        container.appendChild(li);
      }
    });
  }

  // Search bookmarks
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const bookmarks = bookmarkList.querySelectorAll("li");
    bookmarks.forEach((bookmark) => {
      bookmark.style.display = bookmark.textContent.toLowerCase().includes(searchTerm) ? "block" : "none";
    });
  });

  // Add current page as a bookmark
  addBookmarkBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.bookmarks.create({
        parentId: "1", // Default folder
        title: tabs[0].title,
        url: tabs[0].url
      }, loadBookmarks);
    });
  });

  loadBookmarks();
});
