// Research Blog: loads markdown posts with YAML front matter, renders list or single post
(function () {
  var BLOG_INDEX = "data/blog/index.json?v=1";
  var BLOG_DIR = "data/blog/";

  // --- YAML front matter parser ---
  function parseFrontMatter(md) {
    var m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return { meta: {}, content: md };
    var raw = m[1];
    var meta = {};
    raw.split(/\r?\n/).forEach(function (line) {
      var match = line.match(/^(\w[\w-]*)\s*:\s*(.+)$/);
      if (!match) return;
      var key = match[1].trim();
      var val = match[2].trim();
      // Handle arrays: [a, b, c]
      if (val.charAt(0) === "[" && val.charAt(val.length - 1) === "]") {
        val = val.slice(1, -1).split(",").map(function (s) {
          return s.trim().replace(/^["']|["']$/g, "");
        });
      } else {
        val = val.replace(/^["']|["']$/g, "");
      }
      meta[key] = val;
    });
    return { meta: meta, content: md.slice(m[0].length).trim() };
  }

  // --- Minimal markdown to HTML ---
  function renderMarkdown(md) {
    var html = md;

    // Fenced code blocks (```lang ... ```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
      var escaped = escapeHtml(code.trim());
      var attr = lang ? ' data-lang="' + escapeHtml(lang) + '"' : "";
      return '<pre' + attr + '><code>' + escaped + '</code></pre>';
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr/>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');

    // Ordered lists
    html = html.replace(/((?:^\d+\. .+\n?)+)/gm, function (block) {
      var items = block.trim().split(/\n/).map(function (line) {
        return "<li>" + line.replace(/^\d+\.\s*/, "") + "</li>";
      }).join("");
      return "<ol>" + items + "</ol>";
    });

    // Unordered lists
    html = html.replace(/((?:^- .+\n?)+)/gm, function (block) {
      var items = block.trim().split(/\n/).map(function (line) {
        return "<li>" + line.replace(/^-\s*/, "") + "</li>";
      }).join("");
      return "<ul>" + items + "</ul>";
    });

    // Paragraphs: wrap standalone lines
    html = html.replace(/^(?!<[houpb]|<li|<hr|<pre|<code|<blockquote|\$\$)(.+)$/gm, '<p>$1</p>');

    // Collapse consecutive blockquotes
    html = html.replace(/<\/blockquote>\s*<blockquote>/g, '<br/>');

    return html;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // --- Date formatting ---
  function formatDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    var months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function formatDateShort(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  // --- Extract first paragraph as snippet ---
  function extractSnippet(content) {
    var lines = content.split(/\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line && !line.match(/^#/) && !line.match(/^[-*]/) && !line.match(/^\d+\./) && !line.match(/^>/)) {
        // Strip markdown formatting
        return line.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`([^`]+)`/g, "$1");
      }
    }
    return "";
  }

  // --- Render KaTeX on element ---
  function renderMath(el) {
    if (typeof renderMathInElement === "function") {
      renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }
  }

  // --- Build post card for list view ---
  function buildCard(meta) {
    var a = document.createElement("a");
    a.className = "blog-card";
    a.href = "blog.html?post=" + encodeURIComponent(meta.slug);

    var title = document.createElement("h2");
    title.className = "blog-card-title";
    title.textContent = meta.title;
    a.appendChild(title);

    var row = document.createElement("div");
    var date = document.createElement("span");
    date.className = "blog-card-date";
    date.textContent = formatDateShort(meta.date);
    row.appendChild(date);

    if (meta.tags && meta.tags.length) {
      var tagsWrap = document.createElement("span");
      tagsWrap.className = "blog-card-tags";
      meta.tags.forEach(function (t) {
        var tag = document.createElement("span");
        tag.className = "blog-card-tag";
        tag.textContent = t;
        tagsWrap.appendChild(tag);
      });
      row.appendChild(tagsWrap);
    }
    a.appendChild(row);

    if (meta.snippet) {
      var snip = document.createElement("p");
      snip.className = "blog-card-snippet";
      snip.textContent = meta.snippet;
      a.appendChild(snip);
    }

    return a;
  }

  // --- Main ---
  async function init() {
    var params = new URLSearchParams(window.location.search);
    var postSlug = params.get("post");

    // Load index
    var files = [];
    try {
      var r = await fetch(BLOG_INDEX);
      if (r.ok) files = await r.json();
    } catch (e) { /* silent */ }

    // Load all posts
    var posts = [];
    for (var i = 0; i < files.length; i++) {
      try {
        var resp = await fetch(BLOG_DIR + files[i] + "?v=1");
        if (!resp.ok) continue;
        var text = await resp.text();
        var parsed = parseFrontMatter(text);
        parsed.meta.snippet = extractSnippet(parsed.content);
        parsed.meta._content = parsed.content;
        posts.push(parsed.meta);
      } catch (e) { /* silent */ }
    }

    // Sort by date descending
    posts.sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });

    if (postSlug) {
      // --- SINGLE POST VIEW ---
      document.getElementById("blog-list").style.display = "none";
      var postEl = document.getElementById("blog-post");
      postEl.style.display = "block";

      var post = posts.find(function (p) { return p.slug === postSlug; });
      if (!post) {
        document.getElementById("post-title").textContent = "Post not found";
        document.getElementById("post-body").innerHTML = '<p class="muted">The requested post could not be found.</p>';
        return;
      }

      document.title = post.title + " — Research Blog — Christian Garry";
      document.getElementById("post-title").textContent = post.title;
      document.getElementById("post-date").textContent = formatDate(post.date);

      // Update meta tags
      var canon = document.getElementById("canonical-url");
      if (canon) canon.href = "https://christiangarry.com/blog.html?post=" + post.slug;
      var ogTitle = document.getElementById("og-title");
      if (ogTitle) ogTitle.content = post.title + " — Christian Garry";
      var ogUrl = document.getElementById("og-url");
      if (ogUrl) ogUrl.content = "https://christiangarry.com/blog.html?post=" + post.slug;

      // Tags
      var tagsEl = document.getElementById("post-tags");
      if (post.tags && post.tags.length) {
        post.tags.forEach(function (t) {
          var tag = document.createElement("span");
          tag.className = "blog-post-tag";
          tag.textContent = t;
          tagsEl.appendChild(tag);
        });
      }

      // Render body
      var bodyEl = document.getElementById("post-body");
      bodyEl.innerHTML = renderMarkdown(post._content);

      // Render math after DOM update
      setTimeout(function () { renderMath(bodyEl); }, 50);

    } else {
      // --- LIST VIEW ---
      var container = document.getElementById("blog-posts");
      container.innerHTML = "";

      if (!posts.length) {
        container.innerHTML = '<p class="blog-empty">No posts yet. Check back soon.</p>';
        return;
      }

      posts.forEach(function (meta) {
        container.appendChild(buildCard(meta));
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
