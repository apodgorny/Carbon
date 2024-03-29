/**
	_enyo.canvas.Shape_ is the base kind for shapes that can be drawn into the
	canvas.	It doesn't have a default rendering, but an event handler may call
	the _draw_ method on it.

	Kinds derived from this one should provide their own implementation of
	_renderSelf_. If more complex operations are needed for filled mode or
	outline	mode, override the _fill_ or _outline_ methods, respectively.
*/
enyo.kind({
	name: "enyo.canvas.Shape",
	kind: enyo.canvas.Control,
	published: {
		color			: '#FFFFFF',
		outlineColor	: '#333333',
		lineWidth		: '1',	
	},
	//* @protected
	fill: function(inContext) {
		inContext.fill();
	},
	outline: function(inContext) {
		inContext.stroke();
	},
	//* @public
	draw: function(inContext) {
		if (this.lineWidth) {
			inContext.lineWidth = this.lineWidth;
		}
		if (this.color) {
			inContext.fillStyle = this.color;
			this.fill(inContext);
		}
		if (this.outlineColor) {
			inContext.strokeStyle = this.outlineColor;
			this.outline(inContext);
		}
	}
});
