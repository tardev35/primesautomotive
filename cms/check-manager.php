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
echo "PASS: 12 seed round trips, field validation, legacy ACF reads, nested allowlist, protected content, nonce/capability and atomic metadata validation (offline stubs).\n";
