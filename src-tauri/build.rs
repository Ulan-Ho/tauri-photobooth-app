// fn main() {
//     cc::Build::new()
//         .file("src/bridge.cpp")
//         .include("EDSDK/Header") // Путь к заголовочным файлам SDK
//         .compile("bridge");

//     // Указание пути к библиотекам
//     println!("cargo:rustc-link-search=native=EDSDK/Library"); // Укажите путь к библиотеке
//     println!("cargo:rustc-link-lib=dylib=EDSDK"); // Укажите имя библиотеки

//     // Указываем Cargo, чтобы он перезапускал сборку при изменении этих файлов
//     println!("cargo:rerun-if-changed=src/bridge.cpp");
//     println!("cargo:rerun-if-changed=EDSDK/Header/EDSDK.h");
//     tauri_build::build();
// }
// use std::env;
// use std::fs;
// use std::path::PathBuf;

// fn main() {
//     cc::Build::new()
//         .file("src/bridge.cpp")
//         .include("EDSDK/Header") // Путь к заголовочным файлам SDK
//         .compile("bridge");

//     // Указание пути к библиотекам
//     println!("cargo:rustc-link-search=native=EDSDK/Library"); // Укажите путь к библиотеке
//     println!("cargo:rustc-link-lib=dylib=EDSDK"); // Укажите имя библиотеки

//     // Указываем Cargo, чтобы он перезапускал сборку при изменении этих файлов
//     println!("cargo:rerun-if-changed=src/bridge.cpp");
//     println!("cargo:rerun-if-changed=EDSDK/Header/EDSDK.h");
//     tauri_build::build();
// }
// use std::env;
// use std::fs;
// use std::path::PathBuf;

fn main() {
    // // Получаем путь к выходной директории
    // let out_dir = env::var("OUT_DIR").expect("OUT_DIR env var is not set");

    // // Создаем путь к файлу
    // let dest_path = PathBuf::from(out_dir).join("output.txt");

    // // Записываем что-то в файл (например, просто строку)
    // fs::write(&dest_path, "This is a build script output").expect("Unable to write file");

    // // Указываем Cargo, чтобы он перезапускал сборку при изменении этих файлов
    // println!("cargo:rerun-if-changed=build.rs");
    // println!("cargo:rerun-if-changed=src/bridge.cpp");
    // println!("cargo:rerun-if-changed=EDSDK/Header/EDSDK.h");

    // // Компиляция C++ файла
    // cc::Build::new()
    //     .file("src/bridge.cpp")
    //     .include("EDSDK/Header")
    //     .compile("bridge");

    // // Указание пути к библиотекам
    // println!("cargo:rustc-link-search=native=EDSDK/Library");
    // println!("cargo:rustc-link-lib=dylib=EDSDK");

    // Генерация контекста Tauri
    tauri_build::build();
}
