<?php
// User-defined fields. Definitions live in one option and are merged into the schema,
// so the editor, validation, REST output and ?lang= shaping treat them like built-in fields.
if (!defined('ABSPATH')) { exit; }

define('PDM_CUSTOM_OPTION','pdm_custom_fields');
define('PDM_CUSTOM_TYPES',array('text'=>'ข้อความสั้น','textarea'=>'ข้อความยาว','number'=>'ตัวเลข','select'=>'ตัวเลือกเดียว (select)','checkbox'=>'หลายตัวเลือก (checkbox)','true_false'=>'เปิด/ปิด','url'=>'ลิงก์ HTTPS','email'=>'อีเมล','image'=>'รูปภาพ','gallery'=>'แกลเลอรี'));
define('PDM_CUSTOM_POST_TYPES',array('cars'=>'รถยนต์','prom_drive_setting'=>'ข้อมูลเว็บไซต์ (global)','prom_drive_page'=>'เนื้อหา 3 ภาษา (home/about/contact)'));
// Keys the public API already uses at the top level of each record.
define('PDM_CUSTOM_RESERVED',array('id','slug','name','lang','media','updated_at','acf','title','status','content','key','page_key','custom_tab','generated_at','filters','pagination','items','settings','pages'));

function pdm_custom_definitions() {
    $all=get_option(PDM_CUSTOM_OPTION,array());
    return is_array($all)?$all:array();
}

function pdm_custom_write($all) {
    update_option(PDM_CUSTOM_OPTION,$all,false);
    pdm_schema_reset();
}

// One stored definition becomes one schema field, or three (name_th/_en/_zh) when multilingual.
function pdm_custom_expand($def) {
    $base=array('name'=>$def['name'],'label'=>$def['label'],'type'=>$def['type'],'required'=>!empty($def['required'])?1:0,'custom'=>true);
    if (!empty($def['instructions'])) $base['instructions']=$def['instructions'];
    if (!empty($def['list'])) $base['list']=true;
    if (!empty($def['page_keys'])) $base['page_keys']=array_values($def['page_keys']);
    if (in_array($def['type'],array('select','checkbox'),true)) $base['choices']=isset($def['choices'])&&is_array($def['choices'])?$def['choices']:array();
    if ($def['type']==='number') { foreach (array('min','max','step') as $key) if (isset($def[$key])&&$def[$key]!=='') $base[$key]=0+$def[$key]; }
    if ($def['type']==='textarea') $base['rows']=4;
    if (isset($def['default_value'])&&$def['default_value']!=='') $base['default_value']=$def['type']==='number'?0+$def['default_value']:$def['default_value'];
    if (empty($def['i18n'])) return array($base);
    $labels=array('th'=>'ไทย','en'=>'English','zh'=>'中文');
    $out=array();
    foreach (PDM_LANGS as $lang) {
        $field=$base;
        $field['name']=$def['name'].'_'.$lang;
        $field['label']=$def['label'].' · '.$labels[$lang];
        $out[]=$field;
    }
    return $out;
}

function pdm_custom_schema($type) {
    $defs=pdm_custom_definitions();
    if (empty($defs[$type])||!is_array($defs[$type])) return array();
    $fields=array(array('name'=>'custom_tab','type'=>'tab','label'=>'ฟิลด์เพิ่มเติม','custom'=>true));
    foreach ($defs[$type] as $def) foreach (pdm_custom_expand($def) as $field) $fields[]=$field;
    return $fields;
}

function pdm_schema_names($fields,&$names) {
    foreach ($fields as $field) {
        $names[]=$field['name'];
        if (!empty($field['sub_fields'])) pdm_schema_names($field['sub_fields'],$names);
    }
}

// "key|label" per line; a line without a key must already be ASCII so it can be its own key.
function pdm_custom_parse_choices($text) {
    $choices=array();
    foreach (preg_split('/\r\n|\r|\n/',(string)$text) as $line) {
        $line=trim($line);
        if ($line==='') continue;
        $parts=preg_split('/\s*[|=]\s*/',$line,2);
        $label=trim(end($parts));
        $key=strtolower(trim(preg_replace('/[^A-Za-z0-9_-]+/','-',trim($parts[0])),'-'));
        if ($key==='') return new WP_Error('pdm_invalid','ตัวเลือก "'.$line.'" ต้องมี key ภาษาอังกฤษ เช่น red|แดง');
        $choices[$key]=$label;
    }
    return $choices;
}

