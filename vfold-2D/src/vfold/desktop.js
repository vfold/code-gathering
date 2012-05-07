define("Desktop", function(self) {

	var treeReposition = function() {},
		tree, bg;

	var Desktop = function() {

		parent(Layer);

			bg = new Shape({
				drawFunc: function() {

					var w = stage.getWidth(),
						h = stage.getHeight(),
						ctx = self.getContext(),
						grd = ctx.createRadialGradient(w, h, 100, w, h, w);

					grd.addColorStop(0, "#3a4e4e");
					grd.addColorStop(1, "#070e0f");
					ctx.fillStyle = grd;
					ctx.rect(0, 0, w, h);
					ctx.fill();
				}
			});

			loadBitmap("tree.png", function(image) {

				tree = image;
				self.add(tree);

				treeReposition = function() {
					put(tree.attrs, {
						x: stage.width - 400,
						y: stage.height - 400
					});
					self.draw();
				};
				treeReposition();
			});
			stage.addResizeCallback(function() {
				treeReposition();
			});

			stage.add(self);
			self.add(bg);
		}



	return Desktop;
}, ["Layer"]);
