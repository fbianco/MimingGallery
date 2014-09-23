<?php
/*
Copyright © 2014 François Bianco <francois.bianco@skadi.ch>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

See COPYING file for the full license.
*/


// Uncomment for DEBUG only
// error_reporting (E_ALL ^ E_NOTICE);

// Options:
// --------
// Images folder (with trailling slash)
define("IDIR", "./");
// Shall we save generated thumbnails & zip ?
define("CACHE", true);
// Writable cache folder (with trailling slash)
define("CDIR", sys_get_temp_dir().'/');
// jpeg quality for thumbnails and resampled images
define("QUALITY", 95);
// Thumbnails size in pixel (resampled square cut of image)
define("TS", 128);
// *** end of options **

// Get gallery name from image folder
define("GNAME", basename(realpath(IDIR)));
define("TITLE", "Miming Gallery – ".GNAME);

// Shall we & Can we store cache ?
define("_CACHE", CACHE && is_writable(CDIR));

function is_image($s) {
    // Return TRUE if extension is in allowed extensions list
    return in_array(strrchr($s, '.'),
                array(".jpg",".png",".gif",".JPG",".PNG",".GIF"));
}

function get_images_list() {
    // Return a list of readable images in IDIR
    $images_list = array();
    foreach(scandir(IDIR) as $fname) {
        $fpath = IDIR.$fname;
        if(is_image($fpath) && is_readable($fpath)) {
            array_push( $images_list, $fname );
        }
    }
    return $images_list;
}

function get_thumb($iname) {
    // Send thumb back
    // If CACHE: try to get it from CDIR, if not available
    //           create and save it, if
    // Else: create thumb live

    // We use basename() to avoid possible injection of other path
    // and accept only image/file from IDIR
    $iname = basename($iname);
    $ipath = IDIR.$iname;
    $tpath = null;

    if (_CACHE) {
        $tpath = CDIR.$iname;
        if (file_exists($tpath)) {
            send_file($tpath, 'image/jpeg');
            return;
        }
    }

    // Get biggest square in image
    list($w, $h) = getimagesize($ipath);
    if ($w > $h) {
        $src_x = round(($w-$h)/2);
        $src_y = 0;
        $w = $h;
    }
    else {
        $src_x = 0;
        $src_y = round(($h-$w)/2);
        $h = $w;
    }

    $thumb = imagecreatetruecolor(TS, TS);
    imageinterlace($thumb, true);
    $image = @imagecreatefromstring(file_get_contents($ipath)); // original
    if(!$image) {
        header("HTTP/1.0 400 Image unreadable, unsupported type.");
        exit;
    }
    imagecopyresampled($thumb, $image, 0, 0, $src_x, $src_y, TS, TS, $w, $h);
    if (_CACHE) {
        imagejpeg($thumb, $tpath, QUALITY); // save to $tpath
        send_file($tpath, 'image/jpeg');
    } else {
        header('Content-Type: image/jpeg');
        imagejpeg($thumb, null, QUALITY); // output jpg stream directly
    }
    // free
    imagedestroy($thumb);
    imagedestroy($image);
}

function send_file($fpath, $type) {
    // Send the file content over HTTP
    // with the given content $type
    //
    // Caller is responsible for security
    // of passed $fpath
    if (!file_exists($fpath)) {
        header("HTTP/1.0 404 File doesn't exists.");
        return;
    }
    $fo=@fopen($fpath,'rb');
    if(!$fo) {
        header("HTTP/1.0 403 Forbidden");
        return;
    }

    header('Content-Type: '. $type);
    header('Content-Length: ' . filesize($fpath));
    while (!feof($fo)) {
        echo fread($fo, 1048576); // in chunk of 1 MB
        ob_flush();
        flush();
    }
    fclose($fo);
}

function clean_cache() {
    // Empty CDIR
    if (_CACHE) {
        // Remove all thumbnails
        foreach(get_images_list() as $iname) {
            $tpath = CDIR.$iname;
            @unlink($tpath);
        }
        // and zip file
        @unlink(zip_path());
    }
}

