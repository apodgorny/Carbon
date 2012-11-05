/**
 * Url utility makes easy: 
 *
 * 	1) assembling/disassembling url. 
 * 	2) altering url parameters 
 * 	3) doing ajax requests. 
 * 	4) doing redirects
 * 
 * @author Lex Podgorny <lex.podgorny@hp.com>
 */

enyo.Url = function(sUrl) {
	return new enyo.Url.engine(sUrl);
};

enyo.Url.maxConcurrentRequests = 1;

enyo.Url.serialize = function(o) {
	var a = [],
		sKey;
		
	for (sKey in o) {
		a.push(sKey + '=' + encodeURIComponent(o[sKey]));
	}
	return a.join('&');
}

enyo.Url.unserialize = function(s) {
	var aPairs = s.split('&'), 
		n, 
		o = {},
		a = [];
		
	for (n=0; n<aPairs.length; n++) {
		a = aPairs[n].split('=');
		o[a[0]] = a[1];
	}
	return o;
}

/********************************************************************/

enyo.Url.engine = function(sUrl) {
	var _oThis	 	= this;
	var _bRelative	= false;
	var _bLSlash	= false;
	var _bProtocol	= false;
	var _o			= {
		'protocol'	: null,
		'server'	: null,
		'port'		: 80,
		'path'		: [],
		'file'		: null,	
		'params'	: {},
		'hash'		: null
	}
	
	function _init() {
		if (sUrl) {	_fromString(sUrl); }
	}
	
	function _trim(s) {
		return s.replace(/(^[\s\xA0]+|[\s\xA0]+$)/g, '');
	}
	
	function _isDefined(m) {
		return typeof m != 'undefined';
	}
	
	function _fromString(s) {
		var a, a1;
		
		s = _trim(s);
		if (s[0] == '/') {
			_bLSlash = true;
			s = s.substring(1);
		}
		
		// Parse protocol
		a = s.split('://', 2);
		if (a.length > 1) {
			_bProtocol = true;
			_oThis.protocol(a[0]);
			s = a[1];
		}
		
		// Parse hash
		a = s.split('#', 2);
		if (a.length > 1) {
			_oThis.hash(a[1]);
			s = a[0];
		}
		
		// Parse query
		a = s.split('?', 2);
		if (a.length > 1) {
			_o.params = enyo.Url.unserialize(a[1]);
			s = a[0];
		}
		
		// Parse server
		a = s.split('/');
		if (a.length > 1) { /// TODO: account for case like http://google.com
			if (a[0].indexOf('.') > 0 || a[0] == 'localhost') {
				a1 = a[0].split(':');
				_oThis.server(a1[0]);
				_oThis.port(a1[1]);
				a.splice(0, 1);
			}
		} else {
			if (_bProtocol) {
				_oThis.server(a[0]);
			} else {
				_oThis.file(a[0]);
			}
			a.splice(0, 1);
		}
		s = a.join('/');
		
		if (!_o.server) {
			_bRelative = true;
		}
		
		_oThis.path(s);
	}	
	
	function _toString() {
		var sProtocol	= _o.protocol || 'http',
			sServer		= _o.server ? _o.server : '',
			sPort		= (_o.port == '80' || !_o.port ) ? '' : ':' + _o.port,
			sPath		= _oThis.path(),
			sFile		= _o.file ? '/' + _o.file : '',
			sParams 	= enyo.Url.serialize(_o.params),
			sHash		= _o.hash ? '#' + _o.hash : '';
			sParams 	= (sParams.length > 0 ? '?' + sParams : '');
		
		if (_bRelative) {
			return (_bLSlash ? '/' : '') +
				sPath +
				sFile +
				sParams +
				sHash;
		}
		return  sProtocol + '://' + 
			sServer + 
			sPort + '/' + 
			sPath +
			sFile +
			sParams +
			sHash;
	}
	
	this.protocol = function(s) {
		if (s) 	{ 
			s = s.toLowerCase();
			_o.protocol = (s == 'https') 
				? 'https' 
				: 'http';
			return this;
		} 
		return _o.protocol || 'http';
	}
	
	this.server = function(s) {
		if (s) {
			s = s.toLowerCase();
			_o.server = s;
			return this;
		}
		return _o.server || '';
	}
	
	this.port = function(n) {
		if (n) { 
			n = parseInt(n, 10);
			_o.port = n;
			return this;
		} 
		return _o.port;
	}
	
	this.path = function(s) {
		if (s) {
			if (typeof s['join'] != 'undefined') {
				_o.path = s;
			} else {
				s = s.toLowerCase().replace(/^[^a-z0-9_]/, '').replace(/[^a-z0-9_]$/, '');
				var a = s.split('/');
				var sLast = a[a.length-1];
				if (sLast.indexOf('.') != -1) {
					_o.file = sLast;
					a.splice(a.length-1, 1);
				}
				_o.path = a;
			}
			return this;
		}
		return _o.path.join('/');
	}
	
	this.file = function(s) {
		if (s) {
			_o.file = s;
			return this;
		}
		return _o.file;
	}
	
	this.query = function(s) {
		if (s) {
			_o.params = enyo.Url.unserialize(s);
			return this;
		}
		return enyo.Url.serialize(_o.params);
	}
	
	this.param = function(sKey, sValue) {
		if (!sValue) {
			if (!sKey) {
				return _o.params;
			}
			if (typeof sKey == 'object') {
				for (var s in sKey) {
					this.param(s, sKey[s]);
				}
			} else {
				return _o.params[sKey];
			}
		} else {
			_o.params[sKey] = sValue;
		}
		return this;
	}
	
	this.hash = function(s) {
		if (s) {
			_o.hash = s;
			return this;
		}
		return _o.hash || '';
	}
	
	this.url = function(s) {
		if (s) {
			_fromString(s);
			return this;
		}
		return _toString();
	}
	
	this.urlComponents = function(o) {
		if (o) {
			var sKey;
			for (sKey in o) {
				if (typeof _o[sKey] != 'undefined') {
					_o[sKey] = o[sKey];
				}
			}
			return this;
		}
		return _o;
	}
	
	_init();
}

