/* Enemy class */

var FixAngleRange = function(angle) {
  while (angle < -180) {
    angle += 360;
  }
  while (angle > 180) {
    angle -= 360;
  }
  return angle;
}

var DegAtan = function(x, y) {
  var res = Math.atan2(y, x);
  return res * 180 / Math.PI;
};

var Enemy = function(id) {
  this.id = id;
};

Enemy.prototype.Update = function(other) {
  this.position = other.position;
  this.angle = other.angle;
};

Enemy.prototype.CloserMove = function(robot, speed) {
  var dx = this.position.x - robot.position.x;
  var dy = this.position.y - robot.position.y;

  var alpha = (90 - this.angle) * Math.PI / 180;

  var angle = DegAtan(dx + speed * Math.cos(alpha),
    dy + speed * Math.sin(alpha));
  angle = FixAngleRange(angle);

  var distance = (dx + speed * Math.cos(alpha)) /
  Math.cos(angle * Math.PI / 180);

  return {angle: angle, distance: Math.abs(distance)};
};

Enemy.prototype.Distance = function(robot) {
  var dx = this.position.x - robot.position.x;
  var dy = this.position.y - robot.position.y;
  return Math.sqrt(dx * dx + dy * dy);
};


/* Robot class */

var GetCloser = function(robot, enemy) {
  var move = enemy.CloserMove(robot, 100);
  var angle = 90 + move.angle - robot.angle;
  angle = FixAngleRange(angle);
  robot.turn(angle);
  robot.rotateCannon(-angle);

  var distance = move.distance - 100;
  if (distance > 200) {
    robot.move(Math.max(200, distance));
    return true;
  }
  return false;
};

var Robot = function(robot) {
  this.enemies = {};
  this.closest = -1;
};

Robot.prototype.Enemy = function(id) {
  if (!this.enemies[id]) {
    this.enemies[id] = new Enemy(id);
  }
  return this.enemies[id];
};

Robot.prototype.onIdle = function(ev) {
  var robot = ev.robot;
  robot.rotateCannon(360);
  var moved = false;
  if (this.closest != -1) {
    moved = GetCloser(robot, this.enemies[this.closest]); 
    this.closest = -1;    
  }
  if (!moved) {
    robot.move(100);
  }
};

Robot.prototype.onScannedRobot = function(ev) {
  var robot = ev.robot;
  var other = ev.scannedRobot;

  var enemy = this.Enemy(other.id);
  enemy.Update(other);

  if ((this.closest == -1) || (this.enemies[this.closest].Distance(robot) > enemy.Distance(robot))) {
    this.closest = enemy.id;
  }

  robot.ignore('onScannedRobot');
  for (var i = 0; i < 3; ++i) {
    robot.rotateCannon(5);
    robot.fire();    
  }
  if (enemy.Distance(robot) < 300) {
    robot.rotateCannon(-40);    
  }
  robot.listen('onScannedRobot');
};
