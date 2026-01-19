# CSS Cleanup Report - Unused and Overwritten Rules

Generated: 2026-01-19

## Summary

This report identifies CSS rules that are either:
1. **OVERWRITTEN** - Defined multiple times where later definitions override earlier ones
2. **UNUSED** - Not referenced in any HTML file
3. **DUPLICATE** - Multiple class names for the same purpose

---

## 🔴 CRITICAL: Overwritten Rules (styles/index.css)

These rules are defined multiple times. Earlier definitions are completely overridden by later ones and serve no purpose.

### `.repo-list` - Lines 274-281 vs 297-305
**Status:** OVERWRITTEN
**Issue:** Defined twice with different properties. The second definition (297-305) completely overrides the first.
```css
/* USELESS - Lines 274-281 */
.repo-list {
  max-height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}

/* ACTUAL - Lines 297-305 (overwrites above) */
.repo-list {
  flex: 1 1 auto;
  max-height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}
```

### `.hero-row` - Multiple Overwrites (Lines 568-913)
**Status:** SEVERELY OVERWRITTEN
**Issue:** Defined **5 times** throughout the file. Each definition modifies/overrides previous ones.

```css
/* USELESS - Lines 568-620 */
.hero-row {
  display: grid;
  grid-template-columns: 2fr 4fr 1fr;
  gap: 22px;
  min-height: 260px;
  align-items: stretch;
}

/* USELESS - Lines 622-628 (overwrites height) */
.hero-row {
  display: grid;
  grid-template-columns: 2fr 4fr 1fr;
  gap: 22px;
  height: 385px;
  max-height: 385px;
  align-items: stretch;
}

/* USELESS - Lines 657-675 (overwrites height/max-height again) */
.hero-row {
  display: grid;
  grid-template-columns: 2fr 4fr 1fr;
  gap: 22px;
  height: 385px;
  max-height: 385px;
  align-items: stretch;
}

/* USELESS - Lines 775-831 (overwrites columns and height again) */
.hero-row {
  display: grid;
  grid-template-columns: 300px 1fr 250px;
  gap: 22px;
  min-height: 260px;
  align-items: stretch;
  margin-bottom: 22px;
}

/* ACTUAL - Lines 834-850 (final definition) */
.hero-row {
  display: grid;
  grid-template-columns: 300px 1fr 250px;
  gap: 22px;
  min-height: 385px;
  height: auto;
  max-height: none;
  align-items: stretch;
  margin-bottom: 22px;
}
```
**Lines to delete:** 568-620, 622-628, 657-675, 775-831

### `.hero-bio-card` - Lines 551-553 vs 585-591 vs 853-865
**Status:** OVERWRITTEN
```css
/* USELESS - Lines 551-553 */
.hero-bio-card {
  padding: 24px;
}

/* USELESS - Lines 585-591 */
.hero-bio-card {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 12px;
}

/* ACTUAL - Lines 853-865 (final definition) */
.hero-bio-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 24px;
}
```

### `.hero-socials-card` - Lines 560-566 vs 597-613 vs 677-697
**Status:** OVERWRITTEN
```css
/* USELESS - Lines 560-566 */
.hero-socials-card {
  padding: 18px;
}

/* USELESS - Lines 597-613 */
.hero-socials-card {
  padding: 16px;
  font-size: 0.85rem;
}

/* ACTUAL - Lines 677-697 (final definition) */
.hero-socials-card {
  display: flex;
  flex-direction: column;
  padding: 0;
}
```

### `.hero-socials-links` - Lines 682-691 vs 700-706 vs 806-811 vs 875-879 vs 915-917
**Status:** SEVERELY OVERWRITTEN
**Issue:** Defined **5 times**
```css
/* USELESS - Lines 682-691 */
.hero-socials-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

/* USELESS - Lines 689-691 (duplicate nested) */
.hero-socials-links {
  padding: 8px 0;
}

/* USELESS - Lines 700-706 */
.hero-socials-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 0;
}

/* USELESS - Lines 806-811 */
.hero-socials-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* ACTUAL - Lines 875-879 (final definition) */
.hero-socials-links {
  display: flex;
  flex-direction: column;
  height: 100%;
}
```
Plus another override at lines 915-917 for padding-bottom.

### `.net-chip` - Lines 154-172 vs 564-566 vs 610-613 vs 708-762 vs 919-921 vs 927-929
**Status:** SEVERELY OVERWRITTEN
**Issue:** Defined **6 times** with completely different properties
```css
/* USELESS - Lines 154-172 (old style with pill naming) */
.network-pill, .net-chip {
  display: block;
  padding: 14px;
  border-radius: 14px;
  /* ... */
}

/* USELESS - Lines 610-613 */
.hero-socials-card .net-chip {
  padding: 12px;
  margin-bottom: 10px;
}

/* ACTUAL - Lines 708-762 (major rewrite) */
.net-chip {
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  /* ... */
}
```
Plus overrides at 919-921 (margin-bottom) and 927-929 (height).

