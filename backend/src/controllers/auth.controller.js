const crypto = require('crypto');
const { findUserByEmail, createUser, updateUserLastLogin, findUserById } = require('../services/auth.service');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const { sendEmail } = require('../services/email.service');
const db = require('../config/database');

/**
 * Register a user via Email/Password
 */
const register = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      // If user exists and already has a password, fail
      if (existingUser.password_hash) {
        return res.status(409).json({ success: false, message: 'User already exists with this email address.' });
      }

      // If user exists but is Google-only (no password), allow them to add a password
      const passwordHash = await hashPassword(password);
      await connection.query(
        'UPDATE users SET password_hash = ?, first_name = ?, last_name = ? WHERE id = ?',
        [passwordHash, firstName || existingUser.first_name, lastName || existingUser.last_name, existingUser.id]
      );

      // Log verified identity update
      await connection.query(
        `INSERT INTO auth_identities (user_id, provider, provider_email, provider_email_verified)
         VALUES (?, 'email', ?, TRUE)
         ON DUPLICATE KEY UPDATE provider_email_verified = TRUE`,
        [existingUser.id, email]
      );

      await connection.commit();
      return res.status(200).json({
        success: true,
        message: 'Password successfully linked to your account. You can now login.'
      });
    }

    // New user signup
    const passwordHash = await hashPassword(password);
    const uuid = crypto.randomUUID();

    // Create user (inactive until verified)
    const [userResult] = await connection.query(
      `INSERT INTO users (uuid, email, password_hash, first_name, last_name, role, status, email_verified) 
       VALUES (?, ?, ?, ?, ?, 'customer', 'inactive', FALSE)`,
      [uuid, email, passwordHash, firstName || null, lastName || null]
    );
    const userId = userResult.insertId;

    // Create email verification token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    await connection.query(
      'INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, tokenHash, expiresAt]
    );

    // Track initial identity provider record
    await connection.query(
      "INSERT INTO auth_identities (user_id, provider, provider_email) VALUES (?, 'email', ?)",
      [userId, email]
    );

    // Send verification email via Resend
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Verify Your Email Address — Abel's By Lincy",
      templateName: 'verify-email',
      variables: {
        verificationUrl,
        customerName: firstName || 'there'
      },
      userId
    });

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Verify Email Address via Verification Link
 */
const verifyEmail = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Query active verification token
    const [tokens] = await connection.query(
      'SELECT * FROM email_verification_tokens WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP AND verified_at IS NULL',
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
    }

    const verificationRecord = tokens[0];

    // Activate user
    await connection.query(
      "UPDATE users SET email_verified = TRUE, status = 'active' WHERE id = ?",
      [verificationRecord.user_id]
    );

    // Update email identity verification status
    await connection.query(
      "UPDATE auth_identities SET provider_email_verified = TRUE WHERE user_id = ? AND provider = 'email'",
      [verificationRecord.user_id]
    );

    // Set token as verified
    await connection.query(
      'UPDATE email_verification_tokens SET verified_at = CURRENT_TIMESTAMP WHERE id = ?',
      [verificationRecord.id]
    );

    await connection.commit();
    res.status(200).json({ success: true, message: 'Email address verified successfully. You can now login.' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Standard User Login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      if (user.status === 'inactive') {
        return res.status(403).json({ success: false, message: 'Please verify your email address before logging in.' });
      }
      return res.status(403).json({ success: false, message: `Your account is currently ${user.status}.` });
    }

    await updateUserLastLogin(user.id);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.query(
      'INSERT INTO auth_sessions (user_id, refresh_token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshHash, expiresAt]
    );

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        uuid: user.uuid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request Password Reset Token
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // Return 200 to prevent user enumeration security issues
      return res.status(200).json({ success: true, message: 'If the email exists, a password reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Reset Your Password — Abel's By Lincy",
      templateName: 'reset-password',
      variables: {
        resetUrl,
        customerName: user.first_name || 'there'
      },
      userId: user.id
    });

    res.status(200).json({ success: true, message: 'If the email exists, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Execute Password Reset
 */
const resetPassword = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Query active reset token
    const [tokens] = await connection.query(
      'SELECT * FROM password_reset_tokens WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP AND used_at IS NULL',
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const resetRecord = tokens[0];

    const passwordHash = await hashPassword(newPassword);

    // Update password
    await connection.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, resetRecord.user_id]
    );

    // Mark reset token used
    await connection.query(
      'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?',
      [resetRecord.id]
    );

    await connection.commit();
    res.status(200).json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Google OAuth Login & Account Link Merging
 */
const googleLogin = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { email, googleSub, firstName, lastName, avatarUrl } = req.body;

    if (!email || !googleSub) {
      return res.status(400).json({ success: false, message: 'Google email and subject identifier are required.' });
    }

    // 1. Check if user exists by email
    let user = await findUserByEmail(email);
    let userId;

    if (user) {
      userId = user.id;

      // Check if user has Google provider linked already in auth_identities
      const [identities] = await connection.query(
        "SELECT id FROM auth_identities WHERE user_id = ? AND provider = 'google'",
        [userId]
      );

      if (identities.length === 0) {
        // Link Google profile directly to existing email user (Merging flow)
        await connection.query(
          `INSERT INTO auth_identities (user_id, provider, provider_user_id, provider_email, provider_email_verified, provider_name, provider_avatar_url)
           VALUES (?, 'google', ?, ?, TRUE, ?, ?)`,
          [userId, googleSub, email, `${firstName || ''} ${lastName || ''}`.trim(), avatarUrl || null]
        );
      }

      // If email wasn't verified before, mark verified now since Google verified it
      if (!user.email_verified) {
        await connection.query(
          "UPDATE users SET email_verified = TRUE, status = 'active' WHERE id = ?",
          [userId]
        );
        user.email_verified = 1;
        user.status = 'active';
      }
    } else {
      // 2. Register user since email doesn't exist
      const uuid = crypto.randomUUID();

      // No password_hash stored for Google-only signups
      const [userResult] = await connection.query(
        `INSERT INTO users (uuid, email, password_hash, first_name, last_name, role, status, email_verified)
         VALUES (?, ?, NULL, ?, ?, 'customer', 'active', TRUE)`,
        [uuid, email, firstName || null, lastName || null]
      );
      userId = userResult.insertId;

      // Link Google identity mapping
      await connection.query(
        `INSERT INTO auth_identities (user_id, provider, provider_user_id, provider_email, provider_email_verified, provider_name, provider_avatar_url)
         VALUES (?, 'google', ?, ?, TRUE, ?, ?)`,
        [userId, googleSub, email, `${firstName || ''} ${lastName || ''}`.trim(), avatarUrl || null]
      );

      // Re-fetch user details for response token creation
      const [newUsers] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
      user = newUsers[0];
    }

    await updateUserLastLogin(userId);

    // Generate JWT Auth Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await connection.query(
      'INSERT INTO auth_sessions (user_id, refresh_token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, refreshHash, expiresAt]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        uuid: user.uuid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Logout user by deleting their session from the database
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await db.query('DELETE FROM auth_sessions WHERE refresh_token_hash = ?', [refreshHash]);
    }

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  googleLogin,
  logout
};
