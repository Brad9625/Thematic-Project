CREATE TABLE Routes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    from_node INT,
    to_node INT,
    colour VARCHAR(20)
);

CREATE TABLE Locations (
    location INT PRIMARY KEY,
    xPos FLOAT,
    yPos FLOAT
);

INSERT INTO Routes (from_node, to_node, colour) VALUES (1, 2, 'yellow');
INSERT INTO Routes (from_node, to_node, colour) VALUES (3, 4, 'yellow');
INSERT INTO Routes (from_node, to_node, colour) VALUES (9, 10, 'yellow');
INSERT INTO Routes (from_node, to_node, colour) VALUES (10, 11, 'yellow');
INSERT INTO Routes (from_node, to_node, colour) VALUES (11, 13, 'yellow');
INSERT INTO Routes (from_node, to_node, colour) VALUES (13, 14, 'yellow');
INSERT INTO Routes (from_node, to_node, colour) VALUES (14, 16, 'yellow');
INSERT INTO Routes (from_node, to_node, colour) VALUES (19, 20, 'yellow');

INSERT INTO Routes (from_node, to_node, colour) VALUES (7, 20, 'red');

INSERT INTO Routes (from_node, to_node, colour) VALUES (3, 8, 'green');
INSERT INTO Routes (from_node, to_node, colour) VALUES (5, 6, 'green');
INSERT INTO Routes (from_node, to_node, colour) VALUES (11, 12, 'green');
INSERT INTO Routes (from_node, to_node, colour) VALUES (12, 14, 'green');
INSERT INTO Routes (from_node, to_node, colour) VALUES (15, 16, 'green');
INSERT INTO Routes (from_node, to_node, colour) VALUES (15, 17, 'green');
INSERT INTO Routes (from_node, to_node, colour) VALUES (17, 18, 'green');
INSERT INTO Routes (from_node, to_node, colour) VALUES (18, 19, 'green');
INSERT INTO Routes (from_node, to_node, colour) VALUES (19, 20, 'green');

INSERT INTO Locations (location, xPos, yPos) VALUES (1, 206.200, 335.995);
INSERT INTO Locations (location, xPos, yPos) VALUES (2, 389.148, 874.011);
INSERT INTO Locations (location, xPos, yPos) VALUES (3, 596.642, 1492.888);
INSERT INTO Locations (location, xPos, yPos) VALUES (4, 95.734, 177.652);
INSERT INTO Locations (location, xPos, yPos) VALUES (5, 820.955, 2079.943);
INSERT INTO Locations (location, xPos, yPos) VALUES (6, 615.779, 2415.488);
INSERT INTO Locations (location, xPos, yPos) VALUES (7, 1112.234, 2705.666);
INSERT INTO Locations (location, xPos, yPos) VALUES (8, 986.392, 1419.019);
INSERT INTO Locations (location, xPos, yPos) VALUES (9, 841.173, 766.237);
INSERT INTO Locations (location, xPos, yPos) VALUES (10, 994.611, 454.270);
INSERT INTO Locations (location, xPos, yPos) VALUES (11, 1536.674, 478.471);
INSERT INTO Locations (location, xPos, yPos) VALUES (12, 2090.810, 574.290);
INSERT INTO Locations (location, xPos, yPos) VALUES (13, 1570.613, 1343.749);
INSERT INTO Locations (location, xPos, yPos) VALUES (14, 2052.127, 1368.004);
INSERT INTO Locations (location, xPos, yPos) VALUES (15, 2865.179, 1065.722);
INSERT INTO Locations (location, xPos, yPos) VALUES (16, 2804.937, 1435.299);
INSERT INTO Locations (location, xPos, yPos) VALUES (17, 3310.560, 773.128);
INSERT INTO Locations (location, xPos, yPos) VALUES (18, 3921.903, 1174.111);
INSERT INTO Locations (location, xPos, yPos) VALUES (19, 3780.475, 2161.489);
INSERT INTO Locations (location, xPos, yPos) VALUES (20, 2711.313, 2355.649);