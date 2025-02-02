fn main() {
    // cc::Build::new()
    //     .file("src/bridge.cpp")
    //     .include("EDSDK/Header") // Путь к заголовочным файлам SDK
    //     .compile("bridge");

    // Указание пути к библиотекам
    println!("cargo:rustc-link-search=native=EDSDK/Library"); // Укажите путь к библиотеке
    println!("cargo:rustc-link-lib=dylib=EDSDK"); // Укажите имя библиотеки

    // Указываем Cargo, чтобы он перезапускал сборку при изменении этих файлов
    // println!("cargo:rerun-if-changed=src/bridge.cpp");
    println!("cargo:rerun-if-changed=EDSDK/Header/EDSDK.h");
    println!("cargo:rerun-if-changed=EDSDK/Header/EDSDKErrors.h");
    println!("cargo:rerun-if-changed=EDSDK/Header/EDSDKTypes.h");
    tauri_build::build();
}