function pdm_custom_validate_definition($type,$input,$original='') {
    if (!isset(PDM_CUSTOM_POST_TYPES[$type])) return new WP_Error('pdm_invalid','ประเภทข้อมูลไม่ถูกต้อง');
    if (!is_array($input)) return new WP_Error('pdm_invalid','ข้อมูลฟิลด์ไม่ถูกต้อง');
    $name=$original!==''?$original:strtolower(trim((string)(isset($input['name'])?$input['name']:'')));
    if (!preg_match('/^[a-z][a-z0-9_]{0,40}$/',$name)) return new WP_Error('pdm_invalid','ชื่อฟิลด์ (name) ใช้ได้เฉพาะ a-z 0-9 _ ขึ้นต้นด้วยตัวอักษร ยาวไม่เกิน 41 ตัว');
    if (preg_match('/_(th|en|zh)$/',$name)) return new WP_Error('pdm_invalid','ห้ามลงท้ายชื่อด้วย _th/_en/_zh ให้ติ๊ก "หลายภาษา" แทน');
    if (in_array($name,PDM_CUSTOM_RESERVED,true)) return new WP_Error('pdm_invalid','ชื่อ "'.$name.'" ถูกสงวนไว้สำหรับ API');
    $fieldType=(string)(isset($input['type'])?$input['type']:'');
    if (!isset(PDM_CUSTOM_TYPES[$fieldType])) return new WP_Error('pdm_invalid','ชนิดฟิลด์ไม่ถูกต้อง');
    $label=trim(sanitize_text_field((string)(isset($input['label'])?$input['label']:'')));
    if ($label==='') return new WP_Error('pdm_required','กรุณากรอกป้ายชื่อฟิลด์');
    $def=array(
        'name'=>$name,'label'=>$label,'type'=>$fieldType,
        'required'=>!empty($input['required']),
        'i18n'=>!empty($input['i18n'])&&in_array($fieldType,array('text','textarea'),true),
        'list'=>!empty($input['list'])&&$fieldType==='textarea',
        'instructions'=>trim(sanitize_textarea_field((string)(isset($input['instructions'])?$input['instructions']:''))),
        'default_value'=>'','choices'=>array(),'page_keys'=>array(),
    );
    if (in_array($fieldType,array('select','checkbox'),true)) {
        $choices=pdm_custom_parse_choices(isset($input['choices'])?$input['choices']:'');
        if (is_wp_error($choices)) return $choices;
        if (!$choices) return new WP_Error('pdm_required','กรุณาใส่ตัวเลือกอย่างน้อย 1 บรรทัด (key|ป้ายชื่อ)');
        $def['choices']=$choices;
    }
    if ($fieldType==='number') {
        foreach (array('min','max','step') as $key) {
            $value=trim((string)(isset($input[$key])?$input[$key]:''));
            if ($value==='') continue;
            if (!is_numeric($value)) return new WP_Error('pdm_invalid',$key.' ต้องเป็นตัวเลข');
            $def[$key]=0+$value;
        }
        if (isset($def['min'],$def['max'])&&$def['min']>$def['max']) return new WP_Error('pdm_invalid','min ต้องไม่มากกว่า max');
    }
    if (in_array($fieldType,array('text','textarea','select','number'),true)) {
        $default=trim(sanitize_textarea_field((string)(isset($input['default_value'])?$input['default_value']:'')));
        if ($default!==''&&$fieldType==='select'&&!array_key_exists($default,$def['choices'])) return new WP_Error('pdm_invalid','ค่าเริ่มต้นต้องเป็น key หนึ่งในตัวเลือก');
        if ($default!==''&&$fieldType==='number'&&!is_numeric($default)) return new WP_Error('pdm_invalid','ค่าเริ่มต้นต้องเป็นตัวเลข');
        $def['default_value']=$default;
    }
    if ($type==='prom_drive_page') {
        $keys=array_map('strval',(array)(isset($input['page_keys'])?$input['page_keys']:array()));
        $def['page_keys']=array_values(array_intersect($keys,PDM_PAGE_KEYS));
    }
    // Names stay unique across built-in fields, nested groups, language variants and other custom fields.
    $names=array();
    pdm_schema_names(pdm_base_schema($type),$names);
    $existing=pdm_custom_definitions();
    foreach (isset($existing[$type])?$existing[$type]:array() as $other) {
        if ($other['name']===$name) {
            if ($original==='') return new WP_Error('pdm_invalid','มีฟิลด์ชื่อ "'.$name.'" อยู่แล้ว กดแก้ไขแทนการเพิ่มใหม่');
            continue;
        }
        foreach (pdm_custom_expand($other) as $field) $names[]=$field['name'];
    }
    foreach (pdm_custom_expand($def) as $field) {
        if (in_array($field['name'],$names,true)) return new WP_Error('pdm_invalid','ชื่อ "'.$field['name'].'" ซ้ำกับฟิลด์ที่มีอยู่แล้ว');
    }
    return $def;
}

