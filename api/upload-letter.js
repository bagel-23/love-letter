import { createClient } from '@supabase/supabase-js';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    });
  }

  try {
    const payload = req.body;

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        ok: false,
        error: 'Invalid JSON payload',
      });
    }

    if (!payload.poem || !payload.draftStages) {
      return res.status(400).json({
        ok: false,
        error: 'Missing poem or draftStages',
      });
    }

    const supabase = getSupabase();

    const row = {
      poem: payload.poem,
      line: payload.line || '',
      date_label: payload.date || '',
      season: payload.season || 'none',
      source: payload.source || 'bank',
      payload,
      deleted: false,
    };

    const { data, error } = await supabase
      .from('letters')
      .insert(row)
      .select('id, archive_no, created_at')
      .single();

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      id: data.id,
      letter: data,
    });
  } catch (err) {
    console.error('[upload-letter]', err);

    return res.status(500).json({
      ok: false,
      error: err.message || 'Upload failed',
    });
  }
}
