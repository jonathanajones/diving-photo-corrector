/*
 *
 * @source:https://raw.githubusercontent.com/jonathanajones/diving-photo-corrector/master/dcc.js
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2019  Jonathan A. Jones
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */
/*
 dcc.js
 Color correction script to add red channel information to diving photos
 Port of a GIMP plugin to mass-correct images
*/
const sharp = require('sharp');
const path = require('path');

const inputPath = process.argv[2];
const inputDir = path.dirname(inputPath);
const inputImg = path.basename(inputPath);

sharp(inputPath)
  .toBuffer({resolveWithObject: true})
  .then(({data, info}) => {
    console.log('Read in ' + info.width + ' x ' + info.height + 'px ' + info.format + ' colorspace:' + info.space + '\nSize: ' + info.size + ' bytes');
    (async() => {
      const redLayer = await sharp({
        create: {
          width: info.width,
          height: info.height,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 1.0 }
        }
      })
        .png()
        .toBuffer()
      const redTintedLayer = await sharp(data)
        .greyscale()
        .composite([{ input: redLayer, blend: 'multiply' }])
        .toBuffer()
      const fixedLayer = await sharp(redTintedLayer)
        .composite([{ input: data, blend: 'screen' }])
        .normalize()
        .jpeg()
        .toFile(inputDir + '/out-base.jpg')
        .catch(err => {console.error('fixedLayer', err)});
    })()
  })
  .catch( err => { console.error(err) });
