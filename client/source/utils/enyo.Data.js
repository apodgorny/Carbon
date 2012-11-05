/**	
 *	enyo.Data utility class. Provides easy read, write access to nodes of javascript object
 * 	which correspond to a "selector" path. Selector notation is as follows: 
 *		<key>[.<key>]... [.<key>], where <key> can be a string, number or "*".
 *		For example 
 *			"foo.5.bar" will access node under property "bar" of 5th element of node under property "foo" in your object
 *			"*.foo.*"	will access nodes under all properties of node under property "foo" under all first level properties of your object
 *
 *	@author Lex Podgorny 
 */

enyo.Data = function(oData) {
	return new enyo.Data.engine(oData);
}

enyo.Data.engine = function(oData) {
	
	var _oData = oData;
	
	function _error(sMethod, sMessage) {
		throw 'ERROR in enyo.Data' + (sMethod ? '.' + sMethod + '()' : '') + ': ' + sMessage;
	}
	
	function _select(sKey, oData) {
		_select._data.push(oData[sKey]);
	}
	_select._data = [];
	
	function _each(sKey, oData, sFullPath, oFullPath) {
		_each._f(_each._n, sKey, oData[sKey], sFullPath, oFullPath);
		_each._n ++;
	}
	_each._f = null;
	_each._n = 0;
	
	function _append(sKey, oData) {
		console.debug(oData[sKey], sKey, _append._sNewKey, _append._mNewData);
		if (enyo.isArray(oData[sKey])) {
			oData[sKey].push(_append._mNewData);
		} else if (enyo.isObject(oData[sKey])) {
			oData[sKey][_append._sNewKey] = _append._mNewData;
		}
	}
	_append._sNewKey  = null;
	_append._mNewData = null;
	
	function _set(sKey, oData) {
		oData[sKey] = _set._mNewData;
	}
	_set._mNewData = null;
	
	function _modify(sKey, oData) {
		_modify._oBuffer = _modify._f(sKey, oData[sKey]);
		if (_modify._bModifyKeys) {
			if (enyo.isArray(oData)) { return; }
			if (enyo.isArray(_modify._oBuffer)) {
				oData[_modify._oBuffer[0]] = _modify._oBuffer[1];
			} else {
				oData[_modify._oBuffer] = oData[sKey];
			}
			delete oData[sKey];
		} else {
			oData[sKey] = _modify._oBuffer;
		}
	}
	_modify._f 		 	 = null;
	_modify._oBuffer 	 = null;
	_modify._bModifyKeys = false;
	
	function _unset(sKey, oData) {
		delete oData[sKey];
	}
	
	function _step(aPath, oData, f, sFullPath, oFullPath) {
		aPath 		= _getPathArray(aPath);
		sFullPath 	= sFullPath || '';
		oFullPath	= oFullPath || enyo.Hash();
		
		if (aPath.length < 1) {
			throw 'Invalid path supplied in criteria object';
		}
		var sKey = aPath.splice(0, 1)[0];
		
		if (sKey == '*') {
			if (enyo.isAtomic(oData)) {	return; }							// Path is too long
			for (var sDataKey in oData) {
				_step(
					[sDataKey].concat(aPath), 
					oData, 
					f, 
					sFullPath,
					oFullPath
				);															// Recursive case: "*" - iterating all properties
			}
		} else {
			if (typeof oData[sKey] == 'undefined') { return; }				// Path is invalid
			
			oFullPath1 = enyo.Hash().fromHash(oFullPath);
			oFullPath1.set(sFullPath || 'root', oData);
			sFullPath += sFullPath ? ('.' + sKey) : sKey;
			
			
			if (aPath.length == 0) {										// Terminal case: last path component
				oFullPath1.set(sFullPath, oData[sKey]);
				f(sKey, oData, sFullPath, oFullPath1);
				return;
			} 
			if (!enyo.isAtomic(oData)) {
				_step(aPath, oData[sKey], f, sFullPath, oFullPath1);		// Recursive case: one more step into object
			}
		}
	}
	
	function _getPathArray(sPath) {
		if (enyo.isArray(sPath)) {
			return sPath;
		}
		if (enyo.isString(sPath)) {
			return sPath.split('.');
		}
		_error('', 'Path must be String or Array. "' + typeof sPath + '" is supplied');
	}
	
	function _traverse(oData, f, s, sFullPath) {
		f(s, oData, sFullPath);
		if (enyo.isAtomic(oData)) { return; }
		for (s in oData) {
			_traverse(oData[s], f, s, (sFullPath ? (sFullPath + '.' + s) : s));
		}
	}
	
	/*********************** PUBLIC ***********************/
	
	this.data = function(oData) {
		if (oData) {
			_oData = oData;
			return this;
		}
		return _oData;
	}

	this.select = function(sPath) {
		_step(sPath, _oData, _select);
		var o = _select._data;
		_select._data = null;									// Free references to prevent memory leaks
		return o;
	}
	
	this.modify = function(sPath, f, bModifyKeys) {
		_modify._bModifyKeys = bModifyKeys;
		_modify._f 			 = f;
		_step(sPath, _oData, _modify);
		_modify._bModifyKeys = false;
		_modify._f 			 = null;							// Free references to prevent memory leaks
	}
	
	this.each = function(sPath, f) {
		_each._f = f;
		_each._n = 0;
		_step(sPath, _oData, _each);
		_each._n = 0;
		_each._f = null;										// Free references to prevent memory leaks
		return this;
	}
	
	this.append = function(sPath, sNewKey, mNewData) {
		_append._sNewKey  = sNewKey;
		_append._mNewData = mNewData;
		_step(sPath, _oData, _append);
		_append._sNewKey  = null;
		_append._mNewData = null;								// Free references to prevent memory leaks
		return this;
	}
	
	this.set = function(sPath, mData) {
		_set._mNewData = mData;
		_step(sPath, _oData, _set);
		_set._mNewData = null;									// Free references to prevent memory leaks
		return this;
	}
	
	this.unset = function(sPath) {
		var aPath = _getPathArray(sPath);
		_step(aPath, _oData, _unset);
		return this;
	}
	
	this.traverse = function(f) {
		_traverse(_oData, f);
		return this;
	}
	
/*	this.pave = function(sPath) {
		var aPath = _getPathArray(sPath),
			n, n1,
			nLen  = aPath.length,
			oData = _oData,
			sKey,
			sTest;
		
		for (n=0; n<nLen; n++) {
			sKey = aPath[n];
			if (enyo.isDefined(oData[sKey])) {
				oData = oData[sKey];
			} else {
				if (sTest = parseInt(sKey)) == NaN) {
					sKey = sTest;
				}
				
				if (oData) {
					
				} else if (enyo.isArray(oData)) {
					if (enyo.isNumber(sKey)) {
						for (n1=0; n1<sKey; n1++) {
							oData.push(null);
						}
					} else {
						_error('pave', 'Can\'t set string key in array');
					}
				} else if (enyo.isObject(oData)) {
					oData[sKey + ''] = null;
				} else {
					_error('pave', 'Can\'t replace existing atomic values, use enyo.Data.unset()');
				}
			}
		}
	}*/
	
}