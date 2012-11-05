/**
 * Script kind definition
 * @author: Lex Podgorny
 */

enyo.kind({
	name: 'Script',
	tag: '',
	/******************************/
	_oScript: null,
	constructor: function() {
		this.inherited(arguments);
		this._oScript =  document.createElement('script');
		var oThis = this;
		this._oScript.onload = function(oEvent) {
			oThis.doLoad();
		};
		document.getElementsByTagName('head')[0].appendChild(this._oScript);
	},
	/******************************/
	srcChanged: function() {
		var aScripts = document.getElementsByTagName('script'),
			n,
			sSrc;
		
		// Prevent script from loading twice
		for (n=0; n<aScripts.length; n++) {
			sSrc = aScripts[n].getAttribute('src');
			if (sSrc == this.src) {
				throw 'Enyo.script: Attempting to load script ' + sSrc + ' twice';
			}
		}
		this._oScript.setAttribute('src', this.src);
	},	
	published: {
		src: ''
	},
	events: {
		onLoad: ''
	}
});

