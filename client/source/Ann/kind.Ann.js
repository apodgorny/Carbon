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
			onDragOver	: 'onDragOver',
			onDrag		: 'onDrag'
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
	
	isDragging: function() {
		return this.draggedNode !== null;
	},
	
	onDragOver: function(oSender, oEvent) {
		if (!this.getConnection(oEvent.node, this.draggedNode)) {
			this.connectNodes(this.draggedNode, oEvent.node);
			this.draggedNode.dragReverse();
			this.draggedNode.dragStop();
			this.update();
		}
	},
	
	onDragStart: function(oSender, oEvent) {
		this.draggedNode = oEvent.node;
	},
	
	onDragStop: function(oSender, oEvent) {
		this.draggedNode = null;
	},
	
	onDrag: function(oSender, oEvent) {
		this.update();
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
				enyo.Signals.send('onViewportMouseOut', {x: nX, y: nY});
				break;
			case 'mousemove':
				enyo.Signals.send('onMouseMove', {x: nX, y: nY});
				break;
			default:
				break;
		}
	},
	
	addNode: function(sName, nX, nY, nR, nF) {
		nR = nR || 30;
		nF = nF || 1;
		
		this.createComponent({name: sName, kind: 'Ann.Node', x: nX, y: nY, r: nR, f: nF}, {owner: this});
		this.nodes[sName] = this.$[sName];
		this.nodeCount ++;
		return this.nodes[sName];
	},
	
	getNode: function(sName) {
		return typeof this.nodes[sName] != 'undefined' ? this.nodes[sName] : null;
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
	
	connectNodes: function(oNode1, oNode2, nWeight) {
		nWeight = nWeight || 1.0;
		
		var sName = this.getConnectionName(oNode1, oNode2);
		this.createComponent({
			name	: sName, 
			kind 	: 'Ann.Connection', 
			node1	: oNode1,
			node2	: oNode2,
			weight	: nWeight
		}, {owner: this});
		this.connections[sName] = this.$[sName];
		this.connectionCount ++;
		return this.connections[sName];
	},
	
	update: function() {
		enyo.Signals.send('onUpdate');
	},
	
	fromObject: function(o) {
		var n,
			oData;
		
		for (n=0; n<o.nodes.length; n++) {
			oData = o.nodes[n];
			this.addNode(
				oData.name,
				oData.x,
				oData.y,
				oData.r,
				oData.f
			);
		}
		
		for (n=0; n<o.connections.length; n++) {
			oData  = o.connections[n];
			this.connectNodes(
				this.getNode(oData.node1),
				this.getNode(oData.node2),
				oData.weight
			)
		}
		
		this.update();
	},
	
	toObject: function() {
		var sName,
			o = {
			nodes: [],
			connections: []
		};
		
		for (sName in this.nodes) {
			o.nodes.push(this.nodes[sName].toObject());
		}
		for (sName in this.connections) {
			o.connections.push(this.connections[sName].toObject());
		}
		return o;		
	},
	
	/******************************/
});