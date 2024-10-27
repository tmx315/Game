<?php

require $_SERVER['DOCUMENT_ROOT'].'/asset/code/php/lh/Api.php';

//test
LH::api('save',function($data){
  file_put_contents('map.json',json_encode($data['map'],JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));//写入
  exit('ok');
});