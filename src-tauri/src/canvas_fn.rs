fn print_image(image_data: String, state: State<PrinterState>) -> Result<(), String> {
    // let base64_str = image_data.split(',').nth(1).ok_or("Invalid base64 string")?;
    let decoded_data = BASE64_STANDARD.decode(image_data).map_err(|e| e.to_string())?;

    // let file_path = "temp_image.png";
    let file_path = PathBuf::from(env::current_dir().map_err(|err| err.to_string())?).join("temp_image.png");
    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(&decoded_data).map_err(|e| e.to_string())?;
    drop(file);
    let state_printer = state.selected_printer.lock().unwrap();
    let printer_name = state_printer.as_ref().map(|printer| printer.name.clone()).unwrap_or_default();

    // Экранирование пути к файлу для PowerShell
    let file_path_str = file_path.display().to_string();
    let escaped_file_path = format!("\"{}\"", file_path_str.replace("\\", "\\\\"));
    println!("Escaped file path: {}", escaped_file_path);

    thread::sleep(Duration::from_millis(100));

    let print_function = r#"
function Print-Image {
    param(
        [string]$PrinterName,
        [string]$FilePath,
        [int]$Scale,
        [string]$PaperSize,
        [string]$PrintJobName,
        [string]$PrintQuality
    )
    Add-Type -AssemblyName System.Drawing
    $printDocument = New-Object System.Drawing.Printing.PrintDocument
    $printDocument.PrinterSettings.PrinterName = $PrinterName
    $printDocument.DefaultPageSettings.Landscape = $false
    $printDocument.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize('Custom', 600, 400)
    $printDocument.add_PrintPage({
        param($sender, $e)
        $image = [System.Drawing.Image]::FromFile($FilePath)
        $e.Graphics.TranslateTransform(0, 0)
        $e.Graphics.RotateTransform(0)
        $scaledWidth = $image.Width * ($Scale / 300)
        $scaledHeight = $image.Height * ($Scale / 300)
        $e.Graphics.DrawImage($image, 0, 0, $scaledWidth, $scaledHeight)
        $image.Dispose()
    })
    $printDocument.PrinterSettings.DefaultPageSettings.PrinterResolution.Kind = [System.Drawing.Printing.PrinterResolutionKind]::High
    $printDocument.PrintController = New-Object System.Drawing.Printing.StandardPrintController
    $printDocument.Print()
}
    "#;

    let command = format!(
        r#"
{}
Print-Image -PrinterName "{}" -FilePath {} -Scale 100 -PaperSize "6x4-Split (6x2 2 prints)" -PrintJobName "ImagePrintJob" -PrintQuality "High"
        "#,
        print_function,
        printer_name,
        escaped_file_path
    );

    // Передача функции в PowerShell
    let output = Command::new("powershell")
        .args(&["-Command", &command])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(())
}