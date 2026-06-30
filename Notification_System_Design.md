# Stage 1

## Priority Algorithm

Notifications are assigned a numeric weight based on their type:

| Type      | Weight | Description |
|-----------|--------|-------------|
| Placement | 3      | Most critical (career/hiring updates) |
| Result    | 2      | Important (marks/academic results) |
| Event     | 1      | General (campus festivals/seminars) |

*Any unrecognized notification type defaults to weight `0`.*

## Sorting Logic

Notifications are sorted using a two-key comparator:
1. **Primary Sort (Weight Descending)**: Placement notifications appear first, followed by Results, and then Events.
2. **Secondary Sort (Recency Descending)**: If two notifications have the same weight, the one with the newer `Timestamp` is shown first.

Only the **Top 10** notifications are returned to the user.

```javascript
// Example code snippet
const sorted = notifications.sort((a, b) => {
  const weightDiff = getWeight(b) - getWeight(a);
  if (weightDiff !== 0) return weightDiff;
  return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
}).slice(0, 10);
```

## Efficiently Maintaining the Top 10

When new notifications arrive continuously (e.g. via real-time WebSocket feeds), performing a full re-sort is inefficient. Instead, we can maintain the Top 10 using a **Min-Heap of size 10**:

1. **Heap Initialization**: Maintain a min-heap with a fixed maximum capacity of 10, keyed by `(weight, timestamp)`.
2. **On New Notification**:
   * If heap size is less than 10, insert the new notification: **O(log 10)**.
   * If the heap is full, compare the new notification's score with the root element (the minimum element currently in the Top 10):
     * If the new notification has a higher priority, remove the root and insert the new notification: **O(log 10)**.
     * Otherwise, discard the new notification: **O(1)**.

---

# Stage 2

## Application Architecture Overview

The frontend is a React application styled using **Material UI**. It contains two main views accessible via tab navigation:

1. **All Notifications Page**: Shows a list of all incoming notifications using server-side pagination (`page`, `limit`) and server-side filtering (`notification_type`).
2. **Priority Inbox Page**: Displays client-sorted top `n` notifications (customizable to 5, 10, 15, or 20) with live filtering.

```
+-------------------------------------------------------------+
|                     Campus Notifications                    |
|       [ All Notifications ]        [ Priority Inbox ]       |
+-------------------------------------------------------------+
|                                                             |
|  [All] [Placement] [Result] [Event]   Show: [Top 10 | v]    |
|                                                             |
|  #1  [Placement] CSX Corporation hiring             [NEW]   |
|  #2  [Placement] Visa Inc. hiring                   [NEW]   |
|  #3  [Result]    end-sem results                            |
|                                                             |
+-------------------------------------------------------------+
```

## Core Implementation Features

### 1. Automated Authentication (`src/config/auth.js`)
* Tokens expire after 15 minutes. To prevent manual rotations, the app auto-authenticates.
* When requesting a token, it POSTs credentials to `/auth`, caches the token in-memory, and schedules an auto-refresh 60 seconds before it expires.

### 2. Browser CORS Resolution (`vite.config.js`)
* The assessment API sends conflicting `Access-Control-Allow-Origin` headers causing browser sandbox errors.
* We configured a local development **reverse proxy** in Vite. Requests to `/api` are locally intercepted and safely forwarded to the remote API server by the local Node server, bypassing CORS restrictions entirely.

### 3. Read/Unread Tracker (`src/state/viewedNotifications.js`)
* Distinguishes between new and viewed notifications without a database using browser `localStorage`.
* **State Snapshot Pattern**: On component mount, the app captures a snapshot of currently viewed IDs. New items show a **"NEW"** badge and distinct color. Once rendered, their IDs are added to `localStorage` so they appear as read the next time the app loads.

### 4. Logging Middleware (`src/middleware/logger.js`)
* Implements the mandatory `Log(stack, level, package, message)` method.
* **Message Truncation**: Automatically trims log messages to a maximum of 48 characters to satisfy the assessment logger's validation limit and avoid `400 Bad Request` errors.
* **Resilient Handling**: Catch-blocks swallow logging network glitches so a logger failure never crashes the application.
