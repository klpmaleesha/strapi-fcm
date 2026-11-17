# Configuration

## Configure Firebase

Open **Settings → Strapi FCM → Configure** and upload a Firebase service account JSON file. Configuration responses never return the private key. A saved key stays in the Strapi plugin store unless you manage credentials on the server; protect database backups accordingly.

For server-managed credentials, use `config/plugins.js` and environment variables:

```js
module.exports = ({ env }) => ({
  'strapi-fcm': {
    enabled: true,
    config: {
      serviceAccount: {
        project_id: env('FIREBASE_PROJECT_ID'),
        client_email: env('FIREBASE_CLIENT_EMAIL'),
        private_key: env('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      },
      registrationRateLimit: { windowMs: 60000, max: 30 },
    },
  },
});
```

Alternatively set `useApplicationDefault: true` and configure [Google Application Default Credentials](https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments). Server-managed credentials take priority over a service account stored through the UI. The plugin uses its own named Firebase app and leaves other Firebase apps alone.

Grant the plugin's **Read**, **Send**, and **Configure** permissions to the relevant admin roles. Read is needed to load configuration status and notification history. Sending and saving settings require their own permissions.

## Optional Cloudinary images

Text notifications and direct HTTPS image URLs work without Cloudinary. For browser image uploads:

1. In your Cloudinary product environment, create an **unsigned upload preset** restricted to the image formats, file size, and destination folder you need.
2. Enter the **cloud name** and **unsigned upload preset name** in the plugin settings. These are not an API key or API secret. Leave both fields empty to disable uploads.
3. In Send, choose **Upload an image instead**, select a PNG or JPEG up to 5 MB, then send. The plugin uploads the image as multipart form data and passes Cloudinary's HTTPS `secure_url` to Firebase as `notification.imageUrl`.

The browser sends only the image and upload preset to Cloudinary; Firebase credentials are never included. Upload failures and timeouts stop the notification request and show an error. A successful image upload is reused if the subsequent notification request fails. A test send never uploads a selected local file: use an existing HTTPS image URL or remove the file first.

Preset restrictions must be configured in Cloudinary; the settings screen saves the values without claiming to have verified them. FCM/browser/platform image restrictions still apply. See the [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference#unsigned_upload_syntax) and [Firebase image notification documentation](https://firebase.google.com/docs/cloud-messaging/android/send-image).

