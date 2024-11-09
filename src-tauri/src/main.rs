#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

//--------------------------------Windows API-------------------------------------------------
extern crate winapi;
use winapi::um::winspool::EnumPrintersW;
use winapi::um::winspool::DRIVER_INFO_3W;
use winapi::um::winspool::PRINTER_ENUM_LOCAL;
use winapi::um::winspool::PRINTER_INFO_2W;
use std::ffi::OsString;
use std::os::windows::ffi::OsStringExt;
use std::ptr::null_mut;
use winapi::um::winspool::EnumPrinterDriversW;
use std::os::windows::ffi::OsStrExt;
//-------------------------------------------------------------------------------------------------
// use tauri::AppHandle;
use device_query::{DeviceQuery, DeviceState, Keycode};
use std::result::Result;
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
use std::env;
use serde_json::Value;
use std::ffi::c_void;
use tauri::{State};
//------------------------------------------------------------------------------------
use base64::prelude::BASE64_STANDARD;
use std::ptr;
use base64::encode;
use tauri::command;
use std::ffi::{CString, CStr};
use std::os::raw::c_char;

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkHours {
    pub start: String,
    pub end: String,
}

#[repr(C)]
pub struct EdsDirectoryItemInfo {
    pub size: u64,
    pub is_folder: i32,
    pub group_id: u32,
    pub option: u32,
    pub file_name: [i8; 256],
    // pub format: u32,
    // pub date_time: u32,
}

extern "C" {
    fn startLiveView();
    fn downloadEvfImage(out_data: *mut *mut u8, out_length: *mut usize) -> i32;
    fn capturePhoto();
    fn stopLiveView();
}

#[command]
fn get_image_base64() -> Result<String, String> {
    unsafe {
        let mut image_ptr: *mut u8 = ptr::null_mut();
        let mut length: usize = 0;

        let err = downloadEvfImage(&mut image_ptr, &mut length);
        if err != 0 || image_ptr.is_null() {
            return Err("Failed to download image.".into());
        }
        let image_data = Vec::from_raw_parts(image_ptr, length, length);
        // Кодируем изображение в base64
        let base64_data = encode(&image_data);
;

        Ok(base64_data)
    }
}


// Запуск live view
#[tauri::command]
fn start_live_view() {
    unsafe { startLiveView() };
}

#[tauri::command]
fn take_photo() {
    unsafe { capturePhoto() };
}

#[tauri::command]
fn stop_camera() {
    unsafe { stopLiveView() };
}

// Удаление изображения 
#[tauri::command]
fn delete_image(image_name: String) -> Result<(), String> {
    // Укажите директорию, где хранятся изображения 
    // let image_path = PathBuf::from(env::current_dir().map_err(|err| err.to_string())?)
    //     .join("image_alltime_usable.jpg");
    // Формируем полный путь к файлу
    let current_dir = env::current_dir().map_err(|err| err.to_string())?;
    let image_path = current_dir.join(image_name);

    // Удаляем файл, если он существует
    println!("Attempting to delete image at path: {:?}", image_path);

    if image_path.exists() {
        fs::remove_file(&image_path).map_err(|err| err.to_string())?;
        Ok(())
    } else {
        println!("Image not found, skipping deletion.");
        Ok(())
    }
}

