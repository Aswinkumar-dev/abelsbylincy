const db = require('../config/database');

const findUserByEmail = async (email) => {
  if (!email) return null;
  const cleanEmail = String(email).trim().toLowerCase();
  const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

const findUserByUuid = async (uuid) => {
  const [rows] = await db.query('SELECT * FROM users WHERE uuid = ?', [uuid]);
  return rows[0];
};

const createUser = async (uuid, email, passwordHash, firstName, lastName, role = 'customer') => {
  const cleanEmail = String(email).trim().toLowerCase();
  const [result] = await db.query(
    `INSERT INTO users (uuid, email, password_hash, first_name, last_name, role, status, email_verified) 
     VALUES (?, ?, ?, ?, ?, ?, 'active', TRUE)`,
    [uuid, cleanEmail, passwordHash, firstName, lastName, role]
  );
  return result.insertId;
};

const updateUserLastLogin = async (userId) => {
  await db.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
};

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByUuid,
  createUser,
  updateUserLastLogin
};
