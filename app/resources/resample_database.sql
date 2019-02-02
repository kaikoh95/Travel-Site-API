# MySQL script for inserting sample data into the database


INSERT INTO VenueCategory
    (category_id, category_name, category_description)
VALUES
    (1, 'Accommodation', 'The best places to stay in town.'),
    (2, 'Cafés & Restaurants', 'The finest dining in town.'),
    (3, 'Attractions', 'The coolest things to see in town.'),
    (4, 'Events', 'What\'s going on in town.'),
    (5, 'Wonders of Nature', 'The most beautiful spots out of town.');

INSERT INTO Facility
    (facility_id, facility_name, facility_description)
VALUES
    (1, 'Public Restroom', ''),
    (2, 'WiFi', ''),
    (3, 'Free Parking', ''),
    (4, 'Japanese Cuisine', ''),
    (5, 'Italian Cuisine', '');

INSERT INTO Venue
    (venue_id, admin_id, category_id, venue_name, city, short_description, long_description, date_added, address,
    latitude,
    longitude)
VALUES
    (1, 1, 2, 'The Wok', 'Christchurch', 'Home of the world-famous $2 rice', '', '2018-12-25',
    'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
    -43.523617, 172.582885),
    (2, 2, 5, 'Ilam Gardens', 'Christchurch', 'Kinda pretty', '', '2019-01-01',
    '87 Ilam Rd, Ilam, Christchurch 8041, New Zealand',
    -43.524219, 172.576032),
    (3, 3, 1, 'Erskine Building', 'Christchurch', 'Many a late night has been spent here', '', '2019-01-01',
    'Erskine Science Rd, Ilam, Christchurch 8041, New Zealand',
    -43.522535, 172.581086);