/**	
 *	enyo.Set utility object. Provides fast data manipulation features coherent with a Set data structure: sum, difference, intersection with other sets, etc.
 *	in addition, each subsequent setting of the duplicate value will increase it's relevance that can be used to sort the set when it is
 *  exported as array usning toArray() function.
 *
 *	@author Lex Podgorny 
 */

enyo.Set = function(mData) {
	return new enyo.Set.engine(mData);
};

enyo.Set.engine = function(mData) {
	
	var _oThis 	= this,
		_o 		= {};
	
	function _error(sMethod, sMessage) {
		throw 'Error in enyo.Set.' + sMethod + ': ' + sMessage;
	}
	
	function _init() {
		if (mData instanceof enyo.Set.engine) {		// Set
			_oThis.fromObject(mData.toObject());
		} else if (enyo.isArray(mData)) {			// Array
			_oThis.fromArray(mData);
		} else if (enyo.isAtomic(mData)) {			// Atomic
			_oThis.set(mData);
		} else {									// Only objects are left
			_oThis.fromObject(mData);
		}
	}
	
	function _toArray(m) {
		if (m instanceof enyo.Set.engine) {			// Set
			return m.toArray();
		} else if (enyo.isArray(m)) {				// Array
			return m;
		} else if (enyo.isAtomic(m)) {				// Atomic
			return [m];
		} else {									// Only objects are left
			var a = [];
			for (s in m) {
				a.push(s);
			}
			return a;
		}
	}
	
	/******************** PUBLIC ********************/
	
	this.fromJson = function(s) {
		_o = enyo.json.parse(s);
		return this;
	}
	
	this.toJson = function() {
		return enyo.json.stringify(_o);
	}
	
	// Deletes all values from the set
	this.empty = function() {
		_o = {};
		return this;
	}
	
	// Checks if set is empty
	this.isEmpty = function() {
		var s;
		for (s in _o) {
			if (_o.hasOwnProperty(s)) { return false; }
		}
		return true;
	}
	
	// Replaces 
	this.fromObject = function(o) {
		_o = enyo.clone(o);
		return this;
	}
	
	// Converts set to an object with keys as set values
	this.toObject = function() {
		return _o;
	}
	
	// Replaces set values with those from array
	this.fromArray = function(a) {
		var n, 
			nLen = a.length;
		
		for (n=0; n<nLen; n++) {
			this.set(a[n]);
		}
	}
	
	// Converts set to array
	this.toArray = function(nSortDirection) {
		var s, a=[], aRelevance=[];
		for (s in _o) {
			a.push(s);
			if (nSortDirection) {
				aRelevance.push(_o[s]);
			}
		}
		if (nSortDirection) {
			var n;
			a.sort(function(s1, s2) {
				return nSortDirection > 0
					? _o[s1] > _o[s2]
					: _o[s1] < _o[s2];
			});
		}
		return a;
	}
	
	// Faster version of .add() for adding atomic types
	this.set = function(m) {
		_o[m+''] = _o[m+''] ? _o[m+'']++ : 1;
	}
	
	// Faster version of .subtract() for removing atomic types
	this.unset = function(m) {
		delete _o[m+''];
	}
	
	// Checks if Set, array or atomic are in the set
	this.has = function(a) {
		a = _toArray(a);
		
		var n,
			nLen = a.length;
		
		for (n=0; n<nLen; n++) {
			if (typeof _o[a[n] + ''] == 'undefined') {
				return false;
			}
		}
		return true;
	}
	
	// Adds Set, array or atomics to the set
	// returns modified self
	
	this.add = function(m) {
		m = _toArray(m);
		
		var n, 
			nLen = m.length;
			
		for (n=0; n<nLen; n++) {
			this.set(m[n]);
		}
		
		return this;
	}
	
	// subtracts Set, array or atomics from the set
	// returns modified self
	
	this.subtract = function(m) {
		m = _toArray(m);
		
		var n, 
			nLen = m.length;
			
		for (n=0; n<nLen; n++) {
			this.unset(m[n]);
		}
		
		return this;
	}
	
	// intersects with Set, array or atomic
	// returns modified self
	
	this.intersect = function(a) {
		a = _toArray(a);
		
		var n,
			nLen = a.length,
			oSet = enyo.Set();
			
		for (n=0; n<nLen; n++) {
			if (typeof _o[a[n] + ''] != 'undefined') {
				oSet.set(a[n]);
			}
		}
		
		_o = oSet.toObject();
		
		return this;		
	}
	
	_init();
};