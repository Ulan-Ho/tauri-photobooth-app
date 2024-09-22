#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
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
use std::ptr;
use std::ffi::{c_void, CString};
use std::sync::atomic::{AtomicBool, Ordering};

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkHours {
    pub start: String,
    pub end: String,
}


// Объявление внешних функций из Canon EDSDK
#[link(name = "EDSDK")]
extern "C" {
    fn EdsInitializeSDK() -> u32;
    fn EdsTerminateSDK() -> u32;
    fn EdsGetCameraList(cameraList: *mut *mut c_void) -> u32;
    fn EdsGetChildCount(cameraList: *mut c_void, count: *mut u32) -> u32;
    fn EdsGetChildAtIndex(cameraList: *mut c_void, index: u32, camera: *mut *mut c_void) -> u32;
    fn EdsOpenSession(camera: *mut c_void) -> u32;
    fn EdsCloseSession(camera: *mut c_void) -> u32;
    fn EdsRelease(ref_: *mut c_void) -> u32;
    fn EdsSetObjectEventHandler(
        camera: *mut c_void,
        event: u32,
        handler: extern "C" fn(u32, *mut c_void, *mut c_void) -> u32,
        context: *mut c_void,
    ) -> u32;
    fn EdsSetPropertyEventHandler(
        camera: *mut c_void,
        event: u32,
        handler: extern "C" fn(u32, u32, u32, *mut c_void) -> u32,
        context: *mut c_void,
    ) -> u32;
    fn EdsSetCameraStateEventHandler(
        camera: *mut c_void,
        event: u32,
        handler: extern "C" fn(u32, u32, *mut c_void) -> u32,
        context: *mut c_void,
    ) -> u32;
    fn EdsSendCommand(camera: *mut c_void, command: u32, param: u32) -> u32;
    fn EdsGetEvent() -> u32;
    fn EdsSetPropertyData(
        camera: *mut c_void,
        prop_id: u32,
        in_param: u32,
        size: u32,
        data: *const c_void,
    ) -> u32;
    fn EdsSetCapacity(camera: *mut c_void, capacity: EdsCapacity) -> u32;
    fn EdsDownload(directory_item: *mut c_void, size: u64, stream: *mut c_void) -> u32;
    fn EdsDownloadComplete(directory_item: *mut c_void) -> u32;
    fn EdsGetDirectoryItemInfo(directory_item: *mut c_void, dir_item_info: *mut EdsDirectoryItemInfo) -> u32;
    fn EdsCreateFileStream(
        file_name: *const i8,
        create_disposition: u32,
        access: u32,
        stream: *mut *mut c_void,
    ) -> u32;
}

// Определение структуры EdsCapacity
#[repr(C)]
struct EdsCapacity {
    number_of_shots: i32,
    bytes_per_sector: i32,
    reset: i32,
}

// Определение структуры EdsDirectoryItemInfo
#[repr(C)]
struct EdsDirectoryItemInfo {
    size: u64,
    sz_file_name: [i8; 256],
}

// Глобальный флаг завершения события, используя AtomicBool для потокобезопасности
static EVENT_HAS_FIRED: AtomicBool = AtomicBool::new(false);

// Обработчик событий объекта
extern "C" fn handle_object_event(event: u32, object: *mut c_void, _context: *mut c_void) -> u32 {
    println!("[LOG] Object event triggered: 0x{:X}", event);
    if event == 0x00000201 { // kEdsObjectEvent_DirItemRequestTransfer
        unsafe {
            let err = download_image(object);
            if err != 0 {
                eprintln!("[ERROR] Failed to download image: 0x{:X}", err);
            } else {
                println!("[LOG] Image downloaded successfully.");
                EVENT_HAS_FIRED.store(true, Ordering::SeqCst);
            }
            // Освободите объект после обработки
            EdsRelease(object);
        }
    }
    0
}

// Обработчик событий состояния
extern "C" fn handle_state_event(event: u32, _parameter: u32, _context: *mut c_void) -> u32 {
    println!("[LOG] State event triggered: 0x{:X}", event);
    0
}

// Обработчик событий свойств
extern "C" fn handle_property_event(_event: u32, _property: u32, _in_param: u32, _context: *mut c_void) -> u32 {
    println!("[LOG] Property event triggered.");
    0
}

