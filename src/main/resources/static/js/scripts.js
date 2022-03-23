const HL_RULES = [
    { cl: 'str',  re: /("[^"]+")/ },
    { cl: 'optr', re: /^(var|let|for|in|of|function|function*|const|do|while|break|continue|if|else|switch|case|default|try|catch|throw|delete|void|yield|yield*|return)$/ },
    { cl: 'cnst', re: /(\d+)/ },
    { cl: 'brcs', re: /({|})/ }
];
///(?<=[=|\s])\d+(?=[;|\s])|\d+$/g

let codeAreas_HTMLCollection = null;
let codeAreas = [];
let btn = null;
window.onload=function(){
    codeAreas_HTMLCollection = document.getElementsByClassName("codearea");
    btn = document.getElementById('hl');
    for (var codeArea of codeAreas_HTMLCollection){
        codeArea.addEventListener('keyup', timeToColor);
        codeAreas.push(codeArea)
    }
    timeToColor()
}
function timeToColor(e) {
    console.clear()
    alertNum("timeToColor")
    for(let i = 0; i<codeAreas.length; i++) {
        simpleHighlighter(getCodeArea({index:i}));
    }
    alertNum("timeToColor END")
}

function getCodeArea({findActive = false, index = -1} = {}){

    if (!findActive && index <0) {//ошибка
        alertNum("invalidArgumentException: Если не указан поиск активной области, то должен быть указан корректный индекс.")
        return
    }
    for (var codeArea of codeAreas){
        if (findActive && document.activeElement == codeArea||//активная область
            !findActive && codeAreas.indexOf(codeArea) == index) {//по индексу
            return codeArea;
        }
    }
    return undefined;
}


let isEnterBt = false
let flag = "_$_"
function setFlag(el){
    alertNum("setFlag<"+el.textContent+">")
    el.innerHTML= el.innerHTML.replace("<div>", "\n"+flag)
    el.innerHTML= el.innerHTML.replace("</div>", "")
    alertNum("!setFlag<"+el.textContent+">")
}
function removeFlag(params){

    params.position = params.parent.textContent.indexOf(flag)
    //params.parent.textContent = params.parent.textContent.replace(flag,"")
    let child = params.parent.firstChild
    while(child.textContent.indexOf(flag)==-1){
        params.position -= child.textContent.length
        child = child.nextSibling
        alertNum(child.textContent)
    }
    child.textContent=child.textContent.replace(flag,"")
    alertNum("newChild<"+child.textContent+">")
    alertNum("newPosition="+params.position)
    document.getSelection().collapse(child, params.position)
    alertNum(parent.textContent)
}
function simpleHighlighter(el) {
    alertNum("simpleHighlighter")
    alertNum("REPLASE DIV")
    alertNum(el)
    alertNum(el.innerHTML)
    //предпологается что тег <div> появляется только
    // при нажатии Enter
    if(el.innerHTML.indexOf("<div>")!=-1){
        alertNum("Найдена клавиша Enter!")
        setFlag(el)
        isEnterBt = true;
    }

    alertNum(el.innerHTML)
    alertNum("REPLASE DIV2")

    if (el instanceof Event)
        el = this;
    // если эту функцию назначать обработчиком input, то тут должен быть код сохранения позиции каретки...
    let words = textToArray(el),
        html  = '',
        rule;
    words.forEach(word => {
        if (rule = getHlRuleFor(word))
            html += `<span class="${rule.cl}">${rule.m}</span>`;
        else
            html += word;
    });

    innerHTML_replaceWithSaveCursor(el, el.innerHTML, html)
    alertNum("UP parent = <"+el.innerHTML+">")
    alertNum("SUCCESS")
    // ..., а тут - код установки каретки обратно на сохраненную позицию
}

function innerHTML_replaceWithSaveCursor(elem, searchValue, replaceValue) {
    let offset = 0;
    if (!!getCodeArea({findActive: true})) {//существует активное окно
        //offset = getCursorPosition(elem);
        Cursor.saveCursorPosition(elem);
    }

    alertNum("CursorPosition = " + offset)
    elem.innerHTML = elem.innerHTML.replace(searchValue, replaceValue)

    if (!!getCodeArea({findActive: true})){//существует активное окно
        //setCursorPosition(elem, offset)
        Cursor.setLastCursorPosition(elem);
    }
}
function getCursorPosition(parent) {
    let selection = document.getSelection()
    let range = new Range
    range.setStart(parent, 0)
    range.setEnd(selection.anchorNode, selection.anchorOffset)
    return range.toString().length
}
function setCursorPosition(parent, position) {
    alertNum("setCursorPosition")
    alertNum("pos = "+ position)
    let child = parent.firstChild

    if(isEnterBt){
        alertNum("WWWWWWWWWWWWWWWWWWWWWWWWWWW")
        alertNum("parent = <"+getCodeArea({findActive:true}).textContent+">")
        alertNum("child = <"+child.textContent+">")
        var params={
            parent:parent,
            position:position
        }
        removeFlag(params)//передача по ссылке
        parent = params.parent
        position = params.position
        alertNum("УДАЛИЛИ")
        alertNum("parent = <"+getCodeArea({findActive:true}).textContent+">")
        alertNum("child = <"+child.textContent+">")
        alertNum("child length = "+child.textContent.length)
        alertNum("parent length = "+parent.textContent.length)
        alertNum("position = "+position)

        isEnterBt=false
    }
    else {
        let counter = 0
        while (position > 0) {

            let length = child.textContent.length
            alertNum("l=" + length + "\np=" + position)
            if (position > length) {
                alertNum("position > length")
                position -= length
                alertNum("prev=" + child)
                child = child.nextSibling
                alertNum("next=" + child)
                alertNum("nextSib")
            } else {
                counter += 1
                if (counter > 3) return
                alertNum("position < length")
                alertNum("nodeType="+child.nodeType)
                //if (child.nodeType == 3) {
                alertNum("!child=<" + child.toString()+">")
                alertNum(child)
                    document.getSelection().collapse(child, position)
                    return
                //}
                alertNum("child=<" + child+">")
                //alert(child.textContent)
                child = parent.firstChild
                alertNum("child=" + child)
            }
        }
    }
    alertNum("setCursorPosition END")
}

function textToArray(el) {
    alertNum("textToArray")
    alertNum("textContent="+el.textContent)
    const RE = /(^|\(+?|[^\w]+?)((?:"[^"]*")|(?:[{}\w]+))(\)+?[\S]+?)?/gmi;   // эта регулярка весьма далека от совершенства :)
    let result = [],
        match, i;
    while (match = RE.exec(el.textContent)) {
        for (i = 1; i < match.length; i++) {
            if (match[i]){
                result.push(match[i]);
                alertNum("<"+match[i]+">")
            }
        }
    }
    alertNum("textToArray END")
    return result;
}

function getHlRuleFor(word) {
    alertNum("getHlRuleFor")
    alertNum("<"+word+">")
    let rule, mr;

    try {
        if (rule = HL_RULES.find(r => mr = word.match(r.re)))
        if(!!rule){
            rule.m = mr[1];
            alertNum("<"+rule.m+">")
        }
    }catch (exception) {

    }

    alertNum("getHlRuleFor END")
    return rule;
}

function alertNum(num){
    console.log(num)
    //проблемы с записью в конец строки
    //проблема со вторым блоком кода
}


class Cursor {
    static lastOffset;
    static saveCursorPosition(parentElement) {
        var selection = window.getSelection(),
            charCount = -1,
            node;

        if (selection.focusNode) {
            if (Cursor._isChildOf(selection.focusNode, parentElement)) {
                node = selection.focusNode;
                charCount = selection.focusOffset;

                while (node) {
                    if (node === parentElement) {
                        break;
                    }

                    if (node.previousSibling) {
                        node = node.previousSibling;
                        charCount += node.textContent.length;
                    } else {
                        node = node.parentNode;
                        if (node === null) {
                            break;
                        }
                    }
                }
            }
        }

        this.lastOffset = charCount;
    }

    static setLastCursorPosition(element) {
        let chars = this.lastOffset;
        if (chars >= 0) {
            var selection = window.getSelection();

            let range = Cursor._createRange(element, { count: chars });

            if (range) {
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    static _createRange(node, chars, range) {
        if (!range) {
            range = document.createRange()
            range.selectNode(node);
            range.setStart(node, 0);
        }

        if (chars.count === 0) {
            range.setEnd(node, chars.count);
        } else if (node && chars.count >0) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.textContent.length < chars.count) {
                    chars.count -= node.textContent.length;
                } else {
                    range.setEnd(node, chars.count);
                    chars.count = 0;
                }
            } else {
                for (var lp = 0; lp < node.childNodes.length; lp++) {
                    range = Cursor._createRange(node.childNodes[lp], chars, range);

                    if (chars.count === 0) {
                        break;
                    }
                }
            }
        }

        return range;
    }

    static _isChildOf(node, parentElement) {
        while (node !== null) {
            if (node === parentElement) {
                return true;
            }
            node = node.parentNode;
        }

        return false;
    }
}