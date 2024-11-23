// #![cfg_attr(
//     all(not(debug_assertions), target_os = "windows"),
//     windows_subsystem = "windows"
// )]

//-------------------------------------------------------------------------------------------------
// use tauri::AppHandle;
// use std::slice;
use std::ffi::CString;
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
// use std::ffi::{ c_void, c_uint, c_int};
use libc::{c_void, c_uint, c_int, c_char};
use tauri::State;
use chrono::{Local, NaiveTime};
use std::io;
#[derive(Serialize, Deserialize, Debug)]
pub struct WorkHours {
    pub start: String,
    pub end: String,
}

type EdsError = c_int;
type EdsCameraRef = *mut c_void;
// type EdsDirectoryItemRef = *mut c_void;
type EdsUInt32 = c_uint;
type EdsPropertyID = c_uint;
type EdsStateEvent = c_uint;
type EdsObjectEvent = c_uint;
type EdsPropertyEvent = c_uint;
type EdsBaseRef = *mut c_void;
type EdsVoid = c_void;


#[link(name = "EDSDK")]
extern "C" {
    fn EdsInitializeSDK() -> u32;
    fn EdsTerminateSDK() -> u32;
    fn EdsGetCameraList(camera_list: *mut *mut c_void) -> u32;
    fn EdsGetChildCount(inRef: *mut c_void, outCount: *mut u32) -> u32;
    fn EdsGetChildAtIndex(inRef: *mut c_void, index: u32, outRef: *mut *mut c_void) -> u32;
    fn EdsOpenSession(camera: *mut c_void) -> u32;
    fn EdsCloseSession(camera: *mut c_void) -> u32;
    fn EdsSendCommand(camera: *mut c_void, command: u32, param: u32) -> u32;
    fn EdsGetDirectoryItemInfo(dir_item: *mut c_void, dir_item_info: *mut EdsDirectoryItemInfo) -> u32;
    fn EdsCreateMemoryStream(size: u64, stream: *mut *mut c_void) -> u32;
    fn EdsDownload(dir_item: *mut c_void, size: u64, stream: *mut c_void) -> u32;
    fn EdsDownloadComplete(dir_item: *mut c_void) -> u32;
    fn EdsGetPointer(stream: *mut c_void, pointer: *mut *mut u8) -> u32;
    fn EdsGetLength(stream: *mut c_void, length: *mut u64) -> u32;
    fn EdsRelease(ref_: *mut c_void) -> u32;
    // fn EdsDeleteDirectoryItem(dir_item: *mut c_void) -> u32;
    fn EdsCreateEvfImageRef(stream: *mut c_void, evfImage: *mut *mut c_void) -> u32;
    fn EdsDownloadEvfImage(camera: *mut c_void, evfImage: *mut c_void) -> u32;
    fn EdsGetPropertyData(ref_: *mut c_void, prop_id: u32, param: u32, size: u32, out_data: *mut c_void) -> u32;
    // fn EdsSetPropertyData(camera: *mut c_void, prop_id: u32, param: u32, size: u32, in_data: *const i64) -> u32;
    fn EdsSetPropertyData(camera: *mut c_void, prop_id: u32, param: u32, size: u32, in_data: *const c_void) -> u32;
    
    // fn EdsSetPropertyEventHandler(camera: *mut c_void, event: c_uint, event_handler: extern "C" fn(c_uint, *mut c_void, *mut c_void) -> c_int, context: *mut c_void) -> c_int;
    // fn EdsSetObjectEventHandler(camera: *mut c_void, event: c_uint, event_handler: extern "C" fn(c_uint, c_uint, c_uint, *mut c_void) -> c_int, context: *mut c_void) -> c_int;
    // fn EdsSetCameraStateEventHandler(camera: *mut c_void, event: c_uint, event_handler: extern "C" fn(c_uint, c_uint, *mut c_void) -> c_int, context: *mut c_void) -> c_int;
    
    fn EdsSetObjectEventHandler(camera: EdsCameraRef, event: EdsObjectEvent, handler: extern "C" fn(EdsObjectEvent, EdsBaseRef, *mut EdsVoid) -> EdsError, context: *mut EdsVoid) -> EdsError;
    fn EdsSetPropertyEventHandler(camera: EdsCameraRef, event: EdsPropertyEvent, handler: extern "C" fn(EdsPropertyEvent, EdsPropertyID, EdsUInt32, *mut EdsVoid) -> EdsError, context: *mut EdsVoid) -> EdsError;
    fn EdsSetCameraStateEventHandler(camera: EdsCameraRef, event: EdsStateEvent, handler: extern "C" fn(EdsStateEvent, EdsUInt32, *mut EdsVoid) -> EdsError, context: *mut EdsVoid) -> EdsError;

    fn EdsCreateFileStream(
        in_file_name: *const c_char,
        in_create_disposition: c_int,
        in_desired_access: c_uint,
        out_stream: *mut *mut c_void,
    ) -> c_uint;

    fn EdsGetEvent() -> u32;
    fn EdsSetCapacity(camera: *mut c_void, capacity: EdsCapacity) -> u32;
}
#[repr(C)]
pub struct EdsDirectoryItemInfo {
    pub size: u64,
    pub is_folder: i32,
    pub group_id: u32,
    pub option: u32,
    pub sz_file_name: [i8; 256],
}
#[repr(C)]
pub struct EdsCapacity {
    number_of_free_clusters: i32,
    bytes_per_sector: i32,
    reset: bool,
}

