/*
	layoutctrl.js
	
	v2.00alpha06, caugustin.de, 2013-07-25

	Purpose
	- set cssClasses on the html element reflecting browser characteristics
	- set cssClasses on body element to be changed with ctrl+alt+g u. +a
	- optionally set a randomClass on the html element
	- preload images
	
	ToDo
	! Opera Presto engine signalling.
	. Cancel use of Modernizr - too much problems, reduce external dependencies other than MT.
	- Use MooTools to simplify code (especially addClass etc.). [No dependencies!]
	- Consider MSIE6 multiple class bug (.one.two.three applies to all .three). [No MSIE6 specific freatures from now on!]

	History
	2013-07-25 caugustin.de: Extended layoutctrl.css, IE bugfix.
	2013-07-23 caugustin.de: show-annotations added.
	2013-07-12 caugustin.de: hideAnnotations -> hide-annotations etc.
	2013-07-12 caugustin.de: showLayout -> show-layout.
	2013-07-12 caugustin.de: No width and height classes anymore!
	2013-07-12 caugustin.de: Modernizing ...
	2012-01-02 caugustin.de: Config to caLayoutCtrl.
	2011-12-02 caugustin.de: Reporting isMsieBackCompat/CSS1Compat too.
	2011-11-26 caugustin.de: Reporting isTridentX (5, 7, 8, 9 ...) with MSIE.
	2011-05-04 caugustin.de: Added .jsPrint.
	2011-04-28 caugustin.de: Using WebLayout namespace and wl-config.js.
	2011-04-12 caugustin.de: Changed noBeforeAfterPos to contentposition/no-contentposition.
	2011-04-12 caugustin.de: Changed boxShadow/noBoxShadow to boxshadow/no-boxshadow.
	2011-04-12 caugustin.de: Started v2.00alpha01.
	2011-04-11 caugustin.de: Signalling JavaScript support with "js".
	2010-03-07 caugustin.de: Beginning to use Modernizr ("contentposition").
	2010-02-23 caugustin.de: boxShadow and noBoxShadow added.
	2010-02-19 caugustin.de: Renamed isCairoGeckoMac to isMacCairoGecko.
	2010-02-19 caugustin.de: isNotCairoGecko added.
	2009-11-09 caugustin.de: preloadImgs added.
	2009-08-06 caugustin.de: noBeforeAfterPos added for Geckos before 1.9.1.
	2009-07-02 caugustin.de: Firebug JS warnings with window.opera fixed.
	2009-07-02 caugustin.de: MSIE 6 abbr bug fix added.
	2009-04-19 caugustin.de: isNotMsie added.
	2009-03-29 caugustin.de: randomClasses added (initial, simple version).
	2009-03-22 caugustin.de: CTRL+ALT+G added to show grid (Opera, Google Chrome).
	2009-02-03 caugustin.de: Initial setup and complete rewrite.

	This is a rewrite of an old layoutctrl.js and the newer browserctrl.js
	as a singleton (with only the config data in the global namespace).
	
	Technical Note: Dynamic global CSS classes should be applied to the
	body element, because MSIE 6 doesn't like that at the html element
	(changes are ignored sometimes).

*/


/* Try to enable MSIE 6 SP 1 background image caching       */
/* http://www.mister-pixel.com/, also found in MooTools ... */
if (!window.XMLHttpRequest && window.ActiveXObject) {
	try {document.execCommand("BackgroundImageCache", false, true);}
	catch (e){};
}

/* Fix MSIE 6 abbr bug ... */
if (/*@cc_on!@*/false && !window.XMLHttpRequest && document.createElement) {
	document.createElement('abbr');
}

