/**
	enyo.Index utility class. Provides data indexing of a javascript object for subsequent fast search.
	It consumes a "criteria" object which specifies a list of search criteria. Each item of this "criteria" contains a list of key-value pairs, where 
	keys are object "selector paths" (see enyo.Data) and values are callback anonymous functions that return a two-element arrays (or an array of such arrays)
	These returned arrays specify (0) search value and (1) piece of data to be returned when user searches for that search value. The callback function will be
	called for each element of "data", supplied to index() method, that corresponds to the "selector path" and receives two parameters:
	
		* sPath - string specifying a path to the iterated data node with all wildcards replaced with real property names
		* oPath	- object containing key-value pairs for each level of "data" object leading to the iterated node, where:
		 	* key is path with wildcards replaced to real values
			* value is the corresponding data value
			
	This way object { foo: { bar : ['zero', 'one', 'two'] } }, when iterating using "foo.bar.*", will iterate 3 times each time passing the following parameters to callback:
	(0) "foo.bar.0", 
		{ "root" : <data>, "foo" : <data>.foo, "foo.bar" : <data>.foo.bar, "foo.bar.0" : <data>.foo.bar[0] }
	
	(1) "foo.bar.1", 
		{ "root" : <data>, "foo" : <data>.foo, "foo.bar" : <data>.foo.bar, "foo.bar.1" : <data>.foo.bar[1] }
		
	(2) "foo.bar.2", 
		{ "root" : <data>, "foo" : <data>.foo, "foo.bar" : <data>.foo.bar, "foo.bar.2" : <data>.foo.bar[2] }
	

	Criteria structure:
	
 	oCriteria = {
		<criteria>: [
			<path> : function(sKey, mValue) { return [sKey1, mValue1] }
		]
	}
	
	criteria	: search category (String)
	path		: path in JS object (String)
		Example:
			"*"				sKey-> first level key, 	mValue-> oData[sKey]
			"*.*"			sKey-> null, 				mValue-> oData[EACH][EACH]
			"images.s		sKey-> null,				mValue-> oData.images.s
			
	in resulting index object expression "<path> : function(sKey, mValue) { return [sKey1, mValue1] }" is replaced
	with sKey1 : [ index1, index2, index3 ... indexN ], where indices correspond to array of values ever returned by the function (mValue1)
	
	@author: Lex Podgorny

 */

enyo.Index = function(fProgressCallback, oProgressCallbackContext) {
	return new enyo.Index.engine(fProgressCallback, oProgressCallbackContext);
}