// Add ($original === '') or update ($original = existing name; the name itself never changes).
function pdm_custom_save_definition($type,$input,$original='') {
    $def=pdm_custom_validate_definition($type,$input,$original);
    if (is_wp_error($def)) return $def;
    $all=pdm_custom_definitions();
    $list=isset($all[$type])&&is_array($all[$type])?$all[$type]:array();
    $replaced=false;
    foreach ($list as $i=>$existing) {
        if ($existing['name']===$def['name']) { $list[$i]=$def; $replaced=true; }
    }
    if (!$replaced) {
        if ($original!=='') return new WP_Error('pdm_invalid','ไม่พบฟิลด์ที่ต้องการแก้ไข');
        $list[]=$def;
    }
    $all[$type]=array_values($list);
    pdm_custom_write($all);
    return $def;
}

// Removes the definition only; stored values stay in post meta until a database cleanup.
function pdm_custom_delete($type,$name) {
    $all=pdm_custom_definitions();
    if (empty($all[$type])) return false;
    $kept=array_values(array_filter($all[$type],static function($def) use ($name) { return $def['name']!==$name; }));
    if (count($kept)===count($all[$type])) return false;
    $all[$type]=$kept;
    pdm_custom_write($all);
    return true;
}

function pdm_custom_move($type,$name,$direction) {
    $all=pdm_custom_definitions();
    if (empty($all[$type])) return false;
    $list=array_values($all[$type]);
    foreach ($list as $i=>$def) {
        if ($def['name']!==$name) continue;
        $target=$direction==='up'?$i-1:$i+1;
        if ($target<0||$target>=count($list)) return false;
        $swap=$list[$target]; $list[$target]=$list[$i]; $list[$i]=$swap;
        $all[$type]=$list;
        pdm_custom_write($all);
        return true;
    }
    return false;
}

