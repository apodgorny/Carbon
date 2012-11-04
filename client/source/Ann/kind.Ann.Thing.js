/**
 * Ann.Thing kind definition
 * @author: Lex Podgorny
 */

enyo.kind({
	name: 'Ann.Thing',
	kind: enyo.Control,
	components: [
		{
			kind 			: 'Signals',
			onMouseDown		: 'onMouseDown',
			onMouseUp		: 'onMouseUp',
			onMouseMove		: 'onMouseMove',
			onUpdate		: 'onUpdate'
		}
	],
	published: {
	},
	
	isDragged	: false,
	isDraggable	: true,
	isHovered	: false,
	dragStartX	: 100,
	dragStartY	: 100,
	
	/******************************/
	create: function() {
		this.inherited(arguments);
	},
	
	hasPoint: function(nX, nY) {},
	
	reverseDrag: function() {
		this.moveTo(this.dragStartX, this.dragStartY);
	},
	
	dragStop: function() {
		enyo.Signals.send('onDragStop', {node: this});
		this.isDragged = false;
	},
	
	onMouseDown: function(oSender, oEvent) {
		if (this.isHovered) {
			enyo.Signals.send('onFocus', {node: this});
			this.focus();
			if (this.isDraggable) {
				enyo.Signals.send('onDragStart', {node: this});
				this.isDragged 	= true;
				this.dragStartX = oEvent.x;
				this.dragStartY = oEvent.y;
			}
		} else {
			enyo.Signals.send('onBlur', {node: this});
			this.blur();
		}
	},
	
	onMouseUp: function(oSender, oEvent) {
		if (this.isDraggable && this.isDragged) {
			this.dragStop();
		}
	},
	
	onMouseMove: function(oSender, oEvent) {
		var nX = oEvent.x,
			nY = oEvent.y;
			
		if (this.isDragged) {
			enyo.Signals.send('onDrag', {node: this, x: nX, y: nY});
			this.moveTo(nX, nY);
		} else if (this.hasPoint(nX, nY)) {
			this.isHovered = true;
			enyo.Signals.send('onMouseOver', {node: this, x: nX, y: nY});
			
			var oDraggedNode = this.owner.getDraggedNode();
			if (oDraggedNode && oDraggedNode !== this) {
				console.log('dragover!!!');
				enyo.Signals.send('onDragOver', {node: this, draggedNode: oDraggedNode});
				this.dragStop();
			}
		} else {
			this.isHovered = false;
			enyo.Signals.send('onMouseOut', {node: this, x: nX, y: nY});
		}
	},
	
	onUpdate: function() {
		this.update();
	}
	
	/******************************/
});