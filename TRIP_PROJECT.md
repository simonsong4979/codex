# Tokyo family trip — working memory

## Goal and decisions
- Build a Korean, mobile-first itinerary site accessible abroad; support offline access after the first successful online visit.
- User delegated planning and requested durable, continually updated context with efficient token usage. Read this file before reopening large source files.
- Preserve the unrelated Next.js portfolio. Use standalone static HTML/CSS/JS in `tokyo-trip/`, without package installs, CDN fonts, or paid APIs.
- No public URL yet. GitHub API read failed with `Forbidden` on 2026-10-22; Git access alone does not establish deployment access. User answered: no hosting account, prepare the simplest method. Use Netlify Drop manual HTTPS deployment; no token or secret needed for local work.

## Source and accuracy
- PDF: `6bcc31f4-42b5-4d48-85cc-ecbb2cec13d8_날짜별_상세_일정표.pdf`, uploaded in this chat.
- Extracted text: `/tmp/tokyo-itinerary.txt` (temporary; canonical structured site data will be `tokyo-trip/itinerary.js`).
- 2027-01-04 through 2027-01-07, 3 nights / 4 days, 3 family members. All schedule/transport/booking times provisional. Adjust to family condition.
- Hotel: Tobu Hotel Levant Tokyo. Outbound ICN→NRT 10:25–12:50 on Jan 4; return NRT→ICN 13:15–16:15 on Jan 7. Flight numbers and terminals absent; do not invent.
- Day 1: depart home 06:30; airport 07:30; hotel 14:30; Ichiran Asakusa 16:00; Sensoji 17:00; Skytree 18:10.
- Day 2: Tokyo Tower/Shiba 10:00; Starbucks Shiba Daimon 11:00; Shibuya 12:30; Moheji 14:00; Center-gai 15:10; teamLab Planets 17:30; Torikizoku 19:30; Akihabara 20:30.
- Day 3: depart hotel 06:30; Disneyland 07:30 onward. 07:30 is planned arrival, not confirmed opening time.
- Day 4: hotel departure 09:00; NRT arrival 10:00 (transport duration unverified); check-in; return flight.
- Conflicts: Day 2 heading mentions Odaiba, but no Odaiba stop exists in rows. Torikizoku transfer names Akihabara branch but dining row names Asakusa. Airport transfers may be optimistic; verify route, timetable, terminal. Shibuya Sky/teamLab/Disney reservations and all current business hours unconfirmed.

## Implementation plan
1. [done] Structured itinerary: 4 days / 30 activities, original starting-location-only rows folded into first transfer notes. Tabs, transit/visit filters, maps, 16-item preparation list, travel info.
2. [done] PWA, atomic versioned offline app shell, per-device checklist/completion persistence, print view, no-JS text fallback. Local SVG and PNG icons.
3. [done] 15 browser validations passed against the final packaged output with system Chromium, including production CSP, 320–1440px layouts, US timezone, root/subdirectory hosting, offline reload, print, disabled storage, keyboard focus. Corrected a tab focus race and refined the mobile hero after inspecting screenshots.
4. [blocked externally] No hosting account/project supplied. Prepare Netlify Drop upload ZIP and instructions; publishing requires user's authenticated hosting session. Do not claim live access.

