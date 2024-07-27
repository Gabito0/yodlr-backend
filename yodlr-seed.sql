-- Insert seed data into users table
-- password for all users: password

INSERT INTO users (id, email, password, first_name, last_name, is_admin, state)
VALUES
(1, 'kyle@getyodlr.com', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'Kyle', 'White', false, 'active'),
(2, 'jane@getyodlr.com', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'Jane', 'Stone', false, 'active'),
(3, 'lilly@getyodlr.com', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'Lilly', 'Smith', false, 'pending'),
(4, 'fred@getyodlr.com', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'Fred', 'Miles', false, 'pending'),
(5, 'alex@getyodlr.com', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'Alexandra', 'Betts', false, 'pending'),
(6, 'adminUser@test.com', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'AdminFirst', 'AdminLast', true, 'active'),
(7, 'user@test.com', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'UserFirst', 'UserLast', false, 'active');

