<?php
if (!defined('ABSPATH')) { exit; }

if (!defined('PDM_LANGS')) define('PDM_LANGS', array('th','en','zh'));
if (!defined('PDM_PAGE_KEYS')) define('PDM_PAGE_KEYS', array('home','about','contact'));

// Built-in fields shipped in schema.json.
function pdm_base_schema($type) {
    if (!isset($GLOBALS['pdm_base_schema'])) { $GLOBALS['pdm_base_schema'] = json_decode(file_get_contents(PDM_DIR.'schema.json'), true); }
    return isset($GLOBALS['pdm_base_schema'][$type]) ? $GLOBALS['pdm_base_schema'][$type] : array();
}

// Built-in fields plus user-defined ones (includes/custom-fields.php), cached per request.
function pdm_schema($type) {
    if (!isset($GLOBALS['pdm_schema_cache'][$type])) {
        $custom = function_exists('pdm_custom_schema') ? pdm_custom_schema($type) : array();
        $GLOBALS['pdm_schema_cache'][$type] = array_merge(pdm_base_schema($type), $custom);
    }
    return $GLOBALS['pdm_schema_cache'][$type];
}

function pdm_schema_reset() { unset($GLOBALS['pdm_schema_cache']); }

function pdm_read_field($id,$field,$prefix='') {
    $key=$prefix.$field['name'];
    if ($field['type']==='group') {
        $stored=get_post_meta($id,$key,true);
        if (is_array($stored)) { return pdm_shape($field,$stored); }
        // Read legacy ACF group subfields without requiring ACF to stay installed.
        $value=array();
        foreach ($field['sub_fields'] as $child) { $value[$child['name']]=pdm_read_field($id,$child,$key.'_'); }
        return $value;
    }
    if (!metadata_exists('post',$id,$key)) {
        if (isset($field['default_value'])) return $field['default_value'];
        if (in_array($field['type'],array('checkbox','gallery'),true)) return array();
        if ($field['type']==='true_false') return false;
        if (in_array($field['type'],array('number','image'),true)) return null;
        return '';
    }
    $value=get_post_meta($id,$key,true);
    if ($field['type']==='true_false') return (bool)$value;
    if ($field['type']==='number') return is_numeric($value) ? 0+$value : null;
    if ($field['type']==='image') return $value ? absint($value) : null;
    if ($field['type']==='gallery') return array_map('absint',is_array($value)?$value:array());
    if ($field['type']==='checkbox') return is_array($value)?$value:array();
    return is_scalar($value)?(string)$value:'';
}

// Project every nested group onto the public schema, never arbitrary stored keys.
function pdm_shape($field,$value) {
    if ($field['type']==='group') {
        $result=array();
        foreach ($field['sub_fields'] as $child) {
            $result[$child['name']]=pdm_shape($child,is_array($value)?($value[$child['name']]??null):null);
        }
        return $result;
    }
    if ($field['type']==='true_false') return (bool)$value;
    if ($field['type']==='number') return is_numeric($value)?0+$value:null;
    if ($field['type']==='image') return is_numeric($value)?absint($value):null;
    if ($field['type']==='gallery') return array_map('absint',is_array($value)?$value:array());
    if ($field['type']==='checkbox') return array_values(array_intersect(is_array($value)?$value:array(),array_keys($field['choices'])));
    return is_scalar($value)?(string)$value:'';
}

function pdm_read($id,$type) {
    $data=array();
    foreach (pdm_schema($type) as $field) {
        if ($field['type']!=='tab') $data[$field['name']]=pdm_read_field($id,$field);
    }
    return $data;
}

