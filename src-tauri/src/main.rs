// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


mod models;
mod errors;
mod db;
mod repositories;
mod commands;
mod services;
mod state;


fn main() {
    doctor_management_system_lib::run()
}
