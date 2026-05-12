let gsiLoader: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (gsiLoader) return gsiLoader;

  gsiLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google identity script"));
    document.head.appendChild(script);
  });

  return gsiLoader;
}

export async function getGoogleDriveAccessToken(prompt: "consent" | "" = "consent"): Promise<{ accessToken: string; expiresIn: number }> {
  const clientId = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;
  if (!clientId || clientId.includes("your_google_oauth_client_id")) {
    throw new Error(
      "Set VITE_GOOGLE_CLIENT_ID in apps/web/.env.local with your Google OAuth Web Client ID, then restart the web dev server."
    );
  }

  await loadGoogleScript();
  const oauth = window.google?.accounts?.oauth2;
  if (!oauth) throw new Error("Google accounts SDK is not available");

  return new Promise((resolve, reject) => {
    const tokenClient = oauth.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (response) => {
        if (!response.access_token || !response.expires_in || response.error) {
          reject(new Error(response.error ?? "Failed to obtain Google Drive permission"));
          return;
        }

        resolve({ accessToken: response.access_token, expiresIn: response.expires_in });
      },
    });

    tokenClient.requestAccessToken({ prompt });
  });
}