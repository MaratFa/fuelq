/**
 * Initial schema migration for FuelQ database
 */
module.exports = {
  /**
   * Create the initial database schema
   * @param {Object} connection - MySQL connection
   * @param {Function} callback - Callback function
   */
  up: function(connection, callback) {
    // Create threads table
    const createThreadsTable = `
      CREATE TABLE IF NOT EXISTS threads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        category VARCHAR(50) NOT NULL,
        views INT DEFAULT 0,
        content TEXT NOT NULL
      )
    `;

    // Create posts table
    const createPostsTable = `
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        thread_id INT NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        content TEXT NOT NULL,
        FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
      )
    `;

    // Create contacts table
    const createContactsTable = `
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        newsletter BOOLEAN DEFAULT FALSE,
        date BIGINT NOT NULL
      )
    `;

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        role ENUM('admin', 'moderator', 'user') DEFAULT 'user',
        dateJoined BIGINT NOT NULL,
        lastLogin BIGINT
      )
    `;

    // Execute all table creation queries
    connection.query(createThreadsTable, (err) => {
      if (err) return callback(err);

      connection.query(createPostsTable, (err) => {
        if (err) return callback(err);

        connection.query(createContactsTable, (err) => {
          if (err) return callback(err);

          connection.query(createUsersTable, (err) => {
            if (err) return callback(err);

            // Insert sample data
            const insertThreads = `
              INSERT INTO threads (title, author, created_at, category, views, content) VALUES
              ('Latest developments in hydrogen fuel cell efficiency', 'Dr. Elena Rodriguez', '2023-05-16 09:30:00', 'hydrogen', 245, 'I wanted to share some exciting research from our lab on improving PEM fuel cell efficiency. We\\\'ve achieved a 12% improvement in energy conversion through novel catalyst materials. The key was using a graphene-supported platinum alloy that reduces catalyst poisoning while maintaining conductivity.'),
              ('Biofuels from algae: Scaling production challenges', 'Prof. James Chen', '2023-05-17 09:30:00', 'biofuels', 189, 'Our team has been working on optimizing algae growth for biofuel production. We\\\'ve developed a new photobioreactor design that increases productivity by 35% while reducing water usage. The main challenge remains harvesting cost-effectively at scale.'),
              ('Geothermal energy in cold climates', 'Sarah Kim', '2023-05-18 09:30:00', 'geothermal', 156, 'Has anyone worked on geothermal systems in colder climates? We\\\'re planning a community heating project in Alaska and wondering about efficiency concerns when ground temperatures are lower.')
            `;

            connection.query(insertThreads, (err) => {
              if (err) return callback(err);

              const insertPosts = `
                INSERT INTO posts (thread_id, author, created_at, content) VALUES
                (1, 'Prof. James Chen', '2023-05-16 10:22:00', 'Fascinating results, Dr. Rodriguez! Could you share more details about graphene support structure? We\\\'ve been working on similar approaches but haven\\\'t achieved comparable efficiency gains.'),
                (1, 'Sarah Kim', '2023-05-17 11:22:00', 'This is very promising for transportation applications. Have you tested these under real-world temperature and pressure conditions?'),
                (2, 'Dr. Elena Rodriguez', '2023-05-17 09:22:00', 'Great work, Prof. Chen! We\\\'ve experimented with membrane filtration for harvesting, which reduces energy costs by about 40% compared to centrifugation. Have you considered this approach?'),
                (3, 'Prof. James Chen', '2023-05-18 10:22:00', 'Yes, we\\\'ve implemented several geothermal systems in Alaska. The key is using antifreeze solutions in the ground loop and ensuring proper insulation. We typically see a 15-20% efficiency reduction compared to temperate climates, but the systems remain economically viable.')
              `;

              connection.query(insertPosts, callback);
            });
          });
        });
      });
    });
  },

  /**
   * Drop all tables (rollback)
   * @param {Object} connection - MySQL connection
   * @param {Function} callback - Callback function
   */
  down: function(connection, callback) {
    // Drop tables in reverse order to handle foreign key constraints
    connection.query('DROP TABLE IF EXISTS posts', (err) => {
      if (err) return callback(err);

      connection.query('DROP TABLE IF EXISTS threads', (err) => {
        if (err) return callback(err);

        connection.query('DROP TABLE IF EXISTS contacts', (err) => {
          if (err) return callback(err);

          connection.query('DROP TABLE IF EXISTS users', callback);
        });
      });
    });
  }
};
