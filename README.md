# Tauri + React

This template should help get you started developing with Tauri and React in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
# tauri-photobooth-app
Это декстопное приложение которое будет работать в windows



import { getName, getTauriVersion, getVersion, hide, show } from '@tauri-apps/api/app';

//Вызывает имя приложения
const appName = await getName();


//Вызывает версию tauri
const tauriVersion = await getTauriVersion();


//Вызывает версию приложения
const appVersion = await getVersion();


//Скрывает приложение на macOS
await hide();


//Показывает приложение на macOS
await show();