<?php
require "compressor.php";

$c = new Compressor;

$c->keep_line_breaks = false;
$c->comment = array(
    "See https://github.com/fbianco/MimingGallery for uncompressed code."
);

$c->load(file_get_contents("gallery.ajax.php"));
echo $c->run() . '?>'
?>