# Class 12th deployment notes
- Main application database: `educationqpp` (courses, PDFs, users, chat, banners, ratings, enrollments, admin settings, Mod APKs/Websites).
- Existing Test Series database: `testing-5ce76` (series, tests, questions, attempts, leaderboard, reports). Test Series was intentionally left on this project.
- The Class 12th course list starts empty; add batches from Admin > Courses. Add matching PDF/material records under `pdfs` in the `educationqpp` Realtime Database with each record's `batch_id` set to the batch key and `category_id` such as `physics`, `chemistry`, `biology`, `math`, `hindi`, or `english`.
- After deployment, configure Realtime Database rules for both projects. Main app writes require permissions for accounts/users, chats, ratings, enrollments, settings, batches, banners, modApks, and modSites. Keep Testing rules and data intact for the Test Series.

# SK Education — v2.2
- **Signup first**: new visitors, and users who log out, land on `signup.html`. Below the form: "Already have an account? Login here".
- **Signup User ID**: anything is allowed (`user@q244`, `user1234`, `@1244user`, `1245`, any language) except spaces. 4-24 characters. Spaces are removed while typing.
- **Admin panel on phones** (`control.html`): slide-in menu (☰), bottom bar (Home / Users / Tests / Chat / More), single-column forms, big touch targets. Desktop keeps the sidebar.
- **New popups**: delete, leave test and submit test use one styled dialog (`skDialog` in nav.js; `askConfirm` still works). Submit shows Answered / Unanswered / Total.
- **Test time (minutes)**: admin sets how long the whole quiz may take (any number: 1, 10, 30, 60 ... with quick buttons) when uploading, single or bulk. Empty = 1 minute per question. One countdown for the whole test, auto-submits at 0; Previous / Next, Review mark and the question palette stay. Data: `testMeta/<id>/duration` (minutes).
- **Before the test**: instructions are fully in Hindi, in italics.
- **After submit**: Result shows the wrong / skipped question numbers (tap one to jump to it); Answers tab has All / Wrong / Skipped / Correct filters and labels "Your answer" / "Correct answer". The last attempt can be reopened from the test intro ("View last result", saved on the device).
- **Question reports** now stay in Admin > Reports (own tab with a badge) until you press Resolved — deleting a test or a series no longer deletes its reports. Each report stores the question, options and test name, so it is readable even after the test is gone.
- **Subcategories**: Admin > Test Series > "Subcategories": choose Category -> Subject -> add names (e.g. Hindi: Poetry, Prose, Grammar). Upload (single and bulk) = Category -> Subject -> Subcategory. Users see Subject -> Subcategory -> Tests. Tests without a subcategory (or whose subcategory was deleted) appear under "Other tests". Data: `testSeries/<id>/subjects[n]/subs`, `testMeta/<id>/sub`.
- **English UI**: all Hinglish text replaced with English (Close, Leave Test, ...).
- **Homepage on desktop**: wide layout (up to 1240px), top navigation bar, larger text, course grid, 6 quick-access tiles. Phones keep the bottom bar.
- **Profile page** redesigned (header card, stats, shortcuts, theme switch, rating, links). The Telegram join popup shows every time Profile is opened.
- `tools/bulk_upload.py`: new `--subcat KEY` (and `--duration MINUTES`).
- sw cache v23, data cache VER 10.
- Firebase rules: nothing new — `testSeries`, `testMeta`, `testReports` use the same write rules as before.

# SK Education — v2.1
- **Admin panel ab `control.html` par hai** (`admin.html` hata diya, noindex + no-store). Purana link ab 404 dega. Telegram Mini App `?startapp=admin` bhi `control.html` kholta hai.
- **Test Series add/delete** (batches jaise): Admin > Test Series > "🗂 Series" — naam, emoji, color, subjects (comma se) likhkar nayi series banayein; edit/delete bhi. Delete par us series ke saare tests, leaderboard aur reports hat jate hain. Default Class 10/12 bhi delete ho sakti hain. Data: `testSeries/<id>`.
- **Bulk delete**: Tests list mein checkbox + subject/series filter + "Select all" + "Delete selected".
- **Question report**: har question ke saath ⚠️ button → Wrong question / Wrong option / Formatting issue / Other (khud likhein). Admin > Test Series ke neeche "Question reports" mein dikhta hai (Resolved / Clear all). Data: `testReports/<testId>/<id>`.
- Hinglish hint/placeholder text hata diye gaye (signup, login, admin, search boxes).
- App open popup (Telegram join + Admin SMS) ka naya sheet-style design.
- Poori site responsive (phone / tablet / desktop), admin desktop par sidebar layout.
- `tools/bulk_upload.py` ab admin ki banayi series bhi samajhta hai (`--cls "NEET Series"`).
- **Firebase rules**: `testReports` (users likh sakein) aur `testSeries` (admin likhe) ke liye write allow hona chahiye — baaki tests jaise hi.

