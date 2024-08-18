use std::path::Path;

use tauri::http;

pub fn is_supported_photo_extension(extension: &str) -> bool {
    match &*extension.to_ascii_lowercase() {
        "jpg" | "jpeg" /* | "hif" | "heif" */ => return true,
        _ => {}
    }
    false
}
pub fn parse_photo_mime_type(uri: &str) -> &'static str {
    if let Some(suffix) = uri.split('.').last() {
        match &*suffix.to_ascii_lowercase() {
            "jpg" | "jpeg" => return "image/jpeg",
            "hif" | "heif" => return "image/heif",
            _ => {}
        }
    }
    "application/octet-stream"
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

fn generate_thumbnail(input_path: &str) -> String {
    // use imageproc::geometric_transformations::*;
    use imageproc::image::imageops::thumbnail;
    use imageproc::image::open;
    // use imageproc::image::save_buffer_with_format;

    let thumbnail_path = Path::new(input_path).with_extension("thumb.jpeg");
    if !thumbnail_path.exists() {
        println!("1 generate_thumbnail");
        let image = open(input_path)
            .unwrap_or_else(|_| panic!("Could not load image at {:?}", input_path))
            .to_rgb8();

        println!("2 generate_thumbnail");

        // let scale = Projection::scale(2.0, 3.0);
        // let thumbnail_img = warp(&image, &scale, Interpolation::Bilinear, Rgb([255, 0, 0]));
        let thumbnail_img = thumbnail(&image, 6000 / 4, 4000 / 4);

        thumbnail_img.save(&thumbnail_path).unwrap();
    }
    thumbnail_path.to_str().unwrap().to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![list_files])
        .register_asynchronous_uri_scheme_protocol("photo", |_app, request, responder| {
            std::thread::spawn(move || {
                let path = request.uri().path();
                let query = request.uri().query().unwrap_or_default();

                let thumbnail = generate_thumbnail(path);

                if let Ok(data) = std::fs::read(thumbnail) {
                    responder.respond(
                        http::Response::builder()
                            .header(http::header::CONTENT_TYPE, parse_photo_mime_type(path))
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
