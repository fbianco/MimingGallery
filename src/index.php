<?php  include_once("gallery.ajax.php"); ?>
<?php echo '<?xml version="1.0" encoding="utf-8"?>' ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
    <title><?php echo TITLE;?></title>
    <meta http-equiv="Content-Type" content="application/xhtml+xml; charset=UTF-8" />
    <link rel="stylesheet" type="text/css" href="css/blueprint.css" />
    <link rel="stylesheet" type="text/css" href="css/miming.gallery.css" />
</head>
<body>
    <script type="text/javascript" src="js/jquery-2.1.1.min.js"></script>
    <script type="text/javascript" src="js/jquery.fullscreen-min.js"></script>
    <script type="text/javascript" src="js/jquery.mobile.custom.min.js"></script>
    <script type="text/javascript" src="js/jquery.miming.gallery-1.js"></script>
    <script type="text/javascript">$(function() { $("body").MimingGallery(); });</script>
</body>
</html>