# SK Education — v2.0
- NEW Admin > Test Series > **Bulk add**: ek saath kai files (JSON/HTML/PHP/JS/TXT/CSV) chunein. Chapter naam file ke naam se, subject file ke naam se auto; list mein dono edit ho sakte hain. Duplicate chapter par replace/skip, progress bar, ek click mein sab upload. (Purana "Single add" bhi wahi hai.)
- NEW `tools/bulk_upload.py` — Termux / PC se bulk upload (sirf Python 3). Guide: `tools/TERMUX.txt`.
- Test Series UI refresh: animated gradient hero, glossy class cards, colourful subject tiles, accent-colour per subject, sticky timer + progress bar, question tag, bade option cards with check animation, naya result/review/leaderboard look. (style.css end mein "v2.0" block; test-play.html mein sirf 3 chhote tweak.)
- sw cache v19.

# SK Education — v1.7
- NEW Test Series tab (Class 10th/12th -> subject -> chapter tests): animated test player with timer, question palette, result ring, review, per-test + overall leaderboard. Admin: Category -> Subject -> Chapter -> JSON upload with live preview.
- FIX "SKData.modApks is not a function": service worker served an old cached data.js. JS/CSS are now network-first and the app auto-clears stale cache once.
- Error handler v2: catches JS errors, promise rejections, failed scripts/CSS and failed /api calls, with "last actions" trail; sends to Telegram via /api/report-error (separate bot supported); error-handler.html has filters, system check, test alert.
- Telegram join popup on home (dismissible; editable in Admin > Settings). Mod tiles now match the other tiles.

- NEW Mod APKs (admin: add/edit/hide/pin/delete; user: search + download) and Mod Websites (logo+name+about card, "View Website" opens inside SK Education via site-view.html). WhatsApp Channel + Social Media tiles replaced.
- Security: admin password verified on the server (api/admin-login, 8h signed session, 5-try lockout + Telegram alert); user passwords salted PBKDF2 (old accounts auto-upgrade); login lockout, 30-day session expiry, safer signup rules, https-only link handling.
- Admin: new Dashboard tab. Icons shrunk from 1.8 MB to ~25-120 KB each.

# SK Education — v1.4 (fast build)

Deploy the folder root on Vercel (same as before). Env variables: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, IMGBB_API_KEY (optional SITE_URL).

## v1.5 — Course UI + Admin responsive
- User: responsive 16:9 course thumbnails (no crop/overflow), new My Courses cards with "Enrolled" state, simple Subjects list, each subject has separate PDF / Video / DPP tabs (a material is DPP if its type is "dpp" or its title contains "DPP").
- Admin: new Courses tab (thumbnail upload/URL/reset, per-subject PDF/Video/DPP counts) and Enrollments tab (grouped by course, search, remove). Thumbnails stored in educationqpp `settings/courseThumbs/<batchId>/url`.
- Global no-horizontal-scroll rules, touch-friendly sizes, landscape + Telegram safe-area handling, friendly error toast + error-handler.html.
- Bump: sw cache v13, data cache VER 7.

## What changed in v1.4
**Speed**
- Courses / materials / banners now load over plain HTTPS (`data.js`) instead of the Firebase SDK websocket, and are cached on the phone (stale-while-revalidate): 2nd visit opens instantly, fresh data updates quietly in the background.
- The whole `pdfs` list used to be downloaded on every page. It is now downloaded at most once per 5 min per device, slimmed to the needed fields, and pre-fetched while the user is on Home.
- Firebase SDK + config scripts are `defer`red, so the page shell paints first (no blank screen). Telegram script loads only inside Telegram.
- Batch page no longer waits for the enrollment check before showing subjects; My Courses paints from cache.
- `registerUser()` runs once per 10 min (was a read + write on every page); block-check / chat popup listeners start after first paint.
- Service worker v7: HTML waits max 2.5 s for network, CSS/JS/icons load from cache instantly, Firebase SDK is cached.
- Heavy `backdrop-filter` removed, off-screen cards use `content-visibility`, icons compressed (512 px logo 388 KB → 124 KB, header logo 5 KB).
- vercel.json: Mumbai region for API functions + cache headers.

**Telegram Mini App**
- Telegram Back button on inner pages (in-page arrow hidden), native haptics, safe-area + real viewport height (keyboard aware), header/bottom-bar colours synced, follows Telegram light/dark on first launch, no install banner.
- User panel: `https://t.me/YOUR_BOT/APP` — Admin panel: same link with `?startapp=admin`.

**Friendly UI**
- New logo everywhere (favicon, PWA icons, header, login).
- Skeleton loaders, clear error/empty states with a retry button, offline notice, search on courses + materials, "Show more" for long lists, auto-selects Free/Paid tab that has material, counts on tabs.
- Tablet / desktop layout (2–3 column lists), better tap targets, focus outlines, reduced-motion support.

**Cleanup**: removed dead Class 12th pages, `home.html`, `my-course.html`, `developer.html`, `app.css`, junk files.

## After deploying
Open the site once, then close and reopen — the 2nd open is the fast one. If a user still sees the old UI, the service worker (`sk-education-v7`) replaces it on the next visit. Bump `CACHE` in `sw.js` and `VER` in `data.js` whenever you deploy big changes.
