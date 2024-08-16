use std::fs::File;
use std::io::Write;
use std::path::Path;
use std::process::Command;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use tauri::command;

#[command]
fn print_image(image_data: String, format: String, _printer_name: String) -> Result<(), String> {
    let temp_path = match format.as_str() {
        "svg" => "temp_image.svg",
        _ => return Err("Unsupported image format.".to_string()),
    };

    // Декодируем изображение из Base64
    let decoded_image = STANDARD.decode(&image_data).map_err(|e| e.to_string())?;

    // Сохраняем данные изображения как файл
    let mut file = File::create(temp_path).map_err(|e| e.to_string())?;
    file.write_all(&decoded_image).map_err(|e| e.to_string())?;
    drop(file); // Закрываем файл

    // Проверка существования файла
    if !Path::new(temp_path).exists() {
        return Err("Temporary file does not exist.".to_string());
    }

    // Вызов системной команды для печати
    let output = if cfg!(target_os = "windows") {
        Command::new("inkscape")
            .args(&[temp_path, "--export-type=png", "--export-filename=temp_image.png"])
            .output()
            .and_then(|_| {
                if !Path::new("temp_image.png").exists() {
                    return Err(std::io::Error::new(std::io::ErrorKind::NotFound, "Converted PNG file does not exist."));
                }
                Command::new("mspaint")
                    .args(&["/pt", "temp_image.png"])
                    .output()
            })
    } else if cfg!(target_os = "linux") {
        Command::new("lp")
            .arg(temp_path)
            .output()
    } else if cfg!(target_os = "macos") {
        Command::new("lp")
            .arg(temp_path)
            .output()
    } else {
        return Err("Unsupported OS".to_string());
    }.map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    // Очистка временных файлов
    std::fs::remove_file(temp_path).map_err(|e| e.to_string())?;
    if cfg!(target_os = "windows") {
        std::fs::remove_file("temp_image.png").map_err(|e| e.to_string())?;
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![print_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}