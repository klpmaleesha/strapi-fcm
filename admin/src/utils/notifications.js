export const errorMessage = (error) => error.response?.data?.error?.message || error.message || 'The request failed. Please try again.';

export const deliveryNotice = (result) => {
  const { successCount, failureCount, removedTokenCount } = result.response;
  if (result.status === 'empty') return { type: 'warning', message: 'No registered devices. No notification was sent.' };
  const prefix = result.dryRun ? 'Test complete. No notifications sent.' : 'Firebase accepted the notification.';
  return {
    type: failureCount ? 'warning' : 'success',
    message: `${prefix} ${successCount} accepted, ${failureCount} failed.${removedTokenCount ? ` ${removedTokenCount} expired tokens removed.` : ''}`,
  };
};
