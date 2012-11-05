/**	
 *	enyo.Storage utility singleton. 
 *	Provides a wrapper around localStorage allowing storing complex data structures which are serialized as JSON
 *
 *	@author Lex Podgorny 
 */

enyo.Storage = new function() {
	var _sPrefix = '__ENYO__';
	var _oData 	 = {};
	
	/********************* PUBLIC *******************/
	
	/*
	 * Get value from session
	 * @param sKey string A key in session collection
	 * @return value of session under specified key
	 */
	this.get = function(sKey) {
		sKey = _sPrefix + sKey;
		if (typeof _oData[sKey] == 'undefined') {
			_oData[sKey] = enyo.json.parse(localStorage.getItem(sKey));
		}
		return _oData[sKey];
	};
	
	/*
	 * Set value in session
	 * @param sKey string Key in session collection
	 * @param mValue mixed Value to store under specified key
	 * @return Session object Returns itself for chaining
	 */
	this.set = function(sKey, mValue) {
		sKey = _sPrefix + sKey;
		_oData[sKey] = mValue;
		localStorage.removeItem(sKey);
		localStorage.setItem(sKey, enyo.json.stringify(mValue));
		if (localStorage.getItem(sKey) == null) {
			throw 'Local storage is full';
		}
		return this;
	};
	
	/*
	 * Delete key from session
	 * @param sKey string A key in session collection
	 * @return Session object Returns itself for chaining
	 */
	this.unset = function(sKey) {
		sKey = _sPrefix + sKey;
		delete(_oData[sKey]);
		localStorage.removeItem(sKey);
		return this;
	};
	
	/*
	 * Deletes all keys from session
	 * @return Session object Returns itself for chaining
	 */
	this.unsetAll = function() {
		var sKey = '';
		for (var n=0; n<localStorage.length; n++) {
			sKey = localStorage.key(n);
			if (sKey.match(/^{_sPrefix}/)) {
				localStorage.setItem(sKey, null);
			}
		}
		return this;
	};
	
	/*
	 * Predicates if specified key is set in session collection
	 * @param sKey string A key in session collection
	 * @return boolean
	 */
	this.isSet = function(sKey) {
		sKey = _sPrefix + sKey;
		return (localStorage.getItem(sKey) != null);
	};
};