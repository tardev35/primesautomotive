<?php
// Included by PROM DRIVE Content. Public catalogue only, never reservations or customer data.
if (!defined('ABSPATH')) { exit; }

function prom_drive_fleet_meta_query($location, $category, $service) {
    $meta = array('relation' => 'AND',
        array('key' => 'fleet_status', 'value' => 'active', 'compare' => '='),
        array('key' => 'data_status', 'value' => 'verified', 'compare' => '='),
    );
    if ($category !== 'All') { $meta[] = array('key' => 'category', 'value' => $category, 'compare' => '='); }
    // ACF checkbox arrays are serialized by WordPress. Match a quoted whole value,
    // not a substring ("bangkok" must not match "bangkok-extra"). WP_Query escapes LIKE values.
    if ($location !== '') { $meta[] = array('key' => 'delivery_locations', 'value' => '"' . $location . '"', 'compare' => 'LIKE'); }
    if ($service !== '') { $meta[] = array('key' => 'service_modes', 'value' => '"' . $service . '"', 'compare' => 'LIKE'); }
    return $meta;
}

add_action('rest_api_init', function () {
    register_rest_route('prom-drive/v1', '/vehicles', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => '__return_true',
        'args' => array(
            'location' => array('type' => 'string', 'enum' => array('', 'bangkok', 'bkk', 'dmk', 'hotel'), 'default' => ''),
            'category' => array('type' => 'string', 'enum' => array('All', 'Sports', 'Supercar', 'Ultra-Luxury', 'SUV'), 'default' => 'All'),
            'service' => array('type' => 'string', 'enum' => array('', 'self-drive', 'chauffeur', 'event'), 'default' => ''),
            'page' => array('type' => 'integer', 'minimum' => 1, 'default' => 1),
            'per_page' => array('type' => 'integer', 'minimum' => 1, 'maximum' => 100, 'default' => 12),
        ),
        'callback' => 'prom_drive_search_vehicles',
    ));
});

function prom_drive_search_vehicles($request) {
    if (!post_type_exists('cars') || !function_exists('get_field')) {
        return new WP_Error('prom_drive_catalogue_unavailable', 'Activate the Cars post type and ACF first.', array('status' => 503));
    }
    // Deliberately reject date availability requests until a booking source is connected.
    // Silently ignoring dates could make catalogue matches look like available vehicles.
    foreach (array('pickup', 'returnAt', 'return_at', 'pickup_date', 'return_date') as $date_key) {
        if ($request->get_param($date_key) !== null) {
            return new WP_Error('prom_drive_availability_not_connected', 'This endpoint filters the catalogue only. Date availability requires the booking service.', array('status' => 400));
        }
    }
    $query = new WP_Query(array(
        'post_type' => 'cars', 'post_status' => 'publish', 'has_password' => false,
        'posts_per_page' => $request['per_page'], 'paged' => $request['page'],
        'orderby' => array('title' => 'ASC', 'ID' => 'ASC'),
        'meta_query' => prom_drive_fleet_meta_query($request['location'], $request['category'], $request['service']),
    ));
    // Explicit allowlist: no private operational metadata is ever serialized here.
    $fields = array('brand','model','variant','model_year','category','fleet_status','data_status','service_modes','delivery_locations',
        'seats','doors','transmission','fuel','power_ps','acceleration_seconds','top_speed_kmh',
        'daily_rate_thb','deposit_thb','minimum_days','included_km_per_day','extra_km_thb',
        'summary_th','summary_en','summary_zh','features_th','features_en','features_zh','rental_terms_th','rental_terms_en','rental_terms_zh',
        'cover_image','gallery','photo_source_url','photo_author','photo_license','photo_license_url');
    $items = array();
    foreach ($query->posts as $post) {
        $acf = array();
        foreach ($fields as $name) { $acf[$name] = get_field($name, $post->ID, false); }
        $image_id = absint($acf['cover_image']);
        $items[] = array('id' => $post->ID, 'slug' => $post->post_name, 'name' => get_the_title($post), 'acf' => $acf,
            'cover_image_url' => $image_id ? (wp_get_attachment_image_url($image_id, 'large') ?: null) : null);
    }
    $response = new WP_REST_Response(array(
        'items' => $items,
        'filters' => array('location' => $request['location'], 'category' => $request['category'], 'service' => $request['service']),
        'pagination' => array('page' => (int) $request['page'], 'per_page' => (int) $request['per_page'], 'total' => (int) $query->found_posts, 'pages' => (int) $query->max_num_pages),
        'availability_confirmed' => false, 'availability_source' => 'not_connected',
    ));
    $response->header('X-WP-Total', (int) $query->found_posts);
    $response->header('X-WP-TotalPages', (int) $query->max_num_pages);
    return $response;
}
