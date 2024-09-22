fn main() {
    // cc::Build::new()
    //     .cpp(true)
    //     .file("src/bridge.cpp")
    //     .include("EDSDK/Header") // Путь к заголовочным файлам SDK
    //     // .flag_if_supported("-lEDSDK")
    //     .compile("bridge");

    // Указание пути к библиотекам
    println!("cargo:rustc-link-search=native=EDSDK/Library");
    println!("cargo:rustc-link-lib=dylib=EDSDK");
    // println!("cargo:rerun-if-changed=src/bridge.cpp");
    // println!("cargo:rerun-if-changed=EDSDK/Header/EDSDK.h");
    tauri_build::build();
}