<?php
// Offline WordPress stubs: verifies contracts and guards, not live WP integration.
define('PDM_OFFLINE_TEST',true);
function register_rest_field($type,$name,$config){$GLOBALS['rest_field']=$config;}
require __DIR__.'/check-fleet-api.php';
function is_wp_error($v){return $v instanceof WP_Error;}
function wp_attachment_is_image($id){return in_array($id,array(90,91),true);}
function is_email($value){return filter_var($value,FILTER_VALIDATE_EMAIL);}
function wp_parse_url($v){return parse_url($v);}
function esc_url_raw($value,$protocols){return $value;}
function sanitize_text_field($v){return trim(strip_tags($v));}
function sanitize_textarea_field($v){return trim(strip_tags($v));}
function wp_slash($v){return $v;}
function wp_unslash($v){return $v;}
function update_post_meta($id,$key,$v){$GLOBALS['records'][$id]['acf'][$key]=$v;}
function delete_post_meta($id,$key){unset($GLOBALS['records'][$id]['acf'][$key]);}
function wp_is_post_revision($id){return false;}
function wp_is_post_autosave($id){return false;}
function wp_verify_nonce($value,$action){return $value==='valid';}
function current_user_can($cap,$id=null){return $GLOBALS['can_edit']??false;}
function get_current_user_id(){return 1;}
function set_transient($key,$value,$time){$GLOBALS['notices'][$key]=$value;}
function get_post($id){return $GLOBALS['posts'][$id]??null;}
require PDM_DIR.'includes/custom-fields.php';
require PDM_DIR.'includes/admin.php';
$seed=json_decode(file_get_contents(PDM_DIR.'seed.json'),true);
check(count($seed)===12,'12 draft records');
foreach($seed as $i=>$record){
    $value=pdm_validate($record['post_type'],$record['acf']);
    check(!is_wp_error($value),'Seed validation: '.($value instanceof WP_Error?$value->message:$record['slug']));
    $id=100+$i;$GLOBALS['records'][$id]=array('acf'=>array());pdm_store($id,$value);
    $read=pdm_read($id,$record['post_type']);
    foreach($value as $key=>$v) check($read[$key]===$v,'Round trip '.$record['slug'].':'.$key);
}
check(is_wp_error(pdm_validate('cars',array('category'=>'private'))),'Invalid enum');
check(is_wp_error(pdm_validate('cars',array('service_modes'=>array('self-drive','wrong')))),'Invalid checkbox');
check(is_wp_error(pdm_validate('cars',array('brand'=>array('bad')))),'Array rejected for scalar');
check(is_wp_error(pdm_validate('cars',array('brand'=>''))),'Required brand');
check(is_wp_error(pdm_validate('cars',array('seats'=>-2))),'Range');
check(is_wp_error(pdm_validate('cars',array('seats'=>2.5))),'Integer');
check(is_wp_error(pdm_validate('cars',array('gallery'=>'90,999'))),'Invalid media');
check(pdm_validate('cars',array('gallery'=>'90,91,90'))['gallery']===array(90,91),'Native gallery IDs');
foreach(array('javascript:alert(1)','http://insecure.test','https://name:secret@example.test') as $url){
    check(is_wp_error(pdm_validate('prom_drive_setting',array('logo_url'=>$url))),'Unsafe logo URL');
}
check(pdm_validate('prom_drive_setting',array('logo_url'=>'/prom-drive-logo.png'))['logo_url']==='/prom-drive-logo.png','Bundled logo');
$clean=pdm_validate('prom_drive_setting',array('brand_name'=>'<b>PROM DRIVE</b>','private_secret'=>'never'));
check($clean===array('brand_name'=>'PROM DRIVE'),'Plain text and unknown field allowlist');
$GLOBALS['records'][100]['acf']['social']['private_secret']='PRIVATE';
check(strpos(json_encode(pdm_read(100,'prom_drive_setting')),'PRIVATE')===false,'Nested public allowlist');
$GLOBALS['records'][300]=array('acf'=>array('text_th_address'=>'Legacy Thai address','text_en_address'=>'Legacy English'));
check(pdm_read(300,'prom_drive_setting')['text']['th']['address']==='Legacy Thai address','Legacy flattened ACF group');
$GLOBALS['records'][301]=array('acf'=>array('power_ps'=>'broken'));
check(pdm_read(301,'cars')['power_ps']===null,'Malformed legacy number');
$post=(object)array('ID'=>100,'post_type'=>'prom_drive_setting','post_status'=>'draft','post_password'=>'');$GLOBALS['posts'][100]=$post;
check(pdm_rest_fields(array('id'=>100)) instanceof stdClass,'Unauthenticated drafts hidden');
$post->post_status='publish';$post->post_password='secret';
check(pdm_rest_fields(array('id'=>100)) instanceof stdClass,'Protected content hidden');
$post->post_password='';check(pdm_rest_fields(array('id'=>100))['brand_name']==='PROM DRIVE','Published data readable');
$_POST=array('pdm_nonce'=>'valid','pdm_complete'=>'1','pdm_fields'=>array('brand_name'=>'NEW'));
pdm_save_post(100,$post,true);check(pdm_read(100,'prom_drive_setting')['brand_name']==='PROM DRIVE','Capability blocks mutation');
$GLOBALS['can_edit']=true;$_POST['pdm_nonce']='invalid';
pdm_save_post(100,$post,true);check(pdm_read(100,'prom_drive_setting')['brand_name']==='PROM DRIVE','Nonce blocks mutation');
$_POST['pdm_nonce']='valid';$_POST['pdm_fields']['logo_url']='javascript:bad';
pdm_save_post(100,$post,true);check(pdm_read(100,'prom_drive_setting')['brand_name']==='PROM DRIVE','Invalid form keeps all old fields');
unset($_POST['pdm_fields']['logo_url']);unset($_POST['pdm_complete']);
pdm_save_post(100,$post,true);check(pdm_read(100,'prom_drive_setting')['brand_name']==='PROM DRIVE','Truncated form keeps old fields');
$_POST['pdm_complete']='1';pdm_save_post(100,$post,true);
check(pdm_read(100,'prom_drive_setting')['brand_name']==='NEW','Authorized valid save');
// 2.1: demo vehicles are editor-only on the slug endpoint too.
$GLOBALS['can_edit']=false;
$GLOBALS['records'][500]=array('post_type'=>'cars','slug'=>'demo-car','title'=>'Demo','status'=>'publish','acf'=>array('data_status'=>'demo','brand'=>'X','model'=>'Y'));
check(pdm_get_vehicle(new Request(array('slug'=>'demo-car')))instanceof WP_Error,'Demo vehicle hidden by slug');
$GLOBALS['can_edit']=true;
check(pdm_get_vehicle(new Request(array('slug'=>'demo-car')))instanceof WP_REST_Response,'Editors can preview demo vehicle');
// 2.2: user-defined fields behave like built-in ones everywhere.
$GLOBALS['options']=array(); pdm_schema_reset();
check(is_wp_error(pdm_custom_save_definition('cars',array('name'=>'brand','label'=>'x','type'=>'text'))),'Custom name must not shadow built-in');
check(is_wp_error(pdm_custom_save_definition('prom_drive_setting',array('name'=>'address','label'=>'x','type'=>'text'))),'Nested built-in names are protected');
check(is_wp_error(pdm_custom_save_definition('cars',array('name'=>'media','label'=>'x','type'=>'text'))),'Reserved API key rejected');
check(is_wp_error(pdm_custom_save_definition('cars',array('name'=>'Bad Name','label'=>'x','type'=>'text'))),'Name format enforced');
check(is_wp_error(pdm_custom_save_definition('cars',array('name'=>'tagline_th','label'=>'x','type'=>'text'))),'Language suffix reserved');
check(is_wp_error(pdm_custom_save_definition('cars',array('name'=>'colors','label'=>'สี','type'=>'checkbox','choices'=>"แดง\nดำ"))),'Thai-only choices need an ASCII key');
check(!is_wp_error(pdm_custom_save_definition('cars',array('name'=>'tagline','label'=>'Tagline','type'=>'text','i18n'=>'1'))),'Save multilingual text');
check(is_wp_error(pdm_custom_save_definition('cars',array('name'=>'tagline','label'=>'dup','type'=>'text'))),'Duplicate custom name rejected');
check(!is_wp_error(pdm_custom_save_definition('cars',array('name'=>'tagline','label'=>'Tagline 2','type'=>'text','i18n'=>'1'),'tagline')),'Edit keeps the name');
$saved=pdm_custom_save_definition('cars',array('name'=>'colors','label'=>'สี','type'=>'checkbox','choices'=>"red|แดง\nblack | ดำ",'required'=>'1'));
check(!is_wp_error($saved)&&$saved['choices']===array('red'=>'แดง','black'=>'ดำ'),'Checkbox choices parsed');
check(!is_wp_error(pdm_custom_save_definition('cars',array('name'=>'wheel_inch','label'=>'ล้อ','type'=>'number','min'=>'15','max'=>'24','default_value'=>'20'))),'Number with range');
check(is_wp_error(pdm_custom_save_definition('cars',array('name'=>'bad_range','label'=>'x','type'=>'number','min'=>'5','max'=>'1'))),'min > max rejected');
$names=array_column(pdm_schema('cars'),'name');
check(in_array('tagline_th',$names,true)&&in_array('tagline_zh',$names,true)&&in_array('colors',$names,true)&&$names[count($names)-1]==='wheel_inch','Custom fields merged after built-ins');
check(pdm_schema('cars')[array_search('tagline_th',$names,true)]['label']==='Tagline 2 · ไทย','Language labels');
check(is_wp_error(pdm_validate('cars',array('colors'=>array('blue')))),'Custom choices enforced on save');
check(is_wp_error(pdm_validate('cars',array('wheel_inch'=>30))),'Custom number range enforced');
check(pdm_validate('cars',array('tagline_en'=>'<b>Fast</b>','colors'=>array('red')))===array('tagline_en'=>'Fast','colors'=>array('red')),'Custom values sanitized');
$GLOBALS['records'][600]=array('post_type'=>'cars','slug'=>'custom-car','title'=>'Custom','status'=>'publish','acf'=>array('data_status'=>'verified','brand'=>'A','model'=>'B','tagline_th'=>'เร็ว','tagline_en'=>'Fast','colors'=>array('red')));
$item=pdm_vehicle_item((object)array('ID'=>600,'post_name'=>'custom-car','post_title'=>'Custom'),'th');
check($item['tagline']==='เร็ว'&&!isset($item['tagline_en'])&&$item['colors']===array('red')&&$item['wheel_inch']===20,'Custom fields localized in v1 with defaults');
$item=pdm_vehicle_item((object)array('ID'=>600,'post_name'=>'custom-car','post_title'=>'Custom'));
check($item['tagline_en']==='Fast'&&$item['tagline_zh']==='','Custom fields in all-language output');
check(pdm_rest_fields(array('id'=>100))['brand_name']==='NEW'&&!isset(pdm_rest_fields(array('id'=>100))['tagline_th']),'Custom car fields do not leak into settings');
check(!is_wp_error(pdm_custom_save_definition('prom_drive_page',array('name'=>'promo_banner','label'=>'Promo','type'=>'textarea','i18n'=>'1','list'=>'1','page_keys'=>array('home','bogus')))),'Page-scoped multilingual list');
check(!is_wp_error(pdm_custom_save_definition('prom_drive_page',array('name'=>'show_badge','label'=>'Badge','type'=>'true_false'))),'Unscoped page toggle');
$GLOBALS['records'][201]['acf']['promo_banner_th']="ลด 10%\n\nฟรีส่ง";
$GLOBALS['records'][201]['acf']['show_badge']='1';
$GLOBALS['records'][202]['acf']['show_badge']='';
$home=pdm_page_content('home','th');
check($home['content']['promo_banner']===array('ลด 10%','ฟรีส่ง')&&$home['content']['show_badge']===true&&isset($home['content']['heroTitle']),'Custom page fields merged into content');
$about=pdm_page_content('about','th');
check(!isset($about['content']['promo_banner'])&&$about['content']['show_badge']===false,'Scoped field stays on its page');
check(count(pdm_page_content('home')['content']['th'])===39&&is_array(pdm_page_content('home')['content']['promo_banner_th']),'All-language page output keeps groups intact');
check(pdm_custom_move('cars','wheel_inch','up')&&array_column(pdm_schema('cars'),'name')[count(pdm_schema('cars'))-1]==='colors','Reorder');
check(pdm_custom_delete('cars','colors')&&!in_array('colors',array_column(pdm_schema('cars'),'name'),true)&&!pdm_custom_delete('cars','colors'),'Delete definition');
$json=pdm_custom_export(); $GLOBALS['options']=array(); pdm_schema_reset();
check(!in_array('tagline_th',array_column(pdm_schema('cars'),'name'),true),'Cache reset after clearing');
$imported=pdm_custom_import($json);
check($imported===4&&in_array('tagline_th',array_column(pdm_schema('cars'),'name'),true)&&pdm_page_content('home','th')['content']['promo_banner']===array('ลด 10%','ฟรีส่ง'),'Export/import round trip');
check(pdm_custom_import($json)===4,'Re-import upserts without duplicates');
check(is_wp_error(pdm_custom_import('{bad'))&&is_wp_error(pdm_custom_import('{"fields":{"cars":[{"name":"media","label":"x","type":"text"}]}}')),'Import validates every definition');
echo "PASS: 12 seed round trips, field validation, legacy ACF reads, nested allowlist, protected content, nonce/capability, atomic metadata validation and user-defined fields (offline stubs).\n";
