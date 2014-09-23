MimingGallery
=============

Single page responsive php-jquery images gallery.

Turn any folder with images in a responsive dynamic web gallery with the
following features:

 * Allow user interaction on mobile platform
 * Resizable display
 * Thumbnails generated on the fly (or cached, see options)
 * Allow download of all images in a ZIP file
 * Based on Jquery and PHP

Usage
-----
Simply copy 'index.php' in a web accessible folder on your server containing
images. It will start acting as a gallery.

Options
-------
Edit 'gallery.ajax.php' options section to get access to the following
parameters:

  * IDIR (string): Images folder path with trailling slash, default is current
                   folder.
  * CACHE (bool): Specify if we shall save generated thumbnails & zip. If False,
                  we generate them live. Default is True.
  * CDIR (string): Cache folder path with trailling slash. If not writable will
                   fallback to CACHE = False. Default = sys_get_temp_dir().'/'
  * QUALITY (int): Jpeg quality in percent for thumbnails and resampled images,
                   default = 95 [%]
  * TS (int): Thumbnails size in pixel (resampled square cut of image),
              default = 128 [px]

Compressed code
---------------

To compress code simply use *python make.py* in the src folder. It requires
php and yui-compressor.

Limitations
-----------
This will probably not be suited for large image gallery (>100 images) and/or 
high traffic websites, since we rely on no or simple caching mechanism and we
resample images live on user request.

Cleaning cache
--------------
Caching was activated and you want to clean it, go your gallery page and append
the query '?cleancache' to the the URL this will delete any thumbnails and zip
file stored in cache folder (See options CACHE, CDIR).

Copyright
---------
For Blueprint CSS, Jquery, Loading.io, compressor.php codes see their respective
licences. They are merged here for simplicity.


MimingGallery (PHP & Javascript & Pyhton)

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