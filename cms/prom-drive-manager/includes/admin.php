<?php
if (!defined('ABSPATH')) { exit; }

add_action('add_meta_boxes', function () {
    foreach (array('cars','prom_drive_setting','prom_drive_page') as $type) add_meta_box('pdm-fields','PROM DRIVE · รายละเอียด','pdm_render_box',$type,'normal','high');
});
add_action('admin_enqueue_scripts', function () {
    $screen=get_current_screen();
    if (!$screen||!in_array($screen->post_type,array('cars','prom_drive_setting','prom_drive_page'),true)) return;
    wp_enqueue_media();
    wp_enqueue_style('pdm-admin',plugins_url('assets/admin.css',PDM_DIR.'prom-drive-manager.php'),array(),'2.0.0');
    wp_enqueue_script('pdm-admin',plugins_url('assets/admin.js',PDM_DIR.'prom-drive-manager.php'),array('jquery','media-views'),'2.0.0',true);
});

function pdm_render_box($post) {
    wp_nonce_field('pdm_save_'.$post->ID,'pdm_nonce');
    $data=pdm_read($post->ID,$post->post_type);
    echo '<div class="pdm-editor"><p class="pdm-notice">ข้อมูลที่ Publish จะอ่านได้ผ่าน API สาธารณะ ห้ามกรอกข้อมูลลูกค้าหรือรหัสผ่าน</p>';
    if ($post->post_type==='prom_drive_setting') echo '<p>ใช้ Slug <code>global</code> สำหรับข้อมูลส่วนกลาง</p>';
    if ($post->post_type==='prom_drive_page') echo '<p>Slug ต้องตรงกับหน้าที่เลือก: <code>home</code>, <code>about</code> หรือ <code>contact</code></p>';
    foreach (pdm_schema($post->post_type) as $field) pdm_render_field($field,$data[$field['name']]??null,'pdm_fields');
    echo '<input type="hidden" name="pdm_complete" value="1"></div>';
}

function pdm_render_field($field,$value,$parent) {
    $name=$parent.'['.$field['name'].']';$id='pdm-'.sanitize_key(str_replace(array('[',']'),array('-',''),$name));$type=$field['type'];
    if ($type==='tab') { echo '<h3 class="pdm-section">'.esc_html($field['label']).'</h3>';return; }
    if ($type==='group') {
        $page_group=$parent==='pdm_fields'&&in_array($field['name'],array('home','about','contact'),true)?$field['name']:'';
        echo '<details class="pdm-group" '.($page_group?'data-page="'.esc_attr($page_group).'"':'').' open><summary>'.esc_html($field['label']).'</summary><div>';
        foreach ($field['sub_fields'] as $child) pdm_render_field($child,is_array($value)?($value[$child['name']]??null):null,$name);
        echo '</div></details>';return;
    }
    echo '<div class="pdm-field"><label for="'.esc_attr($id).'"><strong>'.esc_html(str_replace(' (ACF Pro)','',$field['label'])).'</strong>'.(!empty($field['required'])?' *':'').'</label>';
    $attr=' id="'.esc_attr($id).'" name="'.esc_attr($name).'"';
    if ($field['name']==='page_key') $attr.=' data-pdm-page-key';
    if ($type==='textarea') echo '<textarea'.$attr.' rows="'.esc_attr($field['rows']??3).'">'.esc_textarea(is_array($value)?implode("\n",$value):(string)$value).'</textarea>';
    elseif ($type==='select') {
        echo '<select'.$attr.'>';
        foreach ($field['choices'] as $key=>$label) echo '<option value="'.esc_attr($key).'" '.selected((string)$value,(string)$key,false).'>'.esc_html($label).'</option>';
        echo '</select>';
    } elseif ($type==='checkbox') {
        echo '<fieldset id="'.esc_attr($id).'"><legend class="screen-reader-text">'.esc_html($field['label']).'</legend><input type="hidden" name="'.esc_attr($name).'[]" value="">';
        foreach ($field['choices'] as $key=>$label) echo '<label class="pdm-check"><input type="checkbox" name="'.esc_attr($name).'[]" value="'.esc_attr($key).'" '.checked(in_array($key,(array)$value,true),true,false).'>'.esc_html($label).'</label>';
        echo '</fieldset>';
    } elseif ($type==='true_false') {
        echo '<input type="hidden" name="'.esc_attr($name).'" value="0"><label><input type="checkbox"'.$attr.' value="1" '.checked((bool)$value,true,false).'> แสดง / Enabled</label>';
    } elseif (in_array($type,array('image','gallery'),true)||$field['name']==='logo_url') {
        $multiple=$type==='gallery';$url=$field['name']==='logo_url';
        $ids=$multiple?implode(',',(array)$value):(string)$value;
        echo '<div class="pdm-media" data-multiple="'.($multiple?'1':'0').'" data-url="'.($url?'1':'0').'"><input'.$attr.' type="text" value="'.esc_attr($ids).'" '.(!$url?'readonly':'').'><button type="button" class="button pdm-pick">เลือกภาพ</button> <button type="button" class="button pdm-clear">ล้างภาพ</button><div class="pdm-preview">';
        if (!$url) foreach (array_filter($multiple?(array)$value:array($value)) as $image) echo wp_get_attachment_image((int)$image,'thumbnail');
        echo '</div></div>';
    } else {
        $input=in_array($type,array('number','url','email'),true)?$type:'text';
        echo '<input'.$attr.' type="'.esc_attr($input).'" value="'.esc_attr((string)$value).'"';
        foreach (array('min','max','step') as $limit) if(isset($field[$limit])) echo ' '.$limit.'="'.esc_attr($field[$limit]).'"';
        echo '>';
    }
    if (!empty($field['instructions'])) echo '<p class="description">'.esc_html($field['instructions']).'</p>';
    echo '</div>';
}

