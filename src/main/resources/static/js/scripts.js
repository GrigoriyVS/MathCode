window.onload=function(){
    CodeArea.enableCode("cpp")
}


class Cursor {
    static lastOffset;

    static saveCursorPosition(keyEvent) {
        var selection = window.getSelection(),
            charCount = -1,
            node;

        if (selection.focusNode) {
            if (Cursor._isChildOf(selection.focusNode, codeArea)) {
                node = selection.focusNode;
                charCount = selection.focusOffset;

                while (node) {
                    if (node === codeArea) {
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
        CodeArea.checkKeys(keyEvent)
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
    static _moveCursor(value){
        Cursor.lastOffset += value
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

class CodeArea{
    static _codeArea;
    static _enableTabKey;
    static _hasNextSibling() {
        return window.getSelection().focusNode.nextSibling
    }
    static _isLastCharacterOnNode() {
        let selection = window.getSelection();
        console.clear()
        console.log(selection.focusOffset)
        console.log(selection.focusNode.textContent.length)
        return selection.focusOffset==selection.focusNode.textContent.length
    }

    static enableTabKey() {
        CodeArea._enableTabKey = true;
        window.onkeydown=function(keyEvent){
            if(keyEvent.code == "Tab") //перехватываем tab от гнусного браузера
                return false
        }
    }
    static disableTabKey() {
        CodeArea._enableTabKey = false;
        window.onkeydown=function(){ }
    }
    static _checkTab(keyEvent) {
        if(keyEvent.key === "Tab" && CodeArea._enableTabKey){
            let selection = window.getSelection()
            let node = selection.focusNode;
            let charCount = selection.focusOffset;
            node.textContent = CodeArea._insert(node.textContent,"\t",charCount)
            Cursor._moveCursor(1)
        }
    }
    static _insert(str, substr, pos) {
        var array = str.split('');
        array.splice(pos, 0, substr);
        return array.join('');
    }
    static _checkEnter(keyEvent) {
        if(keyEvent.key === "Enter"){
            let replaceString="\n"
            if(!CodeArea._hasNextSibling()){//если последний Sibling
                if(CodeArea._isLastCharacterOnNode()){//если курсор в конце
                    replaceString+="\n";
                }
            }
            CodeArea._codeArea.innerHTML= CodeArea._codeArea.innerHTML.replace("<div>", replaceString)
            CodeArea._codeArea.innerHTML= CodeArea._codeArea.innerHTML.replace("</div>", "")
            Cursor._moveCursor(1)
        }
    }
    static checkKeys(keyEvent){
        CodeArea._checkEnter(keyEvent)
        CodeArea._checkTab(keyEvent)
    }

    static enableHighlight(){
        hljs.highlightAll();
        window.onkeyup=function(keyEvent){
            CodeArea.enableTabKey()

            Cursor.saveCursorPosition(keyEvent);
            hljs.highlightAll();
            Cursor.setLastCursorPosition(CodeArea._codeArea);

            console.clear();
        }
    }
    static enableCode(typeCode){
        CodeArea._codeArea = document.getElementById("codeArea");
        CodeArea._setAttributes(typeCode)
        CodeArea.enableHighlight();
        console.clear();
    }
    static _setAttributes(typeCode){
        CodeArea._codeArea.setAttribute("contenteditable", "");
        CodeArea._codeArea.setAttribute("spellcheck", "false");
        CodeArea._codeArea.setAttribute("class", typeCode);
    }
}