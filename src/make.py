#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
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
"""

import os
from subprocess import check_output

with open('output.template.php','r') as template:
    content = ''.join([l.strip() for l in template.readlines()])

    # PHP AJAX
    content = content.replace('{AJAX}', check_output(["/usr/bin/php","helper/compress.php"]))

    # STYLE
    style = ''.join([check_output(["/usr/bin/yui-compressor", "--type", "css", 'css/'+f])
            for f in ['blueprint.css','miming.gallery.css']]) # order matters
    content = content.replace('{STYLE}', style)

    # ICONS
    icons = ''
    for icon in os.listdir('svg'):
        with open('svg/'+icon,'r') as i:
            icons+= "<div id='icon_" + icon.replace('.svg','') + "' class='icon'>" + "".join([l.strip() for l in i.readlines()]) + "</div>"
    content = content.replace('{ICONS}', icons)

    # SCRIPTS
    script = ''.join([check_output(["/usr/bin/yui-compressor", "--type", "js", 'js/'+f])
             for f in ['jquery-2.1.1.min.js','jquery.fullscreen-min.js','jquery.mobile.custom.min.js','jquery.miming.gallery-1.js'] ])
    content = content.replace('{SCRIPT}', script)

with open('../index.php','w') as out:
    out.write(content)