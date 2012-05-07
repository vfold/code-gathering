define("Desktop",function(self){

    var Desktop = function() {

		stage.add(this);

		var treeReposition = function() {},
			tree, bg = new Kinetic.Shape({
				drawFunc: function() {

					var w = stage.getWidth(),
						h = stage.getHeight(),
						ctx = this.getContext(),
						grd = ctx.createRadialGradient(w, h, 100, w, h, w);

					grd.addColorStop(0, "#3a4e4e");
					grd.addColorStop(1, "#070e0f");
					ctx.fillStyle = grd;
					ctx.rect(0, 0, w, h);
					ctx.fill();
				}
			});

		this.add(bg);

		loadImage("tree.png", function(image) {

			tree = image;
			log("hey i did it!!");
			this.add(tree);

			treeReposition = function() {
				put(tree.attrs, {
					x: stage.getWidth() - 400,
					y: stage.getHeight() - 400
				});
				this.draw();
			};
			treeReposition();
		});
		stage.addResizeCallback(function() {
			treeReposition();
		});
	}

return Desktop;
},["Layer"]);