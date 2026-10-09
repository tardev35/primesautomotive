<?php
if (!defined('ABSPATH')) { exit; }


add_action('rest_api_init',function(){
    // Preserve the existing frontend envelope; the name is a contract, not a dependency.
    register_rest_field(array('cars','prom_drive_setting','prom_drive_page'),'acf',array(
        'get_callback'=>'pdm_rest_fields',
        'schema'=>array('type'=>'object','readonly'=>true,'context'=>array('view','edit')),
    ));
    // Resolved image URLs so apps never have to call /wp/v2/media per picture.
    register_rest_field('cars','media',array(
        'get_callback'=>'pdm_rest_media',
        'schema'=>array('type'=>'object','readonly'=>true,'context'=>array('view','edit')),
    ));
    $lang=array('type'=>'string','enum'=>array_merge(array(''),PDM_LANGS),'default'=>'','description'=>'Return one language only; *_th/_en/_zh fields and th/en/zh groups collapse to that language.');
    register_rest_route('prom-drive/v1','/vehicles',array(
        'methods'=>WP_REST_Server::READABLE,'permission_callback'=>'__return_true',
        'args'=>array(
            'location'=>array('type'=>'string','enum'=>array('','bangkok','bkk','dmk','hotel'),'default'=>''),
            'category'=>array('type'=>'string','enum'=>array('All','Sports','Supercar','Ultra-Luxury','SUV'),'default'=>'All'),
            'service'=>array('type'=>'string','enum'=>array('','self-drive','chauffeur','event'),'default'=>''),
            'page'=>array('type'=>'integer','minimum'=>1,'default'=>1),
            'per_page'=>array('type'=>'integer','minimum'=>1,'maximum'=>100,'default'=>12),
            'lang'=>$lang,
        ),'callback'=>'pdm_search_vehicles',
    ));
    register_rest_route('prom-drive/v1','/vehicles/(?P<slug>[a-z0-9-]+)',array(
        'methods'=>WP_REST_Server::READABLE,'permission_callback'=>'__return_true','args'=>array('lang'=>$lang),'callback'=>'pdm_get_vehicle',
    ));
    register_rest_route('prom-drive/v1','/pages/(?P<key>home|about|contact)',array(
        'methods'=>WP_REST_Server::READABLE,'permission_callback'=>'__return_true','args'=>array('lang'=>$lang),'callback'=>'pdm_get_page',
    ));
    register_rest_route('prom-drive/v1','/settings',array(
        'methods'=>WP_REST_Server::READABLE,'permission_callback'=>'__return_true','args'=>array('lang'=>$lang),'callback'=>'pdm_get_settings',
    ));
    // One bootstrap call for apps: settings + the three pages.
    register_rest_route('prom-drive/v1','/content',array(
        'methods'=>WP_REST_Server::READABLE,'permission_callback'=>'__return_true','args'=>array('lang'=>$lang),'callback'=>'pdm_get_content',
    ));
},99);

function pdm_rest_fields($object) {
    $post=get_post($object['id']);
    if (!$post||!pdm_schema($post->post_type)) return new stdClass();
    if (($post->post_status!=='publish'||$post->post_password!=='')&&!current_user_can('edit_post',$post->ID)) return new stdClass();
    return pdm_read($post->ID,$post->post_type);
}

function pdm_rest_media($object) {
    $post=get_post($object['id']);
    if (!$post||$post->post_type!=='cars') return new stdClass();
    if (($post->post_status!=='publish'||$post->post_password!=='')&&!current_user_can('edit_post',$post->ID)) return new stdClass();
    return pdm_vehicle_media(pdm_read($post->ID,'cars'));
}

// ---- Language and list shaping -------------------------------------------------

function pdm_lang($request) {
    $lang=(string)$request->get_param('lang');
    return in_array($lang,PDM_LANGS,true)?$lang:'';
}

// Admin textareas marked list:true hold one item per line; apps receive arrays.
function pdm_split_list($value) {
    $lines=is_array($value)?$value:preg_split('/\r\n|\r|\n/',(string)$value);
    return array_values(array_filter(array_map('trim',$lines),'strlen'));
}

function pdm_is_lang_group($field) {
    if ($field['type']!=='group') return false;
    $names=array();
    foreach ($field['sub_fields'] as $child) $names[]=$child['name'];
    $langs=PDM_LANGS; sort($names); sort($langs);
    return $names===$langs;
}

