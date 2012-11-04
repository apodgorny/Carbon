enyo.kind({
	name: 'App',
	kind: 'FittableRows',
	components: [
		{
			kind 		: 'Signals', 
			onMouseOver : 'onMouseOver',
			onMouseOut 	: 'onMouseOut',
			onFocus		: 'onFocus'
		},
		{components: [
			{kind: 'Button', content: 'Add node', ontap: 'onAddNode' },
		]},
		{kind: 'FittableColumns', fit: true, components: [
			{
				name		: 'ann', 
				kind 		: 'Ann', 
				width		: '800', 
				height		: '600',
				onEnter		: 'handleEnter',
				onExit		: 'handleExit'
			},
			{name: 'inspector', kind: 'Ann.Inspector', classes: 'ann_inspector'},
		]}
	],
	
	focusedNode: null,
	
	inspect: function(o) {
		if (!o) {
			this.$.inspector.hide();
			return;
		}
		
		switch (o.kind) {
			case 'Ann.Node':
				this.$.inspector.show([
					{key: 'kind', value: o.kind },
					{key: 'name', value: o.name },
				]);
				break;
			default:
				break;
		}
		
	},
	
	onAddNode: function() {
		this.$.ann.addNode(this.$.ann.nodeCount + '', 100, 100); 
	},
	onMouseOver: function(oSender, oEvent) {
		this.inspect(oEvent.node);
	},
	onMouseOut: function(oSender, oEvent) {
		this.inspect(this.focusedNode);
	},
	onFocus: function(oSender, oEvent) {
		this.focusedNode = oEvent.node;
	}
	
});
