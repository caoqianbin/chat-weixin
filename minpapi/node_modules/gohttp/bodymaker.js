'use strict';

const crypto = require('crypto');
const fs = require('fs');

var bodymaker = function (options = {}) {
    if (!(this instanceof bodymaker)) {return new bodymaker(options);}

    //最大同时上传文件数量限制
    this.max_upload_limit = 10;

    //上传文件最大数据量
    this.max_upload_size = 2000000000;

    //单个文件最大上传大小
    this.max_file_size = 1000000000;

    this.mime_map = {
        'css'   : 'text/css',
        'der'   : 'application/x-x509-ca-cert',
        'gif'   : 'image/gif',
        'gz'    : 'application/x-gzip',
        'h'     : 'text/plain',
        'htm'   : 'text/html',
        'html'  : 'text/html',
        'jpg'   : 'image/jpeg',
        'jpeg'  : 'image/jpeg',
        'png'   : 'image/png',
        'js'    : 'application/x-javascript',
        'mp3'   : 'audio/mpeg',
        'mp4'   : 'video/mp4',
        'c'     : 'text/plain',
        'exe'   : 'application/octet-stream',
        'txt'   : 'text/plain',
        'wav'   : 'audio/x-wav',
        'svg'   : 'image/svg+xml',
        'tar'   : 'application/x-tar',
    };

    this.default_mime   = 'application/octet-stream';

    this.extName = function (filename = '') {
        if (filename.length <= 0) { return ''; }
        var name_split = filename.split('.').filter(p => p.length > 0);
        if (name_split.length < 2) { return ''; }
        return name_split[name_split.length - 1];
    };

    this.mimeType = function (filename) {
        var extname = this.extName(filename);
        extname = extname.toLowerCase();
        if (extname !== '' && this.mime_map[extname] !== undefined) {
            return this.mime_map[extname];
        }
        return this.default_mime;
    };

};

bodymaker.prototype.makeUploadData = async function (r) {
    var bdy = this.boundary();

    var formData = '';
    if (r.form !== undefined) {
        if (typeof r.form === 'object') {
            for (var k in r.form) {
                formData += `\r\n--${bdy}\r\nContent-Disposition: form-data; name=${'"'}${k}${'"'}\r\n\r\n${r.form[k]}`;
            }
        }
    }

    var bodyfi = {};
    var header_data = '';
    var payload = '';

    var content_length = Buffer.byteLength(formData);

    var end_data = `\r\n--${bdy}--\r\n`;
    content_length += Buffer.byteLength(end_data);

    if (r.files && typeof r.files === 'object') {
        let t = '';
        for (var k in r.files) {
            if (typeof r.files[k] === 'string') {
                t = [ r.files[k] ];
            } else {
                t = r.files[k];
            }
            let fst = null;
            for (let i=0; i<t.length; i++) {
                header_data = `Content-Disposition: form-data; name=${'"'}${k}${'"'}; filename=${'"'}${t[i]}${'"'}\r\nContent-Type: ${this.mimeType(t[i])}`;

                payload = `\r\n--${bdy}\r\n${header_data}\r\n\r\n`;
                content_length += Buffer.byteLength(payload);

                try {
                    fst = fs.statSync(t[i]);
                    content_length += fst.size;
                } catch (err) {
                    console.log(err);
                    continue ;
                }

                bodyfi[ t[i] ] = {
                    payload : payload,
                    length: fst.size
                };

            }
        }

    }

    var seek = 0;
    var bodyData = Buffer.alloc(content_length);
    seek = Buffer.from(formData).copy(bodyData);

    let fd = -1;
    for(let f in bodyfi) {
        seek += Buffer.from(bodyfi[f].payload).copy(bodyData, seek);
        try {
            fd = fs.openSync(f);
            await new Promise((rv, rj) => {
                fs.read(fd, bodyData, seek, bodyfi[f].length, 0, (err, bytesRead, buffer) => {
                    if (err) {
                        rj(err);
                    } else {
                        seek += bytesRead;
                        rv(bytesRead);
                    }
                });
            });
        } catch (err) {
            throw err;
        } finally {
            if (fd > 0) {
                fs.close(fd, err => {});
            }
        }
    }
    
    Buffer.from(end_data).copy(bodyData, seek);

    return {
        'content-type' : `multipart/form-data; boundary=${bdy}`,
        'body' : bodyData,
        'content-length' : content_length
    };
};

bodymaker.prototype.boundary = function() {
    var hash = crypto.createHash('md5');
    hash.update(`${Date.now()}-${Math.random()}`);
    var bdy = hash.digest('hex');

    return `----${bdy}`;
};

module.exports = bodymaker;
