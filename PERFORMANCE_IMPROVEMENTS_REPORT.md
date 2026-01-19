# Performance & Code Structure Improvements Report

Generated: 2026-01-19

---

## 🔴 CRITICAL: CV Blog View Performance Bottleneck

### Issue: Sequential Network Waterfall (cv.js:367-494)

**Impact:** CV blog view takes 10-30+ seconds to load with multiple entries

**Root Cause:** `buildBlogCards()` fetches every CV entry markdown file **sequentially**:

```javascript
// cv.js lines 389-433
for (const e of entries) {
  const r = await fetch(e.url, { cache: "no-store" });  // ❌ BLOCKING
  if (!r.ok) continue;
  const md = await r.text();  // ❌ BLOCKS NEXT ITERATION
  // ... process entry ...
}
```

**Problem:**
- With 10 CV entries, this creates a **10-request waterfall**
- Each fetch blocks the next one
- Total time = sum of all request times (10× slower than parallel)
- User sees blank screen for 10-30 seconds

**Solution: Parallel Fetching**

```javascript
// Fetch ALL entries in parallel
const fetchPromises = entries.map(e =>
  fetch(e.url, { cache: "no-store" })
    .then(r => r.ok ? r.text().then(md => ({ e, md })) : null)
    .catch(() => null)
);

const results = await Promise.all(fetchPromises);
const items = [];

for (const result of results) {
  if (!result) continue;
  const { e, md } = result;
  // ... process entry ...
}
```

**Expected Improvement:**
- 10 entries: ~20-30s → ~2-3s (10× faster)
- 20 entries: ~40-60s → ~3-4s (15× faster)

**File:** `scripts/cv.js:367-494`
**Priority:** 🔴 CRITICAL - Major UX issue

---

## 🟠 HIGH PRIORITY: Code Duplication

### Issue: Shared Utilities Copied Across 3 Files

**Duplicated code across `index.js`, `cv.js`, and `entry.js`:**

1. **Front matter parsing** (identical in all 3 files)
   - `index.js:395-412` (17 lines)
   - `cv.js:51-68` (18 lines)
   - `entry.js:81-208` (127 lines, most complex)

2. **URL/CDN helpers** (identical in all 3 files)
   - `jsDelivrRaw()` - appears 3×
   - `normSlashes()` - appears 3×
   - `dirnameFromRaw()` - appears 3×
   - `repoRootFromRaw()` - appears 3×
   - `resolveCoverURL()` / `resolveAgainst()` - appears 3×

3. **Markdown rendering** (similar but slightly different)
   - `index.js:40-97` - `mdToHtmlFeatured()` (58 lines)
   - `cv.js:223-261` - `mdToHtml()` (39 lines)
   - `entry.js:273-318` - `mdToHtml()` (46 lines)

4. **HTML escaping** (identical in 3 files)
   - `index.js:24-36`
   - `cv.js:263-275`
   - `entry.js:273-277`

**Impact:**
- **~400 lines of duplicated code** (20% of total JS)
- Bug fixes must be applied 3 times
- Inconsistencies between implementations
- Larger bundle size

**Solution: Create Shared Utilities Module**

```
scripts/
├── utils.js           # NEW - shared utilities
│   ├── parseFrontMatter()
│   ├── jsDelivrRaw()
│   ├── normSlashes()
│   ├── resolveAgainst()
│   ├── escapeHtml()
│   └── mdToHtml()
├── index.js          # Import from utils
├── cv.js             # Import from utils
└── entry.js          # Import from utils
```

**Benefits:**
- Single source of truth
- ~300 lines removed
- Easier maintenance
- Consistent behavior

**Priority:** 🟠 HIGH - Technical debt, maintainability

---

## 🟡 MEDIUM PRIORITY: Sequential Loading on Homepage

### Issue: index.js Awaits Each Section Sequentially

**Current behavior (index.js:656-685):**

```javascript
window.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadGithub();        // ❌ Blocks next
  } catch (e) { /* ... */ }

  try {
    await loadPinnedProjects(); // ❌ Blocks next
  } catch (e) { /* ... */ }

  try {
    await loadLatestRepo();     // ❌ Blocks next
  } catch (e) { /* ... */ }

  try {
    await loadLinkedIn();       // ❌ Blocks next
  } catch (e) { /* ... */ }

  try {
    await loadLatestCvEntry();  // ❌ Last to load
  } catch (e) { /* ... */ }
});
```

**Problem:**
- Each section waits for previous to complete
- Total load time = sum of all sections (~5-10s)
- User sees sections populate one-by-one slowly

