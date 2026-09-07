/**
 * Synk-tjener for "Tungesuik Bygg – NOBB-oppslag".
 *
 * Holder det ekte GitHub-tokenet skjult på serversiden. Appen (som kjører i
 * nettleseren til hvem som helst som besøker den offentlige nettsiden) sender
 * bare en delt PIN-kode – aldri selve GitHub-tokenet.
 *
 * Hemmeligheter settes opp i Cloudflare-dashbordet (Settings → Variables and
 * Secrets på denne Workeren), IKKE her i koden:
 *   SYNC_PIN      – PIN-koden appen/de ansatte bruker
 *   GITHUB_TOKEN  – fine-grained personal access token, avgrenset til dette
 *                   ene repoet, med rettigheten "Contents: Read and write"
 *   GITHUB_OWNER  – GitHub-brukernavn/organisasjon (f.eks. "kristoffer-tungesuik")
 *   GITHUB_REPO   – repository-navn (f.eks. "tungesuik-nobb")
 *   GITHUB_BRANCH – valgfri, standard "main"
 *   GITHUB_PATH   – valgfri, standard "data/projects.json"
 *   ALLOWED_ORIGIN – valgfri, f.eks. "https://<brukernavn>.github.io" for å
 *                   strupe hvilken nettside som får lov til å kalle denne
 *                   Workeren (ren høflighet – gir ikke reell sikkerhet alene,
 *                   PIN-koden er det som faktisk beskytter dataene)
 */

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Pin',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const jsonResponse = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    if (!env.SYNC_PIN || !env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
      return jsonResponse({ error: 'Synk-tjeneren er ikke ferdig konfigurert (mangler hemmeligheter).' }, 500);
    }

    const pin = request.headers.get('X-Pin');
    if (!pin || pin !== env.SYNC_PIN) {
      return jsonResponse({ error: 'Feil PIN-kode.' }, 401);
    }

    const branch = env.GITHUB_BRANCH || 'main';
    const path = (env.GITHUB_PATH || 'data/projects.json').replace(/^\/+/, '');
    const ghUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`;

    const ghHeaders = {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'tungesuik-nobb-sync-worker',
    };

    if (request.method === 'GET') {
      const res = await fetch(`${ghUrl}?ref=${encodeURIComponent(branch)}`, { headers: ghHeaders });
      if (res.status === 404) {
        return jsonResponse({ sha: null, data: [] });
      }
      if (!res.ok) {
        return jsonResponse({ error: `GitHub-lesing feilet (${res.status}).` }, 502);
      }
      const json = await res.json();
      let data = [];
      try {
        data = JSON.parse(decodeURIComponent(escape(atob(json.content.replace(/\n/g, '')))));
      } catch (e) {
        data = [];
      }
      return jsonResponse({ sha: json.sha, data: Array.isArray(data) ? data : [] });
    }

    if (request.method === 'PUT') {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return jsonResponse({ error: 'Ugyldig forespørsel.' }, 400);
      }
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(body.data ?? [], null, 2))));
      const putBody = {
        message: `Oppdater prosjekter (${new Date().toISOString()})`,
        content,
        branch,
      };
      if (body.sha) putBody.sha = body.sha;

      const putRes = await fetch(ghUrl, {
        method: 'PUT',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(putBody),
      });
      if (!putRes.ok) {
        const errJson = await putRes.json().catch(() => ({}));
        return jsonResponse(
          { error: errJson.message || `GitHub-skriving feilet (${putRes.status}).` },
          putRes.status === 409 ? 409 : 502
        );
      }
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: 'Ikke støttet.' }, 404);
  },
};