#[derive(Debug)]
struct Camera {
    camera_ref: *mut c_void,
    is_live_view_started: bool,
    photo_created: Arc<Mutex<bool>>,
}


unsafe impl Send for Camera {}
unsafe impl Sync for Camera {}

impl Camera {
    fn new() -> Result<Arc<Mutex<Self>>, u32> {
        unsafe {
            let err = EdsInitializeSDK();
            if err != 0 {
                return Err(err);
            }

            let mut camera_list: *mut c_void = std::ptr::null_mut();
            let err = EdsGetCameraList(&mut camera_list);
            if err != 0 {
                EdsTerminateSDK();
                return Err(err);
            }

            let mut camera_count: u32 = 0;
            let err = EdsGetChildCount(camera_list, &mut camera_count);
            if err != 0 || camera_count == 0 {
                EdsRelease(camera_list);
                EdsTerminateSDK();
                return Err(err);
            }

            let mut camera_ref_in: *mut c_void = std::ptr::null_mut();
            let err = EdsGetChildAtIndex(camera_list, 0, &mut camera_ref_in);
            EdsRelease(camera_list);
            if err != 0 {
                EdsTerminateSDK();
                return Err(err);
            }

            let err = EdsOpenSession(camera_ref_in);
            if err != 0 {
                EdsRelease(camera_ref_in);
                EdsTerminateSDK();
                return Err(err);
            }

            EdsRelease(camera_list);
            let camera = Arc::new(Mutex::new(Camera {
                camera_ref: camera_ref_in,
                is_live_view_started: false,
                photo_created: Arc::new(Mutex::new(false)),
            }));

            println!("[INFO] Camera initialized successfully.");
            Ok(camera)
        }
    }

    extern "C" fn handle_object_event( event: EdsObjectEvent, object: EdsBaseRef, context: *mut EdsVoid) -> EdsError {
        println!("[LOG] Object event triggered: 0x{:X}", event);
        if event == 0x00000208 {
            let camera = unsafe { &*(context as *mut Camera) };
            let err = Self::download_image( object, "captured_image.jpg");
            if err != 0 {
                println!("[ERROR] Failed to download image: 0x{:?}", err);
            }
            if !object.is_null() {
                unsafe { EdsRelease(object); }
            }
            let mut photo_created = camera.photo_created.lock().unwrap();
            *photo_created = true;
        }
        0
    }

    extern "C" fn handle_property_event(_event: EdsPropertyEvent, property_id: EdsPropertyID, _param: EdsUInt32, _context: *mut EdsVoid) -> EdsError {
        println!("[LOG] Property event triggered: 0x{:X}", property_id);
        // Обработка события свойства
        0
    }

    extern "C" fn handle_state_event(event: EdsStateEvent, _param: EdsUInt32, _context: *mut EdsVoid) -> EdsError {
        // match event {
        //     0x00000302 => {
        //         println!("[INFO] Camera disconnected.");
        //         Self::new().unwrap();
        //     }
        //     0x00000301 => {
        //         println!("[INFO] Camera connected.");
        //     }
        //     _ => {
        //         println!("[LOG] State event triggered: 0x{:X}", event);
        //     }
        // }
        println!("[LOG] State event triggered: 0x{:X}", event);

        0
    }

