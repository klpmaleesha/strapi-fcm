'use strict';

module.exports = {
  default: { useApplicationDefault: false, registrationRateLimit: { windowMs: 60000, max: 30 } },
  validator(config) {
    if (typeof config.useApplicationDefault !== 'boolean') throw new Error('useApplicationDefault must be a boolean');
    for (const key of ['windowMs', 'max']) {
      if (!Number.isSafeInteger(config.registrationRateLimit?.[key]) || config.registrationRateLimit[key] < 1) {
        throw new Error(`registrationRateLimit.${key} must be a positive integer`);
      }
    }
  },
};
