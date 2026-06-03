import { createClient } from '@supabase/supabase-js';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key);
}

function formatArchiveNo(n) {
  const num = Number(n || 0);
  return String(num).padStart(5, '0');
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    });
  }

  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('letters')
      .select('id, archive_no, poem, line, date_label, season, source, payload, created_at')
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const letters = (data || []).map(row => ({
      id: row.id,
      no: formatArchiveNo(row.archive_no),
      archive_no: row.archive_no,
      poem: row.poem || '',
      line: row.line || '',
      date: row.date_label || '',
      season: row.season || 'none',
      source: row.source || 'bank',
      created_at: row.created_at,
      payload: row.payload || {},
      draftStages: row.payload?.draftStages || {},
      lineSource: row.payload?.lineSource || 'unknown',
    }));

    return res.status(200).json({
      ok: true,
      count: letters.length,
      letters,
    });
  } catch (err) {
    console.error('[list-letters]', err);

    return res.status(500).json({
      ok: false,
      error: err.message || 'List failed',
    });
  }
}