// Функция для загрузки изображения
unsafe fn download_image(directory_item: *mut c_void) -> u32 {
    // Получение информации о директории
    let mut dir_item_info: EdsDirectoryItemInfo = std::mem::zeroed();
    let err = EdsGetDirectoryItemInfo(directory_item, &mut dir_item_info);
    if err != 0 {
        eprintln!("[ERROR] Failed to get directory item info: 0x{:X}", err);
        return err;
    }

    // Преобразуем имя файла из C-строки в Rust строку
    let c_str = std::ffi::CStr::from_ptr(dir_item_info.sz_file_name.as_ptr());
    let file_name = match c_str.to_str() {
        Ok(s) => s,
        Err(_) => {
            eprintln!("[ERROR] Invalid file name.");
            return err;
        }
    };

    // Создаём файловый поток для загрузки
    let c_file_name = CString::new(file_name).unwrap();
    let mut stream: *mut c_void = ptr::null_mut();
    let err = EdsCreateFileStream(
        c_file_name.as_ptr(),
        0x00000001, // kEdsFileCreateDisposition_CreateAlways
        0x00000001, // kEdsAccess_ReadWrite
        &mut stream,
    );
    if err != 0 {
        eprintln!("[ERROR] Failed to create file stream: 0x{:X}", err);
        return err;
    }

    // Загрузка изображения
    let err = EdsDownload(directory_item, dir_item_info.size, stream);
    if err != 0 {
        eprintln!("[ERROR] Failed to download image: 0x{:X}", err);
        EdsRelease(stream);
        return err;
    }

    // Завершение загрузки
    let err = EdsDownloadComplete(directory_item);
    if err != 0 {
        eprintln!("[ERROR] Failed to complete download: 0x{:X}", err);
        EdsRelease(stream);
        return err;
    }

    // Освобождение потока
    EdsRelease(stream);

    println!("[LOG] Image downloaded successfully.");
    err
}

// Функция для получения первой камеры
unsafe fn get_first_camera(camera: *mut *mut c_void) -> u32 {
    let mut camera_list: *mut c_void = ptr::null_mut();
    let mut count: u32 = 0;

    let err = EdsGetCameraList(&mut camera_list);
    if err != 0 {
        eprintln!("[ERROR] Failed to get camera list: 0x{:X}", err);
        return err;
    }

    let err = EdsGetChildCount(camera_list, &mut count);
    if err != 0 {
        eprintln!("[ERROR] Failed to get child count: 0x{:X}", err);
        EdsRelease(camera_list);
        return err;
    }

    if count == 0 {
        eprintln!("[ERROR] No cameras found.");
        EdsRelease(camera_list);
        return 0x0000001E; // EDS_ERR_DEVICE_NOT_FOUND
    }

    let err = EdsGetChildAtIndex(camera_list, 0, camera);
    if err != 0 {
        eprintln!("[ERROR] Failed to get camera at index 0: 0x{:X}", err);
    }

    EdsRelease(camera_list);
    err
}

// Функция для захвата изображения
unsafe fn take_picture(camera: *mut c_void) -> Result<(), String> {
    let mut err = EdsSendCommand(camera, 0x00000000, 0); // kEdsCameraCommand_TakePicture
    if err == 0x0000050A { // EDS_ERR_TAKE_PICTURE_AF_NG
        eprintln!("[WARNING] Autofocus failed, retrying...");
        thread::sleep(Duration::from_millis(500));
        err = EdsSendCommand(camera, 0x00000000, 0);
    }

    if err != 0 {
        Err(format!("Failed to take picture: 0x{:X}", err))
    } else {
        Ok(())
    }
}

// Tauri команды
#[tauri::command]
async fn take_picture_command() -> Result<String, String> {
    tokio::task::spawn_blocking(move || {
        unsafe {
        // Здесь предполагается, что вы уже инициализировали SDK и открыли сессию
        // В реальном приложении вам нужно хранить состояние камеры, возможно, через Arc<Mutex<_>>
        // Для примера будем инициализировать и закрывать SDK внутри команды

        // Инициализация SDK
        // let mut err = EdsInitializeSDK();
        // println!("[LOG] SDK initialized successfully. {:?}", err);
        // if err != 0 {
        //     return Err(format!("Failed to initialize SDK: 0x{:X}", err));
        // }
        println!("[LOG] SDK initialized successfully.");

        // Получение первой камеры
        let mut camera: *mut c_void = ptr::null_mut();
        let mut err = get_first_camera(&mut camera);
        if err != 0 {
            EdsTerminateSDK();
            return Err(format!("Failed to get camera: 0x{:X}", err));
        }
        println!("[LOG] Camera obtained.");

        // Открытие сессии с камерой
        err = EdsOpenSession(camera);
        if err != 0 {
            EdsRelease(camera);
            EdsTerminateSDK();
            return Err(format!("Failed to open session with camera: 0x{:X}", err));
        }
        println!("[LOG] Camera session opened.");

        // Установка обработчиков событий
        // EdsSetObjectEventHandler(camera, 0xFFFFFFFF, handle_object_event, ptr::null_mut());
        // EdsSetPropertyEventHandler(camera, 0xFFFFFFFF, handle_property_event, ptr::null_mut());
        // EdsSetCameraStateEventHandler(camera, 0xFFFFFFFF, handle_state_event, ptr::null_mut());

        // Установка параметров камеры
        let save_target: i32 = 1; // kEdsSaveTo_Host
        err = EdsSetPropertyData(
            camera,
            0xD004, // kEdsPropID_SaveTo
            0,
            4,
            &save_target as *const _ as *const c_void,
        );
        if err != 0 {
            eprintln!("[WARNING] Failed to set save location: 0x{:X}", err);
            // Продолжаем, так как можно использовать память карты
        }

        // Установка объёма памяти
        let capacity = EdsCapacity {
            number_of_shots: 0x7FFFFFFF,
            bytes_per_sector: 0x1000,
            reset: 1,
        };
        err = EdsSetCapacity(camera, capacity);
        if err != 0 {
            eprintln!("[ERROR] Failed to set camera capacity: 0x{:X}", err);
            EdsCloseSession(camera);
            EdsRelease(camera);
            EdsTerminateSDK();
            return Err(format!("Failed to set camera capacity: 0x{:X}", err));
        }

        // Захват изображения
        println!("[LOG] Taking picture...");
        match take_picture(camera) {
            Ok(_) => println!("[LOG] Picture taken successfully."),
            Err(e) => {
                eprintln!("[ERROR] {}", e);
                EdsCloseSession(camera);
                EdsRelease(camera);
                EdsTerminateSDK();
                return Err(e);
            }
        }

        // Ждём события загрузки изображения
        println!("[LOG] Waiting for event...");
        // while !EVENT_HAS_FIRED.load(Ordering::SeqCst) {
        //     EdsGetEvent();
        //     thread::sleep(Duration::from_millis(100));
        // }

        // Закрываем сессию с камерой
        // EdsCloseSession(camera);
        println!("[LOG] Camera session closed.");

        // Освобождаем камеру
        EdsRelease(camera);

        // Завершаем SDK
        err = EdsTerminateSDK();
        println!("[LOG] SDK terminated.");
        if err != 0 {
            eprintln!("[ERROR] Failed to terminate SDK: 0x{:X}", err);
            return Err(format!("Failed to terminate SDK: 0x{:X}", err));
        }

        println!("[LOG] SDK terminated.");
        // Ok("Picture taken and downloaded successfully.".to_string())
        Ok("Photo captured successfully".to_string())
}})
    .await
    .map_err(|e| format!("Error capturing photo: {:?}", e))?
}

