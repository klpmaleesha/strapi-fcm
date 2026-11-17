# Changelog

## 0.2.0

Requires Node 22 and Strapi 4.26.2. This is a breaking upgrade from 0.1.x; read the README migration steps before upgrading an existing database.

- Replaces the retired legacy Firebase send API with current HTTP v1-backed multicast sends.
- Fixes the out-of-scope history entry error, fresh configuration crash, invalid history queries, duplicate registration, and stuck loading states.
- Preserves the Strapi aesthetic and Send/Sent tabs; adds a live text preview and clearer result feedback.
- Adds 500-device batching, selected-device and topic targeting, custom string data, validation-only test sends, acceptance counts, and paginated history.
- Removes definitively expired tokens after actual sends, while preserving tokens on transient or ambiguous errors.
- Adds required admin permissions and limits public token-registration requests.
- Redacts stored Firebase credentials from configuration responses and isolates the plugin's Firebase app.
- Fixes unsigned Cloudinary multipart uploads, secure URL handling, invalid preset and network errors, and image reuse after a Firebase failure.
- Makes Cloudinary optional, supports server-managed Firebase credentials, and adds local simulated demos and automated checks.

## 0.1.3

Previous published release.
