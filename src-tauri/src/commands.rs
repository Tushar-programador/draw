use tauri::command;

/// Returns the current application version from Cargo.toml.
#[command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Opens a URL in the system's default browser.
#[command]
pub async fn open_external(url: String) -> Result<(), String> {
    // Validate scheme to prevent javascript: or data: injection
    if !url.starts_with("https://") && !url.starts_with("http://") {
        return Err("Only http/https URLs are allowed".to_string());
    }
    open::that(&url).map_err(|e| e.to_string())
}
