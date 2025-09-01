"use strict";
exports.__esModule = true;

const fs = require('fs');

const translations = require("./lib/translations");

main()

function main() {
    Object.entries(translations).forEach(([key,obj]) => {
        const langs = Object.keys(obj);
        if (!langs.includes('en')) {
            console.log("Missing English translation for", key);
        }
        if (!langs.includes('fu')) {
            console.log("Missing Furlan translation for", key);
        }
    });
    const keys = Object.keys(translations);

    const lst = [
        ...parse("components"),
        ...parse("lib"),
        ...parse("pages"),
    ]

    const out = {};

    keys.forEach(key => {
        if (!lst.includes(key)) {
            console.log("Unused translation:", key);
        }
    })

    lst.forEach(str => {
        if (!keys.includes(str)) {
            out[str] = {
                    en: str,
                    fu: str,
            }
        }
    });

    console.log("Missing translations:");
    console.log(JSON.stringify(out, null, 2));
}

function parse(filename) {
    const st = fs.statSync(filename)
    if (st.isDirectory()) {
        let lst = []
        const files = fs.readdirSync(filename)
        files.forEach(f => {lst = lst.concat(...parse(filename + "/" + f))})
        return lst
    }
    // check if filename is a .js file
    if (!filename.endsWith(".js") && !filename.endsWith(".jsx") && !filename.endsWith(".ts") && !filename.endsWith(".tsx")) {
        return []
    }
    console.log("Parsing", filename)

    const fileContents = fs.readFileSync(filename, 'utf8')
    const stringRegex = /_\("([^"]+)"(\)|,)/g
    let match;
    const stringList = []
    while ((match = stringRegex.exec(fileContents)) !== null) {
      stringList.push(match[1]);
    }
    return stringList;
}