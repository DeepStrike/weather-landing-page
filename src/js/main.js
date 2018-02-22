function Vec2(x, y) {
  this.x = x;
  this.y = y;
}
Vec2.prototype.set = function (x, y) {
  this.x = x;
  this.y = y;
  return this;
};
Vec2.prototype.copy = function (v) {
  return this.set(v.x, v.y);
};
Vec2.prototype.translate = function (x, y) {
  return this.set(this.x + x, this.y + y);
};
Vec2.prototype.scale = function (v) {
  return this.set(this.x * v, this.y * v);
};
Vec2.prototype.distance = function (o) {
  var dx = this.x - o.x, dy = this.y - o.y;
  return Math.sqrt(dx * dx + dy * dy);
};



function Mouse(canvas) {
  this.pos = new Vec2(0, 0);
  this.down = false;

  var self = this;
  canvas.onmousemove = function (e) {
    var r = canvas.getBoundingClientRect();
    self.pos.set(e.clientX - r.left, e.clientY - r.top);
    return e.preventDefault();
  };
  canvas.onmouseup = function (e) {
    self.down = false;
    return e.preventDefault();
  };
  canvas.onmousedown = function (e) {
    self.down = true;
    var r = canvas.getBoundingClientRect();
    self.pos.set(e.clientX - r.left, e.clientY - r.top);
    return e.preventDefault();
  };
}




class Dot {

  constructor(x, y, neihgbourhood) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.friction = 0.3;
    this.radius = 4;
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.float = 0;
    this.spring = 0.03;
    this.alpha = 0.1;
    this.color = "rgba(255,0,0,1)";
    this.lineWidth = 0;
    this.neighbors = [];
    this.neihgbourhood = neihgbourhood;

  }

  move(m) {
    let centerBall = { x: m.pos.x, y: m.pos.y, radius: this.neihgbourhood };

    // let radius = m.down?150:100;
    let radius = this.neihgbourhood;
    // var minDist = 180;
    // this.x += 1;
    // console.log(m.pos);

    let dx = - m.pos.x + this.x;
    let dy = - m.pos.y + this.y;
    var minDist = this.radius + radius;
    let dist = Math.sqrt(dx * dx + dy * dy);



    if (dist < minDist) {
      this.float = 0;

      var angle = Math.atan2(dy, dx),
        tx = centerBall.x + Math.cos(angle) * minDist,
        ty = centerBall.y + Math.sin(angle) * minDist;

      this.vx += (tx - this.x) / 10;
      this.vy += (ty - this.y) / 10;

    }


    this.vx *= this.friction;
    this.vy *= this.friction;

    // begin spir
    this.springBack();

    if (this.float > 0) {
      this.x = this.originalX + this.lastFloat * Math.sin(2 * Math.PI * this.float / this.lastFloat);
      // this.vx = 0;
      this.float = this.float - 1 / 100;
    }


    this.x += this.vx;
    this.y += this.vy;



    // console.log(this.float);
  }

  floatMe(amount) {
    // console.log('fl');
    if (this.float < 0.1) {
      this.float = amount;
      this.lastFloat = amount;
    }

  }



  addNeighbor(n, c, s) {
    var dist = Math.sqrt((n.x - this.x) * (n.x - this.x) + (n.y - this.y) * (n.y - this.y))
    this.neighbors.push({
      point: n,
      x: n.x,
      y: n.y,
      vx: n.vx,
      vy: n.vy,
      dist: dist,
      compress: c,
      strength: s
    });
  }

  addAcrossNeighbor(n) {
    this.addNeighbor(n, 1, 1);
  }

  setNeighbors(p, n) {
    this.addNeighbor(p, 30, 0.5);
  }



  springBack() {
    var dx1 = this.originalX - this.x;
    var dy1 = this.originalY - this.y;

    dx1 *= this.spring;
    dy1 *= this.spring;

    this.vx += dx1;
    this.vy += dy1;

  }

  think() {

    for (var i = 0, len = this.neighbors.length; i < len; i++) {
      // console.log(this.neighbors);
      var n = this.neighbors[i];
      var dx = this.x - n.x;
      var dy = this.y - n.y;
      // console.log(this,n,'---');
      var d = Math.sqrt(dx * dx + dy * dy);
      var a = (n.dist - d) / d * n.strength;
      if (d < n.dist) {
        a /= n.compress;
      }
      var ox = dx * a * this.friction;
      var oy = dy * a * this.friction;
      // console.log(ox,oy);
      // console.log(n)
      this.vx += ox;
      this.vy += oy;

      n.point.vx -= ox;
      n.point.vy -= oy;
      if (ox > 0.001) n.point.color = "rgba(255,0,255,1)";
      else n.point.color = "rgba(0,255,255,1)";


    }
  };

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.rotation);
    context.scale(this.scaleX, this.scaleY);
    context.lineWidth = this.lineWidth;
    context.globalAlpha = this.alpha;
    context.fillStyle = this.color;
    context.beginPath();
    //x, y, radius, start_angle, end_angle, anti-clockwise
    context.arc(0, 0, this.radius, 0, (Math.PI * 2), true);
    context.closePath();
    context.fill();
    context.restore();
  }

  drawAnchor(context) {
    context.save();
    context.translate(this.originalX, this.originalY);
    context.rotate(this.rotation);
    context.scale(this.scaleX, this.scaleY);
    context.lineWidth = this.lineWidth;
    context.globalAlpha = this.alpha;
    context.fillStyle = '#000000';
    context.beginPath();
    //x, y, radius, start_angle, end_angle, anti-clockwise
    context.arc(0, 0, this.radius, 0, (Math.PI * 2), true);
    context.closePath();
    context.fill();
    context.restore();
  }

}



