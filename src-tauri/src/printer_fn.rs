use std::process::Command;
use serde_json::Value;
use tauri::State;
use printers;
use printers::common::base::printer::Printer;


use crate::globals::{PrinterInfo, PrinterState};
use crate::fs_utils::{reading_from_json_file, writing_to_json_file};


#[tauri::command]
pub fn saving_printer_data(printer: PrinterInfo, state: State<PrinterState>) -> Result<(), String> {
    if let Err(_e) = writing_to_json_file("printer/printer.json", &printer) {
        // eprintln!("Ошибка чтения данных принтера в json файле: {}", e);
    }
    let mut state = state.selected_printer.lock().unwrap();
    *state = Some(printer);
    Ok(())
}


#[tauri::command]
pub fn get_printers_info() -> Result<Vec<PrinterInfo>, String> {
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
pub fn update_selected_printer(state: State<PrinterState>) -> Result<PrinterInfo, String> {
    let selected_printer: PrinterInfo = reading_from_json_file("printer/printer.json").map_err(|e| e.to_string())?;
    let mut state = state.selected_printer.lock().unwrap();
    *state = Some(selected_printer.clone());
    Ok(selected_printer)
}


#[tauri::command]
pub fn printer_status() -> Result<(), String> {
    let output = Command::new("cmd")
        .args(&["/C", "start ms-settings:printers"]).output()
        .map_err(|e| format!("Ошибка запуска команды : {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Ошибка выполнения команды: {:?}", stderr))
    }
}


#[tauri::command]
pub fn printer_settings(state: State<PrinterState>) -> Result<(), String> {
    let printer_name = {
        let state = state.selected_printer.lock().unwrap();
        state
            .as_ref()
            .map(|printer| printer.name.clone())
            .ok_or_else(|| "Принтер не выбран".to_string())?
    };

    let _command = Command::new("rundll32")
        .arg("printui.dll,PrintUIEntry")
        .arg("/e")
        .arg("/n")
        .arg(printer_name)
        .spawn();

    Ok(())
}


#[tauri::command]
pub fn printer_information(state: State<PrinterState>) -> Result<Value, String> {
    let state = state.selected_printer.lock().unwrap();
    let printer_name = state.as_ref().map(|printer| printer.name.clone()).unwrap_or_default();

    let command = format!(r#"Get-WmiObject Win32_Printer -Filter "Name = '{}'" | Select-Object * | ConvertTo-Json"#, printer_name);
    
    let output = Command::new("powershell")
        .args(&["-Command", &command])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        // Преобразуем stdout в строку
        let printer_json = String::from_utf8_lossy(&output.stdout);
        // Парсим строку JSON в объект serde_json::Value
        let json: Value = serde_json::from_str(&printer_json).map_err(|e| e.to_string())?;
        Ok(json)
    } else {
        // Если команда завершилась с ошибкой, возвращаем stderr как ошибку
        let error = String::from_utf8_lossy(&output.stderr);
        Err(error.into())
    }
}