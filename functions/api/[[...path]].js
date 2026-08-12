// Pages Function: /api/* (catch-all proxy)
// Meneruskan request API ke Supabase REST API atau Auth API.
// - /api/auth/*  → {supabaseUrl}/auth/v1/*
// - /api/{table} → {supabaseUrl}/rest/v1/{table}

export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = context.env.VITE_SUPABASE_URL;
  const supabaseKey = context.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({ error: 'Supabase configuration missing' }, 500, corsHeaders);
  }

  const pathSegments = context.params.path || [];
  const url = new URL(context.request.url);
  const queryString = url.search;

  // Route: /api/auth/* → Supabase Auth API
  let targetUrl;
  if (pathSegments[0] === 'auth') {
    const authPath = pathSegments.slice(1).join('/');
    targetUrl = `${supabaseUrl}/auth/v1/${authPath}${queryString}`;
  } else {
    // Route: /api/{table} → Supabase REST API (PostgREST)
    const tablePath = pathSegments.join('/');
    targetUrl = `${supabaseUrl}/rest/v1/${tablePath}${queryString}`;
  }

  const reqHeaders = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
  };

  // Forward select header for PostgREST column selection
  const selectHeader = context.request.headers.get('Prefer');
  if (selectHeader) reqHeaders['Prefer'] = selectHeader;

  const reqBody =
    context.request.method !== 'GET' && context.request.method !== 'HEAD'
      ? await context.request.text()
      : undefined;

  try {
    const resp = await fetch(targetUrl, {
      method: context.request.method,
      headers: reqHeaders,
      body: reqBody,
    });

    const respText = await resp.text();
    const respContentType = resp.headers.get('content-type') || 'application/json';

    return new Response(respText, {
      status: resp.status,
      headers: {
        'Content-Type': respContentType,
        ...corsHeaders,
      },
    });
  } catch (err) {
    return jsonResponse({ error: err.message }, 502, corsHeaders);
  }
}

function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