function Ball(radius, color) {
  this.radius = radius || 20;

  this.color = color || "#EDC951";
  this.originalX = 0;
  this.originalY = 0;
  this.x = 0;
  this.y = 0;
  this.vx = 0;
  this.vy = 0;
  this.rotation = 0;
  this.scaleX = 1;
  this.scaleY = 1;
  this.alpha = 0;
  this.lineWidth = 0;
  this.friction = 0.9;
  this.spring = 0.03;
}

Ball.prototype.move = function (m) {
  let centerBall = { x: m.pos.x, y: m.pos.y, radius: 150 };


  // let ball = this;


  var dx = this.x - centerBall.x;
  var dy = this.y - centerBall.y;
  var minDist = this.radius + 150;
  var dist = Math.sqrt(dx * dx + dy * dy);
  // console.log(this.x,this.y, dist,minDist,centerBall);



  if (dist < minDist) {

    var angle = Math.atan2(dy, dx),
      tx = centerBall.x + Math.cos(angle) * minDist,
      ty = centerBall.y + Math.sin(angle) * minDist;

    this.vx += (tx - this.x);
    this.vy += (ty - this.y);

  }
  console.log(tx, ty, this.x, this.vx, '1')

  this.vx *= this.friction;
  this.vy *= this.friction;
  console.log(tx, ty, this.x, this.vx, '2');
  // begin
  var dx1 = this.originalX - this.x;
  var dy1 = this.originalY - this.y;

  dx1 *= this.spring;
  dy1 *= this.spring;

  this.vx += dx1;
  this.vy += dy1;
  console.log(tx, ty, this.x, this.vx, '3');
  // end

  this.x += this.vx;
  this.y += this.vy;
}

Ball.prototype.draw = function (context) {
  context.save();
  context.translate(this.x, this.y);
  context.rotate(this.rotation);
  context.scale(this.scaleX, this.scaleY);
  context.lineWidth = this.lineWidth;
  context.globalAlpha = this.alpha;
  context.fillStyle = this.color;
  context.beginPath();
  //x, y, radius, start_angle, end_angle, anti-clockwise
  context.arc(0, 0, this.radius, 0, (Math.PI * 2), true);
  context.closePath();
  context.fill();
  if (this.lineWidth > 0) {
    context.stroke();
  }
  context.restore();
};

Ball.prototype.getBounds = function (context) {
  return {
    x: (this.x - this.radius),
    y: (this.y - this.radius),
    width: this.radius * 2,
    height: this.radius * 2
  };
};





function SvgParse(SvgSelector, NumberOfPoints, leftOffset, topOffset) {
  // Смещение картинки относительно левого верхнего угла в пикселях
  leftOffset = leftOffset || 0;
  topOffset = topOffset || 0;
  let XOFF = 50 + leftOffset;
  let YOFF = 60 + topOffset;
  let RANDOM_OFFSET = false;
  // Итоговый размер картинки в ширину который мы хотим
  let SCALE = 200;
  let path = document.querySelectorAll(SvgSelector);
  let points = [], pointsData = [], POINTS = [], point = [];
  let is = {
    arr: function (a) {
      return Array.isArray(a);
    },
    str: function (a) {
      return typeof a === "string";
    },
    fnc: function (a) {
      return typeof a === "function";
    }
  };
  function extendSingle(target, source) {
    for (var key in source)
      target[key] = is.arr(source[key]) ? source[key].slice(0) : source[key];
    return target;
  }
  function extend(target, source) {
    if (!target)
      target = {};

    for (var i = 1; i < arguments.length; i++)
      extendSingle(target, arguments[i]);
    return target;
  }
  function getPathPoints(path) {
    var pathLength = path.getTotalLength();
    var pointsNumber = NumberOfPoints;
    var margin = pathLength / pointsNumber;
    var currentPosition = 0;
    var pt = { xs: 0, ys: 0 };
    var p = [], point;
    while (pointsNumber--) {
      point = path.getPointAtLength(currentPosition);
      pt.x = point.x;
      pt.y = point.y;
      p.push(extend({ ox: pt.x, oy: pt.y }, pt));
      currentPosition += margin;
    }
    return p;
  }
  for (var i = 0; i < path.length; i++) {
    pointsData.push(getPathPoints(path[i]));
  }
  pointsData[0].map(xy => {
    point = []; // specify SCALE here
    point[0] = xy.x / 32;
    point[1] = xy.y / 32;
    POINTS.push(point);

    return point;
  });
  POINTS = POINTS.map(function (xy) {
    if (RANDOM_OFFSET) {
      xy[0] += Math.random() - 0.5;
      xy[1] += Math.random() - 0.5;
    }
    return [xy[0] * SCALE + XOFF, xy[1] * SCALE + YOFF];
  });
  return POINTS;
}