fn main() {
    // unsafe { EdsInitializeSDK(); }
    let event_fired = Arc::new(Mutex::new(false));
    // // Создаем элементы меню
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
            println!("Tauri app started");
            // unsafe { EdsInitializeSDK(); }

            let handle = app.handle();
            let handle_clone = handle.clone();
            let window = handle.get_window("main").unwrap();
            let menu_visible = menu_visible.clone();

            // Создаем состояние устройства
            let device_state = DeviceState::new();

            let event_fired_clone = Arc::clone(&event_fired);
            // Запускаем поток для мониторинга событий камеры
            thread::spawn(move || {
                loop {
                    // Проверяем, было ли событие
                    let fired = {
                        let flag = event_fired_clone.lock().unwrap();
                        *flag
                    };

                    if fired {
                        // Отправляем событие в фронтенд
                        handle.emit_all("image-downloaded", "Image has been downloaded").unwrap();
                        break;
                    }

                    thread::sleep(Duration::from_millis(100));
                }
            });

            // Обработчик событий клавиатуры
            thread::spawn(move || {
                let mut last_check = Instant::now();
                loop {
                    if last_check.elapsed() >= Duration::from_millis(100) {
                        let keys = device_state.get_keys();
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
        })
        .invoke_handler(tauri::generate_handler![print_image, get_work_hours, set_work_hours, save_image, take_picture_command])
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
    // Декодируйте base64 данные изображения
    // let base64_str = image_data.split(',').nth(1).ok_or("Invalid base64 string")?;
    let decoded_data = BASE64_STANDARD.decode(image_data).map_err(|e| e.to_string())?;

    // Установите путь для сохранения файла
    let base_path = app_handle.path_resolver().app_cache_dir().ok_or("Failed to resolve app data directory")?;
    let file_path = base_path.join("images").join(file_name);
    let mut file = File::create(file_path.clone()).map_err(|e| e.to_string())?;

    println!("Путь к файлу: {:?}", file_path.to_str().unwrap());
    file.write_all(&decoded_data).map_err(|e| e.to_string())?;
    Ok(())
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


//---------------------------------------------------Create directory---------------------------------------------------------------------
fn setting_dir(app_handle: tauri::AppHandle) {
    let base_path = app_handle.path_resolver().app_data_dir().unwrap();

    let base_path_clone = base_path.clone(); // Clone base_path for use in the async block
    tauri::async_runtime::spawn(async move {
        let directories = vec!["database", "database/template", "database/time", "database/background", "database/images"];
        create_directories_if_not_exist(directories, &base_path_clone); // Use the cloned version
    });

    // Use the original base_path here
    create_time_json_if_not_exist(&base_path);
}

fn create_directories_if_not_exist(dirs: Vec<&str>, base_path: &PathBuf) {
    for dir in dirs {
        let path: PathBuf = base_path.join(dir);
        if !path.exists() {
            if let Err(e) = fs::create_dir_all(&path) {
                eprintln!("Ошибка при создании папки: {:?}", e);
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