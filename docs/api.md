# Sending notifications and API reference

## Send notifications

Use **Strapi FCM → Send**. The form includes a live text preview, optional image, audience selection, and custom string data under Advanced options. **Test without sending** asks Firebase to validate without delivery, token cleanup, or a history entry. **Sent** shows paginated history with status and acceptance/failure counts.

From trusted server code:

```js
const result = await strapi.plugin('strapi-fcm').service('service').sendNotification({
  title: 'A new update',
  body: 'Your dashboard is ready.',
  image: 'https://example.com/notification.png', // optional
  data: { screen: 'updates' },                 // optional string values
  dryRun: false,                              // true validates without delivery
});
```

Omit both `tokens` and `topic` to broadcast to registered devices. Choose one to target devices or a topic:

```js
await strapi.plugin('strapi-fcm').service('service').sendNotification({
  title: 'Test device', body: 'A targeted notification', tokens: ['registration-token'],
});

await strapi.plugin('strapi-fcm').service('service').sendNotification({
  title: 'News', body: 'A topic notification', topic: 'product-updates',
});
```

Devices must already be subscribed to the Firebase topic. Token lists accept up to 5,000 tokens per call and are deduplicated. Broadcasts page through registered tokens and split requests into groups of up to 500, as required by [Firebase's multicast API](https://firebase.google.com/docs/cloud-messaging/send/admin-sdk). New registrations join the next broadcast.

Responses contain:

```json
{
  "response": {
    "successCount": 2,
    "failureCount": 1,
    "recipientCount": 3,
    "removedTokenCount": 1,
    "errors": { "messaging/registration-token-not-registered": 1 }
  },
  "entry": { "id": 1, "status": "partial" },
  "dryRun": false,
  "status": "partial"
}
```

Statuses are `sending`, `sent`, `partial`, `failed`, or `empty`. Older history is labeled `legacy`, with unknown acceptance counts. Firebase acceptance does not confirm that a device displayed or received the notification. Topic counts describe one accepted topic request, not the number of subscribed devices. Test responses use `entry: null`.

Only definitively expired/invalid registration tokens are removed. Temporary failures and ambiguous `invalid-argument` errors do not trigger removal. Transport failures return an error; previous batches may already have been accepted. Review history before retrying to avoid duplicate notifications. The plugin does not automatically retry broadcasts or provide exactly-once delivery.

## Admin HTTP endpoints

All endpoints are prefixed with `/strapi-fcm`. Except device registration, they require a Strapi admin session and the matching permission; do not expose an admin bearer token to frontend users.

| Method | Path | Permission / response |
| --- | --- | --- |
| GET | `/config` | Read; sanitized status, cloud name and preset |
| POST | `/config` | Configure; update settings or rotate a service account |
| POST | `/send` | Send; same input as the server service |
| GET | `/sent?page=1&pageSize=25` | Read; `{ results, pagination }`, maximum page size 100 |
| POST | `/users/tokens` | Public; idempotent, rate-limited registration |

