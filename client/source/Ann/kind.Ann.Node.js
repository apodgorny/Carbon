/**
 * Ann.Node kind definition
 * @author: Lex Podgorny
 */

enyo.kind({
	name: 'Ann.Node',
	kind: Ann.Thing,
	published: {
		x	: '',
		y	: '',
		r	: 30
	},
	
	textOffset: 5,
	
	/******************************/
	
	getCircleName	: function() { return 'circle_' + this.name; 		},
	getCircle		: function() { return this.$[this.getCircleName()]; },
	getTextName		: function() { return 'text_' + this.name; 			},
	getText			: function() { return this.$[this.getTextName()]; 	},
	
	create: function() {
		this.inherited(arguments);
		var oCanvas		= this.owner.$.canvas;
		oCanvas.createComponents([
			{ name: this.getCircleName(), kind: 'enyo.canvas.Circle', color:'white', outlineColor: 'gray' },
			{ name: this.getTextName(),   kind: 'enyo.canvas.Text',   color:'gray',  text: this.name 	  }
		], {owner: this});
		this.update();
	},
	
	moveTo: function(nX, nY) {
		this.x = nX;
		this.y = nY;
		this.update();
	},
	
	onTap: function() {
		console.log('click');
	},
	
	hasPoint: function(nX, nY) {
		return Math.pow(
			Math.pow(this.x - nX, 2) + 
			Math.pow(this.y - nY, 2)
		,0.5) <= this.r;
	},
	
	focus: function() {
		this.getCircle().setOutlineColor('red');
		this.update();
	},
	
	blur: function() {
		this.getCircle().setOutlineColor('gray');
		this.update();
	},
	
	update: function() {
		this.getCircle().setBounds({l: this.x, t: this.y, w: this.r});
		this.getText().setBounds({l: this.x - this.textOffset, t: this.y + this.textOffset, w: this.r});
		this.owner.$.canvas.update(function(oNode1, oNode2) {
			if (oNode1.kind == 'enyo.canvas.Line') {
				return -1;
			} else if (oNode2.kind == 'enyo.canvas.Line') {
				return 1;
			}
			return 0;
		});
	}
	
	/******************************/
});