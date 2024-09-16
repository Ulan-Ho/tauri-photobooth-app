use device_query::{DeviceQuery, DeviceState, Keycode};
use std::fmt::Result;
use std::sync::{Arc, Mutex};
use tauri::{CustomMenuItem, Menu, Submenu, Manager};
use std::time::{Duration, Instant};
use std::{fs, thread};
use base64::prelude::*;
use std::fs::File;
use std::io::Write;
use std::process::Command;
use std::path::PathBuf;
use serde_json::json;
use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize, Debug)]
pub struct WorkHours {
    pub start: String,
    pub end: String,
}



fn main() {
    // Создаем элементы меню
    let main_page = CustomMenuItem::new("main_page".to_string(), "Главная");
    let setting_page = CustomMenuItem::new("setting_page".to_string(), "Настройки");
    let hide_menu = CustomMenuItem::new("hide_menu".to_string(), "Скрыть меню");
    let show_menu = CustomMenuItem::new("show_menu".to_string(), "Показать меню");
    let submenu = Submenu::new("Страницы", Menu::new().add_item(main_page.clone()).add_item(setting_page.clone()));
    let menu = Menu::new()
        .add_item(hide_menu.clone())
        .add_item(show_menu.clone())
        .add_submenu(submenu);

    // Используем Arc и Mutex для управления видимостью меню
    let menu_visible = Arc::new(Mutex::new(true));

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event({
            let menu_visible = menu_visible.clone();
            move |event| {
                let window = event.window();
                match event.menu_item_id() {
                    "main_page" => {
                        event.window().emit("navigate-to-page", "main_page").unwrap();
                    }
                    "setting_page" => {
                        event.window().emit("navigate-to-page", "setting_page").unwrap();
                    }
                    "hide_menu" => {
                        let mut visible = menu_visible.lock().unwrap();
                        *visible = false;
                        window.menu_handle().hide().unwrap();
                        println!("Menu hidden");
                    }
                    "show_menu" => {
                        let mut visible = menu_visible.lock().unwrap();
                        *visible = true;
                        window.menu_handle().show().unwrap();
                        println!("Menu shown");
                    }
                    _ => {}
                }
            }
        })
        .setup(move |app| {
            let handle = app.handle();
            let window = handle.get_window("main").unwrap();
            let menu_visible = menu_visible.clone();

            // Создаем состояние устройства
            let device_state = DeviceState::new();

            // Обработчик событий клавиатуры
            thread::spawn(move || {
                let mut last_check = Instant::now();
                loop {
                    if last_check.elapsed() >= Duration::from_millis(100) {
                        let keys: Vec<Keycode> = device_state.get_keys();
                        let control_pressed = keys.contains(&Keycode::LControl);
                        let shift_pressed = keys.contains(&Keycode::LShift);
                        let h_pressed = keys.contains(&Keycode::H);

                        if h_pressed && control_pressed && shift_pressed {
                            // println!("Control + Shift + H pressed");
                            let mut visible = menu_visible.lock().unwrap();
                            if *visible {
                                window.menu_handle().hide().unwrap();
                                *visible = false;
                                // println!("Menu hidden via shortcut");
                            } else {
                                window.menu_handle().show().unwrap();
                                *visible = true;
                                // println!("Menu shown via shortcut");
                            }
                        }
                        last_check = Instant::now();
                    }
                    thread::sleep(Duration::from_millis(50)); // Периодическое обновление состояния клавиш
                }
            });

//---------------------------------------------------Create directory---------------------------------------------------------------------
            // setting_dir(app.handle());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


// #[tauri::command]
// fn print_image(image_data: String) -> Result<(), String> {
//     let base64_str = image_data.split(',').nth(1).ok_or("Invalid base64 string")?;
//     let decoded_data = BASE64_STANDARD.decode(base64_str).map_err(|e| e.to_string())?;

//     let file_path = "temp_image.png";
//     let mut file = File::create(file_path).map_err(|e| e.to_string())?;
//     file.write_all(&decoded_data).map_err(|e| e.to_string())?;

//     let command = format!(
//         "function Print-Image {{ param([string]$PrinterName, [string]$FilePath, [int]$Scale, [string]$PaperSize, [string]$PrintJobName, [string]$PrintQuality); Add-Type -AssemblyName System.Drawing; $printDocument = New-Object System.Drawing.Printing.PrintDocument; $printDocument.PrinterSettings.PrinterName = $PrinterName; $printDocument.DefaultPageSettings.Landscape = $false; $printDocument.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize(\"Custom\", 600, 400); $printDocument.add_PrintPage({{ param($sender, $e); $image = [System.Drawing.Image]::FromFile($FilePath); $e.Graphics.TranslateTransform(0, 0); $e.Graphics.RotateTransform(0); $scaledWidth = $image.Width * ($Scale / 300); $scaledHeight = $image.Height * ($Scale / 300); $e.Graphics.DrawImage($image, 0, 0, $scaledWidth, $scaledHeight); $image.Dispose(); }}); $printDocument.PrinterSettings.DefaultPageSettings.PrinterResolution.Kind = [System.Drawing.Printing.PrinterResolutionKind]::High; $printDocument.PrintController = New-Object System.Drawing.Printing.StandardPrintController; $printDocument.Print(); }} Print-Image -PrinterName \"HiTi P525\" -FilePath \"{}\" -Scale 100 -PaperSize \"6x4-Split (6x2 2 prints)\" -PrintJobName \"ImagePrintJob\" -PrintQuality \"High\"",
//         file_path
//     );

//     let output = Command::new("powershell")
//         .args(&["-Command", &command])
//         .output()
//         .map_err(|e| e.to_string())?;

//     if !output.status.success() {
//         return Err(String::from_utf8_lossy(&output.stderr).to_string());
//     }

//     Ok(())
// }


// #[tauri::command]
// fn get_work_hours () -> Result<WorkHours, String> {
//     let app_handle = tauri::AppHandle::current();
//     let base_path = app_handle.path_resolver().app_data_dir().unwrap();
//     let path = base_path.join("database/time/time.json");

//     let file_content = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
//     let work_hours: WorkHours = serde_json::from_str(&file_content).map_err(|e| e.to_string())?;

//     Ok(work_hours)
// }


//---------------------------------------------------Create directory---------------------------------------------------------------------
// fn setting_dir(app_handle: tauri::AppHandle) {
//     let base_path = app_handle.path_resolver().app_data_dir().unwrap();
    
//     let base_path_clone = base_path.clone(); // Clone base_path for use in the async block
//     tauri::async_runtime::spawn(async move {
//         let directories = vec!["database", "database/template", "database/time", "database/background", "database/images"];
//         create_directories_if_not_exist(directories, &base_path_clone); // Use the cloned version
//     });

//     // Use the original base_path here
//     create_time_json_if_not_exist(&base_path).unwrap();
// }

// fn create_directories_if_not_exist(dirs: Vec<&str>, base_path: &PathBuf) {
//     for dir in dirs {
//         let path: PathBuf = base_path.join(dir);
//         if !path.exists() {
//             match fs::create_dir_all(&path) {
//                 Ok(_) => println!("Папка создана: {:?}", path),
//                 Err(e) => println!("Ошибка при создании папки: {:?}", e),
//             }
//         } else {
//             println!("Папка уже существует: {:?}", path);
//         }
//     }
// }

// fn create_time_json_if_not_exist(base_path: &PathBuf) -> Result<(), String> {
//     let path: PathBuf = base_path.join("database/time/time.json");

//     if let Some(parent_dir) = path.parent() {
//         if !parent_dir.exists() {
//             match fs::create_dir_all(parent_dir) { // Corrected: create the parent directory, not the file path
//                 Ok(_) => println!("Папка создана: {:?}", parent_dir),
//                 Err(e) => println!("Ошибка при создании папки: {:?}", e),
//             }
//         }
//     }

//     if !path.exists() {
//         let default_data = json!({
//             "start": "09:00",
//             "end": "21:00"
//         });

//         let json_string = serde_json::to_string(&default_data).map_err(|e| e.to_string())?;
//         let mut file = File::create(&path).map_err(|e| e.to_string())?;
//         file.write_all(json_string.as_bytes()).map_err(|e| e.to_string())?;
//         println!("Файл создан: {:?}", path);
//     } else {
//         println!("Файл уже существует: {:?}", path);
//     }

//     Ok(())
// }