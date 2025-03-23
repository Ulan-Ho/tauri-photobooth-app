use chrono::{Local, NaiveTime};
use std::time::Duration;
use std::thread;

use std::process::{Command, Stdio};
use std::os::windows::process::CommandExt;
use windows_sys::Win32::System::Threading::CREATE_NO_WINDOW;

use crate::globals::WorkHours;
use crate::fs_utils::{reading_from_json_file, writing_to_json_file};


#[tauri::command]
pub fn get_work_hours() -> Result<WorkHours, String> {
    let data: WorkHours = reading_from_json_file("time/time.json").map_err(|e| e.to_string())?;
    Ok(data)
}


#[tauri::command]
pub fn set_work_hours(start: String, end: String, is_always_active: bool) -> Result<(), String> {

    let sleep_time  = NaiveTime::parse_from_str(&end, "%H:%M").map_err(|e| e.to_string())?;
    let wake_time  = NaiveTime::parse_from_str(&start, "%H:%M").map_err(|e| e.to_string())?;

    let work_hours = WorkHours { start: start.clone(), end: end.clone(), is_always_active: is_always_active.clone() };
    if let Err(_e) = writing_to_json_file("time/time.json", &work_hours) {
        // eprintln!("Failed to write to JSON file: {}", e);
    }

    let now = Local::now().time();
    // Вычисляем задержки для сна и пробуждения
    let _sleep_duration = if sleep_time > now {
        (sleep_time - now).num_seconds()
    } else {
        (sleep_time + chrono::Duration::hours(24) - now).num_seconds()
    };

    let _wake_duration = if wake_time > now {
        (wake_time - now).num_seconds()
    } else {
        (wake_time + chrono::Duration::hours(24) - now).num_seconds()
    };
    // Логируем оставшееся время
    // if !is_always_active {
    //     println!(
    //         "Оставшееся время до сна: {} секунд ({} часов, {} минут)",
    //         sleep_duration,
    //         sleep_duration / 3600,
    //         (sleep_duration % 3600) / 60
    //     );
    //     println!(
    //         "Оставшееся время до пробуждения: {} секунд ({} часов, {} минут)",
    //         wake_duration,
    //         wake_duration / 3600,
    //         (wake_duration % 3600) / 60
    //     );
    // }
    
    // Настраиваем таймер на вход в спящий режим
    if !(sleep_time == wake_time) && !is_always_active {
        thread::spawn(move || {
            loop {
                let current_time = Local::now().time();
                // Если текущее время равно времени выключения, переводим компьютер в спящий режим
                if current_time >= sleep_time && current_time < sleep_time + chrono::Duration::minutes(1) {
                    Command::new("shutdown")
                        .args(&["/h", "/f"])
                        .creation_flags(CREATE_NO_WINDOW) // <-- Отключает всплывающее окно PowerShell
                        .stdout(Stdio::null()) // Отключает вывод в консоль
                        .stderr(Stdio::null()) // Отключает ошибки в консоль  // Перевод в спящий режим с принудительным закрытием приложений
                        .spawn()
                        .expect("Не удалось перевести компьютер в спящий режим");
                }
                // Проверяем каждые 30 секунд
                thread::sleep(Duration::from_secs(30));
            }
        });
    }
    let wake_time_formatted = wake_time.format("%H:%M:%S").to_string();

    let ps_script;
    let remote_script = r#"
if (Get-ScheduledTask -TaskName "DailyWakeUpTask" -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName "DailyWakeUpTask" -Confirm:$false
    Write-Output "Task removed successfully."
} else {
    Write-Output "Task does not exist."
}
"#;
    ps_script = format!(
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

    if is_always_active{
        let _output = Command::new("powershell")
        .args(&["-Command", &remote_script])
        .creation_flags(CREATE_NO_WINDOW) // <-- Отключает всплывающее окно PowerShell
        .stdout(Stdio::null()) // Отключает вывод в консоль
        .stderr(Stdio::null()) // Отключает ошибки в консоль
        .output()
        .map_err(|e| format!("Failed to execute PowerShell script: {}", e))?;
    }
    else{
        let _output = Command::new("powershell")
        .args(&["-Command", &ps_script])
        .creation_flags(CREATE_NO_WINDOW) // <-- Отключает всплывающее окно PowerShell
        .stdout(Stdio::null()) // Отключает вывод в консоль
        .stderr(Stdio::null()) // Отключает ошибки в консоль
        .output()
        .map_err(|e| format!("Failed to execute PowerShell script: {}", e))?;    
    }
    Ok(())
}