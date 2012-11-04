/**
 * Ann.Connection kind definition
 * @author: Lex Podgorny
 */

enyo.kind({
	name: 'Ann.Connection',
	kind: Ann.Thing,
	published: {
		node1	: '',
		node2	: '',
		weight	: 1.0
	},
	
	rectSize: 40,
	
	/******************************/
	
	getLineName	: function() { return 'line_' + this.name;			},
	getLine		: function() { return this.$[this.getLineName()];	},
	getRectName	: function() { return 'rect_' + this.name;			},
	getRect		: function() { return this.$[this.getRectName()];	},
	getTextName	: function() { return 'text_' + this.name;			},
	getText		: function() { return this.$[this.getTextName()];	},
	
	update: function() {
		var nHalfRect = this.rectSize / 2;
		var oLineBounds = {
			l: this.node1.x,
			t: this.node1.y,
			w: this.node2.x - this.node1.x,
			h: this.node2.y - this.node1.y
		};
		var oRectBounds = {
			l: (this.node1.x + this.node2.x) / 2 - nHalfRect,
			t: (this.node1.y + this.node2.y) / 2 - nHalfRect,
			w: this.rectSize,
			h: this.rectSize
		};
		
		this.getLine().setBounds(oLineBounds);
		this.getRect().setBounds(oRectBounds);
		
		this.getText().setBounds({
			l: oRectBounds.l + nHalfRect / 2,
			t: oRectBounds.t + nHalfRect,
			w: oRectBounds.w,
			h: oRectBounds.h
		});
		
		var nDist = Math.max(Math.abs(this.node2.x - this.node1.x), Math.abs(this.node2.y - this.node1.y));
		if (nDist <= this.node1.r + this.node2.r + this.rectSize) {
			this.getRect().setVisible(false);
			this.getText().setVisible(false);
		} else {
			this.getRect().setVisible(true);
			this.getText().setVisible(true);
		}
		
		this.owner.$.canvas.update(function(oNode1, oNode2) {
			if (oNode1.kind == 'enyo.canvas.Line') {
				return -1;
			} else if (oNode2.kind == 'enyo.canvas.Line') {
				return 1;
			}
			return 0;
		});
	},
	
	create: function() {
		this.inherited(arguments);
		var oCanvas	= this.owner.$.canvas;
		oCanvas.createComponents([
			{ name: this.getLineName(), kind: 'enyo.canvas.Line' 	  },
			{ name: this.getRectName(), kind: 'enyo.canvas.Rectangle' },
			{ name: this.getTextName(), kind: 'enyo.canvas.Text', text: this.weight },
		], {owner: this});
		
		this.update();
	}
	
	/******************************/
});