#[tauri::command]
fn get_saved_image() -> Result<String, String> {
    // Путь к изображению (замените на ваш путь)
    // let image_path = PathBuf::from(env::current_dir().map_err(|err| err.to_string())?)
    //     .join("image_alltime_usable.jpg");
    // Формируем полный путь к файлу
    
    let current_dir = env::current_dir().map_err(|err| err.to_string())?;
    let image_path = current_dir.join("image_alltime_usable.jpg");
    
    // Чтение изображения и преобразование в base64
    match fs::read(&image_path) {
        Ok(image_data) => Ok(format!("data:image/jpeg;base64,{}", encode(&image_data))),
        Err(_) => Err("Failed to read image file.".to_string()),
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#[tokio::main]
async fn main() {
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
                    }
                    "show_menu" => {
                        let mut visible = menu_visible.lock().unwrap();
                        *visible = true;
                        window.menu_handle().show().unwrap();
                    }
                    _ => {}
                }
            }
        })
        .setup({
            move |app| {
            let handle = app.handle();
            let handle_clone = handle.clone();
            let window = handle.get_window("main").unwrap();
            let menu_visible = menu_visible.clone();

            // Обработчик событий клавиатуры
            thread::spawn(move || {
                let mut last_check = Instant::now();
                loop {
                    if last_check.elapsed() >= Duration::from_millis(100) {
                        let keys = DeviceState::new().get_keys();
                        let mut visible = menu_visible.lock().unwrap(); // Захватываем блокировку
                        if keys.contains(&Keycode::LControl) && keys.contains(&Keycode::LShift) && keys.contains(&Keycode::H) {
                            // Меняем видимость меню на основе нажатых клавиш
                            if *visible {
                                window.menu_handle().hide().unwrap();
                                *visible = false;
                            } else {
                                window.menu_handle().show().unwrap();
                                *visible = true;
                            }
                        }
                        last_check = Instant::now();
                        drop(visible); // Освобождаем блокировку как можно скорее
                    }
                    thread::sleep(Duration::from_millis(50));
                }
            });

//---------------------------------------------------Create directory---------------------------------------------------------------------
            setting_dir(handle_clone);

            Ok(())
        }})
        .invoke_handler(tauri::generate_handler![print_image, get_work_hours, set_work_hours, save_image, get_printer_list, get_printer_driver, get_image, save_canvas_data, save_canvas_image, load_all_canvas_data, 
            start_live_view, 
            get_image_base64, 
            take_photo, 
            stop_camera, 
            delete_image, 
            get_saved_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn print_image(image_data: String) -> Result<(), String> {
    let base64_str = image_data.split(',').nth(1).ok_or("Invalid base64 string")?;
    let decoded_data = BASE64_STANDARD.decode(base64_str).map_err(|e| e.to_string())?;

    let file_path = "temp_image.png";
    let mut file = File::create(file_path).map_err(|e| e.to_string())?;
    file.write_all(&decoded_data).map_err(|e| e.to_string())?;

    let command = format!(
        "function Print-Image {{ param([string]$PrinterName, [string]$FilePath, [int]$Scale, [string]$PaperSize, [string]$PrintJobName, [string]$PrintQuality); Add-Type -AssemblyName System.Drawing; $printDocument = New-Object System.Drawing.Printing.PrintDocument; $printDocument.PrinterSettings.PrinterName = $PrinterName; $printDocument.DefaultPageSettings.Landscape = $false; $printDocument.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize(\"Custom\", 600, 400); $printDocument.add_PrintPage({{ param($sender, $e); $image = [System.Drawing.Image]::FromFile($FilePath); $e.Graphics.TranslateTransform(0, 0); $e.Graphics.RotateTransform(0); $scaledWidth = $image.Width * ($Scale / 300); $scaledHeight = $image.Height * ($Scale / 300); $e.Graphics.DrawImage($image, 0, 0, $scaledWidth, $scaledHeight); $image.Dispose(); }}); $printDocument.PrinterSettings.DefaultPageSettings.PrinterResolution.Kind = [System.Drawing.Printing.PrinterResolutionKind]::High; $printDocument.PrintController = New-Object System.Drawing.Printing.StandardPrintController; $printDocument.Print(); }} Print-Image -PrinterName \"HiTi P525\" -FilePath \"{}\" -Scale 100 -PaperSize \"6x4-Split (6x2 2 prints)\" -PrintJobName \"ImagePrintJob\" -PrintQuality \"High\"",
        file_path
    );

    let output = Command::new("powershell")
        .args(&["-Command", &command])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(())
}

#[tauri::command]
fn save_image(app_handle: tauri::AppHandle, image_data: String, file_name: String) -> Result<(), String> {

    let decoded_data = BASE64_STANDARD.decode(image_data).map_err(|e| e.to_string())?;
    println!("Size of decoded image data: {} bytes", decoded_data.len());
    // Установите путь для сохранения файла
    let base_path = app_handle.path_resolver().app_data_dir().ok_or("Failed to resolve app data directory")?;
    let file_path = base_path.join("database").join("background").join(file_name);
    let mut file = File::create(file_path.clone()).map_err(|e| e.to_string())?;

    file.write_all(&decoded_data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_image(app_handle: tauri::AppHandle, image_name: String) -> Result<String, String> {
    // Определяем путь к изображению
    let mut path = app_handle.path_resolver()
        .app_data_dir()
        .ok_or("Failed to resolve app cache directory")?;
    
    path.push(format!("database/background/{}", image_name));

    println!("Путь к изображению: {:?}", path);
    // Читаем файл
    match fs::read(&path) {
        Ok(data) => {
            // Кодируем данные в строку Base64
            let base64_str = BASE64_STANDARD.encode(&data);
            Ok(base64_str) // Возвращаем закодированную строку
        }
        Err(e) => Err(format!("Failed to read file: {}", e)), // Обрабатываем ошибку
    }
}


//------------------------------------------Timer---------------------------------------------------------------
#[tauri::command]
fn get_work_hours(app_handle: tauri::AppHandle) -> Result<WorkHours, String> {
    let base_path = app_handle.path_resolver().app_data_dir().ok_or("Failed to resolve app data directory")?;
    let path = base_path.join("database/time/time.json");

    let file_content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let work_hours: WorkHours = serde_json::from_str(&file_content).map_err(|e| e.to_string())?;

    Ok(work_hours)
}

#[tauri::command]
fn set_work_hours(app_handle: tauri::AppHandle, start: String, end: String) -> Result<(), String> {
    let data_dir = app_handle.path_resolver().app_data_dir()
        .ok_or("Failed to get app data directory")?;
    let file_path = data_dir.join("database/time/time.json");
    let work_hours = WorkHours { start, end };
    let file_content = serde_json::to_string(&work_hours).map_err(|e| e.to_string())?;
    fs::write(file_path, file_content).map_err(|e| e.to_string())?;
    Ok(())
}


//---------------------------------------------------Setting App---------------------------------------------------------------------
fn setting_dir(app_handle: tauri::AppHandle) {
    let base_path = app_handle.path_resolver().app_data_dir().unwrap();

    let base_path_clone = base_path.clone(); // Clone base_path for use in the async block
    tauri::async_runtime::spawn(async move {
        let directories = vec!["database", "database/template", "database/time", "database/background", "database/images"];
        create_directories_if_not_exist(directories, &base_path_clone); // Use the cloned version
    });
    create_time_json_if_not_exist(&base_path);
}

fn create_directories_if_not_exist(dirs: Vec<&str>, base_path: &PathBuf) {
    for dir in dirs {
        let path: PathBuf = base_path.join(dir);
        if !path.exists() {
            if let Err(_e) = fs::create_dir_all(&path) {
                eprintln!("Ошибка при создании папки: {:?}", _e);
            } else {
                println!("Папка создана: {:?}", path);
            }
        } else {
            println!("Папка уже существует: {:?}", path);
        }
    }
}

// Потом добавить функцию в котором он поставить таймер работы в винде
fn create_time_json_if_not_exist(base_path: &PathBuf) {
    let path: PathBuf = base_path.join("database/time/time.json");

    if let Some(parent_dir) = path.parent() {
        if !parent_dir.exists() {
            if let Err(e) = fs::create_dir_all(parent_dir) { // Corrected: create the parent directory, not the file path
                eprintln!("Ошибка при создании папки: {:?}", e);
            } else {
                println!("Папка создана: {:?}", parent_dir);
            }
        }
    }

    if !path.exists() {
        let default_data = json!({
            "start": "09:00",
            "end": "21:00"
        });

        let json_string = match serde_json::to_string(&default_data) {
            Ok(data) => data,
            Err(e) => {
                eprintln!("Ошибка при создании JSON: {:?}", e);
                return;
            }
        };

        if let Err(e) = File::create(&path).and_then(|mut file| file.write_all(json_string.as_bytes())) {
            eprintln!("Ошибка при создании файла: {:?}", e);
        } else {
            println!("Файл создан: {:?}", path);
        }
    } else {
        println!("Файл уже существует: {:?}", path);
    }
}


//-------------------------------------------------Template Editor-------------------------------------------------------------------------------------
#[tauri::command]
fn save_canvas_data(canvas_id: String, data: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    // Получаем путь к папке приложения для хранения данных
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Не удалось разрешить папку данных приложения.")?;

    // Создаем путь для сохранения данных шаблона в папке 'database/template'
    let template_dir = base_path.join("database/template");

    // Убедимся, что директория существует, и создадим её при необходимости
    if !template_dir.exists() {
        fs::create_dir_all(&template_dir).map_err(|e| e.to_string())?;
    }

    // Создаем полный путь для файла JSON с использованием canvas_id
    let file_path = template_dir.join(format!("canvas_{}.json", canvas_id));

    // Сохраняем данные холста в файл
    fs::write(&file_path, data).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn load_all_canvas_data(app_handle: tauri::AppHandle) -> Result<Vec<Value>, String> {
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to resolve app data directory")?;

    let template_dir = base_path.join("database/template");

    // Получаем все JSON файлы в директории
    let mut canvas_data = Vec::new();

    if template_dir.exists() {
        if let Ok(entries) = fs::read_dir(&template_dir) {
            for entry in entries.filter_map(Result::ok) {
                if let Some(extension) = entry.path().extension() {
                    if extension == "json" {
                        // Читаем файл и добавляем его содержимое в массив
                        let data = fs::read_to_string(entry.path())
                            .map_err(|e| e.to_string())?;
                        let json_value: Value = serde_json::from_str(&data)
                            .map_err(|e| e.to_string())?;
                        canvas_data.push(json_value);
                    }
                }
            }
        }
    }

    Ok(canvas_data)
}

#[tauri::command]
fn save_canvas_image(canvas_id: String, base64_image: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    // Получаем путь к папке приложения для хранения данных
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Не удалось разрешить папку данных приложения.")?;

    // Создаем путь для сохранения изображений холста в папке 'database/images'
    let image_dir = base_path.join("database/template");

    // Убедимся, что директория существует, и создадим её при необходимости
    if !image_dir.exists() {
        fs::create_dir_all(&image_dir).map_err(|e| e.to_string())?;
    }

    // Создаем полный путь для файла изображения с использованием canvas_id
    let image_path = image_dir.join(format!("canvas_{}.png", canvas_id));

    // Декодируем base64 строку изображения в байты
    let image_data = BASE64_STANDARD.decode(&base64_image).map_err(|e| format!("Ошибка декодирования изображения: {}", e))?;

    // Сохраняем изображение в файл
    fs::write(&image_path, image_data).map_err(|e| e.to_string())?;

    Ok(())
}




//-------------------------------------------------Printer Information-------------------------------------------------------------------------------------
#[tauri::command]
fn get_printer_list() -> Result<Vec<String>, String> {
    let mut buffer_size: u32 = 0;
    let mut printer_count: u32 = 0;

    // Первый вызов для получения необходимого размера буфера
    let result = unsafe {
        EnumPrintersW(
            PRINTER_ENUM_LOCAL,
            null_mut(),
            2,
            null_mut(),
            0,
            &mut buffer_size,
            &mut printer_count,
        )
    };

    if result == 0 {
        return Err("Не создался необходимый размер буфера".into());
    }

    // Создаем буфер нужного размера
    let mut buffer: Vec<u8> = vec![0; buffer_size as usize];

    // Второй вызов для получения данных о принтерах
    let result = unsafe {
        EnumPrintersW(
            PRINTER_ENUM_LOCAL,
            null_mut(),
            2,
            buffer.as_mut_ptr(),
            buffer_size,
            &mut buffer_size,
            &mut printer_count,
        )
    };

    if result == 0 {
        return Err("Не получил данные принтера".into());
    }

    // Преобразуем полученные данные в структуру PRINTER_INFO_2W
    let printers: &[PRINTER_INFO_2W] = unsafe {
        std::slice::from_raw_parts(
            buffer.as_ptr() as *const PRINTER_INFO_2W,
            printer_count as usize,
        )
    };

    // Преобразуем имена принтеров в Vec<String>
    let printer_names: Vec<String> = printers.iter().map(|printer| {
        let name = unsafe {
            let len = (0..).take_while(|&i| *printer.pPrinterName.offset(i) != 0).count();
            OsString::from_wide(std::slice::from_raw_parts(printer.pPrinterName, len))
        };
        name.to_string_lossy().into_owned()
    }).collect();

    Ok(printer_names)
}

#[tauri::command]
fn get_printer_driver(printer_name: String) -> Result<String, String> {
    let printer_name: Vec<u16> = OsString::from(printer_name)
        .encode_wide()
        .chain(Some(0).into_iter())
        .collect();

    let mut needed: u32 = 0;
    let mut driver_count: u32 = 0;

    // Первый вызов для получения необходимого размера буфера
    let result = unsafe {
        EnumPrinterDriversW(
            null_mut(),
            printer_name.as_ptr() as *mut u16,
            3,
            null_mut(),
            0,
            &mut needed,
            &mut driver_count,
        )
    };

    if result == 0 {
        return Err("Не получил размер буфера для драйвера".into());
    }

    // Создаем буфер нужного размера
    let mut buffer: Vec<u8> = vec![0; needed as usize];

    // Второй вызов для получения данных о драйверах
    let result = unsafe {
        EnumPrinterDriversW(
            null_mut(),
            printer_name.as_ptr() as *mut u16,
            3,
            buffer.as_mut_ptr(),
            needed,
            &mut needed,
            &mut driver_count,
        )
    };

    if result == 0 {
        return Err("Failed to enumerate printer drivers".into());
    }

    // Преобразуем полученные данные в структуру DRIVER_INFO_3W
    let drivers: &[DRIVER_INFO_3W] = unsafe {
        std::slice::from_raw_parts(
            buffer.as_ptr() as *const DRIVER_INFO_3W,
            driver_count as usize,
        )
    };

    // Преобразуем имена драйверов в строку
    let driver_names: Vec<String> = drivers.iter().map(|driver| {
        let name = unsafe {
            let len = (0..).take_while(|&i| *driver.pName.offset(i) != 0).count();
            OsString::from_wide(std::slice::from_raw_parts(driver.pName, len))
        };
        name.to_string_lossy().into_owned()
    }).collect();

    Ok(driver_names.join(", "))
}