enyo.Index.engine = function(fProgressCallback, oProgressCallbackContext) {
	var _oData 				= enyo.Hash(),
		_oSearch 			= {},
		_oProgress			= enyo.ProgressQueue('index', fProgressCallback, oProgressCallbackContext),
		_oPathCache 		= {};
	
	function _error(sMethod, sMessage) {
		throw 'Error in enyo.Index.' + sMethod + ': ' + sMessage;
	}
	
	function _storeIndexingResult(sCriterion, sPath, aResult) {
		if (!aResult) { return; };

		// If multi dimensional array is supplied - recurse
		if (enyo.isArrayOfArrays(aResult)) {
			var n;
			for (n=0; n<aResult.length; n++) {
				_storeIndexingResult(sCriterion, sPath, aResult[n]);
			}
			return;
		}
		
		var sSearchValue  = aResult[0],
			oSearchResult = aResult[1];
			
		if (typeof _oSearch[sCriterion][sSearchValue] == 'undefined') {
			_oSearch[sCriterion][sSearchValue] = enyo.Set();
		}
		_oData.set(sPath, oSearchResult);
		_oSearch[sCriterion][sSearchValue].set(sPath);
	}
	
	function _processPath(sPath, f, sCriterion, oEnyoData) {
		var nIndex, 
			aResult;
		
		if (typeof _oSearch[sCriterion] == 'undefined') {
			_oSearch[sCriterion] = {};
		}
		
		if (!enyo.isDefined(_oPathCache[sPath])) {									// First time querying data with a given path
			_oPathCache[sPath] = [];													// Create cache space for collected data
			oEnyoData.each(sPath, function(n, sKey, oData, sRealPath, oPath) {			// Iterate through data with given path
				_oPathCache[sPath].push({													// Collect needed pieces per path, per iteration
					sPath	: sRealPath,
					oPath	: oPath
				});
				aResult = f(sRealPath, oPath);												// Call indexing function with the data
				_storeIndexingResult(sCriterion, sRealPath, aResult);						// Store indexing function's return value
			});
		} else {																	// No need to query data again, all is cached
			var n, 																		// n 	- for loop counter
				nLen = _oPathCache[sPath].length,										// nLen - number of data nodes cached per path
				o;																		// o	- cached data node
				
			for (n=0; n<nLen; n++) {													// Iterate through nodes of cached data
				o = _oPathCache[sPath][n];													// Store cached node into "o" for consisenss 
				aResult = f(o['sPath'], o['oPath']);										// Call indexing function with the data
				_storeIndexingResult(sCriterion, o['sPath'], aResult);						// Store indexing function's return value
			}
		}
	}
	
	function _getResultSetData(aKeys) {
		var n,
			nLen 	= aKeys.length,
			aResult = [],
			oResult;
			
		for (n=0; n<nLen; n++) {
			oResult = _oData.get(aKeys[n]);
			if (oResult) {
				aResult.push(oResult);
			}
		}
		return aResult;
	}
	
	/************************ PUBLIC **************************/
	
	this.toJson = function() {
		var oSearch = {},
			sCriterion,
			sValue;
			
		for (sCriterion in _oSearch) {
			oSearch[sCriterion] = {};
			for (sValue in _oSearch[sCriterion]) {
				oSearch[sCriterion][sValue] = _oSearch[sCriterion][sValue].toJson();
			}
		}
		
		return enyo.json.stringify({
			data		: _oData.toJson(),
			search		: oSearch
		});
	}
	
	this.fromJson = function(sJson) {
		var o = enyo.json.parse(sJson),
			sCriterion,
			sValue;
			
		_oData.fromJson(o.data);
		
		for (sCriterion in o.search) {
			_oSearch[sCriterion] = {};
			for (sValue in o.search[sCriterion]) {
				_oSearch[sCriterion][sValue] = enyo.Set().fromJson(o.search[sCriterion][sValue]);
			}
		}
		return this;
	}
	
	this.empty = function() {
		_oData 	 = enyo.Hash();
		_oSearch = {};
	}
	
	this.isEmpty = function() {
		return _oEnyoData === null;
	}
	
	/**
		Indexes data object (parameter 1), based on criteria (parameter 0). 
		See head comments for details.
	*/
	this.index = function(oCriteria, oData) {
		var oEnyoData = enyo.Data(oData),
			sCriterion,
			sPath;
		
		for (sCriterion in oCriteria) {														// Iterate oCriteria object
			for (sPath in oCriteria[sCriterion]) {											// Iterate path=>funciton()
				_oProgress.enqueue();
			}
		}
		for (sCriterion in oCriteria) {														// Iterate oCriteria object
			for (sPath in oCriteria[sCriterion]) {											// Iterate path=>funciton() pairs
				_processPath(sPath, oCriteria[sCriterion][sPath], sCriterion, oEnyoData);	// Process each one
				_oProgress.dequeue();
			}
		}
	}
	
	/**
		Returns a sorted by relevance array of data corresponding to supplied search criteria.
		
		Example: oCriteria = {
			'size'		: ['s','m'],
			'network'	: ['facebook'],
			'keywords'	: ['foo', 'bar']
		};
	*/
	this.search = function(oCriteria) {
		var sCriterion,
			n,
			sValue,
			oResultSet	= enyo.Set(),
			oTempSet	= enyo.Set();
			
		for (sCriterion in oCriteria) {
			oTempSet.empty();
			if (!enyo.isDefined(_oSearch[sCriterion])) {
				return;
				//_error('search', 'Criterion ' + sCriterion + ' is not defined in index');
			}
			for (n=0; n<oCriteria[sCriterion].length; n++) {
				sValue = oCriteria[sCriterion][n];
				if (enyo.isDefined(_oSearch[sCriterion][sValue])) {
					oTempSet.add(_oSearch[sCriterion][sValue]);
				}
			}
			
			if (oResultSet.isEmpty()) {
				oResultSet.add(oTempSet);
			} else {
				oResultSet.intersect(oTempSet);
			}
		}
		var aResults = _getResultSetData(oResultSet.toArray(1));
	/*	var sId		 = '___resultt___';
		var oDiv	 = document.getElementById(sId)

		if (oDiv) {
			document.body.removeChild(oDiv);
		}
			oDiv = document.createElement('div');
			oDiv.id = sId;
			document.body.appendChild(oDiv);

		for (var n=0; n<aResults.length; n++) {
			console.debug(aResults[n]);
			if (!aResults[n]) { continue; }
			var oImg = document.createElement('img');
			oImg.src = aResults[n].src;
			oImg.width = '100';
			oDiv.appendChild(oImg);
		}
		*/
		return aResults;
	}
	
	this.clear = function(oCriteria) {
		var n,
			nLen,
			aIndices = [];
		
		for (sCriterion in oCriteria) {
			if (!enyo.isDefined(_oSearch[sCriterion])) {
				continue;
				//_error('clear', 'Criterion ' + sCriterion + ' is not defined in index');
			}
			for (n=0; n<oCriteria[sCriterion].length; n++) {
				sValue = oCriteria[sCriterion][n];
				if (enyo.isDefined(_oSearch[sCriterion][sValue])) {
					aIndices = _oSearch[sCriterion][sValue].toArray();
					delete _oSearch[sCriterion][sValue];
					nLen = aIndices.length;
					
					for (n=0; n<nLen; n++) {
						_oData.unset(aIndices[n]);
					}
				}
			}
		}
	}
	
	this.clearCache = function() {
		_oPathCache = {};
	}
	
	this.getKeywords = function(sCriterion) {
		var a = [];
		if (enyo.isDefined(_oSearch[sCriterion])) {
			var sKey;
			for (sKey in _oSearch[sCriterion]) {
				a.push(sKey);
			}
			a.sort();
		}
		return a;
	}
	
	this.debug = function() {
		console.debug(_oData.toObject());

		for (var sKey in _oSearch) {
			console.debug(sKey, _oSearch[sKey]);
		}
	}
	
	this.resetProgress = function() {
		_oProgress.reset();
	}
	
}