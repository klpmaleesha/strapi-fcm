# Verification notes — 0.2.0

The release was checked on November 18, 2026. Demo screenshots use sample data.

## Automated checks

- 23 tests cover large multicast broadcasts, duplicates, expired and ambiguous token errors, dry runs, topic/device targeting, empty audiences, transport failures, credential rotation, configuration redaction, validation, pagination, permission declarations, registration throttling, Cloudinary multipart uploads and errors, and upgrade preparation.
- The runtime smoke test loads the real Firebase Admin SDK and validates a generated local test key without making Firebase network calls.
- The Node 22 test run and admin source bundle check pass.
- The plugin's installed production dependency audit reports zero known vulnerabilities at verification time. This does not audit an entire consuming Strapi application.
- The npm tarball was inspected for runtime entry points and intended files; test fixtures, local dependency folders, credentials, and environment files are excluded.

## Browser checks

The actual React screens were exercised with the official Strapi design system 1.19.0 in a local demo shell:

- Validation-only test on a 1,204-device sample audience.
- Broadcast with 1,201 accepted, 3 failed, and one expired token removed.
- Topic and selected-device sends, with readable history results.
- Image selection, local simulated unsigned multipart upload, and use of its HTTPS URL in the notification.
- Invalid Cloudinary preset stops sending and restores the form's controls.
- A test send with a local image file returns an explanation without uploading it.
- Configuration loading and saving with server-managed sample credentials.
- Desktop layout at 1440 pixels and mobile layout at 390 pixels; the mobile form fits without horizontal page overflow.

## Live-account checks still required

No real device notification was sent and no real Cloudinary asset was uploaded during these checks. Firebase delivery requires a test project, real device token, and working credentials. A Cloudinary live upload requires the intended cloud name and restricted unsigned preset. The local demo does not replace a staging test inside a full Strapi application or a database migration rehearsal against a staging backup.