function pdm_custom_export() {
    return json_encode(array('schema_version'=>1,'plugin'=>'prom-drive-manager','fields'=>pdm_custom_definitions()),JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
}

// Upsert from an export; stops at the first invalid definition without touching the rest.
function pdm_custom_import($json) {
    $data=json_decode((string)$json,true);
    if (!is_array($data)||!isset($data['fields'])||!is_array($data['fields'])) return new WP_Error('pdm_invalid','JSON ไม่ถูกต้อง ต้องมี key "fields"');
    $count=0;
    foreach ($data['fields'] as $type=>$defs) {
        if (!is_array($defs)) continue;
        foreach ($defs as $def) {
            if (!is_array($def)||empty($def['name'])) continue;
            $input=$def;
            $lines=array();
            if (isset($def['choices'])&&is_array($def['choices'])) foreach ($def['choices'] as $key=>$label) $lines[]=$key.'|'.$label;
            $input['choices']=implode("\n",$lines);
            $existing=pdm_custom_definitions();
            $found=false;
            foreach (isset($existing[$type])?$existing[$type]:array() as $other) if ($other['name']===$def['name']) $found=true;
            $saved=pdm_custom_save_definition((string)$type,$input,$found?(string)$def['name']:'');
            if (is_wp_error($saved)) return new WP_Error('pdm_invalid',$type.'/'.$def['name'].': '.$saved->get_error_message());
            $count++;
        }
    }
    return $count;
}

// ---- Admin screen ------------------------------------------------------------------

add_action('admin_menu',function(){
    add_submenu_page('edit.php?post_type=prom_drive_setting','PROM DRIVE · ฟิลด์เพิ่มเติม','ฟิลด์เพิ่มเติม','manage_options','pdm-fields','pdm_fields_screen');
});
add_action('admin_enqueue_scripts',function($hook){
    if (strpos((string)$hook,'pdm-fields')===false) return;
    wp_enqueue_style('pdm-admin',plugins_url('assets/admin.css',PDM_DIR.'prom-drive-manager.php'),array(),'2.2.0');
    wp_enqueue_script('pdm-admin',plugins_url('assets/admin.js',PDM_DIR.'prom-drive-manager.php'),array('jquery'),'2.2.0',true);
});

function pdm_fields_redirect($message,$error=false) {
    set_transient(($error?'pdm_error_':'pdm_notice_').get_current_user_id(),$message,60);
    wp_safe_redirect(admin_url('edit.php?post_type=prom_drive_setting&page=pdm-fields'));
    exit;
}

add_action('admin_post_pdm_field_save',function(){
    if (!current_user_can('manage_options')) wp_die('Not allowed.','',array('response'=>403));
    check_admin_referer('pdm_fields');
    $input=wp_unslash(isset($_POST['pdm_def'])?$_POST['pdm_def']:array());
    $type=isset($input['post_type'])?(string)$input['post_type']:'';
    $original=isset($input['original'])?(string)$input['original']:'';
    $saved=pdm_custom_save_definition($type,$input,$original);
    if (is_wp_error($saved)) pdm_fields_redirect($saved->get_error_message(),true);
    pdm_fields_redirect('บันทึกฟิลด์ "'.$saved['label'].'" แล้ว ฟิลด์จะปรากฏในหน้าแก้ไขและ API ทันที');
});
add_action('admin_post_pdm_field_delete',function(){
    if (!current_user_can('manage_options')) wp_die('Not allowed.','',array('response'=>403));
    check_admin_referer('pdm_fields');
    $ok=pdm_custom_delete(isset($_POST['post_type'])?(string)$_POST['post_type']:'',isset($_POST['name'])?(string)$_POST['name']:'');
    pdm_fields_redirect($ok?'ลบนิยามฟิลด์แล้ว ค่าที่เคยกรอกยังอยู่ในฐานข้อมูลแต่จะไม่แสดงและไม่ออกทาง API':'ไม่พบฟิลด์',!$ok);
});
add_action('admin_post_pdm_field_move',function(){
    if (!current_user_can('manage_options')) wp_die('Not allowed.','',array('response'=>403));
    check_admin_referer('pdm_fields');
    pdm_custom_move(isset($_POST['post_type'])?(string)$_POST['post_type']:'',isset($_POST['name'])?(string)$_POST['name']:'',isset($_POST['direction'])&&$_POST['direction']==='up'?'up':'down');
    pdm_fields_redirect('จัดลำดับแล้ว');
});
add_action('admin_post_pdm_field_import',function(){
    if (!current_user_can('manage_options')) wp_die('Not allowed.','',array('response'=>403));
    check_admin_referer('pdm_fields');
    $result=pdm_custom_import(wp_unslash(isset($_POST['pdm_import'])?(string)$_POST['pdm_import']:''));
    if (is_wp_error($result)) pdm_fields_redirect($result->get_error_message(),true);
    pdm_fields_redirect('นำเข้า '.$result.' ฟิลด์แล้ว');
});

function pdm_fields_screen() {
    if (!current_user_can('manage_options')) return;
    $user=get_current_user_id();
    $editing=null; $editType='';
    if (isset($_GET['edit'])&&preg_match('/^([a-z_]+):([a-z0-9_]+)$/',(string)$_GET['edit'],$m)) {
        $all=pdm_custom_definitions();
        foreach (isset($all[$m[1]])?$all[$m[1]]:array() as $def) if ($def['name']===$m[2]) { $editing=$def; $editType=$m[1]; }
    }
    $action=esc_url(admin_url('admin-post.php'));
    $nonce=wp_nonce_field('pdm_fields','_wpnonce',true,false);
    echo '<div class="wrap pdm-builder"><h1>PROM DRIVE · ฟิลด์เพิ่มเติม</h1>';
    echo '<p>เพิ่มฟิลด์ได้เองโดยไม่ต้องแก้ปลั๊กอิน ฟิลด์ใหม่จะปรากฏในหน้าแก้ไข, ผ่าน validation เดียวกัน และออกทาง API สาธารณะทันทีที่ Publish (ชื่อฟิลด์เป็นชื่อ key ใน JSON)</p>';
    foreach (array('pdm_error_'=>'notice-error','pdm_notice_'=>'notice-success') as $prefix=>$class) {
        $message=get_transient($prefix.$user);
        if ($message) { delete_transient($prefix.$user); echo '<div class="notice '.$class.' is-dismissible"><p>'.esc_html($message).'</p></div>'; }
    }
    $all=pdm_custom_definitions();
    foreach (PDM_CUSTOM_POST_TYPES as $type=>$typeLabel) {
        $list=isset($all[$type])?$all[$type]:array();
        echo '<h2>'.esc_html($typeLabel).' <span class="pdm-count">'.count($list).' ฟิลด์</span></h2>';
        if (!$list) { echo '<p class="description">ยังไม่มีฟิลด์เพิ่มเติม</p>'; continue; }
        echo '<table class="widefat striped pdm-table"><thead><tr><th>ป้ายชื่อ</th><th>name (key ใน API)</th><th>ชนิด</th><th>คุณสมบัติ</th><th>จัดการ</th></tr></thead><tbody>';
        foreach ($list as $i=>$def) {
            $props=array();
            if (!empty($def['i18n'])) $props[]='3 ภาษา';
            if (!empty($def['list'])) $props[]='รายการ';
            if (!empty($def['required'])) $props[]='จำเป็น';
            if (!empty($def['page_keys'])) $props[]='เฉพาะ '.implode(', ',$def['page_keys']);
            if (!empty($def['choices'])) $props[]=count($def['choices']).' ตัวเลือก';
            $keys=!empty($def['i18n'])?$def['name'].'_th / _en / _zh':$def['name'];
            echo '<tr><td><strong>'.esc_html($def['label']).'</strong></td><td><code>'.esc_html($keys).'</code></td><td>'.esc_html(PDM_CUSTOM_TYPES[$def['type']]).'</td><td>'.esc_html(implode(' · ',$props)).'</td><td class="pdm-actions">';
            echo '<a class="button button-small" href="'.esc_url(add_query_arg(array('post_type'=>'prom_drive_setting','page'=>'pdm-fields','edit'=>$type.':'.$def['name']),admin_url('edit.php'))).'#pdm-form">แก้ไข</a> ';
            foreach (array('up'=>'↑','down'=>'↓') as $dir=>$arrow) {
                $disabled=($dir==='up'&&$i===0)||($dir==='down'&&$i===count($list)-1);
                echo '<form method="post" action="'.$action.'" class="pdm-inline">'.$nonce.'<input type="hidden" name="action" value="pdm_field_move"><input type="hidden" name="post_type" value="'.esc_attr($type).'"><input type="hidden" name="name" value="'.esc_attr($def['name']).'"><input type="hidden" name="direction" value="'.$dir.'"><button class="button button-small" '.($disabled?'disabled':'').' aria-label="เลื่อน'.($dir==='up'?'ขึ้น':'ลง').'">'.$arrow.'</button></form> ';
            }
            echo '<form method="post" action="'.$action.'" class="pdm-inline" onsubmit="return confirm(\'ลบนิยามฟิลด์นี้? ค่าที่เคยกรอกจะไม่แสดงอีก\');">'.$nonce.'<input type="hidden" name="action" value="pdm_field_delete"><input type="hidden" name="post_type" value="'.esc_attr($type).'"><input type="hidden" name="name" value="'.esc_attr($def['name']).'"><button class="button button-small button-link-delete">ลบ</button></form>';
            echo '</td></tr>';
        }
        echo '</tbody></table>';
    }
    // Add / edit form.
    $d=$editing?$editing:array('name'=>'','label'=>'','type'=>'text','required'=>false,'i18n'=>false,'list'=>false,'instructions'=>'','default_value'=>'','choices'=>array(),'page_keys'=>array(),'min'=>'','max'=>'','step'=>'');
    $choiceLines=array(); foreach ($d['choices'] as $key=>$label) $choiceLines[]=$key.'|'.$label;
    echo '<h2 id="pdm-form">'.($editing?'แก้ไขฟิลด์: '.esc_html($editing['label']):'เพิ่มฟิลด์ใหม่').'</h2>';
    echo '<form method="post" action="'.$action.'" class="pdm-def-form">'.$nonce.'<input type="hidden" name="action" value="pdm_field_save">';
    if ($editing) echo '<input type="hidden" name="pdm_def[original]" value="'.esc_attr($editing['name']).'">';
    echo '<table class="form-table"><tbody>';
    echo '<tr><th><label for="pdm-def-post-type">ใช้กับ</label></th><td><select id="pdm-def-post-type" name="pdm_def[post_type]" data-pdm-post-type '.($editing?'disabled':'').'>';
    foreach (PDM_CUSTOM_POST_TYPES as $type=>$typeLabel) echo '<option value="'.esc_attr($type).'" '.selected($editing?$editType:'cars',$type,false).'>'.esc_html($typeLabel).'</option>';
    echo '</select>'.($editing?'<input type="hidden" name="pdm_def[post_type]" value="'.esc_attr($editType).'">':'').'</td></tr>';
    echo '<tr><th><label for="pdm-def-label">ป้ายชื่อ *</label></th><td><input id="pdm-def-label" type="text" name="pdm_def[label]" value="'.esc_attr($d['label']).'" class="regular-text" data-pdm-label required><p class="description">ชื่อที่แสดงในหน้าแก้ไข เช่น "สีตัวถัง"</p></td></tr>';
    echo '<tr><th><label for="pdm-def-name">name (key ใน API) *</label></th><td><input id="pdm-def-name" type="text" name="pdm_def[name]" value="'.esc_attr($d['name']).'" class="regular-text" pattern="[a-z][a-z0-9_]{0,40}" data-pdm-name '.($editing?'readonly':'required').'><p class="description">a-z 0-9 _ เท่านั้น เปลี่ยนไม่ได้หลังบันทึก เพราะเป็นชื่อที่เก็บในฐานข้อมูลและที่แอปอ่าน</p></td></tr>';
    echo '<tr><th><label for="pdm-def-type">ชนิด *</label></th><td><select id="pdm-def-type" name="pdm_def[type]" data-pdm-type>';
    foreach (PDM_CUSTOM_TYPES as $key=>$label) echo '<option value="'.esc_attr($key).'" '.selected($d['type'],$key,false).'>'.esc_html($label).'</option>';
    echo '</select></td></tr>';
    echo '<tr data-for="text,textarea"><th>หลายภาษา</th><td><label><input type="checkbox" name="pdm_def[i18n]" value="1" '.checked(!empty($d['i18n']),true,false).'> สร้างช่องไทย / English / 中文 ให้อัตโนมัติ (เก็บเป็น name_th, name_en, name_zh และยุบด้วย ?lang=)</label></td></tr>';
    echo '<tr data-for="textarea"><th>รายการ</th><td><label><input type="checkbox" name="pdm_def[list]" value="1" '.checked(!empty($d['list']),true,false).'> หนึ่งรายการต่อบรรทัด API คืนเป็น array</label></td></tr>';
    echo '<tr><th>จำเป็นต้องกรอก</th><td><label><input type="checkbox" name="pdm_def[required]" value="1" '.checked(!empty($d['required']),true,false).'> บันทึกไม่ได้ถ้าเว้นว่าง</label></td></tr>';
    echo '<tr data-for="select,checkbox"><th><label for="pdm-def-choices">ตัวเลือก</label></th><td><textarea id="pdm-def-choices" name="pdm_def[choices]" rows="4" class="large-text code">'.esc_textarea(implode("\n",$choiceLines)).'</textarea><p class="description">หนึ่งตัวเลือกต่อบรรทัด รูปแบบ key|ป้ายชื่อ เช่น <code>red|แดง</code> key เป็นภาษาอังกฤษและเป็นค่าที่ API ส่ง</p></td></tr>';
    echo '<tr data-for="number"><th>ช่วงตัวเลข</th><td>min <input type="number" step="any" name="pdm_def[min]" value="'.esc_attr(isset($d['min'])?$d['min']:'').'" class="small-text"> max <input type="number" step="any" name="pdm_def[max]" value="'.esc_attr(isset($d['max'])?$d['max']:'').'" class="small-text"> step <input type="number" step="any" name="pdm_def[step]" value="'.esc_attr(isset($d['step'])?$d['step']:'').'" class="small-text"><p class="description">เว้นว่างได้ step 1 = จำนวนเต็ม, 0.1 = ทศนิยม</p></td></tr>';
    echo '<tr data-for="text,textarea,select,number"><th><label for="pdm-def-default">ค่าเริ่มต้น</label></th><td><input id="pdm-def-default" type="text" name="pdm_def[default_value]" value="'.esc_attr($d['default_value']).'" class="regular-text"><p class="description">ใช้เมื่อยังไม่เคยกรอก (select ใส่ key)</p></td></tr>';
    echo '<tr data-post-type="prom_drive_page"><th>แสดงเฉพาะหน้า</th><td>';
    foreach (PDM_PAGE_KEYS as $key) echo '<label class="pdm-check"><input type="checkbox" name="pdm_def[page_keys][]" value="'.esc_attr($key).'" '.checked(in_array($key,$d['page_keys'],true),true,false).'> '.esc_html($key).'</label>';
    echo '<p class="description">ไม่เลือก = ทุกหน้า ค่าจะอยู่ใน content ของหน้านั้นใน API</p></td></tr>';
    echo '<tr><th><label for="pdm-def-instructions">คำอธิบายใต้ช่อง</label></th><td><textarea id="pdm-def-instructions" name="pdm_def[instructions]" rows="2" class="large-text">'.esc_textarea($d['instructions']).'</textarea></td></tr>';
    echo '</tbody></table>';
    submit_button($editing?'บันทึกการแก้ไข':'เพิ่มฟิลด์');
    if ($editing) echo '<a class="button" href="'.esc_url(admin_url('edit.php?post_type=prom_drive_setting&page=pdm-fields')).'">ยกเลิก</a>';
    echo '</form>';
    // Export / import for staging → production.
    echo '<h2>ส่งออก / นำเข้า</h2><p>คัดลอก JSON นี้ไปวางในเว็บอีกเครื่อง (เช่น staging → production) นิยามที่ชื่อซ้ำจะถูกอัปเดต ไม่ลบของเดิม ไม่ย้ายค่าที่กรอก</p>';
    echo '<textarea readonly rows="8" class="large-text code" onclick="this.select()">'.esc_textarea(pdm_custom_export()).'</textarea>';
    echo '<form method="post" action="'.$action.'">'.$nonce.'<input type="hidden" name="action" value="pdm_field_import"><textarea name="pdm_import" rows="6" class="large-text code" placeholder=\'{"schema_version":1,"fields":{"cars":[...]}}\'></textarea>';
    submit_button('นำเข้า JSON','secondary');
    echo '</form>';
    echo '<h2>ข้อควรรู้</h2><ul class="pdm-notes"><li>ลบนิยามฟิลด์ไม่ลบค่าที่เคยกรอก ถ้าสร้างฟิลด์ชื่อเดิมอีกครั้ง ค่าจะกลับมา</li><li>ฟิลด์ที่ Publish อ่านได้สาธารณะผ่าน API ห้ามเก็บข้อมูลลูกค้าหรือรหัสผ่าน</li><li>ฟิลด์ที่เพิ่มในเว็บนี้ไม่ได้อยู่ใน schema.json ของปลั๊กอิน ให้ส่งออก JSON เก็บไว้เป็นสำรอง</li><li>เว็บ Next.js และแอปจะเห็นฟิลด์ใหม่ทันที แต่จะแสดงผลก็ต่อเมื่อฝั่งนั้นเขียนโค้ดรองรับ key นี้</li></ul></div>';
}
