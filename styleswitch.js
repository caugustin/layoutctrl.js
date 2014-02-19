/* styleswitch.js
   ====
   Christian Augustin
   2014-02-19

   Based on AlternateStyleSheets and styleswitcher.js.

   Experimental implementation.

*/

(function(){

    if (!document.querySelectorAll) return;

    function enableAlternateStyleSheet(title) {
        forEach(getElements(document, 'link[rel~="stylesheet"]'), function(l){
            if (l.rel.match(/alternat/) && l.title) {
                l.disabled = true; // Necessary to trigger browser!
                l.disabled = !(l.title == title);
            }
        });
        return false;
    }
    this.enableAlternateStyleSheet = enableAlternateStyleSheet;

    function getEnabledStyleSheet() {
        var enabled = '';
        forEach(getElements(document, 'link[rel~="stylesheet"]'), function(l){
            if (l.rel.match(/alternat/) && l.title && !l.disabled) {
                enabled = l.title;
            }
        });
        return enabled;
    }
    function createCookie(name,value,days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }
        else expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
    }
    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    ready(function(){
        if (!document.documentElement) return;
        addClass(document.documentElement, 'styleswitch');
        //enableAlternateStyleSheet(readCookie('style') || '');
    });
    addEvent(window, 'unload', function(){
        createCookie('style', getEnabledStyleSheet() || '-none-', 365);
    });

    enableAlternateStyleSheet(readCookie('style') || '');



    /* ------------------------------------------- 
       Utility functions ...
    */
    
    // General utilities:
    function forEach(l, f) { for (i = 0; i < l.length; i++) f(l[i], i) }
    function trim(s) { return s.replace(/^\s+|\s+$/g, '') }

    // Browser utilities:
    function noSVG() {
        return !document.implementation.hasFeature(
        'http://www.w3.org/TR/SVG11/feature#Image', '1.1')
    }
    function getScroll() {
        var de = document.documentElement, db = document.body, s = self;
        if (s.pageXOffset != null)
            return { x: s.pageXOffset, y: s.pageYOffset }; 
        if (de && de.scrollLeft != null)
            return { x: de.scrollLeft, y: de.scrollTop };
        if (db && db.scrollLeft != null)
            return { x: db.scrollLeft, y: db.scrollTop };
        return { x: 0, y: 0 };
    }
    function ready(fn) {
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', fn, false);
        }
        else if (document.attachEvent) {
            document.attachEvent('onreadystatechange', function(){
                if (document.readyState.match(/loaded|complete/)) fn();
            });
        }
    }
    var supports = (function() {
        var s = document.createElement('div').style,
            v = 'Khtml Ms O Moz Webkit'.split(' ');
        return function(p) {
            if (p in s) return true;
            p = p.replace(/^[a-z]/, function(c){return c.toUpperCase()});
            var l = v.length;
            while(l--) { if (v[l] + p in s) return true; }
            return false;
        };
    })();
    function getVisibleArea() {
        var html = document.documentElement;
        return { w: html.clientWidth || 0, h: html.clientHeight || 0 }
    }
    
    // Class string operations:
    function classNameHas(s, c) {
        return new RegExp('(^|\\b)' + c + '(\\b|$)').test(s);
    }
    function classNameAdd(s, c) {
        if (classNameHas(s, c)) return s;
        return (s) ? s + ' ' + c : c;
    }
    function classNameReplace(s, a, b) {
        return s.replace(
            new RegExp('(^|\\s+)' + a + '(\\s+|$)', 'g'),
            function(m, pe1, pe2){
                return ((b && pe1) ? ' ' : '') + b + ((b && pe2) ? ' ' : '')
            } 
        );
    }

    // Element operations:
    function create(n, c) {
        var e = document.createElement(n);
        if (c) e.className = c;
        return e;
    }
    function hide(e) { e.style.display = 'none'; return e; }
    function show(e) { e.style.display = ''; return e; }
    function append(p, e) { return p.appendChild(e) }
    function prepend(p, e) { return p.insertBefore(e, p.firstChild) }
    function parent(e) { return e.parentNode }
    function remove(e) { return e.parentNode.removeChild(e) }
    function getElements(e, sel) { return e.querySelectorAll(sel) }
    function addEvent(e, evt, fn) {
        if (e.addEventListener) e.addEventListener(evt, fn, false)
        else e.attachEvent('on'+evt, fn);
        return e;
    }
    function removeEvent(e, evt, fn) {
        if (e.removeEventListener) e.removeEventListener(evt, fn, false)
        else e.detachEvent('on'+evt, fn);
        return e;
    }
    function getAttr(e, attr) { return e[attr] }
    function setAttr(e, attr, val) {
        e[attr] = val;
        return e;
    }
    function setStyle(e, prop, val) {
        e.style[prop] = val;
        return e;
    }
    function getStyle(e, prop) { return e[prop] }
    function getComputedStyle(e, prop) {
        var s = e.currentStyle || window.getComputedStyle(e, null);
        return s[prop];
    }

    // Class operations:
    function hasClass(e, c) { return classNameHas(e.className, c) }
    function addClass(e, c) {
        if (!hasClass(e, c)) e.className += (e.className) ? ' ' + c : c;
        return e;
    }
    function replaceClass(e, o, n) {
        if (hasClass(e, o)) e.className = classNameReplace(e.className, o, n);
        return e;
    }
    function removeClass(e, c) {
        return replaceClass(e, c, '');
    }



}).call(this)




