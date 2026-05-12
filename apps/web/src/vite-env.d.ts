/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface GoogleCredentialResponse {
	credential?: string;
}

interface GoogleAccountsId {
	initialize(config: {
		client_id: string;
		callback: (response: GoogleCredentialResponse) => void | Promise<void>;
	}): void;
	renderButton(
		parent: HTMLElement,
		options: {
			type?: "standard" | "icon";
			theme?: "outline" | "filled_blue" | "filled_black";
			size?: "large" | "medium" | "small";
			text?: "signin_with" | "signup_with" | "continue_with" | "signin";
			shape?: "rectangular" | "pill" | "circle" | "square";
			width?: number;
		}
	): void;
}

interface GoogleTokenClient {
	requestAccessToken(opts?: { prompt?: string }): void;
}

interface GoogleOAuth2 {
	initTokenClient(config: {
		client_id: string;
		scope: string;
		callback: (response: { access_token?: string; expires_in?: number; error?: string }) => void;
	}): GoogleTokenClient;
}

interface Window {
	google?: {
		accounts?: {
			id?: GoogleAccountsId;
			oauth2?: GoogleOAuth2;
		};
	};
}
