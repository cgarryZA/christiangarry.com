// Bookshelf: loads book + paper JSONs and renders them on separate shelves
(function () {
  var BOOKS_INDEX = "data/books/index.json?v=3";
  var PAPERS_INDEX = "data/papers/index.json?v=1";

  function fetchAll(baseDir, files) {
    return Promise.all(
      files.map(function (file) {
        return fetch(baseDir + file + "?v=3")
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      })
    ).then(function (results) {
      return results.filter(Boolean);
    });
  }

  function buildShelf(items, type) {
    var shelf = document.createElement("div");
    shelf.className = type === "papers" ? "shelf shelf--papers" : "shelf";

    var back = document.createElement("div");
    back.className = "shelf-back";
    shelf.appendChild(back);

    // Scrollable inner container for items only
    var scroll = document.createElement("div");
    scroll.className = "shelf-scroll";

    items.forEach(function (item) {
      var el;
      if (item.url) {
        el = document.createElement("a");
        el.href = item.url;
        el.target = "_blank";
        el.rel = "noreferrer noopener";
      } else {
        el = document.createElement("div");
      }

      if (type === "papers") {
        // Paper sheaf
        var height = 180 + ((item.title.length * 5) % 60); // 180-240px
        el.className = "paper-sheaf";
        el.style.height = height + "px";
        el.title = item.title + (item.author ? " — " + item.author : "") + (item.year ? " (" + item.year + ")" : "");

        var fold = document.createElement("div");
        fold.className = "sheaf-fold";
        el.appendChild(fold);

        var textWrap = document.createElement("div");
        textWrap.className = "sheaf-text";

        var titleSpan = document.createElement("span");
        titleSpan.className = "sheaf-title";
        titleSpan.textContent = item.title;
        textWrap.appendChild(titleSpan);

        if (item.author) {
          var authorSpan = document.createElement("span");
          authorSpan.className = "sheaf-author";
          authorSpan.textContent = item.author + (item.year ? " (" + item.year + ")" : "");
          textWrap.appendChild(authorSpan);
        }

        el.appendChild(textWrap);
      } else {
        // Book spine
        var height = 190 + ((item.title.length * 7) % 70); // 190-260px
        el.className = "book-spine";
        el.style.height = height + "px";
        el.style.backgroundColor = item.color || "#444";
        el.title = item.title + (item.author ? " — " + item.author : "");

        var textWrap = document.createElement("div");
        textWrap.className = "spine-text";
        textWrap.style.color = item.secondaryColor || "#fff";

        var titleSpan = document.createElement("span");
        titleSpan.className = "spine-title";
        titleSpan.textContent = item.title;
        textWrap.appendChild(titleSpan);

        if (item.author) {
          var authorSpan = document.createElement("span");
          authorSpan.className = "spine-author";
          authorSpan.textContent = item.author;
          textWrap.appendChild(authorSpan);
        }

        el.appendChild(textWrap);
      }

      scroll.appendChild(el);
    });

    shelf.appendChild(scroll);
    return shelf;
  }

  async function loadAll() {
    var container = document.getElementById("bookshelf");
    if (!container) return;

    // Load books index
    var bookFiles = [];
    try {
      var r = await fetch(BOOKS_INDEX);
      if (r.ok) bookFiles = await r.json();
    } catch (e) { /* silent */ }

    // Load papers index
    var paperFiles = [];
    try {
      var r2 = await fetch(PAPERS_INDEX);
      if (r2.ok) paperFiles = await r2.json();
    } catch (e) { /* silent */ }

    if (!bookFiles.length && !paperFiles.length) {
      container.innerHTML = '<p class="shelf-empty">Shelf is empty... for now.</p>';
      return;
    }

    container.innerHTML = "";

    // Side-by-side wrapper
    var row = document.createElement("div");
    row.className = "shelf-row";

    // Books shelf
    if (bookFiles.length) {
      var books = await fetchAll("data/books/", bookFiles);
      if (books.length) {
        var col = document.createElement("div");
        col.className = "shelf-col";
        var label = document.createElement("p");
        label.className = "shelf-label";
        label.textContent = "Books";
        col.appendChild(label);
        col.appendChild(buildShelf(books, "books"));
        row.appendChild(col);
      }
    }

    // Papers shelf
    if (paperFiles.length) {
      var papers = await fetchAll("data/papers/", paperFiles);
      if (papers.length) {
        var col2 = document.createElement("div");
        col2.className = "shelf-col";
        var label2 = document.createElement("p");
        label2.className = "shelf-label";
        label2.textContent = "Papers";
        col2.appendChild(label2);
        col2.appendChild(buildShelf(papers, "papers"));
        row.appendChild(col2);
      }
    }

    container.appendChild(row);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAll);
  } else {
    loadAll();
  }
})();
