/**
* raphael.arrow-set plugin
* Copyright (c) 2011 @author: top-flight
*
* Licensed under the MIT license
*/
(function() {
    
/**
* Create a set that will contain a path for the arrow line and a path for the arrow head.
*/
    Raphael.fn.arc = function (x1, y1, x2, y2, r) {
        var paper = this;
        var arrow = paper.set();
    
        var x3 = Math.min(x1,x2) + (Math.max(x1,x2) - Math.min(x1,x2))/2;
        var y3 = Math.min(y1,y2) + (Math.max(y1,y2) - Math.min(y1,y2))/2;
	
		arrow.push(paper.path(triangle(x3, y3 - (r / 2), r)).rotate(arrowHeadAngle(x1, y1, x3, y3), x3, y3));
        arrow.push(paper.path(line(x1, y1, x2, y2)));
		
        arrow[0].attr({ "fill": "brown", "stroke-width": "1", "stroke": "gray" });
        arrow[1].attr({ "stroke-width": "2", "stroke": "brown" });

        
        return arrow;
        
        /**
* Calculate angle to rotate arrow head by
* This function was inspired by: http://taitems.tumblr.com/post/549973287/drawing-arrows-in-raphaeljs
*/
        function arrowHeadAngle (x1, y1, x2, y2) {
            var angle = Math.atan2(x1 - x2, y2 - y1);
            angle = ((angle / (2 * Math.PI)) * 360) + 180;
            return angle;
        }
    
        /**
* String that represents a line path on canvas
* Adapted from raphael.primitives.js
* For more info visit: https://github.com/DmitryBaranovskiy/raphael
*/
        function line (x1, y1, x2, y2) {
            return ["M", x1, y1, "L", x2, y2];
        }
        
        /**
* String that represents a triangle path on canvas
* Adapted from raphael.primitives.js
* For more info visit: https://github.com/DmitryBaranovskiy/raphael
*/
        function triangle (cx, cy, r) {
            r *= 1.75;
            return "M".concat(cx, ",", cy, "m0-", r * .58, "l", r * .5, ",", r * .87, "-", r, ",0z");
        }
    };
})();
