For frontend display logic, use localStorage.
For analytics, A/B testing, retargeting, CRM sync, use PostHog.

Best Practice for Syncing PostHog → LocalStorage:
Priority: Trust localStorage first (fast, device-specific), then fall back to PostHog (for cross-session/device recovery).
Timing: Only sync from PostHog once it’s fully loaded and posthog.getUserProperties() is available.
Conditionally sync: Only sync from PostHog if localStorage is empty or incomplete.
