import './sass/app.scss';
import axios from 'axios';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

window.onload = () => {
    // headers
    document.querySelector('#add-header').onclick = () => {
        let data = `<div class="row mb-2">
                        <div class="col-4">
                            <input type="text" class="form-control key" placeholder="Header..." value="">
                        </div>
                        <div class="col-7">
                            <input type="text" class="form-control value" placeholder="Value..." value="">
                        </div>
                        <div class="col-1 d-flex">
                        <i class="btn-remove material-icons">delete</i>
                        </div>
                    </div>`;

        document.querySelector('#headers').insertAdjacentHTML('beforeend', data);
    };

    document.querySelector('#clear-headers').onclick = () => {
        document.querySelector('#headers').html('');
    };

    // body
    document.querySelector('#add-body').onclick = () => {

        let timestamp = new Date().getTime();

        let data = `<div class="row mb-2">
                        <div class="col-4">
                            <input type="text" class="form-control key" placeholder="Key..." value="">
                        </div>
                        <div class="col-5">
                            <input type="text" class="form-control value" placeholder="Value..." value="">
                        </div>
                        <div class="col-3 d-flex">
                            <div class="form-check mb-0 pt-2">
                                <input type="checkbox" class="form-check-input optional" id="${timestamp}">
                                <label class="form-check-label" for="${timestamp}">optional</label>
                            </div>
                            <i class="btn-remove material-icons">delete</i>
                        </div>
                    </div>`;

        document.querySelector('#body').insertAdjacentHTML('beforeend', data);
    };

    document.querySelector('#add-file').onclick = () => {

        let timestamp = new Date().getTime();

        let data = `<div class="row mb-2">
                        <div class="col-4">
                            <input type="text" class="form-control key" placeholder="Name..." value="">
                        </div>
                        <div class="col-5">
                            <input type="file" multiple class="form-control value" placeholder="Value..." value="">
                        </div>
                        <div class="col-3 d-flex">
                            <div class="form-check mb-0 pt-2">
                                <input type="checkbox" class="form-check-input optional" id="${timestamp}">
                                <label class="form-check-label" for="${timestamp}">optional</label>
                            </div>
                            <i class="btn-remove material-icons">delete</i>
                        </div>
                    </div>`;
        document.querySelector('#body').insertAdjacentHTML('beforeend', data);
    };

    document.querySelector('#clear-body').onclick = () => {
        document.querySelector('#body').innerHTML = '';
    };

    // remove items
    document.addEventListener('click', function(e){
        if(e.target.classList.contains('btn-remove')){
            e.target
            .parentNode
            .parentNode
            .remove();
        }
    });

    // html
    document.querySelector('#copy-html').onclick = () => {
        let value = document.querySelector('#result').innerHTML;
        copyToClipboard(value);
    };

    // markdown
    let _markdown = "";

    let md = MarkdownIt({
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return '<pre class="hljs"><code>' +
                        hljs.highlight(lang, str, true).value +
                        '</code></pre>';
                } catch (__) {
                }
            }
            return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
        }
    });

    function data2Markdown() {

        let data = getData();

        let md = "- **Path:**";
        md += "\\\n`" + data.method + "` " + data.url;

        if (data.description.length) {
            md += "\n- **Description:**";
            md += "\\\n" + data.description;
        }

        if (isNotEmpty(data.headers)) {
            md += "\n- **Headers:**";
            Object.keys(data.headers).forEach(function (key) {
                md += "\\\n`" + key + "=" + data.headers[key] + "`";
            });
        }

        if (isNotEmpty(data.required) || isNotEmpty(data.optional)) {
            md += "\n- **Params:**";
            if (isNotEmpty(data.required)) {
                md += "\\\n**Required:**";
                Object.keys(data.required).forEach(function (key) {
                    let item = data.required[key];
                    if (item instanceof FileList) {
                        md += "\\\n`" + key + "=[binary]`";
                    } else {
                        md += "\\\n`" + key + "=" + typeof item + "`";
                    }
                });
            }

            if (isNotEmpty(data.optional)) {
                md += "\\\n**Optional:**";
                Object.keys(data.optional).forEach(function (key) {
                    let item = data.optional[key];
                    if (item instanceof FileList) {
                        md += "\\\n`" + key + "=[binary]`";
                    } else {
                        md += "\\\n`" + key + "=" + typeof item + "`";
                    }
                });
            }
        }

        return md;
    }

    document.querySelector('#copy-md').onclick = () => {
        copyToClipboard(_markdown);
    };

    // render
    document.querySelector('#btn-render').onclick = () => {
        let data = data2Markdown();
        _markdown = data;
        let result = md.render(data);
        document.querySelector('#result').innerHTML = result;
    };

    //test
    function getData(baseURL = '') {
        let data = {
            method: document.querySelector('#method').value,
            url: baseURL + document.querySelector('#path').value,
            headers: {},
            required: {},
            optional: {},
            description: document.querySelector('#description').value,
        };

        Array.from(document.querySelectorAll('#headers .row'))
            .forEach(elem => {
                let key = elem.querySelector('.key').value;
                let value = elem.querySelector('.value').value;
                data.headers[key] = value;
            })

        Array.from(document.querySelectorAll('#body .row'))
        .forEach(elem => {
            let key = elem.querySelector('.key').value;
            let input = elem.querySelector('.value').value;
            let field = elem.querySelector('.optional').checked ? 'optional' : 'required';
            if (input.type === 'file') {
                let files = input.files;
                if (files.length > 1 && !key.includes('[]')) {
                    key += "[]";
                }
                data[field][key] = files;
            } else {
                data[field][key] = input.value;
            }
        })

        return data;
    }

    document.querySelector('#btn-test').onclick = function () {
        let data = getData('https://jeancastro.free.beeceptor.com');
        let fd = new FormData();
        let params = { ...data.required, ...data.optional };

        Object.keys(params).map(function (key) {
            let value = params[key];
            if (value instanceof FileList) {
                Array.from(value).map(function (file) {
                    fd.append(key, file)
                });
            } else {
                fd.set(key, value);
            }
        });

        if (data.method === "GET") {
            let queryString = new URLSearchParams(fd).toString();
            data.url += queryString ? "?" + queryString : '';
            fd = {};
        }

        axios({
            method: data.method,
            url: data.url,
            headers: data.headers,
            data: fd,
        }).then(response => {
            console.log(response)
            let data = data2Markdown();
            data += "\n- **Response:** " + response.status + " " + response.statusText + "\n   ```json";
            let json = JSON.stringify(response.data, null, 2);
            json.split("\n").forEach(function (value) {
                data += "\n    " + value;
            });
            data += "\n    ```";
            _markdown = data;
            let result = md.render(data);
            document.querySelector('#result').innerHTML = result;
        }).catch(error => {
            console.log(error);
        });
    };

    // helpers
    function copyToClipboard(text) {
        let textarea = document.createElement("textarea");
        textarea.textContent = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }

    function isNotEmpty(obj) {
        return Object.keys(obj ? obj : {}).length > 0;
    }
};