## Validation and changes
- Repository initially clean; no agent instructions existed. Existing portfolio remains untouched.
- Playwright available through preinstalled Node runtime; use `/usr/bin/chromium` (Playwright's default bundled executable is absent). Browser download domain is blocked; no download is needed.
- Final archive validation: ZIP is ~52KB, passes ZIP integrity check, and all 13 entries exactly match source. No existing tracked portfolio files or lockfiles were changed.
- Current archive SHA256: `a94530737b1576fb75d50d6d8cd44538959b09a8b7c05e7931c5de6ed8d1f3c0` (theme/place update, SW v3).
- Serve locally: `python -m http.server 4173 --bind 127.0.0.1 --directory tokyo-trip` from repo root. A preview instance is running on port 4173.
- Build/package: `node scripts/build-trip.mjs`; output `/workspace/trip-release/tokyo-trip/`, `tokyo-trip.zip`, and `SHA256SUMS`. ZIP contains only 13 public site files, no source PDF or memory docs.
- Validate: `node scripts/test-trip.cjs`; choose packaged site with `TRIP_SITE_DIR=/workspace/trip-release/tokyo-trip`. Screenshots and print PDF in `/workspace/trip-release/checks/`.
- Handoff and update instructions: `TRIP_DEPLOY.md`. User requested simplest approach (no existing hosting). Deploy is manual upload at https://app.netlify.com/drop, then verify real HTTPS URL on each family device.
- Remaining external action: user signs into a hosting account and uploads the prepared folder. No public URL, real international network check, or iPhone hardware installation has been verified. Chromium offline/install metadata was verified locally. Do not repeat installation or reread the PDF unless changing itinerary data.

## Preview error follow-up
- User reported “시각화 내부에서 오류” and clarified it occurs when opening the **screen preview**, not the itinerary site. The original link points to a workspace PNG. PNG bytes are valid and render through the image tool; the chat's file-preview UI cannot be directly inspected/repaired here. Do not call the platform error definitively fixed.
- Displayed the mobile screenshot directly through the image tool instead of relying only on the previous file-preview link.
- Added `/workspace/trip-release/tokyo-trip.html`: a self-contained, classic-script HTML distribution with inline CSS, itinerary, and icons, no module requests or service workers. The regular ZIP remains the PWA distribution (now 13 files after adding theme assets). Build script now generates both.
- Hardened service-worker access against throwing getters in sandboxed frames. Portable HTML skips SW entirely, explains its storage behavior, and shares instructions for the actual file rather than about:blank URLs.
- Intercepted fragment menu links so srcdoc previews don't navigate against the parent page URL. Replaced findLast with reverse/find for older-browser compatibility.
- Added `node scripts/test-trip-portable.cjs`: 4 checks passed for offline HTML bytes, opaque-origin sandbox with denied storage, denied SW getter, and uncaught-exception checks. The managed Chromium blocks file:// by administrator policy; direct local-file navigation was not verified or bypassed. Exact standalone file content was tested offline using setContent.
- Existing 15-check suite passed again against the final packaged output; corrected one flaky assertion to wait for asynchronous hash navigation before checking event count. Total: 15 standard + 4 compatibility checks passed.
- No hosting account, public deployment, or verified external URL was added during this follow-up.

## Theme and place clarity update
- User requested distinct light/dark palettes, readable dark-mode text, less emotional copy, and clearer place names.
- Added `theme.js` (system default, manual switch, independent persisted preference; safe with denied storage) and `theme.css` (semantic palettes, higher-contrast text and warnings, opaque navigation). Switch is in the header and also works in portable/sandboxed HTML.
- Light: white/gray surfaces, dark slate text, deep teal accents. Dark: navy/slate surfaces, light text, mint accents; selected tabs use dark text on mint. Removed background tween that briefly reduced tab contrast during theme changes.
- Replaced promotional activity headings with actual place names (Ichiran Asakusa, Skytree, Tokyo Tower/Shiba Park, Starbucks Shiba Daimon, Moheji Shibuya Scramble Square, teamLab Planets, Disneyland). Larger/bolder titles; identical secondary place labels suppressed. Dates, times, maps, warnings and 30-event structure retained.
- Replaced emotional hero/day/sidebar/countdown copy with itinerary, area and reservation details; removed the emotional day-ending sentence.
- Packaging now includes 13 PWA files and embeds both theme assets into the standalone HTML. Service-worker version v3; checklist keys unchanged.
- Validation: 18 main checks + 4 portable/sandbox compatibility checks passed. Browser-computed visible text contrast >=4.5:1 in BOTH themes across schedule, checklist and info views. Theme follows OS until manually selected; manual choice persists across reload and OS changes.
- Screenshots: `/workspace/trip-release/checks/mobile-light.png` and `mobile-dark.png`. Updated HTML/ZIP in the existing release directory. Public hosting status remains unchanged.

## Deployment preparation
- User accepted the latest theme/place presentation and requested deployment preparation.
- Rechecked the unchanged current ZIP: integrity passes, exactly 13 files, every file matches source, including theme assets and service-worker v3. No need to repeat browser suites for unchanged source.
- No Netlify/Vercel auth variables, CLI auth files, or saved draft secret bindings exist. No hosting connector is available. Do not ask for secret values in chat.
- Prepared `/workspace/trip-release/배포_안내.txt` (short Korean instructions) and `release-manifest.json` (prepared_not_published, public_url null, exact archive checksum). Neither internal artifact is added to the public site ZIP.
- User's final step: download ZIP, extract, sign into https://app.netlify.com/drop, upload the folder containing index.html. Then verify generated HTTPS URL; no build or server settings needed.
- Public deployment remains unperformed: it requires the user's authenticated hosting session. Never fabricate a public URL or describe local artifact links as a live site.

## Download delivery and free deployment correction
- User confirmed ZIP link cannot download, then required a free hosting method. Workspace paths are internal and were incorrectly presented as usable downloads; do not repeat this approach as a verified delivery method.
- Existing HTTPS Git proxy authenticates read and push dry-run on selected repository; GitHub API restriction does NOT mean Git pushes are unavailable. Dry-run to a new `tokyo-trip-deploy` branch succeeded.
- Added root `netlify.toml` to select static base `tokyo-trip`, publish `.`, and a tested static asset verification command; leaves portfolio source and main unchanged.
- Copied verified ZIP and portable HTML to `releases/` for delivery via GitHub, with SHA256SUMS. No uploaded PDF, secrets, node_modules, or browser artifacts included.
- Free workflow: Netlify Free → import GitHub repository → branch tokyo-trip-deploy → deploy with config. Use included netlify.app subdomain; no paid custom domain or API. Free usage limits apply; do not promise unlimited access or claim site publication before verification.
- Preparing a dedicated Git branch for the accepted trip site and deployment artifacts. Push result must be recorded before describing it as uploaded.