(function(){

	this.caLayoutCtrl = this.caLayoutCtrl || {};

	var config = {
		hideAnnotations: false,
		bodyClasses:     [ 'show-layout' ],
		randomClasses:   [],
		preloadImgs:     []
	};

	if (caLayoutCtrl && caLayoutCtrl.config) {
		for (var n in caLayoutCtrl.config) {
			if (typeof caLayoutCtrl.config[n] != 'undefined') {
				config[n] = caLayoutCtrl.config[n];
			}
		}
	}
	
	
	
	// Functions for CSS class manipulation ...
	
	function hasClass(e, c) {
		if (!e || !c) return false;
		return (e.className || '').match(new RegExp('(^|\\s)' + c + '(\\s|$)')) ? true : false;
	};

	function replaceClass(e, c, r) {
		if (!e || c == r) return;
		c = c ? new RegExp('(^|\\s)' + c + '(\\s|$)') : '';
		r = r && !hasClass(e, r) ? r : '';
		if (!c && !r) return;
		var ec = e.className || '';		
		if (c) {
			r = r ? '$1' + r + '$2' : '$2';
			e.className = ec.replace(c, r);
		}
		else if (r) {
			e.className = ec ? ec + ' ' + r : r;
		}
		return;
	};
	
	function addClass(e, c) {
		if (!e || !c || hasClass(e, c)) return;
		replaceClass(e, '', c);
	};
	
	function removeClass(e, c) {
		if (!e || !c || !hasClass(e, c)) return;
		replaceClass(e, c, '');
	};
	


	// Detect box-shadow and opacity support ...

	function hasBoxShadow() {
		var html = document.documentElement;
		var body = document.body;
		return	(html && html.style &&
					(
						html.style.boxShadow !== undefined
						|| html.style.WebkitBoxShadow !== undefined
						|| html.style.KhtmlBoxShadow !== undefined
						|| html.style.MozBoxShadow !== undefined
						|| html.style.MsBoxShadow !== undefined
						|| html.style.OBoxShadow !== undefined
					)
				) || (body && body.style &&
					(
						body.style.boxShadow !== undefined
						|| body.style.WebkitBoxShadow !== undefined
						|| body.style.KhtmlBoxShadow !== undefined
						|| body.style.MozBoxShadow !== undefined
						|| body.style.MsBoxShadow !== undefined
						|| body.style.OBoxShadow !== undefined
					)
				) || false
				;

	};
	
	function hasOpacity() {
		var html = document.documentElement;
		var body = document.body;
		return	(html && html.style &&
					(
						html.style.opacity !== undefined
						|| html.style.WebkitOpacity !== undefined
						|| html.style.KhtmlOpacity !== undefined
						|| html.style.MozOpacity !== undefined
						|| html.style.MsOpacity !== undefined
						|| html.style.OOpacity !== undefined
					)
				) || (body && body.style &&
					(
						body.style.opacity !== undefined
						|| body.style.WebkitOpacity !== undefined
						|| body.style.KhtmlOpacity !== undefined
						|| body.style.MozOpacity !== undefined
						|| body.style.MsOpacity !== undefined
						|| body.style.OOpacity !== undefined
					)
				) || false
				;

	};
	
	
	
	// Set browser CSSclasses ...
	
	var ua = navigator.userAgent;
	var c = (document.all && !window.opera) ? 'is-ie'
	      : (ua.match('Gecko/'))            ? 'is-gecko'
	      : (ua.match('WebKit/'))           ? 'is-webkit'
	      : (ua.match('Blink/'))            ? 'is-blink'
	      : (window.opera)                  ? 'is-opera'
	      : (document.childNodes && !document.all && !navigator.taintEnabled)
	                                        ? 'is-khtml'
	      :                                   'is-unknown'
	;
	var os = ua.match(/Macintosh|Windows|Linux|iOS|Android/);
	os = (os) ? os[0].substring(0,3) : '';
	c += os ? (c ? ' ' + c + os + ' ' : '') + 'is' + os : '';
	/* Gecko 1.9 uses Cairo, and one should know it ... */
	if (c.match('is-gecko')) {
		if (ua.match(/rv:(0\.|1\.[0-8])/)) {
			c += ' is-not-cairo-gecko';
		} else {
			c += ' is-cairo-gecko';
		}
	};
	/* FF3/Mac with Cairo behaves more like a PC browser ... */
	if (os == 'Mac') {
		if (c.match('isCairoGecko')) {
			c += ' isMacCairoGecko';
		} else {
			c += ' isMacNotCairoGecko';
		};
	};
	/* Sometimes we want to know if it is NOT an MSIE ... */
	if (! c.match('is-ie')) {
		c += ' not-ie';
	};
	/* MSIE compatibility mode: isTrident5 isMsieBackCompat/CSS1Compat etc. */
	if (document.all && !window.opera) {
	   if (document.documentMode) { // IE8+
		  c += ' isTrident' + document.documentMode;
		  c += ' isMsie' + ((document.documentMode > 5) ? 'CSS1Compat' : 'BackCompat');
	   } else { // IE 5-7
		  if (document.compatMode && document.compatMode == "CSS1Compat") {
			c += ' isTrident7 isMsieCSS1Compat'; // standards mode
		  } else {
		  	c += ' isTrident5 isMsieBackCompat'; // quirks mode
		  }
	   }
	};
	if (window.print) {
		c+= ' jsprint';
	}
	else {
		c+= ' no-jsprint'
	};
	// Add hideAnnotations ...
	if (config.hideAnnotations) c += ' hide-annotations';
	// Initialize classList of documentElement ...
	if (document.documentElement && !hasClass(document.documentElement, c)) {
		addClass(document.documentElement, c);
	};

	var ac = '';
	// Check for box-shadow and opacity support ...
	ac += hasBoxShadow() ? ' boxshadow' : ' no-boxshadow';
	ac += hasOpacity() ? ' opacity' : ' no-opacity';
	// Gecko before 1.9.1 can't handle position on :before and :after
	if (c.match('isGecko') 
		&&	(
				ua.match(/rv:(0\.|1\.[0-8])/)
				|| ua.match(/rv:1\.9([^.]|\.0)/)
			)
		) {
		ac += ' no-contentposition';
	} else {
		ac += ' contentposition';
	};
	
	// Apply additional classes ...
	if (document.documentElement) {
		addClass(document.documentElement, ac);
		replaceClass(document.documentElement, 'no-js', 'js');
	};
		
	
	// Cycle body classes ... 
	
	function cycleBodyClasses() {
		var b = document.body;
		if (!b) return;
		var classes = config.bodyClasses;
		var found = -1;
		for (var i = 0; i < classes.length; i++) {
			if (hasClass(b, classes[i])) {
				found = i;
			}
		}
		var c = found > -1  ? classes[found] : '';
		var r = found == -1                 ? classes[0]
			  : found != classes.length - 1 ? classes[found + 1]
			  :                               ''
			  ;
		replaceClass(b, c, r);
		return;
	};
	
	function toggleHideAnnotations() {
		var e = document.documentElement;
		if (!e) return;
		var b = document.body;
		if (b && hasClass(b, 'hide-annotations') || hasClass(e, 'hide-annotations')) {
			b && removeClass(b, 'hide-annotations');
			removeClass(e, 'hide-annotations');
			addClass(b || e, 'show-annotations');
		}
		else {
			removeClass(b || e, 'show-annotations');
			addClass(b || e, 'hide-annotations');
		}	
	};
	
	function keyHandler(e) {
		e = (e) ? e : ((event) ? event : null);
		if (!e) return false;
		if (e.type == 'keydown')
		if (e.type == 'keydown' && (e.altKey && e.ctrlKey)) {
			if (e.keyCode == 71) {
				cycleBodyClasses();
			}
			else if (e.keyCode == 65) {
				toggleHideAnnotations();
			}
			e.cancelBubble = true;
			return false;
		}
		return true;
	};
	
	if (document.addEventListener) {
		document.addEventListener('keydown', keyHandler, false);
	}
	else if (document.attachEvent) {
		document.attachEvent('onkeydown', keyHandler);
	}

	function insertButtons() {
		var b = document.body;
		if (!b || !b.appendChild) return;
		var slButton = b.appendChild(document.createElement('a'));
		slButton.className = 'layoutctrl-sl';
		var haButton = b.appendChild(document.createElement('a'));
		haButton.className = 'layoutctrl-ha';
		if (slButton.addEventListener) {
			slButton.addEventListener('click', cycleBodyClasses, true);
			haButton.addEventListener('click', toggleHideAnnotations, true);
		}
		else if (slButton.attachEvent) {
			slButton.attachEvent('onclick', cycleBodyClasses);
			haButton.attachEvent('onclick', toggleHideAnnotations);
		}
	}

	if (window.addEventListener) {
		window.addEventListener('load', insertButtons, false);
	}
	else if (window.attachEvent) {
		window.attachEvent('onload', insertButtons);
	}
	
	// Random CSS class ...
	
	function getRandomClass() {
		if (!config.randomClasses.length) return '';
		var rand = Math.floor(
			Math.random()
			* (config.randomClasses.length - 0.001)
		);
		return config.randomClasses[rand];
	};

	if (config.randomClasses.length) {
		var randClass = getRandomClass();
		if (document.documentElement && !hasClass(document.documentElement, randClass)) {
			addClass(document.documentElement, randClass);
		}
	}	
	
	
	
	// Preload images ...
	
	if (config.preloadImgs.length) {

		var configPath = '';
		var scripts = document.getElementsByTagName('script');
		for (var i=0; i<scripts.length; i++) {
			var src = scripts[i].src;
			if (src && src.match('layoutctrl.js')) {
				configPath = src.replace('layoutctrl.js', '');
				break;
			}
		}

		var preloadedImgs = [];
		for (var i=0; i<config.preloadImgs.length; i++) {
			preloadedImgs[i] = new Image();
			preloadedImgs[i].src = configPath + config.preloadImgs[i];
		}
	
	
	}



}).call(this);
