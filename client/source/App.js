enyo.kind({
	name: 'App',
	kind: 'FittableRows',
	classes: 'ann',
	components: [
		{
			kind 		: 'Signals', 
			onMouseOver : 'onMouseOver',
			onMouseOut 	: 'onMouseOut',
			onFocus		: 'onFocus',
			onDrag		: 'onDrag'
		},
		{components: [
			{kind: 'Button', content: 'Add node', ontap: 'onAddNodeClick' },
			{kind: 'Button', content: 'Save network', ontap: 'onSaveClick' },
			{kind: 'Button', content: 'Restore network', ontap: 'onRestoreClick' }
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
			{name: 'inspector', kind: 'Ann.Inspector', classes: 'inspector'},
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
					{key: 'x', value: o.x },
					{key: 'y', value: o.y }
				]);
				break;
			case 'Ann.Connection':
				this.$.inspector.show([
					{key: 'kind', 	value: o.kind },
					{key: 'name', 	value: o.name },
					{key: 'weight', value: o.getWeight() },
					{key: 'node 1', value: o.node1.name },
					{key: 'node 2', value: o.node2.name },
				]);
				break;
			default:
				break;
		}
		
	},
	
	onMouseOver: function(oSender, oEvent) {
		this.inspect(oEvent.node);
	},
	onMouseOut: function(oSender, oEvent) {
		this.inspect(this.focusedNode);
	},
	onFocus: function(oSender, oEvent) {
		this.focusedNode = oEvent.node;
	},
	onDrag: function(oSender, oEvent) {
		this.inspect(oEvent.node);
	},
	
	onAddNodeClick: function() {
		this.$.ann.addNode(this.$.ann.nodeCount + '', 100, 100); 
	},
	onSaveClick: function() {
		enyo.Storage.set('ann', this.$.ann.toObject());
	},
	onRestoreClick: function() {
		this.$.ann.fromObject(enyo.Storage.get('ann'));
	}
	
});
