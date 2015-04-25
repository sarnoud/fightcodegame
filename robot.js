
//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
};

var id = -1;

Robot.prototype.onIdle = function(ev) {
  var robot = ev.robot;
  robot.rotateCannon(30);
};

var FixRange = function(angle) {
  while (angle < -180) {
    angle += 360;
  }
  while (angle > 180) {
    angle -= 360;
  }
  return angle;
}

var getCloser = function(robot, other) {
  var dy = other.position.y - robot.position.y;
  var dx = other.position.x - robot.position.x;

  var angle = 180 * Math.atan(dy / dx) / Math.PI;
  if (dx < 0) {
    angle += 180;
  }
  angle += 90 - robot.angle;
  angle = FixRange(angle);
  robot.turn(angle);
  robot.rotateCannon(-angle);
  
  var distance = Math.sqrt(dx * dx + dy * dy) - 100;
  if (distance > 0) {
    robot.move(distance);
  }
  
  return distance <= 0;
}

Robot.prototype.onScannedRobot = function(ev) {
  var robot = ev.robot;
  var other = ev.scannedRobot;
  if ((id >= 0) && (other.id != id)) {
    return;
  }
  id = other.id;
  robot.rotateCannon(5);
  getCloser(robot, other); 
  robot.fire();
  robot.rotateCannon(-40);
};
