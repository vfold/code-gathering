define("Shape", function(self) {

	// Background shape for the launcher
	var bg = new Shape({
		drawFunc: function() {}
	}),
		// Launcher container
		lCont = new Layer(),
		// Dummy background for mouse movement
		dummyBg = new Shape(drawing.rect),
		//
		apps,
		//
		appActive,
		// Number of applications pinned to launcher
		numApps = 5,
		// Tab Normal Size
		size = 50,
		// Application Launcher width
		lWidth = numApps * size,
		// Corner Radius
		rd = 6,
		// Tab zoomed size
		zoomSize = 10;

	var Launcher = function() {

			stage.add(this);

			put(dummyBg.attrs, {
				width: lWidth,
				height: size + zoomSize,
				fill: "black",
				alpha: 0.5
			});

			stage.addResizeCallback(function() {
				put(self.attrs, {
					x: (stage.getWidth() - lWidth) >> 1
				});
			});

			dummyBg.on("mousemove", function() {

				drawBg();
			});
		};

	var drawBg = function() {

			// Get context for drawing
			var ctx = bg.getContext(),
				// Properties
				pts = ["#FF0000"],
				// Draw path commands
				cmd = "bFmlqlqlqlqlqlqlqlqlcf",
				// Draw path coordinates
				crds = new Int16Array(52),
				// Local mouse position
				mPos = getLocalMousePos(self),
				// The ratio of mouse related position to launcher's tab 
				moveRatio,
				// Application Launcher's local mouse position ratio 
				lPosRatio = mPos.x / size,
				//
				appOver = Math.ceil(lPosRatio),
				//
				appRatio = 1 + lPosRatio - appOver,
				// Left tab size difference from original tab size 
				leftTabDiff,
				// Right tab size difference from original tab size  
				rightTabDiff,
				// Gap between left corner and left tab
				leftGap = (size * appOver) - (rd << 1),
				// Gap between right tab and right corner
				rightGap = (size * appOver) - (rd << 1),
				// Left Commands: [mlqlqlql] qlqlqlqlql
				leftCrds,
				// Tab separator Commands: mlqlqlql [qlq] lqlqlql
				sepCrds,
				// Right Commands: mlqlqlqlqlq [lqlqlql]
				rightCrds;

			/************************************************
			 * Calculating the coordinates for path drawing
			 ************************************************/

			// Check if mouse is on the right half side of the tab
			if (isRight == (appRatio > 0.5)) {

				moveRatio = 1.5 - appRatio;
				leftTabDiff = zoomSize * moveRatio;
				rightTabDiff = zoomSize * (1 - moveRatio);

				rightGap -= rightTabDiff;

				sepCrds = [
				rd, 0, 0, -rd, // Start Corner
				0, -rightTabDiff, // Line Up to start of right tab
				0, -rd, 0, rd // End Corner		
				];

				// mouse is on the left half side of the tab
			} else {

				moveRatio = appRatio + 0.5;
				leftTabDiff = zoomSize * (1 - moveRatio);
				rightTabDiff = zoomSize * moveRatio;

				leftGap += leftTabDiff;

				sepCrds = [
				rd, 0, 0, -rd, // Start Corner
				0, rightTabDiff, // Line Down to start of right tab
				0, -rd, 0, rd // End Corner		
				];
			}


			/****************************************************
			 * Left part before reaching tab separator
			 * Commands: [mlqlqlql]qlqlqlqlql
			 ****************************************************/

			leftCrds = [
			0, 0, //Move Tos
			0, size - rd, // Line To
			0, rd, rd, 0, // Left Corner of application launcher
			leftGap, 0, // Up until extending tab 
			rd, 0, 0, rd, // Corner of Left tab
			0, leftTabDiff - rd, // Left tab extension
			0, rd, rd, 0, // Bottom Left Tab corner
			(leftTabDiff + size) - (rd << 1), 0 // Line across tab
			];

			/****************************************************
			 * Right part after tab separator
			 * Commands: mlqlqlqlqlq[lqlqlql]
			 ****************************************************/

			rightCrds = [
			(rightTabDiff + size) - (rd << 1), 0, // Line for right tab
			rd, 0, 0, -rd, // Bottom-right right tab corner
			0, -rightTabDiff, // right side tab line 
			0, -rd, rd, 0, // Top-right right tab corner
			rightGap, 0, // After right extending tab
			rd, 0, 0, -rd, // Far right corner
			0, rd - size // Up to the top again
			];

			/****************************************************
			 * Adding the coordinates
			 ****************************************************/

			crds.set(leftCrds, 0);
			crds.set(sepCrds, 21);
			crds.set(rightCrds, 31);

			drawPath(ctx, cmd, crds, pts);
		};

	lCont.add(bg);
	self.add(lCont);
	self.add(dummyBg);

	return Launcher;
}, ["Layer"]);