class Jelateria {
  constructor(opts) {
    // console.log(opts);
    this.canvas = opts.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.paths = opts.paths;
    this.islands = [];
    this.radius = opts.radius || 50;
    this.m = new Mouse(this.canvas);
    this.parsePaths();
    this.paused = true;
    this.centerBall = new Ball(this.radius, '#ff0000');
    this.draw();

    let style = window.getComputedStyle(this.canvas);
    this.height = parseInt(style.height);
    this.width = parseInt(style.width);
    this.time = 0;

    this.tick();
  }

  parsePaths() {
    this.paths.forEach(path => {
      let island = {};
      island.dots = [];
      SvgParse(path.path, path.points, path.offsetX, path.offsetY).forEach(dot => {
        island.dots.push(new Dot(dot[0], dot[1], this.radius));
      })
      island.color = path.color;
      island.float = path.float;
      this.buildNeighbours(island.dots);
      this.islands.push(island);
    });
  }

  floatEffect(island) {
    //
    let amplitude = island.float;
    island.dots.forEach(dot => {
      // console.log(dot);
      if (parseInt(dot.x) - parseInt(dot.originalX) > 0) {
        // console.log(parseInt(dot.x),parseInt(dot.originalX),'ints'); 
      }

      if (parseInt(dot.x) == parseInt(dot.originalX) && parseInt(dot.y) == parseInt(dot.originalY)) {
        // dot.vx = 10;

        // console.log(this.time);
        // dot.x = dot.originalX;
        // console.log(dot);
        // console.log('runme');
        dot.floatMe(amplitude + amplitude / 3 * Math.random());

      }

    })
  }

  buildNeighbours(dots) {
    for (var i = 0, len = dots.length; i < len; i++) {
      var jp = dots[i];
      var pi = i === 0 ? len - 1 : i - 1;
      var ni = i === len - 1 ? 0 : i + 1;
      jp.setNeighbors(dots[pi], dots[ni]);
      // console.log(dots[pi], dots[ni],pi,ni);
      for (var j = 0; j < len; j++) {
        var ojp = dots[j];
        var curdist = Math.sqrt((ojp.x - jp.x) * (ojp.x - jp.x) + (ojp.y - jp.y) * (ojp.y - jp.y));
        if (
          ojp !== jp && ojp !== dots[pi] && ojp !== dots[ni] &&
          curdist <= 30
        ) {
          jp.addAcrossNeighbor(ojp);
        }
      }
    }
  }

  ConnectDots(island) {
    let dots = island.dots;
    this.ctx.beginPath();

    for (var i = 0, jlen = dots.length; i <= jlen; ++i) {
      var p0 = dots[i + 0 >= jlen ? i + 0 - jlen : i + 0];
      var p1 = dots[i + 1 >= jlen ? i + 1 - jlen : i + 1];
      this.ctx.quadraticCurveTo(
        p0.x,
        p0.y,
        (p0.x + p1.x) * 0.5,
        (p0.y + p1.y) * 0.5
      );
    }

    this.ctx.closePath();
    this.ctx.fillStyle = island.color;
    this.ctx.fill();

  }

  draw() {

    this.ctx.clearRect(0, 0, this.width, this.height);

    // mouse draw
    this.centerBall.x = this.m.pos.x;
    this.centerBall.y = this.m.pos.y;
    this.centerBall.draw(this.ctx);
    // end

    this.islands.forEach(island => {
      this.floatEffect(island);
      island.dots.forEach(dot => {
        dot.think();
      })
      island.dots.forEach(dot => {
        dot.move(this.m);
        // dot.draw(this.ctx);
        // dot.drawAnchor(this.ctx);
      })
      this.ConnectDots(island);
    })
  }

  tick() {
    if (!this.paused) {
      this.time++;
      this.draw();
    }
    window.requestAnimationFrame(this.tick.bind(this));
  }

  pause() {
    console.log('pause animation');
    this.paused = true;
  }
  play() {
    console.log('play animation');
    this.paused = false;
  }

}


let canvas = document.getElementById('canvas');

let jela = new Jelateria({
  canvas: canvas,
  radius: 50,
  paths: [{
    path: '#jelly',
    offsetX: 30,
    offsetY: 0,
    points: 100,
    color: '#E60C87',
    float: 0.3
  }]
});


jela.play();

