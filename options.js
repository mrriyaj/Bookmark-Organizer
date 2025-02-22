document.addEventListener("DOMContentLoaded", () => {
  const allBookmarksContainer = document.getElementById("allBookmarks");
  const pinnedBookmarksContainer = document.getElementById("pinnedBookmarks");
  const searchInput = document.getElementById("searchBookmarks");
  const darkModeToggle = document.getElementById("darkModeToggle");

  let pinnedBookmarks = [];

  function loadBookmarks() {
    chrome.bookmarks.getTree((bookmarks) => {
      allBookmarksContainer.innerHTML = "";
      pinnedBookmarksContainer.innerHTML = "";
      pinnedBookmarks = JSON.parse(localStorage.getItem("pinnedBookmarks")) || [];
      displayBookmarks(bookmarks, allBookmarksContainer);
      displayPinnedBookmarks();
    });
  }

  function displayBookmarks(bookmarks, container) {
    bookmarks.forEach((bookmark) => {
      if (bookmark.children) {
        // 📂 Folder with Icon & Editable Name
        const folder = document.createElement("div");
        folder.classList.add("bookmark-folder");

        const folderIcon = document.createElement("span");
        folderIcon.textContent = "📁";
        folderIcon.classList.add("folder-icon");

        const folderInput = document.createElement("input");
        folderInput.type = "text";
        folderInput.value = bookmark.title;
        folderInput.classList.add("folder-name");
        folderInput.addEventListener("change", () => {
          chrome.bookmarks.update(bookmark.id, { title: folderInput.value });
        });

        // 📥 Drop Area for Drag & Drop
        const dropZone = document.createElement("div");
        dropZone.classList.add("folder-drop-zone");
        dropZone.textContent = "Drop Here";
        dropZone.addEventListener("dragover", (e) => e.preventDefault());
        dropZone.addEventListener("drop", (e) => {
          e.preventDefault();
          if (draggedItem) {
            dropZone.parentElement.appendChild(draggedItem);
          }
        });

        folder.appendChild(folderIcon);
        folder.appendChild(folderInput);
        container.appendChild(folder);
        container.appendChild(dropZone);

        const folderList = document.createElement("ul");
        folderList.classList.add("folder-list");
        folder.appendChild(folderList);

        displayBookmarks(bookmark.children, folderList);
        enableDragDrop(folderList);
      } else {
        const li = createBookmarkElement(bookmark, false);
        container.appendChild(li);
      }
    });

    enableDragDrop(container);
  }

  function createBookmarkElement(bookmark, isPinned) {
    const li = document.createElement("li");
    li.classList.add("bookmark-item");

    // 🌍 Website Favicon
    const favicon = document.createElement("img");
    favicon.src = `https://www.google.com/s2/favicons?sz=32&domain=${bookmark.url}`;
    favicon.alt = "🔖";

    // 📝 Bookmark Title
    const text = document.createElement("span");
    text.textContent = bookmark.title;
    text.classList.add("bookmark-text");

    // 🔗 View Link Button
    const viewBtn = document.createElement("button");
    viewBtn.textContent = "🔗";
    viewBtn.classList.add("view-btn");
    viewBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: bookmark.url });
    });

    // ✅ 🛠 Fix: Declare `pinBtn` Before Using It
    let pinBtn = document.createElement("button");
    pinBtn.textContent = isPinned ? "📍 Unpin" : "📌 Pin";
    pinBtn.classList.add(isPinned ? "unpin-btn" : "pin-btn");

    pinBtn.addEventListener("click", () => {
      togglePin(bookmark, li, pinBtn);
    });

    // 🗑️ Remove Bookmark Button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete "${bookmark.title}"?`)) {
        chrome.bookmarks.remove(bookmark.id, loadBookmarks);
      }
    });

    // Actions Container
    const actions = document.createElement("div");
    actions.classList.add("actions");
    actions.appendChild(viewBtn);
    actions.appendChild(pinBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(favicon);
    li.appendChild(text);
    li.appendChild(actions);
    li.dataset.url = bookmark.url;

    return li;
  }

  function togglePin(bookmark, li, pinBtn) {
    const isCurrentlyPinned = pinnedBookmarks.some(b => b.id === bookmark.id);

    if (isCurrentlyPinned) {
      pinnedBookmarks = pinnedBookmarks.filter(b => b.id !== bookmark.id);
      allBookmarksContainer.appendChild(li);
      pinBtn.textContent = "📌 Pin";
    } else {
      pinnedBookmarks.push(bookmark);
      pinnedBookmarksContainer.appendChild(li);
      pinBtn.textContent = "📍 Unpin";
    }

    localStorage.setItem("pinnedBookmarks", JSON.stringify(pinnedBookmarks));
  }

  function displayPinnedBookmarks() {
    pinnedBookmarks.forEach((bookmark) => {
      const li = createBookmarkElement(bookmark, true);
      pinnedBookmarksContainer.appendChild(li);
    });

    enableDragDrop(pinnedBookmarksContainer);
  }

  function enableDragDrop(container) {
    let draggedItem = null;

    container.querySelectorAll(".bookmark-item").forEach((item) => {
      item.addEventListener("dragstart", () => {
        draggedItem = item;
        setTimeout(() => (item.style.display = "none"), 0);
      });

      item.addEventListener("dragend", () => {
        setTimeout(() => {
          if (draggedItem) {
            draggedItem.style.display = "block";
          }
        }, 0);
        draggedItem = null;
      });

      item.addEventListener("dragover", (e) => e.preventDefault());

      item.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedItem !== item) {
          container.appendChild(draggedItem);
        }
      });
    });

    container.querySelectorAll(".folder-drop-zone").forEach((dropZone) => {
      dropZone.addEventListener("dragover", (e) => e.preventDefault());

      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedItem) {
          dropZone.parentElement.querySelector(".folder-list").appendChild(draggedItem);
        }
      });
    });
  }

  // 🔍 Search Functionality
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    filterBookmarks(allBookmarksContainer, query);
    filterBookmarks(pinnedBookmarksContainer, query);
  });

  function filterBookmarks(container, query) {
    container.querySelectorAll(".bookmark-item").forEach((item) => {
      const title = item.querySelector(".bookmark-text").textContent.toLowerCase();
      item.style.display = title.includes(query) ? "flex" : "none";
    });

    container.querySelectorAll(".bookmark-folder").forEach((folder) => {
      const folderName = folder.querySelector(".folder-name").value.toLowerCase();
      const hasVisibleBookmarks = [...folder.nextElementSibling.children].some((item) => item.style.display === "flex");
      folder.style.display = folderName.includes(query) || hasVisibleBookmarks ? "block" : "none";
    });
  }

  // 🌙 Dark Mode Toggle
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);
    localStorage.setItem("darkMode", darkModeToggle.checked);
  });

  // 🔄 Load Dark Mode Preference
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true;
  }

  loadBookmarks();
});