### `.hero-avatar-card` - Lines 544-548 vs 570-576 vs 923-925
**Status:** OVERWRITTEN
```css
/* USELESS - Lines 544-548 */
.hero-avatar-card {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* USELESS - Lines 570-576 */
.hero-avatar-card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  overflow: hidden;
}
```
Plus margin override at 923-925.

### `.hero-avatar-large` - Lines 578-583 vs 630-632
**Status:** OVERWRITTEN
```css
/* USELESS - Lines 578-583 */
.hero-avatar-large {
  width: 100%;
  height: 100%;
  border-radius: 5%;
  object-fit: cover;
}

/* ACTUAL - Lines 630-632 */
.hero-avatar-large {
  object-fit: cover;
}
```

### `.hero-bio-link` - Lines 634-642 vs 644-651 vs 932-952
**Status:** OVERWRITTEN
```css
/* USELESS - Lines 634-642 */
.hero-bio-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

/* USELESS - Lines 644-651 */
.hero-bio-link {
  transition: transform 180ms ease, box-shadow 180ms ease;
}

/* ACTUAL - Lines 932-952 (unified hover transitions) */
.hero-bio-link, .net-chip {
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
}
```

### `.hero-bio-link:hover` - Lines 640-642 vs 648-651 vs 938-945
**Status:** OVERWRITTEN (duplicate hover styles)

### `.hero-bio-card .hero-meta` - Line 654-656
**Status:** USELESS
**Issue:** `.hero-meta` already has styles at lines 136-143. This override only adds `margin-top: auto` which is already handled by flexbox in parent.

---

## 🔴 CRITICAL: Overwritten Rules (styles/cv.css)

### `.cv-inline-card` - Lines 189-192 vs 200-206 vs 217-225 vs 228-235
**Status:** SEVERELY OVERWRITTEN
**Issue:** Defined **4 times**
```css
/* USELESS - Lines 189-192 */
.cv-inline-card {
  width: min(980px, calc(100% - 32px));
  margin: 0 auto;
}

/* USELESS - Lines 200-206 */
.cv-inline-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
}

/* USELESS - Lines 217-225 */
.cv-inline-card {
  width: min(980px, calc(100% - 32px));
  margin: 0 auto;
}

/* ACTUAL - Lines 228-235 (final definition) */
.cv-inline-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.06);
}
```
Note: Lines 222-225 add a transform but it's incomplete without width/margin.

### `.paper-inner` - Lines 245-248 vs 294-298
**Status:** OVERWRITTEN
```css
/* USELESS - Lines 245-248 */
.paper-inner {
  display: flex;
  width: 100%;
}

/* ACTUAL - Lines 294-298 */
.paper-inner {
  display: flex;
  width: 100%;
  height: 100%;
}
```

### `.paper-body` - Lines 109-111 vs 254-258 vs 300-304
**Status:** OVERWRITTEN
```css
/* USELESS - Lines 109-111 */
.paper-body {
  padding: 12px 16px 14px;
}

/* USELESS - Lines 254-258 */
.paper-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ACTUAL - Lines 300-304 */
.paper-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
```
(Note: 254-258 and 300-304 are identical duplicates)

### `.paper-badges` - Lines 141-146 vs 260-262 vs 313-315
**Status:** OVERWRITTEN
```css
/* Lines 141-146 have full styling */
/* USELESS - Lines 260-262 */
.paper-badges {
  margin-top: auto;
}

/* USELESS - Lines 313-315 */
.paper-badges {
  margin-top: auto;
}
```
(Note: 260-262 and 313-315 are identical duplicates)

### `.paper.blog-card` - Lines 69-76 vs 241-243 vs 268-280 vs 290-292
**Status:** OVERWRITTEN
```css
/* Lines 69-76 have initial styling */
/* USELESS - Lines 241-243 */
.paper.blog-card {
  display: flex;
}

/* Lines 268-280 add hover transition */
/* USELESS - Lines 290-292 */
.paper.blog-card {
  min-height: 150px;
}
```