function pdm_clean($field,$value) {
    $type=$field['type']; $name=$field['label'];
    if ($type==='group') {
        if (!is_array($value)) return new WP_Error('pdm_invalid',$name.': รูปแบบข้อมูลไม่ถูกต้อง');
        $result=array();
        foreach ($field['sub_fields'] as $child) {
            if (!array_key_exists($child['name'],$value)) continue;
            $clean=pdm_clean($child,$value[$child['name']]);
            if (is_wp_error($clean)) return $clean;
            $result[$child['name']]=$clean;
        }
        return $result;
    }
    if ($type==='checkbox') {
        if (!is_array($value)) return new WP_Error('pdm_invalid',$name.': ต้องเป็นรายการ');
        $value=array_values(array_filter($value,static function($v){return $v!=='';}));
        foreach ($value as $v) if (!is_string($v)||!array_key_exists($v,$field['choices'])) return new WP_Error('pdm_invalid',$name.': ตัวเลือกไม่ถูกต้อง');
        if (!empty($field['required'])&&!$value) return new WP_Error('pdm_required',$name.': กรุณาเลือกอย่างน้อย 1 รายการ');
        return array_values(array_unique($value));
    }
    if ($type==='true_false') return in_array($value,array(true,1,'1'),true);
    if ($type==='gallery') {
        if (is_string($value)) $value=$value===''?array():explode(',',$value);
        if (!is_array($value)) return new WP_Error('pdm_invalid',$name.': รายการรูปไม่ถูกต้อง');
        $ids=array();
        foreach ($value as $id) {
            if (!is_scalar($id)||!ctype_digit((string)$id)||!wp_attachment_is_image((int)$id)) return new WP_Error('pdm_invalid',$name.': กรุณาเลือกรูปจาก Media Library');
            $ids[]=(int)$id;
        }
        return array_values(array_unique($ids));
    }
    if (!is_scalar($value)&&$value!==null) return new WP_Error('pdm_invalid',$name.': ค่าข้อมูลไม่ถูกต้อง');
    $value=trim((string)$value);
    if (!empty($field['required'])&&$value==='') return new WP_Error('pdm_required',$name.': กรุณากรอกข้อมูล');
    if ($type==='number') {
        if ($value==='') return null;
        if (!is_numeric($value)||!is_finite((float)$value)) return new WP_Error('pdm_invalid',$name.': ต้องเป็นตัวเลข');
        $number=0+$value;
        if ((isset($field['min'])&&$number<$field['min'])||(isset($field['max'])&&$number>$field['max'])) return new WP_Error('pdm_invalid',$name.': อยู่นอกช่วงที่กำหนด');
        if (($field['step']??1)==1&&floor($number)!=$number) return new WP_Error('pdm_invalid',$name.': ต้องเป็นจำนวนเต็ม');
        return $number;
    }
    if ($type==='image') {
        if ($value==='') return null;
        return ctype_digit($value)&&wp_attachment_is_image((int)$value)?(int)$value:new WP_Error('pdm_invalid',$name.': เลือกรูปจาก Media Library');
    }
    if ($type==='select'&&$value!==''&&!array_key_exists($value,$field['choices'])) return new WP_Error('pdm_invalid',$name.': ตัวเลือกไม่ถูกต้อง');
    if ($type==='email'&&$value!==''&&!is_email($value)) return new WP_Error('pdm_invalid',$name.': อีเมลไม่ถูกต้อง');
    if ($type==='url'||$field['name']==='logo_url') {
        if ($value==='') return '';
        if ($field['name']==='logo_url'&&preg_match('~^/(?!/)[a-zA-Z0-9/_.-]+$~',$value)) return $value;
        $url=wp_parse_url($value);
        if (!$url||($url['scheme']??'')!=='https'||empty($url['host'])||isset($url['user'])||isset($url['pass'])) return new WP_Error('pdm_invalid',$name.': ใช้ HTTPS URL ที่ไม่มีรหัสผ่าน');
        return esc_url_raw($value,array('https'));
    }
    return $type==='textarea'?sanitize_textarea_field($value):sanitize_text_field($value);
}

function pdm_validate($type,$input) {
    if (!is_array($input)) return new WP_Error('pdm_invalid','ข้อมูลฟอร์มไม่ถูกต้อง');
    $result=array();
    foreach (pdm_schema($type) as $field) {
        if ($field['type']==='tab'||!array_key_exists($field['name'],$input)) continue;
        $value=pdm_clean($field,$input[$field['name']]);
        if (is_wp_error($value)) return $value;
        $result[$field['name']]=$value;
    }
    return $result;
}

function pdm_store($id,$values) {
    foreach ($values as $key=>$value) {
        if ($value===null) delete_post_meta($id,$key); else update_post_meta($id,$key,wp_slash($value));
    }
}
