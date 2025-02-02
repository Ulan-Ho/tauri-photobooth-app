use std::path::PathBuf;
use rsa::{pkcs1::DecodeRsaPrivateKey, Pkcs1v15Encrypt, RsaPrivateKey};
use base64::prelude::*;
use tauri::State;
use tauri::api::dialog::FileDialogBuilder;
use std::fs;
use tauri::api::path::local_data_dir;

use crate::globals::{LicenseState, PRIVATE_KEY_CODE};

pub fn decrypte_license(license: &String) -> String {
    let private_key = RsaPrivateKey::from_pkcs1_pem(&PRIVATE_KEY_CODE).expect("Не удалось преобразовать приватный ключ");

    let formatted_license = license.replace("\n", "").replace("\r", "").replace("-----BEGIN LICENSE-----", "").replace("-----END LICENSE-----", "");
    let encrypted = BASE64_STANDARD.decode(formatted_license).expect("Не удалось декодировать лицензию");
    let decrypted_data = private_key.decrypt(Pkcs1v15Encrypt, &encrypted)
        .expect("Ошибка расшифрования");
    let decrypted_str = String::from_utf8(decrypted_data).expect("Не удалось преобразовать лицензию в строку");

    decrypted_str
}


#[tauri::command]
pub fn check_license(state: State<LicenseState>) -> Result<bool, String> {
    let machine_id = mid::get("mykey").map_err(|e| format!("Ошибка получения machine ID: {}", e))?;

    let mut local_path =  local_data_dir().unwrap();
    local_path.push("license.pem");
    let file_content = fs::read(&local_path).map_err(|_| "Не удалось прочитать файл".to_string())?;
    let license = decrypte_license(&file_content.iter().map(|&c| c as char).collect());
    if license.contains(&machine_id) {

        let mut license_state = state.license.lock().unwrap();
        *license_state = Some(license.clone());

        return Ok(true)
    } else {
        return Err("Лицензия не соответствует данному устройству".to_string())
    }
}


#[tauri::command]
pub fn verify_license(state: State<LicenseState>) -> Result<String, String> {
    let (tx, rx) = std::sync::mpsc::channel();

    FileDialogBuilder::new()
        .set_title("Выберите файл")
        .pick_file(move |path: Option<PathBuf>| {
            if let Some(original_path) = path {
                tx.send(original_path).unwrap();
            }
        });
    
    let original_path = rx.recv().unwrap();
    let file_content = fs::read(&original_path).expect("Не удалось прочитать файл");
    // let license_string = String::from_utf8(file_content).expect("Не удалось преобразовать файл в строку");
    let license = decrypte_license(&file_content.iter().map(|&c| c as char).collect());
    let machine_id = mid::get("mykey").unwrap();
    if license.contains(&machine_id) {
        save_license(&file_content);

        let mut license_state = state.license.lock().unwrap();
        *license_state = Some(license);

        return Ok("Лицензия верна".to_string())
    } else {
        return Err("Лицензия не соответствует данному устройству".to_string())
    }
}

fn save_license(license: &Vec<u8>) {
    let mut local_path =  local_data_dir().unwrap();
    local_path.push("license.pem");
    fs::write(local_path, license).expect("Не удалось записать файл");
}