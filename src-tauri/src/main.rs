// use base64::prelude::*;
// use std::fs::File;
// use std::io::Write;
// use std::process::Command;
// use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
// use tauri_plugin_global_shortcut::GlobalShortcutManager;
// use std::sync::{Arc, Mutex};

// // extern "C" {
// //     fn mainC();
// // }

// // #[tauri::command]
// // fn take_photo() -> Result<(), String> {
// //     unsafe {
// //         mainC();
// //     }
// //     Ok(())
// // }

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

// fn main() {
//     let quit = CustomMenuItem::new("quit".to_string(), "Quit");
//     let hide_menu = CustomMenuItem::new("hide_menu".to_string(), "Hide Menu");
//     let show_menu = CustomMenuItem::new("show_menu".to_string(), "Show Menu");
//     let submenu = Submenu::new("File", Menu::new().add_item(quit));
//     let menu = Menu::new()
//         .add_native_item(MenuItem::Copy)
//         .add_item(hide_menu.clone())
//         .add_item(show_menu.clone())
//         .add_submenu(submenu);

//     let menu_visible = Arc::new(Mutex::new(true));

//     tauri::Builder::default()
//         .menu(menu)
//         .on_menu_event({
//             let menu_visible = menu_visible.clone();
//             move |event| {
//                 let window = event.window();
//                 match event.menu_item_id() {
//                     "quit" => {
//                         std::process::exit(0);
//                     }
//                     "hide_menu" => {
//                         let mut visible =menu_visible.lock().unwrap();
//                         *visible = false;
//                         window.set_menu(None).unwrap();
//                     }
//                     "show_menu" => {
//                         let mut visible = menu_visible.lock().unwrap();
//                         *visible = true;
//                         window.set_menu(Some(Menu::new()
//                             .add_native_item(MenuItem::Copy)
//                             .add_item(CustomMenuItem::new("hide_menu", "Hide Menu"))
//                             .add_item(CustomMenuItem::new("show_menu", "Show Menu"))
//                             .add_submenu(Submenu::new("File", Menu::new().add_item(CustomMenuItem::new("quit", "Quit"))))
//                         )).unwrap();
//                     }
//                     _ => {}
//                 }
//             }
//         })
//         .setup(|app| {
//             let handle = app.handle();
//             let window = handle.get_window("main").unwrap();

//             // Регистрация глобальных горячих клавиш
//             let mut shortcut_manager = handle.global_shortcut_manager();
//             let menu_visible = menu_visible.clone();
//             shortcut_manager.register("CmdOrCtrl+Shift+H", move || {
//                 let mut visible = menu_visible.lock().unwrap();
//                 if *visible {
//                     window.set_menu(None).unwrap();
//                     *visible = false;
//                 } else {
//                     window.set_menu(Some(Menu::new()
//                         .add_native_item(MenuItem::Copy)
//                         .add_item(CustomMenuItem::new("hide_menu", "Hide Menu"))
//                         .add_item(CustomMenuItem::new("show_menu", "Show Menu"))
//                         .add_submenu(Submenu::new("File", Menu::new().add_item(CustomMenuItem::new("quit", "Quit"))))
//                     )).unwrap();
//                     *visible = true;
//                 }
//             }).unwrap();

//             Ok(())
//         })
//         .plugin(tauri_plugin_global_shortcut::init())
//         .invoke_handler(tauri::generate_handler![print_image])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }

use device_query::{DeviceQuery, DeviceState, Keycode};
use std::sync::{Arc, Mutex};
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, Manager};

fn main() {
    // Создаем элементы меню
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide_menu = CustomMenuItem::new("hide_menu".to_string(), "Hide Menu");
    let show_menu = CustomMenuItem::new("show_menu".to_string(), "Show Menu");
    let submenu = Submenu::new("File", Menu::new().add_item(quit));
    let menu = Menu::new()
        .add_native_item(MenuItem::Copy)
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
                    "quit" => {
                        std::process::exit(0);
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
            std::thread::spawn(move || {
                loop {
                    let keys: Vec<Keycode> = device_state.get_keys();

                    let control_pressed = keys.contains(&Keycode::LControl);
                    let shift_pressed = keys.contains(&Keycode::LShift);
                    let s_pressed = keys.contains(&Keycode::H);


                    if s_pressed && control_pressed && shift_pressed {
                        println!("Control + Shift + H pressed");
                        let mut visible = menu_visible.lock().unwrap();
                        if *visible {
                            window.menu_handle().hide().unwrap();
                            *visible = false;
                            println!("Menu hidden via shortcut");
                        } else {
                            window.menu_handle().show().unwrap();
                            *visible = true;
                            println!("Menu shown via shortcut");
                        }
                    }

                    std::thread::sleep(std::time::Duration::from_millis(100)); // Периодическое обновление состояния клавиш
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    }
