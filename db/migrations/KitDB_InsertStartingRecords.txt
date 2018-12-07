USE db_test_cafitzp1;

DELETE FROM LocationType;
ALTER TABLE LocationType AUTO_INCREMENT = 1;

INSERT INTO LocationType (Name)
VALUES ("UserLocation");

INSERT INTO LocationType (Name)
VALUES ("MeetUp");

INSERT INTO LocationType (Name)
VALUES ("Fixed");

DELETE FROM NotificationType;
ALTER TABLE NotificationType AUTO_INCREMENT = 1;

INSERT INTO NotificationType (Name)
VALUES ("Invite");

INSERT INTO NotificationType (Name)
VALUES ("Alert");

INSERT INTO NotificationType (Name)
VALUES ("Message");