add_action('save_post','pdm_save_post',20,3);
function pdm_save_post($id,$post,$update) {
    if (!pdm_schema($post->post_type)||wp_is_post_revision($id)||wp_is_post_autosave($id)||(defined('DOING_AUTOSAVE')&&DOING_AUTOSAVE)) return;
    if (!isset($_POST['pdm_nonce'])||!is_string($_POST['pdm_nonce'])||!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['pdm_nonce'])),'pdm_save_'.$id)||!current_user_can('edit_post',$id)) return;
    $values=isset($_POST['pdm_complete'])&&$_POST['pdm_complete']==='1'?pdm_validate($post->post_type,wp_unslash($_POST['pdm_fields']??array())):new WP_Error('pdm_incomplete','ฟอร์มส่งไม่ครบ ข้อมูลเดิมยังคงอยู่ กรุณาตรวจ max_input_vars ของ PHP');
    if (is_wp_error($values)) {
        set_transient('pdm_error_'.get_current_user_id(),$values->get_error_message().' — ฟิลด์เดิมยังไม่ถูกเปลี่ยน',60);
        return;
    }
    pdm_store($id,$values);
}
add_action('admin_notices',function(){
    $key='pdm_error_'.get_current_user_id();$error=get_transient($key);
    if($error){delete_transient($key);echo '<div class="notice notice-error"><p>'.esc_html($error).'</p></div>';}
});

add_action('admin_menu',function(){add_submenu_page('edit.php?post_type=prom_drive_setting','PROM DRIVE Setup','ตั้งค่าเริ่มต้น','manage_options','pdm-setup','pdm_setup_screen');});
function pdm_setup_screen() {
    if (!current_user_can('manage_options')) return;
    echo '<div class="wrap"><h1>PROM DRIVE Manager</h1><p>ปลั๊กอินตัวเดียว ไม่ต้องใช้ ACF หรือ CPT UI</p><p>สร้างร่างข้อมูลเว็บไซต์ 4 รายการ และรถตัวอย่าง 8 รายการ ข้าม Slug ที่มีอยู่แล้ว ไม่เขียนทับและไม่ Publish อัตโนมัติ</p><p>ตรวจข้อมูลบริษัท รูปภาพ ราคา สเปก และบริการก่อนเผยแพร่ ข้อมูลรถตัวอย่างไม่ใช่รถว่างจริง</p>';
    if(isset($_GET['pdm_imported']))echo '<div class="notice notice-success inline"><p>สร้างร่างเริ่มต้นเรียบร้อย รายการเดิมถูกข้าม กรุณาตรวจข้อมูลก่อน Publish</p></div>';
    echo '<form action="'.esc_url(admin_url('admin-post.php')).'" method="post"><input type="hidden" name="action" value="pdm_seed">';
    wp_nonce_field('pdm_seed');submit_button('สร้างข้อมูลเริ่มต้นเป็น Draft');echo '</form><p>API: <code>/wp-json/prom-drive/v1/vehicles</code> รองรับ location + category + service (AND) แต่ยังไม่ยืนยันคิวตามวันเวลา</p></div>';
}
add_action('admin_post_pdm_seed',function(){
    if(!current_user_can('manage_options'))wp_die('Not allowed.','',array('response'=>403));
    check_admin_referer('pdm_seed');
    $seed=json_decode(file_get_contents(PDM_DIR.'seed.json'),true);
    foreach($seed as $record){
        if(!pdm_schema($record['post_type']))continue;
        $exists=get_posts(array('post_type'=>$record['post_type'],'name'=>$record['slug'],'post_status'=>array('publish','draft','pending','private','future','trash'),'numberposts'=>1));
        if($exists)continue;
        $values=pdm_validate($record['post_type'],$record['acf']);
        if(is_wp_error($values))wp_die(esc_html($values->get_error_message()));
        $id=wp_insert_post(array('post_type'=>$record['post_type'],'post_title'=>sanitize_text_field($record['title']),'post_name'=>sanitize_title($record['slug']),'post_status'=>'draft'),true);
        if(is_wp_error($id))wp_die(esc_html($id->get_error_message()));
        pdm_store($id,$values);
    }
    wp_safe_redirect(admin_url('edit.php?post_type=prom_drive_setting&page=pdm-setup&pdm_imported=1'));exit;
});
