// Service Worker for Habit Reminder Notifications
const CACHE_NAME = 'habit-tracker-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/habit-reminder-192.png',
  '/icons/habit-badge-72.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS.filter(url => 
          // Only cache assets that actually exist
          url === '/' || url.startsWith('/icons/')
        ));
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        // Return a basic offline page for navigation requests
        if (event.request.destination === 'document') {
          return new Response(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Offline - Habit Tracker</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                  .offline-message { color: #666; }
                </style>
              </head>
              <body>
                <h1>You're Offline</h1>
                <p class="offline-message">Please check your internet connection and try again.</p>
              </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      })
  );
});

// Handle notification click events
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.notification);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  event.notification.close();

  if (data.type === 'habit_reminder') {
    const { habitId, habitName } = data;

    if (action === 'complete') {
      // Handle habit completion
      event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then(clients => {
            // Send message to all clients to mark habit as complete
            clients.forEach(client => {
              client.postMessage({
                type: 'HABIT_AUTO_COMPLETE',
                habitId: habitId,
                habitName: habitName
              });
            });

            // Focus existing window or open new one
            if (clients.length > 0) {
              return clients[0].focus();
            } else {
              return self.clients.openWindow('/');
            }
          })
      );
    } else if (action === 'snooze') {
      // Schedule a new notification in 5 minutes
      event.waitUntil(
        self.registration.showNotification('Habit Reminder (Snoozed)', {
          body: `Reminder: ${habitName} - Time to complete your habit! 🔥`,
          icon: '/icons/habit-reminder-192.png',
          badge: '/icons/habit-badge-72.png',
          tag: `habit_${habitId}_snooze`,
          requireInteraction: true,
          actions: [
            {
              action: 'complete',
              title: '✓ Mark Complete',
            }
          ],
          data: {
            habitId: habitId,
            habitName: habitName,
            type: 'habit_reminder'
          }
        }).then(() => {
          // Set a timeout for the snooze (5 minutes)
          setTimeout(() => {
            // This will be handled by the notification service in the main thread
          }, 5 * 60 * 1000);
        })
      );
    } else {
      // Default click - just open the app
      event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then(clients => {
            // Send message to focus on the clicked habit
            clients.forEach(client => {
              client.postMessage({
                type: 'HABIT_NOTIFICATION_CLICKED',
                habitId: habitId,
                habitName: habitName
              });
            });

            // Focus existing window or open new one
            if (clients.length > 0) {
              return clients[0].focus();
            } else {
              return self.clients.openWindow('/');
            }
          })
      );
    }
  }
});

// Handle notification close events
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification);
  
  const data = event.notification.data || {};
  if (data.type === 'habit_reminder') {
    // Track notification dismissal analytics if needed
    console.log(`Habit reminder dismissed for habit ${data.habitId}`);
  }
});

// Handle push events (for future web push integration)
self.addEventListener('push', event => {
  console.log('Push message received:', event);
  
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const { title, body, icon, badge, tag, actions, requireInteraction } = data;

    event.waitUntil(
      self.registration.showNotification(title || 'Habit Reminder', {
        body: body || 'Time to complete your habit!',
        icon: icon || '/icons/habit-reminder-192.png',
        badge: badge || '/icons/habit-badge-72.png',
        tag: tag || 'habit_push',
        requireInteraction: requireInteraction !== false,
        actions: actions || [
          {
            action: 'complete',
            title: '✓ Complete',
          },
          {
            action: 'view',
            title: '👁 View',
          }
        ],
        data: data
      })
    );
  } catch (error) {
    console.error('Failed to handle push message:', error);
  }
});

// Background sync for offline habit completion
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'habit-sync') {
    event.waitUntil(syncHabitData());
  }
});

async function syncHabitData() {
  try {
    // Get pending habit completions from IndexedDB
    const pendingCompletions = await getPendingHabitCompletions();
    
    if (pendingCompletions.length > 0) {
      // Send to server when online
      const response = await fetch('/api/habits/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completions: pendingCompletions })
      });

      if (response.ok) {
        // Clear pending completions
        await clearPendingHabitCompletions();
        console.log('Habit data synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync habit data:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingHabitCompletions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HabitTrackerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingCompletions'], 'readonly');
      const store = transaction.objectStore('pendingCompletions');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result || []);
      getAll.onerror = () => reject(getAll.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingCompletions')) {
        db.createObjectStore('pendingCompletions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function clearPendingHabitCompletions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HabitTrackerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingCompletions'], 'readwrite');
      const store = transaction.objectStore('pendingCompletions');
      const clear = store.clear();
      
      clear.onsuccess = () => resolve();
      clear.onerror = () => reject(clear.error);
    };
  });
}

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SCHEDULE_NOTIFICATION':
      // Handle notification scheduling
      scheduleNotification(data);
      break;
    case 'CANCEL_NOTIFICATION':
      // Handle notification cancellation
      cancelNotification(data.habitId);
      break;
    case 'UPDATE_SETTINGS':
      // Handle settings update
      updateNotificationSettings(data);
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

function scheduleNotification(habitData) {
  // This would typically use the Notification API or set up timers
  // For now, we'll just log the scheduling
  console.log('Scheduling notification for habit:', habitData);
}

function cancelNotification(habitId) {
  // Cancel any pending notifications for this habit
  console.log('Cancelling notification for habit:', habitId);
}

function updateNotificationSettings(settings) {
  // Update notification settings
  console.log('Updating notification settings:', settings);
}