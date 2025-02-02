use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};

lazy_static::lazy_static! {
    pub static ref PROJECT_PATH: Arc<Mutex<Option<PathBuf>>> = Arc::new(Mutex::new(None));
}



//-------------------------------------------------WorkHours-------------------------------------------------------------------------------------
#[derive(Serialize, Deserialize, Debug)]
pub struct WorkHours {
    pub start: String,
    pub end: String,
    pub is_always_active: bool,
}



//-------------------------------------------------Printer-------------------------------------------------------------------------------------
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PrinterInfo {
    pub id: u32,
    pub name: String,
    pub state: String,
    pub system_name: String,
    pub driver_name: String,
    pub is_used: bool,
}

#[derive(Default, Debug)]
pub struct PrinterState {
    pub selected_printer: Mutex<Option<PrinterInfo>>,
}

//-------------------------------------------------Project-------------------------------------------------------------------------------------
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectInfo{
    pub id: u32,
    pub name: String,
    pub is_used: bool,
}

impl ProjectInfo {
    pub fn from_path(path: &std::path::Path) -> Option<Self> {
        let name = path.file_name()?.to_string_lossy().to_string();
        Some(ProjectInfo {
            id: crc32fast::hash(name.as_bytes()),
            name,
            is_used: false,
        })
    }
}


//-------------------------------------------------Chromokey-------------------------------------------------------------------------------------
#[derive(Serialize, Deserialize, Debug)]
pub struct ChromokeyInfo {
    pub color: String,
    pub is_enabled: bool,
    pub counter_capture_photo: u32
}


//-------------------------------------------------License-------------------------------------------------------------------------------------
pub struct LicenseState {
    pub license: Mutex<Option<String>>,
}

// pub static PUBLIC_KEY_CODE: &str = r#"
// -----BEGIN PUBLIC KEY-----
// MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAhW6KS/V3B+qfnEQgMOlI
// W1r1ze0x0vGhbtK3pETy+AhJBMPqJQ1igbDdacwCZfPimF68eWrwPHTAXkC26pD7
// 4im3i9hM0KKuW0AoZed5B8w9jAGsZA1gliuXFl0V4IHs4g+lGOgFr74SaNJg9hyv
// 6CME4e/SHjW9KtkBtQ46wiNoWf9Fr64b3TKO/hMUjPj+cowW8wu29SR2YJX4vRho
// RCCM7UfNarwZLWX5+6qoxE2hPW6zTje3esaHadAhA8Z+cEcl/tbrGIIptfxofXzP
// iT/KLVvfsW/yzbMIUc07kV85tsECD97vYtm67taZfGwqQ/a9fgnOOjVg7GI5vfX6
// Ip3rvEF2Qh0vDeratcBQg1dJv3wP0pgbt9KvYO0RtvstEzAA72pMEV3Jp9h4qAJ7
// 5MXvlB8ZnK9dxni0pb8SiBcc8pXhPXTFhh9fbhla79LYMWG1eVonW01U7vhaT0re
// 0Y0Bk2OfwpVPKgWh3KSIv4sPpNZ9Fhrj34mngV7zdJxSFHM5CDIPyq0g06ebHhzx
// oi7TIXG3JrhVVbtRsZmco9r+SthdAtl98eHZDpwisANnezKc3q1oxru0PwwNiDSc
// V2hOlsFtD8QfWypH97TVGgf8T+V32q+0HskpBXIsTfz32xRaQl7mrmT7rSGiXXfb
// BgjRHZcjhB5j1Mxf1GmPzEECAwEAAQ==
// -----END PUBLIC KEY-----"#;


pub static PRIVATE_KEY_CODE: &str = r#"
-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----"#;