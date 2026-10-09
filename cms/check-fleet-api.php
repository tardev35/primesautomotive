<?php
// Offline contract test only. This is not a WordPress integration test.
define('ABSPATH', __DIR__);
$hooks = array();
function add_action($hook, $callback) { $GLOBALS['hooks'][$hook] = $callback; }
function register_rest_route($namespace, $route, $config) { $GLOBALS['route'] = $config; }
class WP_REST_Server { const READABLE = 'GET'; }
class WP_Error { public $code; public $data; function __construct($code,$message,$data) { $this->code=$code; $this->data=$data; } }
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
require __DIR__ . '/prom-drive-fleet-api.php';
$hooks['rest_api_init']();
check($GLOBALS['route']['args']['per_page']['maximum']===100,'Bound pagination');
check(in_array('event',$GLOBALS['route']['args']['service']['enum'],true),'REST service allowlist');
$seed=json_decode(file_get_contents(__DIR__.'/car-seed.json'),true);
$records=array();
foreach($seed['records'] as $i=>$r) { $r['status']='publish';$r['acf']['data_status']='verified';$r['acf']['customer_notes']='PRIVATE';$records[$i+1]=$r; }
$GLOBALS['records']=$records;
$count=0;
foreach(array('bangkok','bkk','dmk','hotel') as $location) foreach(array('All','Sports','Supercar','Ultra-Luxury','SUV') as $category) foreach(array('self-drive','chauffeur','event') as $service) {
    $response=prom_drive_search_vehicles(new Request(array('location'=>$location,'category'=>$category,'service'=>$service,'page'=>1,'per_page'=>100)));
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
$page=prom_drive_search_vehicles($request);
check(count($page->data['items'])===2,'Pagination');
foreach($page->data['items'] as $item) check(!in_array($item['id'],array(1,2,3),true),'Draft/demo/protected vehicle leaked');
$request['pickup']='2026-12-01T10:00:00+07:00';
$error=prom_drive_search_vehicles($request);
check($error instanceof WP_Error && $error->code==='prom_drive_availability_not_connected','Dates must not silently be ignored');
echo "PASS: $count filter combinations, AND matching, pagination, draft/demo/protected exclusion, public field allowlist and date rejection (offline stub).\n";
