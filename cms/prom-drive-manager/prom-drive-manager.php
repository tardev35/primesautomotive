<?php
/**
 * Plugin Name: PROM DRIVE Manager
 * Description: All-in-one car catalogue, multilingual content, social settings and headless search. No ACF dependency.
 * Version: 2.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 */
if (!defined('ABSPATH')) { exit; }
define('PDM_DIR', __DIR__ . '/');

add_action('plugins_loaded', function () {
    $active = array_merge((array) get_option('active_plugins', array()), array_keys((array) get_site_option('active_sitewide_plugins', array())));
    foreach ($active as $plugin) {
        if (in_array(basename($plugin), array('prom-drive-content.php','aurelia-cars.php'), true)) {
            add_action('admin_notices', function () { echo '<div class="notice notice-error"><p>PROM DRIVE Manager: กรุณา Deactivate ปลั๊กอิน PROM DRIVE Content และ PROM DRIVE Cars รุ่นเดิมก่อนใช้งานตัวรวม ไม่ต้องลบข้อมูลเดิม</p></div>'; });
            return;
        }
    }
    require_once PDM_DIR . 'includes/data.php';
    require_once PDM_DIR . 'includes/admin.php';
    require_once PDM_DIR . 'includes/rest.php';
    add_action('init', 'pdm_register_types');
});

function pdm_register_types() {
    foreach (array('cars'=>array('รถยนต์','cars','dashicons-car'), 'prom_drive_setting'=>array('ข้อมูลเว็บไซต์','prom-drive-settings','dashicons-admin-settings'), 'prom_drive_page'=>array('เนื้อหา 3 ภาษา','prom-drive-pages','dashicons-welcome-write-blog')) as $type=>$info) {
        register_post_type($type,array(
            'labels'=>array('name'=>'PROM DRIVE · '.$info[0],'singular_name'=>$info[0],'add_new_item'=>'เพิ่ม'.$info[0],'edit_item'=>'แก้ไข'.$info[0]),
            'public'=>false,'publicly_queryable'=>false,'exclude_from_search'=>true,'show_ui'=>true,'show_in_rest'=>true,
            'rest_base'=>$info[1],'show_in_menu'=>true,'menu_icon'=>$info[2],'rewrite'=>false,'has_archive'=>false,
            'supports'=>array('title'),'capability_type'=>'page','map_meta_cap'=>true,
        ));
    }
}