/********************************************************************/ 

enyo.Url.engine._activeRequests = 0;
enyo.Url.engine._queue = [];

enyo.Url.engine._canRequest = function() {
	return (
		enyo.Url.engine._activeRequests <= enyo.Url.maxConcurrentRequests && 
		enyo.Url.engine._queue.length > 0
	);
}

enyo.Url.engine._next = function() {
	while (enyo.Url.engine._canRequest()) {
		var oRequest = enyo.Url.engine._queue.splice(0, 1)[0];
		enyo.Url.engine._ajax(
			oRequest.config, 
			oRequest.callback, 
			oRequest.context
		);
	}
}

enyo.Url.engine._callback = function(fCallback, oContext, oResponse, bSuccess) {
	enyo.Url.engine._activeRequests --
	enyo.Url.engine._next();
	fCallback.apply(oContext, [oResponse, bSuccess]);
}

enyo.Url.engine._ajax = function(oConfig, fCallback, oContext) {
	var oAjax = new enyo.Ajax(oConfig);
	oAjax.response(null, function(oSender, oResponse) {
		enyo.Url.engine._callback(fCallback, oContext, oResponse, true);
	});
	oAjax.error(null, function(oSender, oResponse) {
		enyo.Url.engine._callback(fCallback, oContext, oResponse, false);
	});
	oAjax.go();
	enyo.Url.engine._activeRequests ++;
}

/********************************************************************/

/*
o = {
	method		: 'GET'|'POST',
	handleAs	: 'json'|'text',
	postBody	: "foo=bar&...",
	username	: "",
	password	: "",
	onSuccess	: function() {},
	onError		: function() {},
	context		: this				// object in which context to call callbacks
}
*/
enyo.Url.engine.prototype.ajax = function(o) {
	enyo.Url.engine._queue.push({
		config : {
			url			: this.url(),
			method		: o.method 	 || 'GET',
			handleAs	: o.handleAs || 'json',
			postBody	: o.postBody || '',
			username	: o.username || '',
			password	: o.password || ''
		}, 
		callback : o.onSuccess || function() {}, 
		context	 : o.context
	});
	
	enyo.Url.engine._next();
	
	return this;
}

enyo.Url.engine.prototype.jsonp = function(fCallback, oContext) {
	var fOnError = fOnError || function() { console.debug('Jsonp request failed'); }
	var oJsonp   = new enyo.JsonpRequest({
		url			 : this.url(),
		callbackName : 'callback'
	});
	oJsonp.response(null, function(oSender, oResponse) {
		fCallback.apply(oContext, [oResponse, true]);
	});
	oJsonp.error(null, function(oSender, oResponse) {
		fCallback.apply(oContext, [oResponse, false]);
	});
	oJsonp.go();
	
	return this;
}


enyo.Url.engine.prototype.get = function(fCallback, oContext, sResponseType) {
	return this.ajax({
		method	  : 'GET',
		onSuccess : fCallback,
		context	  : oContext,
		handleAs  : sResponseType
	});
}

enyo.Url.engine.prototype.post = function(oBody, fCallback, oContext, sResponseType) {
	if (typeof oBody == 'object') {
		oBody = enyo.Url.serialize(o);
	}
	return this.ajax({
		method	  : 'POST',
		onSuccess : fCallback,
		context	  : oContext,
		handleAs  : sResponseType,
		postBody  : oBody
	});
}

enyo.Url.engine.prototype.getRedirect = function() {
	window.location.href = this.url();
}

enyo.Url.engine.prototype.postRedirect = function(oBody) {
	var oForm,
		oInput,
	 	sKey;
		
	oForm = document.createElement('form');
	oForm.setAttribute('method', 'post');
	oForm.setAttribute('action', this.url());
	
	for (sKey in oBody) {
		oInput = document.createElement('input');
		oInput.setAttribute('type', 'hidden');
		oInput.setAttribute('name', sKey);
		oInput.setAttribute('value', oBody[sKey]);
		oForm.appendChild(oInput);
	}
	document.getElementsByTagName('body')[0].appendChild(oForm);
	oForm.submit();
}