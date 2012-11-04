/**
 * enyo.canvas.Line kind definition
 * @author: Lex Podgorny
 */

enyo.kind({
	name: 'enyo.canvas.Line',
	kind: enyo.canvas.Shape,
	published: {
		lineWidth : 2,
		color	  : '#666666'
	},
	/******************************/
	renderSelf: function(oContext) {
		oContext.lineWidth 	 = this.lineWidth;
		oContext.strokeStyle = this.color;
		
		oContext.beginPath();
		oContext.moveTo(this.bounds.l, this.bounds.t);
		oContext.lineTo(this.bounds.l + this.bounds.w, this.bounds.t + this.bounds.h);
		oContext.stroke();
	}
});