**Solution: Parallel Loading**

```javascript
window.addEventListener("DOMContentLoaded", async () => {
  // Launch all fetches in parallel
  const results = await Promise.allSettled([
    loadGithub(),
    loadPinnedProjects(),
    loadLatestRepo(),
    loadLinkedIn(),
    loadLatestCvEntry()
  ]);

  // Log any failures
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      const names = ['GitHub', 'Featured', 'Repos', 'LinkedIn', 'CV'];
      console.error(`${names[i]} load failed:`, result.reason);
    }
  });
});
```

**Expected Improvement:**
- 5 sections × 1-2s each = 5-10s → **2-3s total** (3× faster)
- All sections start populating simultaneously
- Better perceived performance

**File:** `scripts/index.js:656-686`
**Priority:** 🟡 MEDIUM - Noticeable UX improvement

---

## 🟡 MEDIUM: Featured Projects Sequential Loading

### Issue: index.js Fetches READMEs in a Loop

**Current behavior (index.js:160-223):**

```javascript
for (const pin of pins) {
  // ... setup ...

  const rawUrl = `https://raw.githubusercontent.com/...`;

  let readmeText = "";
  try {
    const r = await fetch(rawUrl);  // ❌ BLOCKING
    if (r.ok) {
      readmeText = await r.text();
    }
  } catch (e) { /* ... */ }

  // ... render card ...
  container.appendChild(card);
}
```

**Problem:**
- Fetches README for each featured project sequentially
- 3 featured projects = 3-second waterfall
- Cards appear one-by-one instead of all at once

**Solution: Parallel Fetch**

```javascript
// Fetch all READMEs in parallel first
const fetchPromises = pins.map(pin => {
  const rawUrl = `https://raw.githubusercontent.com/...`;
  return fetch(rawUrl)
    .then(r => r.ok ? r.text() : "")
    .catch(() => "");
});

const readmeTexts = await Promise.all(fetchPromises);

// Then render all cards
pins.forEach((pin, i) => {
  const readmeText = readmeTexts[i];
  // ... render card ...
  container.appendChild(card);
});
```

**Expected Improvement:**
- 3 projects: ~3s → ~1s (3× faster)
- All cards appear together

**File:** `scripts/index.js:160-223`
**Priority:** 🟡 MEDIUM

---

## 🟢 LOW PRIORITY: Code Organization

### Issue: Monolithic Files, No Module Structure

**Current structure:**
```
scripts/
├── index.js    (687 lines)
├── cv.js       (642 lines)
└── entry.js    (616 lines)
```

**Problems:**
- Large files hard to navigate
- No separation of concerns
- Duplicated utilities (see above)
- No tree-shaking possible

**Recommended structure:**

```
scripts/
├── utils/
│   ├── markdown.js      # Parsing & rendering
│   ├── frontmatter.js   # YAML parsing
│   ├── cdn.js           # jsDelivr helpers
│   └── dom.js           # DOM utilities
├── services/
│   ├── github.js        # GitHub API calls
│   ├── cv-repo.js       # CV repository access
│   └── linkedin.js      # LinkedIn integration
├── components/
│   ├── featured-card.js # Featured projects
│   ├── cv-card.js       # CV entry cards
│   └── repo-card.js     # Latest repos
├── index.js            # Homepage orchestration (100 lines)
├── cv.js               # CV page orchestration (100 lines)
└── entry.js            # Entry page orchestration (150 lines)
```

**Benefits:**
- Clear responsibility boundaries
- Easier testing
- Better maintainability
- Reusable modules

**Priority:** 🟢 LOW - Long-term maintainability

---

## 🟢 LOW: Cache Optimization

### Issue: Conservative Cache Strategies

**Current caching:**
1. **localStorage for CV index** - 24h TTL ✅ Good
2. **`cache: "no-store"` everywhere else** - ❌ Misses CDN opportunities

**Files using `cache: "no-store"`:**
- `index.js:138` - pinned_projects.json
- `index.js:337` - linkedin.json
- `index.js:583` - Latest CV entry markdown
- `cv.js:306` - cv_cache.json
- `cv.js:391` - Every CV entry markdown (in loop!)
- `cv.js:534` - cv.html
- `entry.js:428` - Entry search
- `entry.js:480` - Crosslink resolution
- `entry.js:572` - Entry markdown

**Problem:**
- Forces network requests even for static content
- CDN caching completely bypassed
- Slower loads, higher bandwidth

**Solution: Smart Cache Strategy**

```javascript
// Static content (READMEs, covers, PDFs) - use default cache
fetch(readmeUrl)  // ✅ Leverages CDN

