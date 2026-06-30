# Stage 1

## Priority Algorithm

Notifications are assigned a numeric weight based on their `type` field:

| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

The weight reflects business importance: a Placement notification is the most
actionable for a student, followed by a Result, then a general Event.
Any unrecognised type defaults to weight `0` and sinks to the bottom.

## Sorting Logic

All notifications fetched from the API are sorted using a two-key comparator:

1. **Primary key — weight (descending)**  
   Higher-weight notifications appear first.  
   `Placement → Result → Event`

2. **Secondary key — timestamp (descending)**  
   Within the same weight tier, the notification with the newer
   `createdAt` / `timestamp` value appears first.

After sorting, only the **top 10** entries are kept and returned to the UI.

```
sorted = notifications
  .sort((a, b) => (weight[b.type] - weight[a.type]) || (time(b) - time(a)))
  .slice(0, 10)
```

## Efficiently Maintaining the Top 10 When New Notifications Arrive

When a new notification arrives (e.g., via polling, WebSocket push, or
server-sent events), the top-10 list can be updated without re-sorting
the entire dataset using a **min-heap of size 10**:

### Strategy

1. **Maintain a min-heap** keyed on `(weight, timestamp)` with a fixed
   capacity of 10.
2. For every incoming notification:
   - Compute its `(weight, timestamp)` score.
   - If the heap has fewer than 10 entries → push the notification.
   - Else if the new notification's score **exceeds the heap minimum** →
     pop the minimum and push the new notification.
   - Otherwise → discard (it would not make the top 10).
3. The heap always contains exactly the top 10 notifications at O(log 10)
   = **O(1) amortised** cost per new notification.

### Complexity

| Operation            | Naive re-sort | Min-heap |
|----------------------|---------------|----------|
| Process 1 new item   | O(n log n)    | O(log 10) ≈ O(1) |
| Read top 10          | O(n log n)    | O(10 log 10) ≈ O(1) |
| Space                | O(n)          | O(10) = O(1) |

### Current Implementation

In the current Stage 1 implementation, `getTopN()` in
`src/utils/notificationPriority.js` performs a full sort and slice on the
array returned by a single API fetch. This is correct and sufficient for
a one-time load. The min-heap optimisation would be applied when the
notification stream becomes continuous (e.g., a live WebSocket feed).