// Project stored values onto the public schema: split lists, and when $lang is set
// collapse name_th/name_en/name_zh fields and th/en/zh groups to that language.
function pdm_localize($fields,$values,$lang='') {
    $out=array();
    foreach ($fields as $field) {
        if ($field['type']==='tab') continue;
        $name=$field['name'];
        $value=isset($values[$name])?$values[$name]:null;
        if ($field['type']==='group') {
            $value=is_array($value)?$value:array();
            if ($lang!==''&&pdm_is_lang_group($field)) {
                foreach ($field['sub_fields'] as $child) {
                    if ($child['name']===$lang) $out[$name]=pdm_localize($child['sub_fields'],isset($value[$lang])&&is_array($value[$lang])?$value[$lang]:array(),$lang);
                }
            } else {
                $out[$name]=pdm_localize($field['sub_fields'],$value,$lang);
            }
            continue;
        }
        if (!empty($field['list'])) $value=pdm_split_list($value);
        if ($lang!==''&&preg_match('/^(.+)_(th|en|zh)$/',$name,$m)) {
            if ($m[2]!==$lang) continue;
            $name=$m[1];
        }
        $out[$name]=$value;
    }
    return $out;
}

// ---- Media --------------------------------------------------------------------

function pdm_media_item($id) {
    $id=absint($id);
    if (!$id) return null;
    $full=wp_get_attachment_image_src($id,'full');
    if (!$full) return null;
    $sizes=array();
    foreach (array('thumbnail','medium','large','full') as $size) {
        $src=wp_get_attachment_image_src($id,$size);
        if ($src) $sizes[$size]=array('url'=>$src[0],'width'=>(int)$src[1],'height'=>(int)$src[2]);
    }
    return array(
        'id'=>$id,'url'=>$full[0],'width'=>(int)$full[1],'height'=>(int)$full[2],
        'alt'=>(string)get_post_meta($id,'_wp_attachment_image_alt',true),
        'caption'=>(string)wp_get_attachment_caption($id),
        'mime'=>(string)get_post_mime_type($id),
        'sizes'=>$sizes,
    );
}

function pdm_vehicle_media($fields) {
    $gallery=array();
    foreach ((array)(isset($fields['gallery'])?$fields['gallery']:array()) as $id) {
        $item=pdm_media_item($id);
        if ($item) $gallery[]=$item;
    }
    $text=static function($key) use ($fields) { return isset($fields[$key])&&is_scalar($fields[$key])?(string)$fields[$key]:''; };
    return array(
        'cover'=>pdm_media_item(isset($fields['cover_image'])?$fields['cover_image']:0),
        'gallery'=>$gallery,
        'fallback_image_path'=>$text('fallback_image_path'),
        'credit'=>array('source_url'=>$text('photo_source_url'),'author'=>$text('photo_author'),'license'=>$text('photo_license'),'license_url'=>$text('photo_license_url')),
        'virtual_tour_url'=>$text('virtual_tour_url'),
    );
}

// ---- Public v1 shapes -----------------------------------------------------------

function pdm_updated_at($post) {
    $gmt=isset($post->post_modified_gmt)?(string)$post->post_modified_gmt:'';
    $time=$gmt!==''&&$gmt!=='0000-00-00 00:00:00'?strtotime($gmt.' UTC'):false;
    return $time?gmdate('c',$time):null;
}

function pdm_response($data) {
    $response=new WP_REST_Response($data);
    // Published, public content: let CDNs and apps cache briefly.
    $response->header('Cache-Control','public, max-age=60, stale-while-revalidate=300');
    return $response;
}

function pdm_published_post($type,$slug) {
    $posts=get_posts(array('post_type'=>$type,'name'=>$slug,'post_status'=>'publish','has_password'=>false,'numberposts'=>1));
    return $posts?$posts[0]:null;
}

function pdm_vehicle_item($post,$lang='') {
    $fields=pdm_read($post->ID,'cars');
    $item=array('id'=>(int)$post->ID,'slug'=>$post->post_name,'name'=>get_the_title($post),'lang'=>$lang===''?null:$lang);
    $item+=pdm_localize(pdm_schema('cars'),$fields,$lang);
    // Pictures and credits live under media only, so there is one source of truth.
    foreach (array('cover_image','gallery','fallback_image_path','photo_source_url','photo_author','photo_license','photo_license_url','virtual_tour_url') as $key) unset($item[$key]);
    $item['media']=pdm_vehicle_media($fields);
    $item['updated_at']=pdm_updated_at($post);
    return $item;
}