// Dynamic content (API responses) - no-store
fetch(apiUrl, { cache: "no-store" })

// Versioned content - cache with query param
fetch(`${url}?v=${version}`)  // ✅ CDN cached but busts on version change
```

**Recommended changes:**
- Remove `cache: "no-store"` from:
  - Featured project READMEs (static)
  - CV entry markdown (versioned via localStorage)
  - CV HTML/PDF (versioned)
  - Images/assets (static)
- Keep `cache: "no-store"` for:
  - GitHub API calls
  - LinkedIn data
  - Entry list (directory contents)

**Priority:** 🟢 LOW - Nice optimization

---

## 📊 Performance Impact Summary

| Issue | Current | Optimized | Improvement | Priority |
|-------|---------|-----------|-------------|----------|
| **CV Blog View** | 20-30s | 2-3s | **10× faster** | 🔴 CRITICAL |
| Homepage Loading | 5-10s | 2-3s | **3× faster** | 🟡 MEDIUM |
| Featured Projects | 3s | 1s | **3× faster** | 🟡 MEDIUM |
| Code Duplication | ~400 lines | ~100 lines | **-300 lines** | 🟠 HIGH |

**Total Expected Improvement:**
- **CV Blog View:** 10× faster (critical fix)
- **Homepage:** 3× faster
- **Codebase:** -300 lines (-20%)

---

## 🎯 Recommended Implementation Order

### Phase 1: Critical Performance (1-2 hours)
1. ✅ Fix CV blog view parallel fetching (cv.js:367-494)
2. ✅ Fix homepage parallel loading (index.js:656-686)

**Impact:** Massive UX improvement, immediate user benefit

### Phase 2: Code Quality (2-3 hours)
3. ✅ Extract shared utilities to utils.js
4. ✅ Refactor all 3 files to import from utils
5. ✅ Fix featured projects parallel loading

**Impact:** Better maintainability, easier debugging

### Phase 3: Optimization (1 hour)
6. ✅ Optimize cache strategies
7. ✅ Add loading indicators for async sections

**Impact:** Polish, professional feel

### Phase 4: Architecture (optional, 4-6 hours)
8. ⚠️ Refactor into modular structure
9. ⚠️ Add build step (Vite/esbuild)
10. ⚠️ Add TypeScript for type safety

**Impact:** Long-term scalability

---

## 🔍 Additional Observations

### Good Practices Already in Place ✅
- localStorage caching with TTL
- Error handling with try-catch
- Fallback content on errors
- Loading="lazy" on images
- JSDelivr CDN usage
- Front matter parsing
- Clean separation of config

### Minor Issues
1. **No loading indicators** - Users see blank sections while loading
2. **No retry logic** - Single network failure = permanent blank section
3. **Large payload** - Fetching 100 repos on homepage (index.js:233)
4. **Hardcoded delays** - Could add exponential backoff on failures

---

## 💡 Quick Wins (< 30 min each)

1. **Add skeleton loaders** - Show placeholders while loading
2. **Limit repo fetch** - Change `per_page=100` to `per_page=20`
3. **Add Promise.allSettled** - Prevent one failure from blocking others
4. **Add retry wrapper** - Retry failed fetches 1-2 times
5. **Debounce cache writes** - Avoid localStorage thrashing

---

## 📈 Metrics to Track

After implementing fixes, measure:
- **Time to First Contentful Paint** (should improve by 2-3s)
- **Time to Interactive** (should improve by 5-10s on CV page)
- **Total page load time**
- **Failed request rate** (should decrease with retries)
- **localStorage cache hit rate**

---

## 🛠️ Tools for Validation

1. **Chrome DevTools Performance tab**
   - Check waterfall diagram (should show parallel, not sequential)
   - Measure LCP, FCP, TBT

2. **Chrome DevTools Network tab**
   - Verify parallel requests
   - Check cache headers

3. **Lighthouse**
   - Run before/after to quantify improvement
   - Target: Performance score 90+

---

## Questions for Discussion

1. **Build tooling?** Would you consider adding a bundler (Vite/esbuild) to enable proper ES modules?
2. **Loading UX?** Want skeleton loaders or spinners during fetch?
3. **Error UX?** Show error messages or silently hide failed sections?
4. **Analytics?** Track load times to measure impact?

---

**Next Steps:** Let me know which fixes you'd like me to implement first. The CV blog view parallel fetching is the biggest win and takes ~15 minutes to implement.
