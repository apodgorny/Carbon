/**	
 *	enyo.Hash utility class. Provides functionality similar to PHP Array(), availing fast access of values by numeric index and/or by string key.
 * 	I.e. var oHash = enyo.Hash().set('foo', 'bar') will set value 'bar' which is available through either oHash.get(0) or oHash('foo')
 *
 *	@author Lex Podgorny 
 */

enyo.Hash = function(o) {
	return new enyo.Hash.engine(o);
}

enyo.Hash.engine = function(o) {
	o = o || {};
	
	var _oThis 	= this;
	var _o 		= {};
	var _a 		= [];
	
	function _set(s, m) {
		if (!_oThis.hasKey(s)) {
			_a.push(s);
			_o[s] = m || null;
			return _a.length - 1;
		}
		return _oThis.getIndex(s);
	}
	
	/************* PUBLIC ***********/
	
	this.fromHash 	= function(o) {
		_o = enyo.clone(o.toObject());
		_a = enyo.cloneArray(o.getKeys());
		return this;
	}
	this.fromObject = function(o) {
		var s;
		_a = [];
		_o = {};
		for (s in o) {
			_set(s, o[s]);
		}
		return this;
	}
	this.toObject 	= function() { return _o; }
	this.getKeys 	= function() { return _a; }
	this.getValues = function() {
		var s, a=[];
		for (s in _o) {
			a.push(_o[s]);
		}
		return a;
	}
	this.hasKey = function(s) {
		return typeof _o[s] != 'undefined';
	}
	this.hasValue = function(m) {
		var s;
		for (s in _o) {
			if (_o[s] == m) { return true; }
		}
		return false;
	}
	this.hasIndex = function(n) {
		return typeof n == 'number' && n >= 0 && n < _a.length;
	}
	this.getIndex = function(s) {
		var n;
		for (n=0; n<_a.length; n++) {
			if (_a[n] == s) { return n; }
		}
		return null;
	}
	this.get = function(m) {
		if (typeof m == 'number') {
			return _o[_a[m]];
		}
		return typeof _o[m] != 'undefined' ? _o[m] : null;
	}
	this.getKey = function(n) {
		if (this.hasIndex(n)) {
			return _a[n];
		}
		return null;
	}
	this.set = function(s, m) {
		if (typeof s == 'object') {
			this.fromObject(s);
			return;
		}
		return _set(s, m);
	}
	this.unset = function(m) {
		if (typeof m != 'numeric') {
			var n=0;
			for (;n<_a.length; n++) {
				if (_a[n] == m) {
					m = n;
					break;
				}
			}
			if (!this.hasIndex(m)) { return; }
		}
		var s = _a[m];
		_a.splice(m, 1);
		delete _o[s];
	}
	this.length = function() {
		return _a.length;
	}
	this.each = function(f, bAssign) {
		var 
			n = 0,
			m;
			
		for (;n<_a.length; n++) {
			m = f(n, _a[n], _o[_a[n]]);
			if (bAssign) {
				_o[_a[n]] = m;
			}
		}
	}
	
	this.toJson = function() {
		return enyo.json.stringify({
			a : _a,
			o : _o
		});
	}
	
	this.fromJson = function(sJson) {
		var oData = enyo.json.parse(sJson);
		_a = oData.a;
		_o = oData.o;
		return this;
	}
	
	this.fromObject(o);
}