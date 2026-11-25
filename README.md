# MAAN Video Editing App — starter source

This is an independent, installable web-app prototype plus a minimal Android WebView wrapper source project.

## Included and working in supported browsers
- MAAN branding and owner/contact section (Abdul Rehman, +92 316 0444503)
- Guest editing mode
- Email/password sign-up and login integration via Supabase (requires your own project URL/key)
- Import and preview local video
- Trim start/end and export selected clip
- Preview/export color filters, playback speed, rotation, fit/fill
- HD/Full HD/SD export choices (browser MediaRecorder; output is WebM, not MP4)
- Responsive layout and offline shell caching

## Important limitations
This starter does **not** yet implement a multi-track timeline, merge multiple clips, crop handles, music-track mixing, vocal removal, AI effects, 4K MP4 encoding, or cloud project sync. Those require additional native media-processing work and device testing. The app does not unlock or copy proprietary paid code from the reference APK. Browser export depends on device/browser codec support and available memory; large files may fail on phones.

## Run as a web app
Open `www/index.html` through a local web server (service workers require localhost/HTTPS). For example, from the `www` directory run `python -m http.server 8000`, then open `http://localhost:8000`.

## Enable email/password login
1. Create a free Supabase project.
2. In `www/app.js`, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the project's Project URL and anon/public key.
3. Run `SUPABASE_SETUP.sql` in the Supabase SQL Editor if you want the optional profile table.
4. Configure email confirmation in Supabase Auth as desired.
5. Never put a service-role key in the app. Passwords are handled by Supabase Auth, not stored in JavaScript or localStorage.

## Android wrapper source
The `android/` folder contains a minimal WebView wrapper. Copy the contents of `www/` into `android/app/src/main/assets/www/`, then build with Android Studio/Gradle on a machine with the Android SDK installed. The wrapper is source, not a signed APK. File picking and export behavior must be tested on target Android versions.

## Owner details
Abdul Rehman · +92 316 0444503
