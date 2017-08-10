var fs = require('fs')
var path = require('path');


/**
 * 指定ファイルの{version}にバージョンを埋める
 * @param {*} filepath 
 * @param {*} modified 
 * @param {*} version 
 */
function replace_version(filepath, modified, version) {

    console.info("set version " + version + " : " + filepath);

    fs.readFile(filepath, 'utf8', function (err, data) {
        if (err) throw err;
        var result = data.replace(/{version}/g, version).replace(/{modified}/g, modified);
        fs.writeFile(filepath, result, 'utf8', function (err) {
            if (err) throw err;
        });
    });
}


/**
 * index.htmlを検索して、{version}をセットする
 * @param {*} folder 
 * @param {*} modified 
 * @param {*} version 
 */
function replace_indexhtml_version(folder, modified, version) {

    fs.readdir(folder, function (err, files) {

        if (err) throw err;

        files.forEach(function (file) {

            let filepath = path.join(folder, file);

            if (file.indexOf("index.html") === 0) {
                replace_version(filepath, modified, version);
            }
            else {
                if (fs.statSync(filepath).isDirectory()) {
                    replace_indexhtml_version(filepath, modified, version);
                }
            }
        });
    });
}

/**
 * ビルド日時をバージョンとする
 */
function build_date() {
    let now = new Date();
    return now.getFullYear()
        + ("0" + (now.getMonth() + 1)).slice(-2)
        + ("0" + now.getDate()).slice(-2)
        + ("0" + now.getHours()).slice(-2)
        + ("0" + now.getMinutes()).slice(-2);
}


let modified = new Date().toUTCString();
let version = build_date();

console.info(modified);

replace_indexhtml_version("dist", modified, version);

