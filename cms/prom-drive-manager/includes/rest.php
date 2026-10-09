<?php
if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init',function(){
    // Preserve the existing frontend envelope; the name is a contract, not a dependency.
    register_rest_field(array('cars','prom_drive_setting','prom_drive_page'),'acf',array(
        'get_callback'=>'pdm_rest_fields',
        'schema'=>array('type'=>'object','readonly'=>true,'context'=>array('view','edit')),
    ));
    register_rest_route('prom-drive/v1','/vehicles',array(
        'methods'=>WP_REST_Server::READABLE,'permission_callback'=>'__return_true',
        'args'=>array(
            'location'=>array('type'=>'string','enum'=>array('','bangkok','bkk','dmk','hotel'),'default'=>''),
            'category'=>array('type'=>'string','enum'=>array('All','Sports','Supercar','Ultra-Luxury','SUV'),'default'=>'All'),
            'service'=>array('type'=>'string','enum'=>array('','self-drive','chauffeur','event'),'default'=>''),
            'page'=>array('type'=>'integer','minimum'=>1,'default'=>1),
            'per_page'=>array('type'=>'integer','minimum'=>1,'maximum'=>100,'default'=>12),
        ),'callback'=>'pdm_search_vehicles',
    ));
},99);

function pdm_rest_fields($object) {
    $post=get_post($object['id']);
    if (!$post||!pdm_schema($post->post_type)) return new stdClass();
    if (($post->post_status!=='publish'||$post->post_password!=='')&&!current_user_can('edit_post',$post->ID)) return new stdClass();
    return pdm_read($post->ID,$post->post_type);
}

function pdm_fleet_meta_query($location,$category,$service) {
    $meta=array('relation'=>'AND',
        array('key'=>'fleet_status','value'=>'active','compare'=>'='),
        array('key'=>'data_status','value'=>'verified','compare'=>'='));
    if ($category!=='All') $meta[]=array('key'=>'category','value'=>$category,'compare'=>'=');
    // WordPress serializes checkbox arrays. Quote the value to match complete items.
    if ($location!=='') $meta[]=array('key'=>'delivery_locations','value'=>'"'.$location.'"','compare'=>'LIKE');
    if ($service!=='') $meta[]=array('key'=>'service_modes','value'=>'"'.$service.'"','compare'=>'LIKE');
    return $meta;
}

function pdm_search_vehicles($request) {
    foreach(array('pickup','returnAt','return_at','pickup_date','return_date') as $key) {
        if ($request->get_param($key)!==null) return new WP_Error('prom_drive_availability_not_connected','Catalogue filtering only. Date availability requires a booking source.',array('status'=>400));
    }
    $query=new WP_Query(array(
        'post_type'=>'cars','post_status'=>'publish','has_password'=>false,
        'posts_per_page'=>$request['per_page'],'paged'=>$request['page'],
        'orderby'=>array('title'=>'ASC','ID'=>'ASC'),
        'meta_query'=>pdm_fleet_meta_query($request['location'],$request['category'],$request['service']),
    ));
    $items=array();
    foreach($query->posts as $post) {
        $fields=pdm_read($post->ID,'cars');$image=absint($fields['cover_image']??0);
        $items[]=array('id'=>$post->ID,'slug'=>$post->post_name,'name'=>get_the_title($post),'acf'=>$fields,
            'cover_image_url'=>$image?(wp_get_attachment_image_url($image,'large')?:null):null);
    }
    $response=new WP_REST_Response(array(
        'items'=>$items,'filters'=>array('location'=>$request['location'],'category'=>$request['category'],'service'=>$request['service']),
        'pagination'=>array('page'=>(int)$request['page'],'per_page'=>(int)$request['per_page'],'total'=>(int)$query->found_posts,'pages'=>(int)$query->max_num_pages),
        'availability_confirmed'=>false,'availability_source'=>'not_connected',
    ));
    $response->header('X-WP-Total',(int)$query->found_posts);
    $response->header('X-WP-TotalPages',(int)$query->max_num_pages);
    return $response;
}
