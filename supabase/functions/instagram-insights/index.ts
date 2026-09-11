// Supabase Edge Function: instagram-insights
// Server-side proxy for Meta Graph API v21.0 with 5-minute rate-limit caching & detailed Deno console logging.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 5-minute in-memory cache per account to prevent Meta API rate limits
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const insightsCache = new Map<string, { timestamp: number; payload: any }>();

interface RequestBody {
  client_id?: string;
  instagram_account_id?: string;
  access_token?: string;
  force_refresh?: boolean;
}

  // 1. Health check & CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method === 'GET') {
    console.log('[INSTAGRAM_EDGE_FUNCTION] Health check ping OK');
    return new Response(
      JSON.stringify({
        status: "healthy",
        function_name: "instagram-insights",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }

  try {
    let body: RequestBody = {};
    try {
      body = await req.json();
    } catch {
      // Empty body
    }

    const clientId = body.client_id;
    const instagramAccountId = body.instagram_account_id;

    if (!clientId) {
      return new Response(
        JSON.stringify({
          success: false,
          status: "not_connected",
          error: "Missing required parameter: client_id"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Check 5-minute cache unless force_refresh is requested
    const cacheKey = `${clientId}_${instagramAccountId}`;
    const cached = insightsCache.get(cacheKey);
    const now = Date.now();

    if (!body.force_refresh && cached && (now - cached.timestamp < FIVE_MINUTES_MS)) {
      console.log(`[INSTAGRAM_CACHE_HIT] Serving 5-min cached response for client: ${clientId} (${instagramAccountId})`);
      return new Response(
        JSON.stringify({
          ...cached.payload,
          source: 'edge_cache_5min',
          cached_at: new Date(cached.timestamp).toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Retrieve secret dynamically for this client_id (or use body token if provided)
    const secretKeyName = `INSTAGRAM_TOKEN_${clientId}`;
    const accessToken = body.access_token || Deno.env.get(secretKeyName);

    if (!accessToken || !instagramAccountId) {
      const errMsg = `No active Instagram connection or secret (${secretKeyName}) found for client: ${clientId}`;
      console.warn(`[INSTAGRAM_CONFIG_NOTICE] ${errMsg}`);
      return new Response(
        JSON.stringify({
          success: false,
          status: "not_connected",
          error: errMsg
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // 1. Call Meta Graph API v21.0 for account details & follower counts
    const accountUrl = `https://graph.facebook.com/v21.0/${instagramAccountId}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${accessToken}`;
    
    let accountRes: Response;
    try {
      accountRes = await fetch(accountUrl);
    } catch (fetchErr: any) {
      const logPayload = {
        timestamp: new Date().toISOString(),
        client_id: clientId,
        instagram_account_id: instagramAccountId,
        error_type: "FETCH_NETWORK_ERROR",
        message: fetchErr.message || "Failed to establish HTTP connection to Meta Graph API"
      };
      console.error('[INSTAGRAM_FETCH_FAILED]', JSON.stringify(logPayload));
      return new Response(
        JSON.stringify({
          success: false,
          status: "network_error",
          error: `Network Error connecting to graph.facebook.com: ${fetchErr.message || 'Connection timed out'}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 504,
        }
      );
    }

    const httpStatus = accountRes.status;
    const accountData = await accountRes.json();

    if (!accountRes.ok || accountData.error) {
      const errObj = accountData.error || {};
      const fullMetaError = {
        timestamp: new Date().toISOString(),
        client_id: clientId,
        instagram_account_id: instagramAccountId,
        http_status: httpStatus,
        meta_error: {
          message: errObj.message || 'Unknown Meta API Error',
          type: errObj.type || 'OAuthException',
          code: errObj.code || 0,
          error_subcode: errObj.error_subcode || null,
          fbtrace_id: errObj.fbtrace_id || null
        }
      };

      // Log full error to Deno Edge Function logs
      console.error('[INSTAGRAM_GRAPH_API_ERROR]', JSON.stringify(fullMetaError));

      return new Response(
        JSON.stringify({
          success: false,
          status: "meta_error",
          http_status: httpStatus,
          error: `HTTP ${httpStatus} | Meta API Code ${errObj.code || 'N/A'} (Subcode ${errObj.error_subcode || 'N/A'}): "${errObj.message || 'Meta API call failed'}" [Type: ${errObj.type || 'N/A'}, Trace: ${errObj.fbtrace_id || 'N/A'}]`,
          meta_error: errObj
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: httpStatus >= 400 ? httpStatus : 400,
        }
      );
    }

    // 2. Call Meta Graph API v21.0 insights endpoint for reach/impressions
    let reach = null;
    let impressions = null;
    try {
      const insightsUrl = `https://graph.facebook.com/v21.0/${instagramAccountId}/insights?metric=impressions,reach&period=day&access_token=${accessToken}`;
      const insightsRes = await fetch(insightsUrl);
      const insightsJson = await insightsRes.json();

      if (insightsJson.data && Array.isArray(insightsJson.data)) {
        const reachItem = insightsJson.data.find((d: any) => d.name === 'reach');
        const imprItem = insightsJson.data.find((d: any) => d.name === 'impressions');
        if (reachItem && reachItem.values?.length) {
          reach = reachItem.values[reachItem.values.length - 1].value;
        }
        if (imprItem && imprItem.values?.length) {
          impressions = imprItem.values[imprItem.values.length - 1].value;
        }
      }
    } catch {
      // Reach/impressions metrics optional
    }

    const payload = {
      success: true,
      source: 'instagram_graph_api_v21',
      client_id: clientId,
      insights: {
        account_id: accountData.id,
        username: accountData.username ? `@${accountData.username}` : null,
        name: accountData.name || null,
        profile_picture_url: accountData.profile_picture_url || null,
        followers_count: typeof accountData.followers_count === 'number' ? accountData.followers_count : null,
        media_count: typeof accountData.media_count === 'number' ? accountData.media_count : null,
        reach: reach,
        impressions: impressions,
        engagement_rate: null
      }
    };

    // Store in 5-minute cache
    insightsCache.set(cacheKey, { timestamp: Date.now(), payload });
    console.log(`[INSTAGRAM_FETCH_SUCCESS] Fetched & cached live metrics for ${clientId} (${accountData.username || instagramAccountId})`);

    return new Response(
      JSON.stringify(payload),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('[INSTAGRAM_UNHANDLED_EXCEPTION]', JSON.stringify({ error: error.message, stack: error.stack }));
    return new Response(
      JSON.stringify({ success: false, status: "error", error: `Server Exception: ${error.message}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