function pdm_page_content($key,$lang='') {
    if (!in_array($key,PDM_PAGE_KEYS,true)) return null;
    $post=pdm_published_post('prom_drive_page',$key);
    if (!$post) return null;
    $fields=pdm_read($post->ID,'prom_drive_page');
    if ((isset($fields['page_key'])?$fields['page_key']:'')!==$key) return null;
    foreach (pdm_schema('prom_drive_page') as $field) {
        if ($field['name']!==$key) continue;
        $content=pdm_localize(array($field),$fields,$lang);
        $body=$content[$key];
        // User-defined page fields (every page, or scoped to this key) join the page body.
        if (function_exists('pdm_custom_schema')) {
            $extra=array();
            foreach (pdm_custom_schema('prom_drive_page') as $custom) {
                if ($custom['type']!=='tab'&&(empty($custom['page_keys'])||in_array($key,$custom['page_keys'],true))) $extra[]=$custom;
            }
            $body+=pdm_localize($extra,$fields,$lang);
        }
        return array('key'=>$key,'lang'=>$lang===''?null:$lang,'content'=>$body,'updated_at'=>pdm_updated_at($post));
    }
    return null;
}

function pdm_settings_content($lang='') {
    $post=pdm_published_post('prom_drive_setting','global');
    if (!$post) return null;
    return array('lang'=>$lang===''?null:$lang,'settings'=>pdm_localize(pdm_schema('prom_drive_setting'),pdm_read($post->ID,'prom_drive_setting'),$lang),'updated_at'=>pdm_updated_at($post));
}

// ---- Route callbacks ------------------------------------------------------------

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
    $lang=pdm_lang($request);
    $query=new WP_Query(array(
        'post_type'=>'cars','post_status'=>'publish','has_password'=>false,
        'posts_per_page'=>$request['per_page'],'paged'=>$request['page'],
        'orderby'=>array('title'=>'ASC','ID'=>'ASC'),
        'meta_query'=>pdm_fleet_meta_query($request['location'],$request['category'],$request['service']),
    ));
    $items=array();
    foreach($query->posts as $post) $items[]=pdm_vehicle_item($post,$lang);
    $response=pdm_response(array(
        'items'=>$items,'filters'=>array('location'=>$request['location'],'category'=>$request['category'],'service'=>$request['service'],'lang'=>$lang===''?null:$lang),
        'pagination'=>array('page'=>(int)$request['page'],'per_page'=>(int)$request['per_page'],'total'=>(int)$query->found_posts,'pages'=>(int)$query->max_num_pages),
        'availability_confirmed'=>false,'availability_source'=>'not_connected',
    ));
    $response->header('X-WP-Total',(int)$query->found_posts);
    $response->header('X-WP-TotalPages',(int)$query->max_num_pages);
    return $response;
}

function pdm_get_vehicle($request) {
    $post=pdm_published_post('cars',(string)$request['slug']);
    if ($post) {
        $fields=pdm_read($post->ID,'cars');
        // Demo records stay editor-only, exactly like the list endpoint.
        if ((isset($fields['data_status'])?$fields['data_status']:'')!=='verified'&&!current_user_can('edit_post',$post->ID)) $post=null;
    }
    if (!$post) return new WP_Error('prom_drive_not_found','Vehicle not found.',array('status'=>404));
    return pdm_response(pdm_vehicle_item($post,pdm_lang($request)));
}

function pdm_get_page($request) {
    $page=pdm_page_content((string)$request['key'],pdm_lang($request));
    return $page?pdm_response($page):new WP_Error('prom_drive_not_found','Page not published.',array('status'=>404));
}

function pdm_get_settings($request) {
    $settings=pdm_settings_content(pdm_lang($request));
    return $settings?pdm_response($settings):new WP_Error('prom_drive_not_found','Global settings not published.',array('status'=>404));
}

function pdm_get_content($request) {
    $lang=pdm_lang($request);
    $settings=pdm_settings_content($lang);
    $pages=array(); $updated=array('settings'=>$settings?$settings['updated_at']:null);
    foreach (PDM_PAGE_KEYS as $key) {
        $page=pdm_page_content($key,$lang);
        $pages[$key]=$page?$page['content']:null;
        $updated[$key]=$page?$page['updated_at']:null;
    }
    return pdm_response(array(
        'lang'=>$lang===''?null:$lang,
        'settings'=>$settings?$settings['settings']:null,
        'pages'=>$pages,
        'updated_at'=>$updated,
        'generated_at'=>gmdate('c'),
    ));
}
