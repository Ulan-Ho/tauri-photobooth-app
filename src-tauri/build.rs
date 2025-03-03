fn main() {
    // Указание пути к библиотеке
    println!("cargo:rustc-link-search=native=EDSDK/Library"); // Путь к файлу EDSDK.lib
    println!("cargo:rustc-link-lib=static=EDSDK"); // Линкуем СТАТИЧЕСКИ
    
    // Следим за изменениями в заголовках
    println!("cargo:rerun-if-changed=EDSDK/Header/EDSDK.h");
    println!("cargo:rerun-if-changed=EDSDK/Header/EDSDKErrors.h");
    println!("cargo:rerun-if-changed=EDSDK/Header/EDSDKTypes.h");
    
    tauri_build::build();
}
