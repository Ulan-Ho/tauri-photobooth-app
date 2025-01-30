use serde::Serialize;
use serde::de::DeserializeOwned;
use std::fs;


use crate::globals::PROJECT_PATH;


pub fn writing_to_json_file<T: Serialize>(path: &str, data: &T) -> Result<(), Box<dyn std::error::Error>> {
    let base_path = PROJECT_PATH.lock().unwrap().clone()
        .ok_or("Project path is not set. Call update_project_path first.")?;

    let file_path = base_path.join(path);
    
    if let Some(parent_dir) = file_path.parent() {
        if !parent_dir.exists() {
            fs::create_dir_all(parent_dir)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
    }

    let file_data = serde_json::to_string(data).map_err(|e| e.to_string())?;

    fs::write(file_path, file_data).map_err(|e| e.to_string())?;

    Ok(())
}


pub fn reading_from_json_file<T: DeserializeOwned>(path: &str) -> Result<T, Box<dyn std::error::Error>> {
    let base_path = PROJECT_PATH.lock().unwrap().clone()
        .ok_or("Project path is not set. Call update_project_path first.")?;

    let file_path = base_path.join(path);
    let file_data = fs::read_to_string(file_path).map_err(|e| e.to_string())?;

    let data: T = serde_json::from_str(&file_data).map_err(|e| e.to_string())?;
    Ok(data)
}
