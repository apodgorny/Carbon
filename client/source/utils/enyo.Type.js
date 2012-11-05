enyo.isString = function(m) {
	return typeof m == 'string';
}

enyo.isNumber = function(m) {
	return typeof m == 'number';
}

enyo.isBoolean = function(m) {
	return typeof m == 'boolean';
}

enyo.isAtomic = function(m) {
	return 	enyo.isNumber(m) ||
			enyo.isString(m) ||
			enyo.isBoolean(m) ||
			m === null;
}

enyo.isDefined = function(m) {
	return typeof m != 'undefined';
}

enyo.isObject = function(m) {
	return	enyo.isDefined(m) &&
			!enyo.isAtomic(m) &&
			!enyo.isArray(m)
}

enyo.isArrayOfArrays = function(m) {
	return 	enyo.isArray(m) && 
			enyo.isDefined(m[0]) && 
			enyo.isArray(m[0]);
}