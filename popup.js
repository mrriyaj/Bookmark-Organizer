document.addEventListener("DOMContentLoaded", () => {
  const bookmarkList = document.getElementById("bookmarkList");
  const searchInput = document.getElementById("searchBookmarks");
  const addBookmarkBtn = document.getElementById("addBookmark");

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
        folder.classList.add("category");
        folder.textContent = bookmark.title;
        const ul = document.createElement("ul");
        displayBookmarks(bookmark.children, ul);
        folder.appendChild(ul);
        container.appendChild(folder);
      } else {
        const li = document.createElement("li");
        li.classList.add("bookmark-item");
        li.innerHTML = `
                    <span>${bookmark.title}</span>
                    <button class="delete-btn">🗑️</button>
                `;
        li.dataset.url = bookmark.url;

        li.addEventListener("click", () => {
          chrome.tabs.create({ url: bookmark.url });
        });

        li.querySelector(".delete-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          chrome.bookmarks.remove(bookmark.id, loadBookmarks);
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

  loadBookmarks();
});
