import { JWT } from 'google-auth-library';

/**
 * Notifies the Google Indexing API of a new, updated, or deleted URL.
 * This is highly recommended for JobPosting schemas to get instant indexing.
 * 
 * Requires a Google Service Account with the Indexing API enabled.
 */
export async function notifyGoogleIndexing(jobId: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
  try {
    const credsJson = process.env.GOOGLE_INDEXING_CREDENTIALS;
    if (!credsJson) {
      console.log("[Indexing] Credentials missing. skipping Google Indexing API ping.");
      return { success: false, error: "CREDENTIALS_MISSING" };
    }

    let appUrl = 'https://www.liggeybi.com';
    const targetUrl = `${appUrl}/offre/${jobId}`;

    let credsRaw = credsJson.trim();
    // Support Base64 encoded credentials in environment variables
    if (!credsRaw.startsWith('{') && !credsRaw.startsWith('"') && !credsRaw.startsWith("'") && !credsRaw.startsWith('\\{')) {
      try {
        const decoded = Buffer.from(credsRaw, 'base64').toString('utf-8');
        if (decoded.trim().startsWith('{')) {
          credsRaw = decoded;
        }
      } catch (e) {
        // Ignore, assume it's not base64
      }
    }

    let credentials;
    try {
      let parsed = JSON.parse(credsRaw);
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      credentials = parsed;
    } catch (parseError) {
      try {
        let fixed = credsRaw;
        if (fixed.startsWith("'") && fixed.endsWith("'")) {
          fixed = fixed.substring(1, fixed.length - 1);
        }
        if (fixed.startsWith('"') && fixed.endsWith('"')) {
          fixed = fixed.substring(1, fixed.length - 1);
        }
        
        fixed = fixed.replace(/\\{/g, '{').replace(/\\}/g, '}');
        
        const firstIndex = fixed.indexOf('{');
        const lastIndex = fixed.lastIndexOf('}');
        
        if (firstIndex !== -1 && lastIndex !== -1) {
            fixed = fixed.substring(firstIndex, lastIndex + 1);
        }
        
        fixed = fixed.replace(/\\"/g, '"');
        fixed = fixed.replace(/\\\\n/g, '\\n');
        
        let parsed = JSON.parse(fixed);
        if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
        }
        credentials = parsed;
      } catch (fallbackError) {
        console.error("Failed to parse Google Indexing JSON credentials:", credsRaw.substring(0, 50) + "...");
        throw new Error("Impossible de parser le JSON des credentials. Copiez-collez exactement le contenu du fichier JSON téléchargé sur Google Cloud.");
      }
    }

    // Fix escaped newlines in private key if they were doubly escaped
    if (credentials && credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }

    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const token = await client.getAccessToken();

    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.token}`,
      },
      body: JSON.stringify({
        url: targetUrl,
        type: type,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Indexing] Google API Error:", errorText);
      return { success: false, error: errorText };
    } else {
      console.log(`[Indexing] Successfully notified Google: ${type} for ${targetUrl}`);
      return { success: true };
    }
  } catch (error: any) {
    console.error("[Indexing] Error calling Google Indexing API:", error);
    return { success: false, error: error.message || String(error) };
  }
}
