<?php
/**
 * Plugin Name: Aurelia Cars
 * Description: Vehicle catalogue post type for the Aurelia headless frontend. Import the supplied ACF field group separately.
 * Version: 0.1.0
 */
if (!defined('ABSPATH')) { exit; }

add_action('init', function () {
    register_post_type('cars', array(
        'labels' => array('name' => 'รถยนต์ / Cars', 'singular_name' => 'รถยนต์ / Car', 'add_new_item' => 'เพิ่มรถยนต์', 'edit_item' => 'แก้ไขข้อมูลรถ'),
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'rest_base' => 'cars',
        'publicly_queryable' => false,
        'exclude_from_search' => true,
        'has_archive' => false,
        'rewrite' => false,
        'supports' => array('title', 'thumbnail', 'revisions', 'custom-fields'),
        'menu_icon' => 'dashicons-car',
    ));
});