    fn capture_photo(&self) -> Result<(), u32> {
        unsafe {
            let save_target: u32 = 2;
            let capacity = EdsCapacity {
                number_of_free_clusters: 0x7FFFFFFF,
                bytes_per_sector: 0x1000,
                reset: true,
            };
    
            // Установка обработчиков событий
            if EdsSetObjectEventHandler(self.camera_ref, 0x00000200, Self::handle_object_event, self as *const _ as *mut EdsVoid) != 0 {
                eprintln!("[ERROR] Failed to set object event handler.");
                // return Err(1);
            }
            if EdsSetPropertyEventHandler(self.camera_ref, 0x00000100, Self::handle_property_event, std::ptr::null_mut()) != 0 {
                eprintln!("[ERROR] Failed to set property event handler.");
                // return Err(2);
            }
            if EdsSetCameraStateEventHandler(self.camera_ref, 0x00000300, Self::handle_state_event, std::ptr::null_mut()) != 0 {
                eprintln!("[ERROR] Failed to set camera state event handler.");
                // return Err(3);
            }
            println!("[LOG] Event handlers set successfully.");

            // Установка цели сохранения
            let result = EdsSetPropertyData(
                self.camera_ref,
                0x0000000b,
                0,
                4,
                &save_target as *const _ as *mut c_void,
            );
            if result != 0 {
                eprintln!("[ERROR] Failed to set save target. Error code: 0x{:X}", result);
            }
            println!("[LOG] Save target set successfully.");
    
            // Установка емкости
            let result = EdsSetCapacity(self.camera_ref, capacity);
            if result != 0 {
                eprintln!("[ERROR] Failed to set capacity. Error code: 0x{:X}", result);
            }
            println!("[LOG] Capacity set successfully.");
    
            // Отправка команды на съемку
            // thread::sleep(Duration::from_millis(100));
            // let result = EdsSendCommand(self.camera_ref, 0x00000000, 0x00000000);
            // if result != 0 {
            //     eprintln!("[ERROR] Failed to send capture command (1). Error code: 0x{:X}", result);
            //     return Err(result);
            // }

            let max_retries = 10; // Максимальное количество попыток
            let mut attempts = 0;

            while attempts < max_retries {
                let result = EdsSendCommand(self.camera_ref, 0x00000000, 0x00000000);
                if result == 0 {
                    println!("[INFO] Capture command sent successfully.");
                    break; // Успешное выполнение команды — выходим из цикла
                } else {
                    eprintln!("[ERROR] Failed to send capture command (attempt {}). Error code: 0x{:X}", attempts + 1, result);
                    attempts += 1;

                    // Здесь можно добавить задержку перед следующей попыткой, если нужно
                    std::thread::sleep(std::time::Duration::from_millis(200)); // Задержка 500 мс
                }
            }

            if attempts == max_retries {
                eprintln!("[ERROR] All attempts to send capture command failed.");
                return Err(result); // Возвращаем ошибку после всех попыток
            }

            println!("[LOG] Photo capture commands sent successfully.");

            // Ожидаем завершения создания фотографии
            let mut photo_created = self.photo_created.lock().unwrap();
            while !*photo_created {
                drop(photo_created); // Освобождаем блокировку, чтобы обработчики могли обновлять состояние
                EdsGetEvent();       // Обрабатываем события
                thread::sleep(Duration::from_millis(100));
                photo_created = self.photo_created.lock().unwrap();
            }
            *photo_created = false;

            println!("[LOG] Photo captured successfully.");
            Ok(())
        }
    }


    fn download_image(directory_item: *mut c_void, file_name: &str) -> EdsError {
        unsafe {
            let c_file_name = CString::new(file_name).expect("Failed to create CString");
            let mut dir_item_info = EdsDirectoryItemInfo {
                size: 0,
                is_folder: 0,
                group_id: 0,
                option: 0,
                sz_file_name: [0; 256],
            };

            // Получаем информацию о элементе директории
            let err = EdsGetDirectoryItemInfo(directory_item, &mut dir_item_info);
            if err != 0 {
                println!("[ERROR] Failed to get directory item info: 0x{:X}", err);
                // return Err(err);
            }

            let mut stream: *mut c_void = std::ptr::null_mut();
            let err = EdsCreateFileStream(c_file_name.as_ptr(), 1, 2, &mut stream);
            if err != 0 {
                println!("[ERROR] Failed to create file stream: 0x{:X}", err);
                // return Err(err);
            }
            // Создаем поток в памяти для сохранения изображения
            // err = unsafe { EdsCreateMemoryStream(dir_item_info.size, &mut stream) };
            // if err != 0 {
            //     println!("[ERROR] Failed to create memory stream: 0x{:X}", err);
                // return err.try_into().unwrap();
            // }

            // Скачиваем изображение в поток
            let err = EdsDownload(directory_item, dir_item_info.size, stream);
            if err != 0 {
                println!("[ERROR] Failed to download image: 0x{:X}", err);
                EdsRelease(stream);
                // return Err(err);
            }
            println!("[LOG] Image downloaded successfully.");

            // Завершаем скачивание
            let err = EdsDownloadComplete(directory_item);
            if err != 0 {
                eprintln!("[ERROR] Failed to complete download: 0x{:X}", err);
                EdsRelease(stream);
                // return Err(err);
            }

            // Освобождаем поток
            if !stream.is_null() {
                EdsRelease(stream);
            }

            println!("[LOG] Image downloaded and encoded to base64 successfully.");
            0
        }
    }

