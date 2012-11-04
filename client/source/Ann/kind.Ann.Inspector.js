/**
 * Ann.Inspector kind definition
 * @author: Lex Podgorny
 */

enyo.kind({
	name		: 'Ann.Inspector',
	classes		: 'enyo-fit repeater-sample',
	components	: [
		{name: 'repeater', kind: 'Repeater', onSetupItem:'setupItem', components: [
			{name:'item', components: [
				{name: 'key',	tag:'span'},
				{name: 'value', tag:'span'}
			]}
		]}
	],
	
	data: [],

	/******************************/

	show: function(aData) {
		this.data = aData;
		this.$.repeater.setCount(aData.length);
	},
	
	hide: function() {
		this.$.repeater.setCount(0);
	},

	setupItem: function(oSender, oEvent) {
		var oItem 	= oEvent.item,
			oData 	= this.data[oEvent.index];
			
			oItem.$.key.setContent(oData.key);
			oItem.$.value.setContent(oData.value);
	},
});