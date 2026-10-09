<?php
/**
 * Plugin Name: PROM DRIVE Content
 * Description: Shared website settings and multilingual page content for the PROM DRIVE headless website. Requires ACF. Keeps the existing Cars plugin unchanged.
 * Version: 1.0.0
 * Requires PHP: 7.4
 */
if (!defined('ABSPATH')) { exit; }
require_once __DIR__ . '/prom-drive-fleet-api.php';

add_action('init', function () {
    $common = array(
        'public' => false, 'publicly_queryable' => false, 'exclude_from_search' => true,
        'show_ui' => true, 'show_in_menu' => true, 'show_in_rest' => true,
        'has_archive' => false, 'rewrite' => false,
        'supports' => array('title', 'revisions', 'custom-fields'),
        'capability_type' => 'page', 'map_meta_cap' => true,
    );
    register_post_type('prom_drive_setting', array_merge($common, array(
        'labels' => array('name' => 'PROM DRIVE · ข้อมูลเว็บไซต์', 'singular_name' => 'ข้อมูลส่วนกลาง', 'add_new_item' => 'ข้อมูลส่วนกลาง (ใช้ slug global)', 'edit_item' => 'แก้ไขข้อมูลเว็บไซต์'),
        'rest_base' => 'prom-drive-settings', 'menu_icon' => 'dashicons-admin-settings',
    )));
    register_post_type('prom_drive_page', array_merge($common, array(
        'labels' => array('name' => 'PROM DRIVE · เนื้อหาหน้าเว็บ', 'singular_name' => 'เนื้อหาหน้าเว็บ', 'add_new_item' => 'เพิ่มเนื้อหาหน้าเว็บ', 'edit_item' => 'แก้ไขเนื้อหาหน้าเว็บ'),
        'rest_base' => 'prom-drive-pages', 'menu_icon' => 'dashicons-welcome-write-blog',
    )));
});

function prom_drive_content_groups() {
    $file = __DIR__ . '/acf-content-fields.json';
    return is_readable($file) ? (json_decode(file_get_contents($file), true) ?: array()) : array();
}

add_action('acf/init', function () {
    foreach (prom_drive_content_groups() as $group) { acf_add_local_field_group($group); }
});

add_action('admin_notices', function () {
    if (current_user_can('manage_options') && !function_exists('acf_add_local_field_group')) {
        echo '<div class="notice notice-warning"><p>PROM DRIVE Content: เปิดใช้งาน Advanced Custom Fields (ACF) เพื่อแก้ไขและเปิด REST fields ของเว็บไซต์</p></div>';
    }
});

add_action('admin_menu', function () {
    add_submenu_page('edit.php?post_type=prom_drive_setting', 'PROM DRIVE Setup', 'นำเข้าร่างเริ่มต้น', 'manage_options', 'prom-drive-setup', 'prom_drive_setup_screen');
});

function prom_drive_setup_screen() {
    if (!current_user_can('manage_options')) { return; }
    echo '<div class="wrap"><h1>PROM DRIVE · นำเข้าร่างเริ่มต้น</h1><p>สร้าง 4 รายการแบบ Draft: global, home, about, contact โดยไม่ทับรายการเดิมและไม่แก้ข้อมูลรถ</p><p>ตรวจเนื้อหา เบอร์โทร ลิงก์โซเชียล และบริการก่อน Publish ทุกครั้ง ข้อมูลที่ Publish จะอ่านได้ผ่าน REST API สาธารณะ ห้ามกรอกข้อมูลลับหรือข้อมูลลูกค้า</p>';
    if (isset($_GET['pd_done'])) { echo '<div class="notice notice-success inline"><p>นำเข้าเสร็จแล้ว โปรดตรวจรายการ Draft ในเมนูข้อมูลเว็บไซต์และเนื้อหาหน้าเว็บ รายการที่มีอยู่แล้วถูกข้าม</p></div>'; }
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"><input type="hidden" name="action" value="prom_drive_seed">';
    wp_nonce_field('prom_drive_seed');
    submit_button('สร้างร่างเริ่มต้น', 'primary', 'submit', true, function_exists('update_field') ? array() : array('disabled' => 'disabled'));
    echo '</form></div>';
}

add_action('admin_post_prom_drive_seed', function () {
    if (!current_user_can('manage_options')) { wp_die('Not allowed.', '', array('response' => 403)); }
    check_admin_referer('prom_drive_seed');
    if (!function_exists('update_field')) { wp_die('Activate ACF first.'); }
    $file = __DIR__ . '/content-seed.json';
    $seed = is_readable($file) ? json_decode(file_get_contents($file), true) : null;
    if (!is_array($seed) || empty($seed['records'])) { wp_die('Missing content-seed.json.'); }
    $field_keys = array();
    foreach (prom_drive_content_groups() as $group) {
        foreach ($group['fields'] as $field) { $field_keys[$field['name']] = $field['key']; }
    }
    foreach ($seed['records'] as $record) {
        if (!in_array($record['post_type'], array('prom_drive_setting', 'prom_drive_page'), true)) { continue; }
        $existing = get_posts(array('post_type' => $record['post_type'], 'name' => $record['slug'], 'post_status' => array('publish','draft','pending','private','future','trash'), 'numberposts' => 1));
        if ($existing) { continue; }
        $id = wp_insert_post(array('post_type' => $record['post_type'], 'post_title' => sanitize_text_field($record['title']), 'post_name' => sanitize_title($record['slug']), 'post_status' => 'draft'), true);
        if (is_wp_error($id)) { wp_die(esc_html($id->get_error_message())); }
        // Field keys (not names) establish ACF references when initially saving a draft.
        foreach ($record['acf'] as $name => $value) {
            if (isset($field_keys[$name])) { update_field($field_keys[$name], $value, $id); }
        }
    }
    wp_safe_redirect(admin_url('edit.php?post_type=prom_drive_setting&page=prom-drive-setup&pd_done=1'));
    exit;
});