    fn start_live_view(&mut self) -> Result<(), u32> {
        if !self.is_live_view_started {
            self.is_live_view_started = true;
            unsafe {
                let mut device: u32 = 0;
                let err = EdsGetPropertyData(self.camera_ref, 0x00000500, 0, size_of::<u32>() as u32, &mut device as *mut _ as *mut c_void);
                if err != 0 {
                    return Err(err);
                }
                if device & 2 == 0 {
                    device |= 2; // Включить вывод живого просмотра
                    let err = EdsSetPropertyData(self.camera_ref, 0x00000500, 0, size_of::<u32>() as u32, &device as *const _ as *mut c_void);
                    if err != 0 {
                        return Err(err);
                    }
                }
            }

            println!("Live view started");
            Ok(())
        } else {
            Ok(())
        }
    }

    fn stop_live_view(&mut self) -> Result<(), u32> {
        if self.is_live_view_started {
            unsafe {
                let mut device: u32 = 0;
                let err = EdsGetPropertyData(
                    self.camera_ref,
                    0x00000500,
                    0,
                    std::mem::size_of::<u32>() as u32,
                    &mut device as *mut _ as *mut c_void,
                );
                
                if err != 0 {
                    println!("Failed to get current output device: {}", err);
                    return Err(err);
                }
    
                // Проверка, активно ли устройство вывода для живого просмотра
                if device & 2 != 0 {
                    // Отключаем вывод на компьютер (удаляем бит)
                    device &= !2;
    
                    // Устанавливаем новое значение для устройства вывода
                    let err = EdsSetPropertyData(
                        self.camera_ref,
                        0x00000500, // kEdsPropID_Evf_OutputDevice
                        0,
                        std::mem::size_of::<u32>() as u32,
                        &device as *const _ as *const c_void,
                    );
    
                    if err != 0 {
                        println!("Failed to disable live view output device: {}", err);
                        return Err(err);
                    }
                }
            }
            // Обновляем флаг состояния живого просмотра
            self.is_live_view_started = false;
            println!("Live view stopped.");
            Ok(())
        } else {
            println!("Live view is not active.");
            Ok(())
        }
    }

    fn download_evf_image(&self) -> Result<String, String> {
        unsafe {
            let mut stream: *mut c_void = std::ptr::null_mut();
            let mut evf_image: *mut c_void = std::ptr::null_mut();
            // thread::sleep(Duratiosn::from_millis(200));
            // Создаем поток памяти для хранения изображения
            let err = EdsCreateMemoryStream(0, &mut stream);
            if err != 0 {
                return Err(format!("Error creating memory stream: {}", err));
            }
            // Создаем ссылку на изображение live view (evf)
            let err = EdsCreateEvfImageRef(stream, &mut evf_image);
            if err != 0 {
                EdsRelease(stream);
                return Err(format!("Error creating EVF image reference: {}", err));
            }
            // Скачиваем изображение
            let err = EdsDownloadEvfImage(self.camera_ref, evf_image);
            // println!("err: {}", err);
            if err != 0 {
                EdsRelease(evf_image);
                EdsRelease(stream);
                // println!("Error downloading EVF image: {}", err);
                return Err(format!("Error downloading EVF image: {}", err));
            }
            // Получаем длину данных в потоке
            let mut length: u64 = 0;
            let err = EdsGetLength(stream, &mut length);
            if err != 0 || length == 0 {
                EdsRelease(evf_image);
                EdsRelease(stream);
                return Err(format!("Error getting stream length: {}", err));
            }
            // Получаем указатель на данные
            let mut data_ptr: *mut u8 = std::ptr::null_mut();
            let err = EdsGetPointer(stream, &mut data_ptr);
            if err != 0 || data_ptr.is_null() {
                EdsRelease(evf_image);
                EdsRelease(stream);
                return Err(format!("Error getting pointer from stream: {}", err));
            }
            // Копируем данные в вектор
            let image_data = std::slice::from_raw_parts(data_ptr, length as usize).to_vec();
            // let image_data = Vec::from_raw_parts(data_ptr, length as usize, length as usize);
            // println!("image_data: {:?}", image_data.len());
            let base64_data = BASE64_STANDARD.encode(&image_data);
            let result = format!("data:image/jpeg;base64,{}", base64_data);
            EdsRelease(evf_image);
            EdsRelease(stream);
            Ok(result)
        }
    }

}

impl Drop for Camera {
    fn drop(&mut self) {
        unsafe {
            EdsCloseSession(self.camera_ref);
            EdsRelease(self.camera_ref);
            EdsTerminateSDK();
        }
    }
}

#[tauri::command]
fn download_ev_image_command(state: tauri::State<'_, Arc<Mutex<Option<Arc<Mutex<Camera>>>>>>) -> Result<String, String> {
    let camera_lock = state.lock().unwrap();
    if let Some(camera) = &*camera_lock {
        camera.lock().unwrap().download_evf_image()
    } else {
        Err("Camera not initialized.".to_string())
    }
}

#[tauri::command]
fn initialize_camera(state: State<'_, Arc<Mutex<Option<Arc<Mutex<Camera>>>>>>) -> Result<String, String> {
    let camera = match Camera::new() {
        Ok(camera) => camera,
        Err(err) => return Err(format!("Failed to initialize camera: Error code {}", err)),
    };

    let mut state_lock = state.lock().unwrap();
    *state_lock = Some(camera);

    Ok("Camera initialized successfully".into())
}

