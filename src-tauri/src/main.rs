use base64::prelude::*;
use std::fs::File;
use std::io::Write;
use std::process::Command;
use tempfile::NamedTempFile;


#[tauri::command]
fn print_image(image_data: String) -> Result<(), String> {
    let base64_str = image_data.split(',').nth(1).ok_or("Invalid base64 string")?;
    let decoded_data = BASE64_STANDARD.decode(base64_str).map_err(|e| e.to_string())?;

    let file_path = "temp_image.png";
    let mut file = File::create(file_path).map_err(|e| e.to_string())?;
    file.write_all(&decoded_data).map_err(|e| e.to_string())?;
    drop(file);
    let command = format!(
        "function Print-Image {} param([string]$PrinterName, [string]$FilePath, [int]$Scale, [string]$PaperSize, [string]$PrintJobName, [string]$PrintQuality); Add-Type -AssemblyName System.Drawing; $printDocument = New-Object System.Drawing.Printing.PrintDocument; $printDocument.PrinterSettings.PrinterName = $PrinterName; $printDocument.DefaultPageSettings.Landscape = $false; $printDocument.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize(\"Custom\", 600, 400); $printDocument.add_PrintPage({} param($sender, $e); $image = [System.Drawing.Image]::FromFile($FilePath); $e.Graphics.TranslateTransform(0, 0); $e.Graphics.RotateTransform(0); $scaledWidth = $image.Width * ($Scale / 300); $scaledHeight = $image.Height * ($Scale / 300); $e.Graphics.DrawImage($image, 0, 0, $scaledWidth, $scaledHeight); $image.Dispose() {}); $printDocument.PrinterSettings.DefaultPageSettings.PrinterResolution.Kind = [System.Drawing.Printing.PrinterResolutionKind]::High; $printDocument.PrintController = New-Object System.Drawing.Printing.StandardPrintController; $printDocument.Print() {}; $printParams = @{} Scale = 100; PaperSize = \"6x4-Split (6x2 2 prints)\"; PrinterName = \"HiTi P525\"; FilePath = \"{}\"; PrintJobName = \"ImagePrintJob\"; PrintQuality = \"High\" {}; Print-Image @printParams",
        '{',
        '{',
        '}',
        '}',
        '{',
        file_path,
        '}'
        );

    let output = Command::new("powershell")
        .args(&["-Command", &command])
        .output()
        .map_err(|e| e.to_string())?;

        return Err(command);

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![print_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


// function Print-Image {
//     param (
//         [string]$PrinterName,
//         [string]$FilePath,
//         [int]$Scale,
//         [string]$PaperSize,
//         [string]$PrintJobName,
//         [string]$PrintQuality
//     )

//     # Create a new print document
//     Add-Type -AssemblyName System.Drawing
//     $printDocument = New-Object System.Drawing.Printing.PrintDocument
//     $printDocument.PrinterSettings.PrinterName = $PrinterName
//     $printDocument.DefaultPageSettings.Landscape = $false
//     $printDocument.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize("Custom", 600, 400)
    
//     # Define the print event
//     $printDocument.add_PrintPage({
//         param($sender, $e)
//         $image = [System.Drawing.Image]::FromFile($FilePath)
        
//         $e.Graphics.TranslateTransform(0, 0)
//         $e.Graphics.RotateTransform(0)
        
//         $scaledWidth = $image.Width * ($Scale / 300)
//         $scaledHeight = $image.Height * ($Scale / 300)
//         $e.Graphics.DrawImage($image, 0, 0, $scaledWidth, $scaledHeight)
//         $image.Dispose()
//     })

//     # Set the print quality
//     $printDocument.PrinterSettings.DefaultPageSettings.PrinterResolution.Kind = [System.Drawing.Printing.PrinterResolutionKind]::High
//     $printDocument.PrintController = New-Object System.Drawing.Printing.StandardPrintController

//     # Start the print job
//     $printDocument.Print()
// }

// # Define the parameters
// $printParams = @{
//     Scale           = 100
//     PaperSize       = "6x4-Split (6x2 2 prints)"
//     PrinterName     = "HiTi P525"
//     FilePath        = "C:\Users\ACER\Desktop\Lesson\Курс\Project_turi_2\tauri-photobooth-app\src-tauri\temp_image.png"
//     PrintJobName    = "ImagePrintJob"
//     PrintQuality    = "High"
// }

// # Execute the function with defined parameters
// Print-Image @printParams

// function Print-Image { param([string]$PrinterName, [string]$FilePath, [int]$Scale, [string]$PaperSize, [string]$PrintJobName, [string]$PrintQuality); Add-Type -AssemblyName System.Drawing; $printDocument = New-Object System.Drawing.Printing.PrintDocument; $printDocument.PrinterSettings.PrinterName = $PrinterName; $printDocument.DefaultPageSettings.Landscape = $false; $printDocument.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize("Custom", 600, 400); $printDocument.add_PrintPage({ param($sender, $e); $image = [System.Drawing.Image]::FromFile($FilePath); $e.Graphics.TranslateTransform(0, 0); $e.Graphics.RotateTransform(0); $scaledWidth = $image.Width * ($Scale / 300); $scaledHeight = $image.Height * ($Scale / 300); $e.Graphics.DrawImage($image, 0, 0, $scaledWidth, $scaledHeight); $image.Dispose() }); $printDocument.PrinterSettings.DefaultPageSettings.PrinterResolution.Kind = [System.Drawing.Printing.PrinterResolutionKind]::High; $printDocument.PrintController = New-Object System.Drawing.Printing.StandardPrintController; $printDocument.Print() }; $printParams = @{ Scale = 100; PaperSize = "6x4-Split (6x2 2 prints)"; PrinterName = "HiTi P525"; FilePath = "C:\Users\ACER\Desktop\Lesson\Курс\Project_turi_2\tauri-photobooth-app\src-tauri\temp_image.png"; PrintJobName = "ImagePrintJob"; PrintQuality = "High" }; Print-Image @printParams
