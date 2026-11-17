# Upgrade from 0.1.x

Back up your database and test against a staging copy before upgrading. Update to Node 22 and Strapi 4.26.2 first, then stop Strapi while preparing existing token data. Version 0.2.0 makes tokens required and unique; old duplicate, blank, null, whitespace, or over-255-character token rows must be cleaned **before** Strapi synchronizes the new schema.

A reusable preparation script is included in the repository. It defaults to a read-only report. Run it using your Strapi project's database driver and the correct database configuration:

```sh
node /path/to/strapi-fcm/scripts/prepare-upgrade.cjs /path/to/database-config.json
node /path/to/strapi-fcm/scripts/prepare-upgrade.cjs /path/to/database-config.json --apply
```

See `scripts/prepare-upgrade.cjs` for the configuration shape. The apply mode removes invalid tokens, trims valid ones, and keeps the oldest row for duplicate tokens in a transaction. It does not send notifications. Run it only against the database you intend to migrate.

Rebuild the Strapi admin and assign the new permissions after upgrading. Existing Firebase/Cloudinary settings are reused. The original draft/publish setting is retained so Strapi does not delete existing unpublished token or history rows during schema synchronization. Plugin services read these rows directly. `/sent` now returns a paginated object rather than a bare array; `/users/tokens` returns an acknowledgment rather than the stored token. History from older versions has no reliable acceptance counts.

