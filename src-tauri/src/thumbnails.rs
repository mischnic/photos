use std::{fs::File, io::Cursor, path::Path};

// use imageproc::geometric_transformations::*;
use imageproc::image::imageops::thumbnail;
use imageproc::image::{open, ImageFormat};
use img_parts::ImageEXIF;
// use imageproc::image::save_buffer_with_format;

pub(crate) fn generate_thumbnail(input_path: impl AsRef<str>) -> String {
    let input_path = Path::new(input_path.as_ref());
    let thumbnail_folder = input_path.parent().unwrap().join(".thumbs");
    let thumbnail_path = thumbnail_folder
        .join(Path::new(input_path.file_name().unwrap()).with_extension("thumb.jpeg"));
    if !thumbnail_path.exists() {
        std::fs::create_dir_all(thumbnail_folder).unwrap();
        println!("1 generate_thumbnail {}", input_path.display());
        let image = open(input_path)
            .unwrap_or_else(|_| panic!("Could not load image at {:?}", input_path))
            .to_rgb8();

        println!("2 generate_thumbnail {}", input_path.display());

        let exif = {
            let file = std::fs::File::open(input_path).unwrap();
            let mut bufreader = std::io::BufReader::new(&file);
            let exifreader = exif::Reader::new();
            exifreader.read_from_container(&mut bufreader).unwrap()
        };

        println!("3 generate_thumbnail {}", input_path.display());

        // project

        // let scale = Projection::scale(2.0, 3.0);
        // let thumbnail_img = warp(&image, &scale, Interpolation::Bilinear, Rgb([255, 0, 0]));
        let thumbnail_img_buffer = thumbnail(&image, 6000 / 4, 4000 / 4);
        println!("4 generate_thumbnail {}", input_path.display());

        let mut bytes: Vec<u8> = Vec::new();
        thumbnail_img_buffer
            .write_to(&mut Cursor::new(&mut bytes), ImageFormat::Jpeg)
            .unwrap();

        let mut thumbnail_img = img_parts::jpeg::Jpeg::from_bytes(bytes.into()).unwrap();
        thumbnail_img.set_exif(Some(exif.buf().to_owned().into()));
        thumbnail_img
            .encoder()
            .write_to(File::create(&thumbnail_path).unwrap())
            .unwrap();
    }
    thumbnail_path.to_str().unwrap().to_string()
}
