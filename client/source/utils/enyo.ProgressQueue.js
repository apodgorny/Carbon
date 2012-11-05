enyo.ProgressQueue = function(sProcessName, fCallback, oCallbackContext) {
	return new enyo.ProgressQueue.engine(sProcessName, fCallback, oCallbackContext);
}

enyo.ProgressQueue.engine = function(sProcessName, fCallback, oCallbackContext) {
	var _oThis 		= this,
		_nTimeStart = 0,
		_nItemsIn	= 0,
		_nItemsOut	= 0;
		
	function _sendUpdate() {
		if (!enyo.isDefined(fCallback)) {
			throw 'Error in enyo.ProgressQueue "' + sProcessName + '": fCallback is undefined';
		}
		fCallback.apply(oCallbackContext, [{
			processName			: sProcessName,
			timeElapsed			: new Date().getTime() - _nTimeStart,
			itemsCompleted		: _nItemsOut,
			itemsTotal			: _nItemsIn,
			percentCompleted	: (_nItemsIn > 0 ? (Math.floor(_nItemsOut / _nItemsIn * 100)) : 0)
		}]);
	}
		
	this.enqueue = function(n) {
		n = n || 1;
		_nItemsIn += n;
		if (_nTimeStart == 0) {
			_nTimeStart = new Date().getTime();
		}
		_sendUpdate();
	}
	
	this.dequeue = function(n) {
		n = n || 1;
		_nItemsOut += n;
		_sendUpdate();
	}
	
	this.reset = function() {
		_nTimeStart = 0,
		_nItemsIn	= 0,
		_nItemsOut	= 0;
	}
}