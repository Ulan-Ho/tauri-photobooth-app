use base64::prelude::*;
use std::fs;


use crate::PROJECT_PATH;


#[tauri::command]
pub fn delete_image(relative_path: String) -> Result<String, String> {
    let base_path = {
        let guard = PROJECT_PATH.lock().unwrap();
        guard.clone().ok_or("Project path is not set. Call update_project_path first.")?
    };

    let path = base_path.join(&relative_path);

    // Проверяем существующие файлы с разными расширениями
    let extensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    for ext in &extensions {
        let file_path = path.with_extension(ext);
        if file_path.exists() {
            fs::remove_file(&file_path).map_err(|e| format!("Failed to delete file: {}", e))?;
            return Ok(format!("File '{}' deleted successfully.", file_path.display()));
        }
    }
    println!("File not found: {:?}", path);

    Err(format!(
        "Не найдено файла '{}' с расширениями ({:?}).",
        relative_path, extensions
    ))
}


#[tauri::command]
pub fn get_image_path(path: &str) -> Result<String, String> {
    let base_path = PROJECT_PATH.lock().unwrap().clone()
        .ok_or("Project path is not set. Call update_project_path first.")?;

    let possible_extensions = ["png", "jpg", "jpeg", "webp"];
    let mut image_path = base_path.join(path);

    if !image_path.exists() {
        // Преобразуем имя файла в нижний регистр
        let lower_path = path.to_lowercase();

        for ext in possible_extensions.iter() {
            let with_ext = format!("{}.{}", lower_path, ext);
            let full_path = base_path.join(with_ext);

            if full_path.exists() {
                image_path = full_path;
                break;
            }
        }
    }

    if !image_path.exists() {
        return Err("Image file not found.".into());
    }

    Ok(image_path.to_str().unwrap().to_string())
}


#[tauri::command]
pub fn save_image(image: String, relative_path: String) -> Result<(), String> {
    let base_path = PROJECT_PATH
        .lock()
        .unwrap()
        .clone()
        .ok_or("Project path is not set. Call update_project_path first.")?;

    if !image.starts_with("data:image/") {
        return Err("Invalid image format. Expected DataURL.".into());
    }

    let format = image.split(',').next()
        .and_then(|header| header.split('/').nth(1))
        .and_then(|header| header.split(';').next())
        .ok_or("Invalid image format. Expected DataURL.")?;
    
    let base64_data = image.split(',').nth(1).ok_or("Invalid DataUrl format.")?;
    let decoded_data = BASE64_STANDARD.decode(base64_data).map_err(|_| "Failed to decode Base64 image")?;

    let base_name = relative_path.split('.').next().unwrap_or(&relative_path);
    let file_name_with_extension = format!("{}.{}", base_name, format);
    let full_path = base_path.join(file_name_with_extension);

    for ext in &["png", "jpg", "jpeg", "webp"] {
        let existing_file = base_path.join(format!("{}.{}", base_name, ext));
        if existing_file.exists() {
            fs::remove_file(existing_file).map_err(|e| format!("Failed to remove old image: {}", e))?;
        }
    }

    fs::write(&full_path, decoded_data).map_err(|e| format!("Failed to save image: {}", e))?;

    Ok(())
}


#[tauri::command]
pub fn get_image_paths() -> Result<Vec<String>, String> {
    let base_path = tauri::api::path::picture_dir()
        .ok_or("Failed to resolve picture_dir")?;
    let project_path = PROJECT_PATH.lock().unwrap().clone().ok_or("Project path is not set.")?;
    
    let project_path_str = project_path.to_str().ok_or("Failed to convert path to string.")?;
    let parts: Vec<&str> = project_path_str.split("\\").collect();
    let project_name = parts.last().ok_or("Failed to extract project name.")?;
    let base_dir = base_path.join("Проекты").join(project_name);

    if !base_dir.exists() {
        return Err(format!("Directory does not exist: {:?}", base_dir));
    }

    // Перечисляем файлы в директории
    let mut file_names = Vec::new();
    for entry in fs::read_dir(base_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;

        // Проверяем, является ли элемент файлом
        if metadata.is_file() {
            let full_path = entry.path();
            if let Some(path_str) = full_path.to_str() {
                file_names.push(path_str.to_string());
            }
        }
    }

    Ok(file_names)
}


// #[tauri::command]
// pub fn get_file_list() -> Result<Vec<String>, String> {
//     let base_path = tauri::api::path::picture_dir()
//         .ok_or("Failed to resolve picture_dir")?;
//     let project_path = PROJECT_PATH.lock().unwrap().clone().ok_or("Project path is not set.")?;

//     let project_path_str = project_path.to_str().ok_or("Failed to convert path to string.")?;
//     let parts: Vec<&str> = project_path_str.split("\\").collect();
//     let project_name = parts.last().ok_or("Failed to extract project name.")?;
//     let base_dir = base_path.join("Проекты").join(project_name);

//     if !base_dir.exists() {
//         return Err("Directory does not exist.".to_string());
//     }

//     let mut file_names = Vec::new();
//     for entry in fs::read_dir(base_dir).map_err(|e| e.to_string())? {
//         let entry = entry.map_err(|e| e.to_string())?;
//         let metadata = entry.metadata().map_err(|e| e.to_string())?;

//         // Проверяем, является ли элемент файлом
//         if metadata.is_file() {
//             if let Some(name) = entry.file_name().to_str() {
//                 file_names.push(name.to_string());
//             }
//         }
//     }

//     Ok(file_names)
// }