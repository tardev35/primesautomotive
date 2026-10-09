<?php
// Offline contract test only. This is not a WordPress integration test.
define('ABSPATH', __DIR__);
$hooks = array();
function add_action($hook, $callback) { $GLOBALS['hooks'][$hook] = $callback; }
function register_rest_route($namespace, $route, $config) { $GLOBALS['routes'][$route] = $config; if ($route === '/vehicles') $GLOBALS['route'] = $config; }
class WP_REST_Server { const READABLE = 'GET'; }
class WP_Error { public $code; public $data; public $message; function __construct($code,$message,$data=null) { $this->code=$code; $this->data=$data; $this->message=$message; } function get_error_message(){return $this->message;} }
class WP_REST_Response { public $data; public $headers=array(); function __construct($data) { $this->data=$data; } function header($key,$value) { $this->headers[$key]=$value; } }
class Request extends ArrayObject { function get_param($name) { return $this->offsetExists($name) ? $this[$name] : null; } }
function post_type_exists($type) { return $type === 'cars'; }
function get_field($key,$id,$format=false) { return $GLOBALS['records'][$id]['acf'][$key] ?? null; }
function get_the_title($post) { return $post->post_title; }
function absint($n) { return abs((int)$n); }
function wp_get_attachment_image_url($id,$size) { return 'https://example.test/car.jpg'; }
class WP_Query {
    public $posts; public $found_posts; public $max_num_pages;
    function __construct($args) {
        $matches=array();
        foreach($GLOBALS['records'] as $id=>$r) {
            if($r['status'] !== $args['post_status'] || !empty($r['password'])) continue;
            $ok=true;
            foreach($args['meta_query'] as $condition) {
                if(!is_array($condition)) continue;
                $value=$r['acf'][$condition['key']] ?? null;
                if($condition['compare'] === '=' && $value !== $condition['value']) $ok=false;
                if($condition['compare'] === 'LIKE' && strpos(serialize($value),$condition['value']) === false) $ok=false;
            }
            if($ok) $matches[]=(object)array('ID'=>$id,'post_name'=>$r['slug'],'post_title'=>$r['title']);
        }
        $this->found_posts=count($matches);
        $this->max_num_pages=(int)ceil(count($matches)/$args['posts_per_page']);
        $this->posts=array_slice($matches,($args['paged']-1)*$args['posts_per_page'],$args['posts_per_page']);
    }
}
function check($condition,$message) { if(!$condition) throw new Exception($message); }
if (defined('PDM_OFFLINE_TEST')) {
    define('PDM_DIR',__DIR__.'/prom-drive-manager/');
    function metadata_exists($type,$id,$key){return array_key_exists($key,$GLOBALS['records'][$id]['acf']);}
    function get_post_meta($id,$key,$single=true){return $GLOBALS['records'][$id]['acf'][$key]??'';}
    function wp_get_attachment_image_src($id,$size){ if(!in_array($id,array(90,91),true)) return false; $w=array('thumbnail'=>150,'medium'=>300,'large'=>1024,'full'=>1600); return array("https://example.test/$id-$size.jpg",$w[$size],(int)($w[$size]*0.6),$size!=='full'); }
    function wp_get_attachment_caption($id){return '';}
    function get_post_mime_type($id){return 'image/jpeg';}
    function get_option($key,$default=false){return $GLOBALS['options'][$key]??$default;}
    function update_option($key,$value,$autoload=null){$GLOBALS['options'][$key]=$value;return true;}
    function get_posts($args){ foreach($GLOBALS['records'] as $id=>$r){ if(($r['post_type']??'cars')===$args['post_type']&&($r['slug']??null)===$args['name']&&($r['status']??'')==='publish'&&empty($r['password'])) return array((object)array('ID'=>$id,'post_name'=>$r['slug'],'post_title'=>$r['title']??'','post_type'=>$args['post_type'],'post_modified_gmt'=>'2026-10-09 10:00:00')); } return array(); }
    require PDM_DIR.'includes/data.php';
    require PDM_DIR.'includes/rest.php';
    $search_callback='pdm_search_vehicles';
} else {
    require __DIR__ . '/prom-drive-fleet-api.php';
    $search_callback='prom_drive_search_vehicles';
}
$hooks['rest_api_init']();
check($GLOBALS['route']['args']['per_page']['maximum']===100,'Bound pagination');
check(in_array('event',$GLOBALS['route']['args']['service']['enum'],true),'REST service allowlist');
$seed=json_decode(file_get_contents(__DIR__.'/car-seed.json'),true);
$records=array();
foreach($seed['records'] as $i=>$r) { $r['status']='publish';$r['acf']['data_status']='verified';$r['acf']['customer_notes']='PRIVATE';$records[$i+1]=$r; }
$GLOBALS['records']=$records;
$count=0;
foreach(array('bangkok','bkk','dmk','hotel') as $location) foreach(array('All','Sports','Supercar','Ultra-Luxury','SUV') as $category) foreach(array('self-drive','chauffeur','event') as $service) {
    $response=$search_callback(new Request(array('location'=>$location,'category'=>$category,'service'=>$service,'page'=>1,'per_page'=>100)));
    $expected=array_filter($records,function($r)use($location,$category,$service) {
        $v=$r['acf'];return $v['fleet_status']==='active' && in_array($location,$v['delivery_locations'],true) && ($category==='All'||$category===$v['category']) && in_array($service,$v['service_modes'],true);
    });
    check($response->data['pagination']['total']===count($expected),'Combined AND filters mismatch');
    check(array_column($response->data['items'],'slug')===array_column(array_values($expected),'slug'),'Wrong vehicles');
    check($response->data['availability_confirmed']===false,'Never confirm date availability');
    check(strpos(json_encode($response->data),'PRIVATE')===false,'Private metadata leaked');
    $count++;
}
$GLOBALS['records'][1]['status']='draft';
$GLOBALS['records'][2]['acf']['data_status']='demo';
$GLOBALS['records'][3]['password']='secret';
$request=new Request(array('location'=>'','category'=>'All','service'=>'','page'=>1,'per_page'=>2));
$page=$search_callback($request);
check(count($page->data['items'])===2,'Pagination');
foreach($page->data['items'] as $item) check(!in_array($item['id'],array(1,2,3),true),'Draft/demo/protected vehicle leaked');
$request['pickup']='2026-12-01T10:00:00+07:00';
$error=$search_callback($request);
check($error instanceof WP_Error && $error->code==='prom_drive_availability_not_connected','Dates must not silently be ignored');
if (defined('PDM_OFFLINE_TEST')) {
    // 2.1: resolved media, list splitting and ?lang= shaping. Record 4 is published + verified above.
    $GLOBALS['records'][4]['acf']['cover_image']=90; $GLOBALS['records'][4]['acf']['gallery']=array(91,90,999);
    $post=(object)array('ID'=>4,'post_name'=>$records[4]['slug'],'post_title'=>$records[4]['title'],'post_modified_gmt'=>'2026-10-09 10:00:00');
    $full=pdm_vehicle_item($post);
    check($full['lang']===null&&$full['summary_th']===$records[4]['acf']['summary_th']&&isset($full['summary_en'],$full['summary_zh']),'No lang keeps every language');
    check(is_array($full['features_en'])&&$full['features_en']===pdm_split_list($records[4]['acf']['features_en']),'Lists split into arrays');
    check(!array_key_exists('cover_image',$full)&&!array_key_exists('photo_author',$full),'Media keys moved under media');
    check($full['media']['cover']['url']==='https://example.test/90-full.jpg'&&$full['media']['cover']['sizes']['large']['width']===1024,'Cover resolved with sizes');
    check(count($full['media']['gallery'])===2&&$full['media']['gallery'][0]['id']===91,'Gallery resolved, missing attachment skipped');
    check($full['media']['credit']['author']===$records[4]['acf']['photo_author'],'Credit kept with media');
    check($full['updated_at']==='2026-10-09T10:00:00+00:00','updated_at is ISO 8601 UTC');
    $th=pdm_vehicle_item($post,'th');
    check($th['lang']==='th'&&$th['summary']===$records[4]['acf']['summary_th']&&!isset($th['summary_th'])&&!isset($th['summary_en']),'lang collapses *_th fields');
    check(is_array($th['features'])&&$th['seo_title']===$records[4]['acf']['seo_title_th']&&$th['daily_rate_thb']===$records[4]['acf']['daily_rate_thb'],'Localized vehicle keeps non-language fields');
    check(pdm_lang(new Request(array('lang'=>'fr')))===''&&pdm_lang(new Request(array('lang'=>'zh')))==='zh','Unknown lang falls back to all languages');
    $list=$search_callback(new Request(array('location'=>'','category'=>'All','service'=>'','page'=>1,'per_page'=>100,'lang'=>'en')));
    check($list->data['filters']['lang']==='en'&&isset($list->data['items'][0]['summary'])&&!isset($list->data['items'][0]['acf']),'List endpoint honours lang');
    check(strpos($list->headers['Cache-Control'],'public')===0,'Public cache header');
    $single=pdm_get_vehicle(new Request(array('slug'=>$records[4]['slug'],'lang'=>'zh')));
    check($single instanceof WP_REST_Response&&$single->data['slug']===$records[4]['slug']&&$single->data['summary']===$records[4]['acf']['summary_zh'],'Vehicle by slug');
    check(pdm_get_vehicle(new Request(array('slug'=>'missing-car','lang'=>'')))instanceof WP_Error,'Unknown slug 404');
    $content=json_decode(file_get_contents(__DIR__.'/content-seed.json'),true);
    foreach($content['records'] as $i=>$r){ $r['status']='publish'; $GLOBALS['records'][200+$i]=$r; }
    $home=pdm_page_content('home','th');
    check(count($home['content']['heroTitle'])===2&&is_string($home['content']['heroBody'])&&!isset($home['content']['th']),'Page collapses to one language and splits lists');
    $all=pdm_page_content('home');
    check(count($all['content']['en']['processHeads'])===3&&$all['lang']===null,'Page without lang keeps th/en/zh groups');
    $settings=pdm_settings_content('zh');
    check(count($settings['settings']['text']['footerHeads'])===3&&!isset($settings['settings']['text']['zh'])&&$settings['settings']['brand_name']==='PROM DRIVE','Settings collapse text group');
    check(isset($settings['settings']['social']['facebook'])&&is_bool($settings['settings']['social_visible']['line']),'Non-language groups untouched');
    $bundle=pdm_get_content(new Request(array('lang'=>'en')));
    check(count($bundle->data['pages']['about']['aboutTitle'])===2&&$bundle->data['settings']['brand_name']==='PROM DRIVE'&&isset($bundle->data['updated_at']['contact']),'Bootstrap bundle');
    $GLOBALS['records'][203]['status']='draft';
    check(pdm_get_page(new Request(array('key'=>'contact','lang'=>'th')))instanceof WP_Error&&pdm_get_content(new Request(array('lang'=>'th')))->data['pages']['contact']===null,'Unpublished page hidden');
    check(isset($GLOBALS['routes']['/vehicles/(?P<slug>[a-z0-9-]+)'],$GLOBALS['routes']['/pages/(?P<key>home|about|contact)'],$GLOBALS['routes']['/settings'],$GLOBALS['routes']['/content']),'v1 routes registered');
    check(in_array('zh',$GLOBALS['routes']['/content']['args']['lang']['enum'],true),'lang allowlist');
    $count.=' + media/lang/v1';
}
echo "PASS: $count filter combinations, AND matching, pagination, draft/demo/protected exclusion, public field allowlist and date rejection (offline stub).\n";
