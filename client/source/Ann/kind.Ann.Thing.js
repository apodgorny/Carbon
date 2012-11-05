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
			onUpdate		: 'onUpdate',
			onDragStart		: 'onDragStart',
			onFocus			: 'onFocus'
		}
	],
	
	isDragged	: false,
	isDraggable	: true,
	isHovered	: false,
	isFocused	: false,
	dragStartX	: 100,
	dragStartY	: 100,
	
	/******************************/

	focus		: function() {},
	blur		: function() {},
	update		: function() {},
	hasPoint	: function(nX, nY) {},
	toObject	: function() {},
	
	// Also called from Ann object
	dragReverse: function() {
		this.moveTo(this.dragStartX, this.dragStartY);
	},
	
	// Also called from Ann object
	dragStop: function() {
		this.isDragged = false;
		this.dragStartX = 100;
		this.dragStartY = 100;
		enyo.Signals.send('onDragStop', {node: this});
	},
	
	dragStart: function(nX, nY) {
		this.isDragged 	= true;
		this.dragStartX = nX;
		this.dragStartY = nY;
		enyo.Signals.send('onDragStart', {node: this});
	},
	
	onMouseDown: function(oSender, oEvent) {
		if (this.isHovered) {
			this.focus();
			enyo.Signals.send('onFocus', {node: this});
			
			if (this.isDraggable) {
				this.dragStart(oEvent.x, oEvent.y);
			}
		} else {
			this.blur();
			enyo.Signals.send('onBlur', {node: this});
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
			if (!this.isHovered) {
				enyo.Signals.send('onMouseOver', {node: this, x: nX, y: nY});
				this.isHovered = true;
			}
			
			if (this.owner.isDragging() && this.isDraggable) {
				enyo.Signals.send('onDragOver', {node: this});
			}
		} else {
			if (this.isHovered) {
				this.isHovered = false;
				enyo.Signals.send('onMouseOut', {node: this, x: nX, y: nY});
			}
		}
	},
	
	onDragStart: function(oSender, oEvent) {
		if (oEvent.node !== this && this.isDragged) {
			this.dragStop();
		}
	},
	
	onFocus: function(oSender, oEvent) {
		if (oEvent.node !== this) {
			this.blur();
			this.isFocused = false;
		} else {
			this.isFocused = true;
		}
	},
	
	onBlur: function(oSender, oEvent) {
		if (oEvent.node == this) {
			this.isFocused = false;
		}
	},
	
	onUpdate: function() {
		this.update();
	}
	
	/******************************/
});