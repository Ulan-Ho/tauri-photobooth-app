use std::fs::*;
use std::path::PathBuf;

use crate::globals::ProjectInfo;
use crate::globals::PROJECT_PATH;


#[tauri::command]
pub fn get_projects(app_handle: tauri::AppHandle) -> Result<Vec<ProjectInfo>, String> {
    // Текущая логика получения проектов из директории
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Не удалось определить папку данных приложения.".to_string())?;

    if !base_path.is_dir() {
        return Err("Папка данных приложения не существует или не является директорией.".to_string());
    }

    let projects = read_dir(base_path)
        .map_err(|e| format!("Ошибка чтения директории: {}", e))?
        .filter_map(|entry| match entry {
            Ok(entry) => {
                let path = entry.path();
                if path.is_dir() {
                    ProjectInfo::from_path(&path)
                } else {
                    None
                }
            }
            Err(_err) => {
                // eprintln!("Ошибка чтения элемента директории: {}", err);
                None
            }
        })
        .collect();

    Ok(projects)
}


#[tauri::command]
pub fn select_project(app_handle: tauri::AppHandle, project_name: String) -> Result<(), String> {
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Не удалось определить папку данных приложения.".to_string())?;

    let project_path = base_path.join(project_name.to_string());
    if !project_path.exists() {
        create_dir_all(&project_path)
            .map_err(|err| format!("Не удалось создать папку проекта: {}", err))?;
    }
    *PROJECT_PATH.lock().unwrap() = Some(project_path);
    println!("PROJECT_PATH: {:?}", PROJECT_PATH.lock().unwrap());
    // setting_dir()?;
    tauri::async_runtime::spawn(setting_dir());
    Ok(())
}

#[tauri::command]
pub fn delete_project(app_handle: tauri::AppHandle, project_name: String) -> Result<(), String> {
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Не удалось определить папку данных приложения.".to_string())?;

    let project_path = base_path.join(&project_name);
    if project_path.exists() {
        remove_dir_all(&project_path)
            .map_err(|err| format!("Не удалось удалить папку проекта: {}", err))?;
    }

    // Если удаляемый проект совпадает с текущим, обнуляем PROJECT_PATH
    let mut locked_path = PROJECT_PATH.lock().map_err(|_| "Ошибка доступа к PROJECT_PATH".to_string())?;
    if locked_path.as_ref() == Some(&project_path) {
        *locked_path = None;
    }

    Ok(())
}

async fn setting_dir() -> Result<(), String> {
    let base_path = PROJECT_PATH.lock().unwrap().clone()
        .ok_or_else(|| "Project path is not set. Call update_project_path first.".to_string())?;
    // Найти проект с is_used: true
    tauri::async_runtime::spawn(async move {
        let directories = vec![
            "template",
            "time",
            "background",
            "images",
            "settings",
        ];
        create_directories_if_not_exist(directories, &base_path);
    });

    // let start_time = "09:00".to_string();
    // let end_time = "21:00".to_string();

    // set_work_hours(start_time, end_time, false).unwrap();

    // save_settings("#00ff00".to_string(), 3, false).unwrap();

    Ok(())
}


fn create_directories_if_not_exist(dirs: Vec<&str>, base_path: &PathBuf) {
    for dir in dirs {
        let path: PathBuf = base_path.join(dir);
        if !path.exists() {
            if let Err(_e) = create_dir_all(&path) {
                // eprintln!("Ошибка при создании папки: {:?}", _e);
            } else {
                println!("Папка создана: {:?}", path);
            }
        } else {
            println!("Папка уже существует: {:?}", path);
        }
    }
}