// Tauri command for capturing a photo
#[tauri::command]
fn capture_photo_as(state: State<'_, Arc<Mutex<Option<Arc<Mutex<Camera>>>>>>) -> Result<String, String> {
    let state_lock = state.lock().unwrap();
    if let Some(camera) = &*state_lock {
        let camera_lock = camera.lock().unwrap();
        match camera_lock.capture_photo() {
            Ok(_) => Ok("Photo captured successfully".into()),
            Err(err) => Err(format!("Failed to capture photo: Error code {}", err)),
        }
    } else {
        Err("Camera is not initialized".into())
    }
}

#[tauri::command]
fn get_captured_image() -> Result<String, String> {
    println!("Waiting for captured image...");

    // Путь к файлу captured_image.jpg
    let file_path = PathBuf::from(env::current_dir().map_err(|err| err.to_string())?)
        .join("captured_image.jpg");

    // Проверяем наличие файла каждые 1 секунду, максимум 30 секунд
    let max_attempts = 30;
    let mut attempts = 0;

    while !file_path.exists() {
        if attempts >= max_attempts {
            return Err("Image not found after 30 seconds.".to_string());
        }
        attempts += 1;
        println!("Image not found, retrying... (Attempt {}/{})", attempts, max_attempts);
        thread::sleep(Duration::from_secs(1));
    }

    // Читаем файл, если он существует
    match fs::read(&file_path) {
        Ok(data) => {
            println!("Image data read successfully");
            let base64_str = BASE64_STANDARD.encode(&data);
            
            // Удаляем файл после успешного чтения
            if file_path.exists() {
                fs::remove_file(&file_path).map_err(|err| format!("Failed to delete file: {}", err))?;
                println!("Remove file")
            } else {
                println!("Image not found, skipping deletion.");
            }
            Ok(base64_str)
        }
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

// #[tauri::command]
// fn capture_photo(state: State<'_, Arc<Mutex<Option<Arc<Mutex<Camera>>>>>>) -> Result<String, String> {
//     let state_lock = state.lock().unwrap();
//     if let Some(camera) = &*state_lock {
//         let camera_lock = camera.lock().unwrap();
//         match camera_lock.capture_photo() {
//             Ok(_) => Ok("Photo captured successfully".into()),
//             Err(err) => Err(format!("Failed to capture photo: Error code {}", err)),
//         }
//     } else {
//         Err("Camera is not initialized".into())
//     }
// }

#[tauri::command]
fn start_live_view(state: State<'_, Arc<Mutex<Option<Arc<Mutex<Camera>>>>>>) -> Result<String, String> {
    let camera = state.lock().unwrap();
    if let Some(camera) = camera.as_ref() {
        camera.lock().unwrap().start_live_view()
            .map_err(|e| format!("Failed to start live view: Error code {}", e))?;
        Ok("Live view started successfully".into())
    } else {
        Err("Camera is not initialized".into())
    }
}


#[tauri::command]
fn stop_live_view(state: State<'_, Arc<Mutex<Option<Arc<Mutex<Camera>>>>>>) -> Result<String, String> {
    let camera = state.lock().unwrap();
    if let Some(camera) = camera.as_ref() {
        camera.lock().unwrap().stop_live_view()
            .map_err(|e| format!("Failed to start live view: Error code {}", e))?;
        Ok("Live view started successfully".into())
    } else {
        Err("Camera is not initialized".into())
    }
}

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
        .invoke_handler(tauri::generate_handler![print_image, get_work_hours, set_work_hours, save_image, get_image, save_canvas_data, save_canvas_image, load_all_canvas_data, delete_canvas_image_and_data, load_all_canvas_images,
            load_available_canvas_data,
            initialize_camera,
            capture_photo_as,
            start_live_view,
            download_ev_image_command,
            get_captured_image,
            stop_live_view,
            get_printers,
            save_printers,
            update_selected_printer])
        .manage(Arc::new(Mutex::new(None::<Arc<Mutex<Camera>>>)))
        .manage(PrinterState::default())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn print_image(image_data: String, state: State<PrinterState>) -> Result<(), String> {
    // let base64_str = image_data.split(',').nth(1).ok_or("Invalid base64 string")?;
    let decoded_data = BASE64_STANDARD.decode(image_data).map_err(|e| e.to_string())?;

    // let file_path = "temp_image.png";
    let file_path = PathBuf::from(env::current_dir().map_err(|err| err.to_string())?).join("temp_image.png");
    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(&decoded_data).map_err(|e| e.to_string())?;
    drop(file);
    let state_printer = state.selected_printer.lock().unwrap();
    let printer_name = state_printer.as_ref().map(|printer| printer.name.clone()).unwrap_or_default();

    // Экранирование пути к файлу для PowerShell
    let file_path_str = file_path.display().to_string();
    let escaped_file_path = format!("\"{}\"", file_path_str.replace("\\", "\\\\"));
    println!("Escaped file path: {}", escaped_file_path);

    thread::sleep(Duration::from_millis(100));

    let print_function = r#"
function Print-Image {
    param(
        [string]$PrinterName,
        [string]$FilePath,
        [int]$Scale,
        [string]$PaperSize,
        [string]$PrintJobName,
        [string]$PrintQuality
    )
    Add-Type -AssemblyName System.Drawing
    $printDocument = New-Object System.Drawing.Printing.PrintDocument
    $printDocument.PrinterSettings.PrinterName = $PrinterName
    $printDocument.DefaultPageSettings.Landscape = $false
    $printDocument.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize('Custom', 600, 400)
    $printDocument.add_PrintPage({
        param($sender, $e)
        $image = [System.Drawing.Image]::FromFile($FilePath)
        $e.Graphics.TranslateTransform(0, 0)
        $e.Graphics.RotateTransform(0)
        $scaledWidth = $image.Width * ($Scale / 300)
        $scaledHeight = $image.Height * ($Scale / 300)
        $e.Graphics.DrawImage($image, 0, 0, $scaledWidth, $scaledHeight)
        $image.Dispose()
    })
    $printDocument.PrinterSettings.DefaultPageSettings.PrinterResolution.Kind = [System.Drawing.Printing.PrinterResolutionKind]::High
    $printDocument.PrintController = New-Object System.Drawing.Printing.StandardPrintController
    $printDocument.Print()
}
    "#;

    let command = format!(
        r#"
{}
Print-Image -PrinterName "{}" -FilePath {} -Scale 100 -PaperSize "6x4-Split (6x2 2 prints)" -PrintJobName "ImagePrintJob" -PrintQuality "High"
        "#,
        print_function,
        printer_name,
        escaped_file_path
    );

    println!("PowerShell command: {}", command);

    // Передача функции в PowerShell
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

    let sleep_time  = NaiveTime::parse_from_str(&end, "%H:%M").map_err(|e| e.to_string())?;
    let wake_time  = NaiveTime::parse_from_str(&start, "%H:%M").map_err(|e| e.to_string())?;
    let data_dir = app_handle.path_resolver().app_data_dir()
        .ok_or("Failed to get app data directory")?;
    let file_path = data_dir.join("database/time/time.json");
    let work_hours = WorkHours { start: start.clone(), end };
    let file_content = serde_json::to_string(&work_hours).map_err(|e| e.to_string())?;
    fs::write(file_path, file_content).map_err(|e| e.to_string())?;

    let now = Local::now().time();
    // Вычисляем задержки для сна и пробуждения
    let sleep_duration = if sleep_time > now {
        (sleep_time - now).num_seconds()
    } else {
        (sleep_time + chrono::Duration::hours(24) - now).num_seconds()
    };

    let wake_duration = if wake_time > now {
        (wake_time - now).num_seconds()
    } else {
        (wake_time + chrono::Duration::hours(24) - now).num_seconds()
    };
    // Логируем оставшееся время
    println!(
        "Оставшееся время до сна: {} секунд ({} часов, {} минут)",
        sleep_duration,
        sleep_duration / 3600,
        (sleep_duration % 3600) / 60
    );
    println!(
        "Оставшееся время до пробуждения: {} секунд ({} часов, {} минут)",
        wake_duration,
        wake_duration / 3600,
        (wake_duration % 3600) / 60
    );
    
    // Настраиваем таймер на вход в спящий режим
    if !(sleep_time == wake_time) {
        thread::spawn(move || {
            loop {
                let current_time = Local::now().time();
                // Если текущее время равно времени выключения, переводим компьютер в спящий режим
                if current_time >= sleep_time && current_time < sleep_time + chrono::Duration::minutes(1) {
                    Command::new("shutdown")
                        .args(&["/h", "/f"])  // Перевод в спящий режим с принудительным закрытием приложений
                        .spawn()
                        .expect("Не удалось перевести компьютер в спящий режим");
                }
                // Проверяем каждые 30 секунд
                thread::sleep(Duration::from_secs(30));
            }
        });
    let wake_time_formatted = wake_time.format("%H:%M:%S").to_string();

    let ps_script = format!(
r#"
# Check if task already exists, if so, delete it
if (Get-ScheduledTask -TaskName "DailyWakeUpTask" -ErrorAction SilentlyContinue) {{
    Unregister-ScheduledTask -TaskName "DailyWakeUpTask" -Confirm:$false
}}

# Task start time
$taskTime = "{wake_time}"

# XML file for task
$taskXmlPath = "$env:temp\DailyWakeUpTask.xml"

# Generate XML file
@"
<?xml version="1.0" encoding="UTF-16"?>
<Task xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
    <RegistrationInfo>
    <Description>Daily task to wake up the computer and execute the task</Description>
    </RegistrationInfo>
    <Triggers>
    <CalendarTrigger>
        <StartBoundary>$((Get-Date -Format "yyyy-MM-ddT") + $taskTime)</StartBoundary>
        <Enabled>true</Enabled>
        <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
        </ScheduleByDay>
    </CalendarTrigger>
    </Triggers>
    <Settings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <StartWhenAvailable>true</StartWhenAvailable>
    <WakeToRun>true</WakeToRun>
    <AllowHardTerminate>false</AllowHardTerminate>
    <RestartOnFailure>
        <Interval>PT1M</Interval>
        <Count>3</Count>
    </RestartOnFailure>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    </Settings>
    <Actions Context="Author">
    <Exec>
        <Command>cmd.exe</Command>
        <Arguments>/c echo Wake-up task executed</Arguments>
    </Exec>
    <Exec>
        <Command>cmd.exe</Command>
        <Arguments>/c echo Wake-up task executed</Arguments>
    </Exec>
    </Actions>
</Task>
"@ | Out-File -Encoding UTF8 -FilePath $taskXmlPath

# Register task with XML
Register-ScheduledTask -Xml (Get-Content $taskXmlPath -Raw) -TaskName "DailyWakeUpTask"

# Remove the temporary XML file
Remove-Item $taskXmlPath -Force
"#,
        wake_time = wake_time_formatted
    );

    // Execute PowerShell script
    let output = Command::new("powershell")
        .arg("-Command")
        .arg(ps_script)
        .output()
        .map_err(|e| format!("Failed to execute PowerShell script: {}", e))?;
    };
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
fn save_canvas_data(canvas_id: String, data: String, available: bool, app_handle: tauri::AppHandle) -> Result<(), String> {
    // Получаем путь к папке приложения для хранения данных
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Не удалось разрешить папку данных приложения.")?;

    // Создаем путь для сохранения данных шаблона в папке 'database/template'
    let template_dir;
    let other_template_dir;

    if available {
        template_dir = base_path.join("database/template/available");
        other_template_dir = base_path.join("database/template/not_available");
    } else {
        template_dir = base_path.join("database/template/not_available");
        other_template_dir = base_path.join("database/template/available");
    }

    // Убедимся, что директория существует, и создадим её при необходимости
    if !template_dir.exists() {
        fs::create_dir_all(&template_dir).map_err(|e| e.to_string())?;
    }

    // Проверка наличия файла с таким же именем в другой папке и удаление его
    let other_file_path = other_template_dir.join(format!("canvas_{}.json", canvas_id));
    if other_file_path.exists() {
        fs::remove_file(&other_file_path).map_err(|e| format!("Ошибка при удалении файла: {}", e))?;
    }

    // Создаем полный путь для файла JSON с использованием canvas_id
    let file_path = template_dir.join(format!("canvas_{}.json", canvas_id));

    // Сохраняем данные холста в файл
    fs::write(&file_path, data).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn save_canvas_image(canvas_id: String, base64_image: String, available: bool, app_handle: tauri::AppHandle) -> Result<(), String> {
    // Получаем путь к папке приложения для хранения данных
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Не удалось разрешить папку данных приложения.")?;

    // Создаем путь для сохранения изображений холста в папке 'database/images'
    let image_dir;
    let other_image_dir;

    if available {
        image_dir = base_path.join("database/template/available");
        other_image_dir = base_path.join("database/template/not_available");
    } else {
        image_dir = base_path.join("database/template/not_available");
        other_image_dir = base_path.join("database/template/available");
    }

    // Убедимся, что директория существует, и создадим её при необходимости
    if !image_dir.exists() {
        fs::create_dir_all(&image_dir).map_err(|e| e.to_string())?;
    }

    // Проверка наличия файла с таким же именем в другой папке и удаление его
    let other_image_path = other_image_dir.join(format!("canvas_{}.png", canvas_id));
    if other_image_path.exists() {
        fs::remove_file(&other_image_path).map_err(|e| format!("Ошибка при удалении файла: {}", e))?;
    }

    // Создаем полный путь для файла изображения с использованием canvas_id
    let image_path = image_dir.join(format!("canvas_{}.png", canvas_id));

    // Декодируем base64 строку изображения в байты
    let image_data = BASE64_STANDARD.decode(&base64_image).map_err(|e| format!("Ошибка декодирования изображения: {}", e))?;

    // Сохраняем изображение в файл
    fs::write(&image_path, image_data).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn delete_canvas_image_and_data(canvas_id: String, available: bool, app_handle: tauri::AppHandle) -> Result<(), String> {
    // Получаем путь к папке приложения для хранения данных
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Не удалось разрешить папку данных приложения.")?;

    // Создаем путь для сохранения данных шаблона в папке 'database/template'
    let template_dir;
    let image_dir;

    if available {
        template_dir = base_path.join("database/template/available");
        image_dir = base_path.join("database/template/available");
    } else {
        template_dir = base_path.join("database/template/not_available");
        image_dir = base_path.join("database/template/not_available");
    }

    // Создаем полный путь для файла JSON с использованием canvas_id
    let file_path = template_dir.join(format!("canvas_{}.json", canvas_id));
    let image_path = image_dir.join(format!("canvas_{}.png", canvas_id));

    // Удаляем файлы
    if file_path.exists() {
        fs::remove_file(&file_path).map_err(|e| e.to_string())?;
    }

    if image_path.exists() {
        fs::remove_file(&image_path).map_err(|e| format!("Ошибка при удалении файла: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
fn load_all_canvas_data(app_handle: tauri::AppHandle) -> Result<Vec<Value>, String> {
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to resolve app data directory")?;

    let template_dir_not_available = base_path.join("database/template/not_available");
    let template_dir_available = base_path.join("database/template/available");

    // Получаем все JSON файлы в директории
    let mut canvas_data = Vec::new();

    if template_dir_not_available.exists() {
        if let Ok(entries) = fs::read_dir(&template_dir_not_available) {
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

    if template_dir_available.exists() {
        if let Ok(entries) = fs::read_dir(&template_dir_available) {
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
fn load_all_canvas_images(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to resolve app data directory")?;

    let image_dir_available = base_path.join("database/template/available");

    // Вектор для хранения изображений в формате Base64
    let mut canvas_images = Vec::new();

    // Обрабатываем папку "available"
    if image_dir_available.exists() {
        if let Ok(entries) = fs::read_dir(&image_dir_available) {
            for entry in entries.filter_map(Result::ok) {
                if let Some(extension) = entry.path().extension() {
                    if extension == "png" || extension == "jpg" || extension == "jpeg" {
                        // Читаем изображение как бинарные данные
                        let image_data = fs::read(entry.path())
                            .map_err(|e| e.to_string())?;
                        // Кодируем в base64
                        let base64_image = BASE64_STANDARD.encode(&image_data);
                        canvas_images.push(base64_image);
                    }
                }
            }
        }
    }

    Ok(canvas_images)
}

#[tauri::command]
fn load_available_canvas_data(app_handle: tauri::AppHandle) -> Result<Vec<Value>, String> {
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to resolve app data directory")?;

    let template_dir_available = base_path.join("database/template/available");

    // Получаем все JSON файлы в директории
    let mut canvas_data = Vec::new();

    if template_dir_available.exists() {
        if let Ok(entries) = fs::read_dir(&template_dir_available) {
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

//-------------------------------------------------Printer Information-------------------------------------------------------------------------------------
#[derive(Serialize, Deserialize, Debug)]
struct PrinterInfo {
    id: u32,
    name: String,
    state: String,
    system_name: String,
    driver_name: String,
    is_used: bool,
}

#[derive(Default, Debug)]
struct PrinterState {
    selected_printer: Mutex<Option<PrinterInfo>>,
}

use printers;
use printers::printer::Printer;

#[tauri::command]
fn get_printers() -> Result<Vec<PrinterInfo>, String> {
    let printers: Vec<Printer> = printers::get_printers();
    let mut id_counter = 1;
    let printer_infos: Vec<PrinterInfo> = printers.into_iter().map(|printer| {
        let info = PrinterInfo {
            id: id_counter,
            name: printer.name.clone(),
            state: format!("{:?}", printer.state),
            system_name: printer.system_name.clone(),
            driver_name: printer.driver_name.clone(),
            is_used: false,
        };
        id_counter += 1;
        info
    }).collect();
    Ok(printer_infos)
}

#[tauri::command]
fn save_printers(printer: PrinterInfo, app_handle: tauri::AppHandle, state: State<PrinterState>) -> Result<(), String> {
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Не удалось разрешить папку данных приложения.")?;
    let dir = base_path.join("database/printers");
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    }
    let file_path = dir.join("printers.json");
    let data = serde_json::to_string(&printer).map_err(|e| e.to_string())?;
    fs::write(&file_path, data).map_err(|e| e.to_string())?;
    let mut state = state.selected_printer.lock().unwrap();
    *state = Some(printer);
    println!("Сохранено: {:?}", *state);
    Ok(())
}

#[tauri::command]
fn update_selected_printer(app_handle: tauri::AppHandle, state: State<PrinterState>) -> Result<(), String> {
    let base_path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Не удалось разрешить папку данных приложения.")?;
    let dir = base_path.join("database/printers");
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    }
    let file_path = dir.join("printers.json");
    let file_content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
    let selected_printer: PrinterInfo = serde_json::from_str(&file_content).map_err(|e| e.to_string())?;
    let mut state = state.selected_printer.lock().unwrap();
    *state = Some(selected_printer);
    Ok(())
}