USE db_test_cafitzp1;

-- add sample users
DELETE FROM SystemUser;
ALTER TABLE SystemUser AUTO_INCREMENT = 1;

INSERT INTO SystemUser (Name, Email, Username, Password, CurrentGroupID)
VALUES ("all", "n/a", "n/a", "n/a", 0);

INSERT INTO SystemUser (Name, Email, Username, Password, CurrentGroupID)
VALUES ("John Smith", "jsmith@gmail.com", "jsmith", "password", 0);

INSERT INTO SystemUser (Name, Email, Username, Password, CurrentGroupID)
VALUES ("Mike Wilson ", "mwilson@gmail.com", "mwilson", "password", 2);

INSERT INTO SystemUser (Name, Email, Username, Password, CurrentGroupID)
VALUES ("Jane Jones ", "jjones@gmail.com", "jjones", "password", 2);

-- add sample notifications
DELETE FROM Notification;
ALTER TABLE Notification AUTO_INCREMENT = 1;

INSERT INTO Notification (DateCreated, Message, Active, UserTo, UserFrom, NotificationTypeID)
VALUES (20181204124100, "Invite to group", 1, 2, 4, 1); -- invite for john from jane

INSERT INTO Notification (DateCreated, Message, Active, UserTo, UserFrom, NotificationTypeID)
VALUES (20181204124500, "SOS", 1, 1, 4, 2); -- alert for all users from jane (query where not. type = 2 & active)

-- add sample locations