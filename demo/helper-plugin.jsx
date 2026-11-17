export const useNotification = () => (notice) => window.dispatchEvent(new CustomEvent('demo-notice', { detail: notice }));
export const auth = { getToken: () => 'local-demo', clearAppStorage() {} };
