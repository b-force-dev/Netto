# Mobile layout audit — 13 November 2026

Base: develop, implementation branch `t3/mobile-layout-audit-1`.

## Changes

- Load `css/mobile.css` last in index.html and stats.html; all overrides are limited to widths up to 820px.
- Move the first-visit Daily action higher; reduce returning-player heading/spacing.
- Give buttons a 44px minimum target, including navigation, archive arrows, puzzle navigation, connection drag handles and result controls.
- Let the menu scroll rather than compressing its items on short screens.
- Increase informational labels, question notes and form text; keep editable fields at least 16px.
- Wrap the reveal verdict and explanation button onto separate lines when necessary. Previously the verdict could become an almost vertical column on 320px screens.
- Use the visual viewport for phone dialogs and fixed game scroll containers when the software keyboard reduces visible space. Keep focused fields visible and hide the floating calculator while editing.
- Add bottom safe-area clearance to game screens and calculator, wrap small-screen live layouts, improve theme-dependent muted text and login field colors.
- Give the standalone 404 page dynamic viewport height and safe-area padding.

## Browser verification

Served the root checkout with Python on 127.0.0.1:8769. Used the shared Chromium browser at 320×568, 390×844, 412×915 and 768×1024; repeated main navigation/game checks in English and Dutch, with light and dark theme. Also checked 568×320 landscape and a 320×300 reduced viewport.

Exercised first-visit and returning home, menu, Daily question/reveal/result (real Supabase response and guest submission), Library list/puzzle, archive, Race setup/online setup/solo game/end, Connection list/game, Live setup, settings, about, how-to-play, photo credits, statistics dialog, login/register, stats.html, 404.html and offline.html. Inspected rendered content and measured scroll width and control bounds. The transient modal entrance transform can report a target below 44px during animation; settled controls measured at least 44px.

Used local DOM fixtures for the submissions form (question and puzzle variants), Live waiting room/game/final layout and a long player name, without creating accounts or publishing rooms. Verified the existing PWA reminder under the Daily result and reviewed install-hint CSS. No document-level horizontal overflow in the exercised layouts. Hidden one-pixel photo-credit accessibility content may have child bounds outside the viewport; its clipping prevents visible overflow.

At 320×300 the login dialog scrolls, with its final visible link reachable at y≈267. In landscape the menu scrolls. stats.html had no visible text below 14px at 320px. Numeric answer fields already had inputmode=numeric, including submission answers and live-round settings.

## Open verification

- Browser tools resize the real browser viewport but do not emulate a native iOS/Android keyboard, touch user agent, installation, notch or home indicator. Check an actual installed iPhone/Android app, keyboard focus/rotation and safe areas before calling those device behaviors verified.
- Full multiplayer races/live rounds with multiple authenticated users were not played. Their dynamic layout fixtures do not verify network/session behavior.
- Theme sets were not present in this checkout's Race implementation. Recheck the parallel agents' new screens/tutorial and run this audit again after integration.
- PWA install prompt eligibility and OS install sheet were not exercised. No comprehensive WCAG contrast certification was performed.

## Checks

Passed: `node tests/daily-reliability.cjs`, `node tests/daily-server.cjs`, `node tests/usage.cjs`, `git diff --check`.

No website mirror generation, existing cache version changes or push. The integrator must bump changed asset versions and regenerate website/ after merging.