### `.paper-rich` - Lines 127-138 vs 306-311
**Status:** OVERWRITTEN
```css
/* Lines 127-138 have initial styling */
/* ACTUAL - Lines 306-311 (overwrites -webkit-line-clamp) */
.paper-rich {
  display: -webkit-box;
  -webkit-line-clamp: 3;  /* Changed from 2 to 3 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 🟡 UNUSED: Selectors Not in HTML (styles/index.css)

These CSS classes are defined but never used in any HTML file:

### `.layout-hero` (Lines 80-91)
**Status:** UNUSED
**Issue:** Grouped with `.hero-grid` but `.layout-hero` class doesn't exist in HTML.
```css
.hero-grid, .layout-hero {
  /* ... */
}
```
**Fix:** Remove `.layout-hero` from selector, keep only `.hero-grid`.

### `.avatar` (Lines 99-109)
**Status:** UNUSED
**Issue:** Grouped with `.hero-avatar` but `.avatar` alone is never used.
```css
.avatar, .hero-avatar {
  /* ... */
}
```
**Fix:** Remove `.avatar` from selector.

### `.hero-subtitle` (Lines 127-131)
**Status:** UNUSED
**Issue:** HTML only uses `.hero-tagline`, not `.hero-subtitle`.
```css
.hero-subtitle, .hero-tagline {
  /* ... */
}
```
**Fix:** Remove `.hero-subtitle` from selector.

### Old "pill" naming system (Lines 154-221)
**Status:** UNUSED
**Issue:** These old class names are no longer used. The codebase has been refactored to use `.net-chip` variants instead.

**Unused classes:**
- `.network-pill` (Lines 154-172)
- `.pill-left` (Lines 174-179)
- `.pill-logo` (Lines 181-190)
- `.linkedin-pill-logo` (Lines 191-194)
- `.pill-logo-img` (Lines 196-200)
- `.pill-label` (Lines 202-208)
- `.pill-primary` (Lines 210-214)
- `.pill-secondary` (Lines 216-221)

**Fix:** Remove all these old selectors from the grouped definitions. Keep only the `.net-*` variants.

### `.net-icon-li` (Lines 191-194)
**Status:** UNUSED
```css
.linkedin-pill-logo, .net-icon-li {
  background: rgba(37, 99, 235, 0.15);
}
```
**Fix:** Remove entire rule (both classes unused).

### `.greenwall-card` and `.greenwall-inner` (Lines 223-236)
**Status:** UNUSED
**Issue:** No HTML elements use these classes.
```css
.greenwall-card {
  overflow: hidden;
}

.greenwall-card img, .greenwall-inner img {
  /* ... */
}
```
**Fix:** Remove entire section (lines 223-236).

### `.desc` (Line 266-268)
**Status:** UNUSED
```css
.desc {
  color: var(--muted);
}
```
**Fix:** Remove rule.

### `.badges` (Lines 269-272)
**Status:** UNUSED
**Issue:** HTML only uses `.paper-badges`, not `.badges`.
```css
.badges {
  display: flex;
  gap: 12px;
}
```
**Fix:** Remove rule (`.paper-badges` is the actual class used).

### `.hero-socials-wrapper` (Lines 790-794, 868-873)
**Status:** USED IN HTML but overwritten
**Note:** This class IS used in HTML but has duplicate definitions that override each other.

---

## 🟡 DUPLICATE: Multiple Class Names for Same Purpose

These are different class names that do the same thing:

### Network/Social Pills (styles/index.css)
**Issue:** Two naming systems exist for the same components

**Old naming (UNUSED):**
- `.network-pill`
- `.pill-left`
- `.pill-logo`
- `.pill-logo-img`
- `.pill-label`
- `.pill-primary`
- `.pill-secondary`

**New naming (USED):**
- `.net-chip`
- `.net-chip-main`
- `.net-icon-circle`
- `.net-icon`
- `.net-label`
- `.net-handle`
- `.net-stats`

**Fix:** Remove all old "pill" selectors from grouped definitions.

---

## 📊 Statistics

### styles/index.css
- **Total lines:** 959
- **Overwritten rule blocks:** ~15 major blocks
- **Unused selectors:** ~12 classes
- **Estimated removable lines:** ~200+ lines (20%+ of file)

### styles/cv.css
- **Total lines:** 316
- **Overwritten rule blocks:** ~6 major blocks
- **Unused selectors:** 0 (mostly clean)
- **Estimated removable lines:** ~50 lines (15% of file)

---

## ✅ Recommendations

### Priority 1: Remove Overwritten Rules
These are the most critical as they waste bandwidth and cause confusion:
1. **index.css:** Remove lines 568-620, 622-628, 657-675, 775-831 (old `.hero-row` definitions)
2. **index.css:** Remove lines 274-281 (old `.repo-list` definition)
3. **index.css:** Consolidate `.hero-socials-links` (remove 682-691, 689-691, 700-706, 806-811)
4. **index.css:** Consolidate `.net-chip` (remove 154-172 where grouped with `.network-pill`, 564-566, 610-613)
5. **cv.css:** Remove lines 189-192, 200-206, 217-220 (old `.cv-inline-card` definitions)

### Priority 2: Remove Unused Selectors
1. Remove all "pill" naming variants from grouped selectors
2. Remove `.greenwall-card` and `.greenwall-inner` (lines 223-236)
3. Remove `.desc` (lines 266-268)
4. Remove `.badges` (lines 269-272)
5. Remove `.layout-hero`, `.avatar`, `.hero-subtitle` from grouped selectors

### Priority 3: Consolidate Duplicate Hover States
Lines 932-959 attempt to unify hover transitions but duplicate earlier definitions. Either:
- Remove the earlier scattered definitions, OR
- Remove lines 932-959 and keep the original specific ones

---

## 🔍 How to Verify

After cleanup, verify with:
```bash
# Check for duplicate selectors
grep -n "^\.hero-row {" styles/index.css

# Search for usage of removed classes in HTML
grep -r "greenwall-card" *.html
grep -r "network-pill" *.html
grep -r "pill-logo" *.html

# Count CSS file sizes before/after
wc -l styles/*.css
```

---

## Notes

This analysis was performed by comparing CSS selectors against actual HTML usage in:
- index.html
- cv.html
- entry.html

Dynamic classes added via JavaScript were not analyzed but appear minimal based on script review.
