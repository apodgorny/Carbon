/**
 * Ann kind definition
 * @author: Lex Podgorny
 */

enyo.kind({
	name: 'Ann',
	kind: enyo.Control,
	published: {
		width	: 100,
		height	: 100
	},
	components: [
		{
			kind 		: 'Signals',
			onDragStart : 'onDragStart',
			onDragStop	: 'onDragStop',
			onDragOver	: 'onDragOver'
		}
	],
	
	nodes			: {},
	nodeCount		: 0,
	connections		: {},
	connectionCount : 0,
	draggedNode		: null,
	
	/******************************/
	create: function() {
		var oThis = this;
		this.inherited(arguments);
		this.createComponent({
			name		: 'canvas', 
			kind 		: 'Canvas', 
			style		: 'border: 1px solid black;', 
			attributes	: {
				width		: this.getWidth(), 
				height		: this.getHeight()
			}
		}, {owner: this});
	},
	
	rendered: function() {
		this.inherited(arguments);
		
		var oThis 		= this,
			oCanvasNode = this.$.canvas.node,
			aEvents		= ['click', 'mousemove', 'mousedown', 'mouseup', 'mouseout'];
			
		for (var n=0; n<aEvents.length; n++) {
			$(oCanvasNode).bind(aEvents[n], function(oEvent) { oThis.onEvent(oEvent); });
		}
	},
	
	getDraggedNode: function() {
		return this.draggedNode;
	},
	
	onDragOver: function(oSender, oEvent) {
		if (!this.getConnection(oEvent.node.name, oEvent.draggedNode.name)) {
			oEvent.draggedNode.reverseDrag();
			this.connectNodes(oEvent.draggedNode, oEvent.node);
			this.update();
		}
	},
	
	onDragStart: function(oSender, oEvent) {
		this.draggedNode = oEvent.node;
	},
	
	onDragStop: function(oSender, oEvent) {
		this.draggedNode = null;
	},
	
	onEvent: function(oEvent) {
		var sId, 
			nX, 
			nY;
		
		if (typeof oEvent.clientX != 'undefined') {
			var oOffset = $(this.$.canvas.hasNode()).offset();
			nX = Math.ceil(oEvent.clientX - oOffset.left);
			nY = Math.ceil(oEvent.clientY - oOffset.top);	
		}
		
		switch (oEvent.type) {
			case 'mousedown':
				enyo.Signals.send('onMouseDown', {x: nX, y: nY});
				break;
			case 'mouseup':
				enyo.Signals.send('onMouseUp', {x: nX, y: nY});
				break;
			case 'mouseout':
				enyo.Signals.send('onMouseOut', {x: nX, y: nY});
				break;
			case 'mousemove':
				enyo.Signals.send('onMouseMove', {x: nX, y: nY});
				break;
			default:
				break;
		}
	},
	
	addNode: function(sName, nX, nY) {
		this.createComponent({name: sName, kind: 'Ann.Node', x: nX, y: nY}, {owner: this});
		this.nodes[sName] = this.$[sName];
		this.nodeCount ++;
	},
	
	getNode: function(sId) {
		return typeof this.nodes[sId] != 'undefined' ? this.nodes[sId] : null;
	},
	
	getConnection: function(oNode1, oNode2) {
		var sName = this.getConnectionName(oNode1, oNode2);
		return typeof this.connections[sName] != 'undefined' ? this.connections[sName] : null;
	},
	
	getConnectionName: function(oNode1, oNode2) {
		return oNode1.name < oNode2.name 
			? oNode1.name + '_' + oNode2.name
			: oNode2.name + '_' + oNode1.name;
	},
	
	connectNodes: function(oNode1, oNode2) {
		var sName = this.getConnectionName(oNode1, oNode2);
		this.createComponent({
			name	: sName, 
			kind 	: 'Ann.Connection', 
			node1	: oNode1,
			node2	: oNode2
		}, {owner: this});
		this.connections[sName] = this.$[sName];
	},
	
	start: function() {
		this.addNode(2, 200, 200);
		this.addNode(3, 300, 200);
		this.connectNodes(1, 2);
		this.connectNodes(2, 3);
		this.connectNodes(1, 3);
	},
	
	update: function() {
		enyo.Signals.send('onUpdate');
	},
	
	/******************************/
});