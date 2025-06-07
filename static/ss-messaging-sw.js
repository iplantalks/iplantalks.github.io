// self['appUrl'] = 'https://customer.smartsender.eu';
// self['appToken'] = 'vYuNe629q09q2geaHTJQEjws7vyDxNTM9QoiRtW1';
// self['appSenderIdentifier'] = '744213958812';

// self.importScripts(self['appUrl'] + '/js/client/push/fcm/worker.js');

// TODO: serviceworker - prepearing for rip
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())
