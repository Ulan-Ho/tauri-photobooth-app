use base64::prelude::*;
use std::fs::File;
use std::io::Write;
use std::process::Command;
use std::path::Path;

#[tauri::command]
fn print_image(image_data: String) -> Result<(), String> {
    // Извлечение и декодирование строки Base64
    let base64_str = image_data.split(',').nth(1).ok_or("Invalid base64 string")?;
    let decoded_data = BASE64_STANDARD.decode(base64_str).map_err(|e| e.to_string())?;

    // Сохранение данных в файл
    let file_path = "temp_image.png";
    let mut file = File::create(file_path).map_err(|e| e.to_string())?;
    file.write_all(&decoded_data).map_err(|e| e.to_string())?;
    drop(file); // Закрываем файл

    // Проверка существования файла
    if !Path::new(file_path).exists() {
        return Err("Temporary file does not exist.".to_string());
    }

    // Отправка на печать с указанием принтера через PowerShell
    let output = Command::new("powershell")
        .arg("-Command")
        .arg(format!("Start-Process -FilePath '{}' -ArgumentList '/p /h /t {}' -NoNewWindow -Wait", file_path, "HiTi P525"))
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    // Очистка временных файлов
    std::fs::remove_file(file_path).map_err(|e| e.to_string())?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![print_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}