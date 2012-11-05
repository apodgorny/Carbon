//* _enyo.canvas.Text_ is a canvas control that draws a text string.
enyo.kind({
	name: "enyo.canvas.Text",
	kind: enyo.canvas.Shape,
	published: {
		//* The text to draw
		text: "",
		//* CSS font specification used to select a font for drawing
		font: "12pt Arial",
		//* Text alignment within the rectangle specified by the _bounds_ property
		align: "left"
	},
	//* @protected
	renderSelf: function(ctx) {
		ctx.textAlign = this.align;
		ctx.font = this.font;
		this.draw(ctx);
	},
	fill: function(ctx) {
		try {
			ctx.fillText(this.text, this.bounds.l, this.bounds.t);
		} catch(e) {
			console.log(e, this.text, this.bounds);
		}
	},
	outline: function(ctx) {
		ctx.strokeText(this.text, this.bounds.l, this.bounds.t);
	}
});
