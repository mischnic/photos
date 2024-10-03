use std::borrow::Cow;

use tauri::{http, AppHandle};
use tauri_plugin_dialog::DialogExt;
use thumbnails::generate_thumbnail;

mod thumbnails;

pub fn is_supported_photo_extension(extension: &str) -> bool {
    match &*extension.to_ascii_lowercase() {
        "jpg" | "jpeg" /* | "hif" | "heif" */ => return true,
        _ => {}
    }
    false
}
pub fn parse_photo_mime_type(uri: impl AsRef<str>) -> &'static str {
    if let Some(suffix) = uri.as_ref().split('.').last() {
        match &*suffix.to_ascii_lowercase() {
            "jpg" | "jpeg" => return "image/jpeg",
            "hif" | "heif" => return "image/heif",
            _ => {}
        }
    }
    "application/octet-stream"
}

#[tauri::command]
async fn pick_folder(app: AppHandle) -> Result<Option<String>, String> {
    let Some(filepath) = app.dialog().file().blocking_pick_folder() else {
        return Ok(None);
    };

    Ok(Some(
        filepath.into_path().unwrap().to_str().unwrap().to_string(),
    ))
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn list_files(path: &str) -> Result<Vec<String>, String> {
    let mut entries = vec![];
    for res in std::fs::read_dir(path).map_err(|err| err.to_string())? {
        let res = res.map_err(|err| err.to_string())?;
        if res.file_type().map_err(|err| err.to_string())?.is_file() {
            let path = res.path();
            let path_str = path.to_str().unwrap();
            if path_str.ends_with(".thumb.jpeg") {
                continue;
            }
            if let Some(ext) = path.extension() {
                let lowercase = ext.to_str().unwrap().to_ascii_lowercase();
                if is_supported_photo_extension(&lowercase) {
                    entries.push(path_str.to_string());
                }
            }
        }
    }
    entries.sort();

    Ok(entries)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![list_files, pick_folder])
        .register_asynchronous_uri_scheme_protocol("photo", |_app, request, responder| {
            std::thread::spawn(move || {
                let path = urlencoding::decode(request.uri().path()).expect("UTF-8");
                let query = request.uri().query().unwrap_or_default();

                let file = if query == "thumbnail" {
                    Cow::Owned(generate_thumbnail(path))
                } else {
                    path
                };

                if let Ok(data) = std::fs::read(&*file) {
                    responder.respond(
                        http::Response::builder()
                            .header(http::header::CONTENT_TYPE, parse_photo_mime_type(file))
                            .body(data)
                            .unwrap(),
                    );
                } else {
                    responder.respond(
                        http::Response::builder()
                            .status(http::StatusCode::BAD_REQUEST)
                            .header(http::header::CONTENT_TYPE, "text/plain")
                            .body("failed to read file".as_bytes().to_vec())
                            .unwrap(),
                    );
                }
            });
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
