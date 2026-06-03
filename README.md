# LOVE LETTER Archive API Template

This is the Vercel API layer for archiving generated letters.

## Files

- `api/upload-letter.js` — receives the archive payload and inserts it into Supabase.
- `api/delete-letter.js` — soft-deletes the last uploaded letter.
- `supabase_schema.sql` — creates the `letters` table and `public_letters` view.

## Environment variables on Vercel

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not put the service role key inside the HTML file.
