// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn execute_shell_script(file_path: String) -> Result<String, String> {
    let bash_path = "C:\\Program Files\\Git\\bin\\bash.exe";
    let current_dir = std::env::current_dir().unwrap();
    // 将 PathBuf 转换为字符串进行处理
    let mut path_str = current_dir.to_str().unwrap().to_owned();
    // 替换指定的子路径
    path_str = path_str.replace("\\src-tauri", "");
    // 重新创建 PathBuf 并添加新的子路径
    let mut new_path = std::path::PathBuf::from(path_str);
    new_path = new_path.join("public\\shell\\rebase_master.sh");
    let output = std::process::Command::new(bash_path)
        .arg(new_path)
        .arg(file_path)
        .output()
        .expect("failed to execute process");

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![execute_shell_script])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
