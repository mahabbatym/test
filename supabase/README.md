# Cherry Supabase Sync

Apply the latest migration before running the enterprise UI:

```sql
-- Supabase SQL Editor
-- paste and run:
-- supabase/migrations/20260520000100_sync_enterprise_profiles.sql
```

This migration syncs older databases by adding missing `profiles` columns such as
`updated_at`, `display_name`, `bio`, `country`, `city`, avatar and premium fields,
creates the `feedback` table, and provisions the public `avatars` storage bucket.
