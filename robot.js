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

var Enemy = function(id) {
  this.id = id;
};

Enemy.prototype.Update = function(position) {
  this.position = position;
};

Enemy.prototype.Angle = function(robot) {
  var dx = this.position.x - robot.position.x;
  var dy = this.position.y - robot.position.y;

  var angle = 180 * Math.atan(dy / dx) / Math.PI;
  if (dx < 0) {
    angle += 180;
  }
  angle = FixAngleRange(angle);

  return angle;
};

Enemy.prototype.Distance = function(robot) {
  var dx = this.position.x - robot.position.x;
  var dy = this.position.y - robot.position.y;
  return Math.sqrt(dx * dx + dy * dy);
};


/* Robot class */

var GetCloser = function(robot, enemy) {
  var angle = enemy.Angle(robot) + 90 - robot.angle;
  angle = FixAngleRange(angle);
  robot.turn(angle);
  robot.rotateCannon(-angle);

  var distance = enemy.Distance(robot) - 100;
  if (distance > 0) {
    robot.move(distance);
  }
};

var Robot = function(robot) {
  this.enemies = {};
};

Robot.prototype.Enemy = function(id) {
  if (!this.enemies[id]) {
    this.enemies[id] = new Enemy(id);
  }
  return this.enemies[id];
};

Robot.prototype.onIdle = function(ev) {
  var robot = ev.robot;
  robot.rotateCannon(30);
};

Robot.prototype.onScannedRobot = function(ev) {
  var robot = ev.robot;
  var other = ev.scannedRobot;

  var enemy = this.Enemy(other.id);
  enemy.Update(other.position);

  robot.rotateCannon(5);
  robot.fire();
  GetCloser(robot, enemy); 
  robot.rotateCannon(-40);
};