function get_image($iname, $width=null, $height=null) {
    // Send back a resampled image in the max size
    // given by width and height keeping original ratio
    // If no size given return in full size

    // We use basename to avoid injection of path
    // and ensure we read only from IDIR
    $ipath=IDIR.basename($iname);
    if (!file_exists($ipath)) {
        header("HTTP/1.0 404 File doesn't exists.");
        exit;
    }
    list($w, $h) = getimagesize($ipath);

    // Resize image only to smaller sizes
    if (($width>=$w) || ($height>=$h)) { $ratio = 1; }
    else {
        if (($width!=null)&&($height!=null)) { $ratio = min($width/$w,$height/$h);}
        else if (($width!=null)&&($height==null)) { $ratio = $width/$w;}
        else if (($width==null)&&($height!=null)) { $ratio = $height/$h;}
        else if (($width==null)&&($height==null)) { $ratio = 1;}
    }

    $width=round($w*$ratio);
    $height=round($h*$ratio);

    $iori = @imagecreatefromstring(file_get_contents($ipath)); // original
    if(!$iori) {
        header("HTTP/1.0 400 Image unreadable, unsupported type.");
        exit;
    }
    $ires = imagecreatetruecolor($width, $height); // resampled
    imageinterlace($ires, true);
    imagecopyresampled($ires, $iori, 0, 0, 0, 0, $width, $height, $w, $h);
    header('Content-Type: image/jpeg');
    imagejpeg($ires, null, QUALITY);
    // free
    imagedestroy($ires);
    imagedestroy($iori);
}

function zip_path() {
    // Return a path to the zip file
    // if no CACHE initalize a tempnam file
    if (_CACHE) {
        return CDIR.GNAME.".zip";
    } else {
        return tempnam(sys_get_temp_dir(), GNAME);
    }
}

function create_zip($zpath) {
    $zip = new ZipArchive();
    if ($zip->open($zpath, ZipArchive::OVERWRITE)!==TRUE) {
        header("HTTP/1.0 400 Impossible to create zip file.");
        exit("Cannot write zipfile $zpath\n");
    }
    $zip->addEmptyDir(GNAME);
    foreach(get_images_list() as $iname) {
        $zip->addFile(IDIR.$iname, GNAME.'/'.$iname);
    }
    $zip->close();
}

function set_download_headers($fname) {
    header("Content-Disposition: attachment; filename=\"".$fname."\"");
    header("Content-Description: File Transfer");
    header("Content-Transfer-Encoding: binary");
}

// *** we need to "exit()" executed options  *** //
// *** else we might output also the trailling content *** //

if(isset($_GET['cleancache'])) {
    clean_cache();
    echo "Done";
    exit;
}

if(isset($_POST['createzip'])) {
    $zpath = zip_path();
    if (!file_exists($zpath) || !_CACHE) {
        create_zip($zpath);

        // If no cache we need to forward the temp zip path
        // for the chained ajax request
        if(!_CACHE) {
            header('Content-Type: application/json');
            echo json_encode(array('zip' => basename($zpath),));
        }
    }
    exit;
}

if(isset($_GET['zip'])) {
    if(_CACHE) {
        $zpath = zip_path();
    } else {
        // use basename to avoid path injection
        // Note: sys_get_temp_dir drops any trailling slash
        $zpath = sys_get_temp_dir().'/'.basename($_GET['zip']);
    }
    set_download_headers(GNAME.".zip");
    send_file($zpath, 'application/zip');
    if(!_CACHE) {
        unlink($zpath);
    }
    exit;
}

if(isset($_GET['thumb'])) {
    get_thumb($_GET['thumb']);
    exit;
}

if(isset($_GET['images'])) {
    // Return a JSON array of images in the IDIR
    header('Content-Type: application/json');
    echo json_encode(get_images_list());
    exit;
}

if(isset($_GET['img'])) {
    // Send back the image with
    // the given size (w,h)
    // resampled on the fly
    $w=null; $h=null;
    if(isset($_GET['w'])) {
        $w = $_GET['w'];
    }
    if(isset($_GET['h'])) {
        $h = $_GET['h'];
    }
    get_image($_GET['img'],$w,$h);
    exit;
}

if(isset($_GET['image'])){
    $iname = basename($_GET['image']);
    $ipath = IDIR.$iname;
    set_download_headers($iname);
    send_file($ipath, 'image/jpeg');
    exit;
}
?>