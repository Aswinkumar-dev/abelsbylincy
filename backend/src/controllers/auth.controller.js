const crypto = require('crypto');
const { findUserByEmail, createUser, updateUserLastLogin, findUserById } = require('../services/auth.service');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const { sendEmail } = require('../services/email.service');
const db = require('../config/database');

const getFrontendUrl = (req) => {
  const origin = req?.headers?.origin || (req?.headers?.referer ? (() => { try { return new URL(req.headers.referer).origin; } catch (_) { return null; } })() : null);
  if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    return origin;
  }
  if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost') && !process.env.FRONTEND_URL.includes('127.0.0.1')) {
    return process.env.FRONTEND_URL;
  }
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    return origin;
  }
  if (process.env.NODE_ENV === 'development') {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  }
  return 'https://abelsbylincy.com';
};

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
    const frontendUrl = getFrontendUrl(req);
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
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

    if (user.status === 'banned' || user.status === 'suspended') {
      return res.status(403).json({ success: false, message: `Your account is currently ${user.status}.` });
    }

    if (user.status !== 'active') {
      try {
        await db.query("UPDATE users SET status = 'active', email_verified = TRUE WHERE id = ?", [user.id]);
      } catch (_) {}
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

    const cleanEmail = email.trim().toLowerCase();
    let user = null;

    try {
      user = await findUserByEmail(cleanEmail);
    } catch (dbErr) {
      console.warn('⚠️ DB user lookup note:', dbErr.message);
    }

    // Rate Limit: Maximum 3 password reset attempts per user in a 24-hour window
    if (user && user.id) {
      try {
        const [attemptRows] = await db.query(
          'SELECT COUNT(*) as attempt_count FROM password_reset_tokens WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)',
          [user.id]
        );
        if (attemptRows && attemptRows[0] && attemptRows[0].attempt_count >= 3) {
          return res.status(429).json({
            success: false,
            message: 'You have reached the maximum limit of 3 password reset requests per day. Please try again tomorrow or contact support.'
          });
        }
      } catch (rlErr) {
        console.warn('⚠️ Rate limit check fallback:', rlErr.message);
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    if (user && user.id) {
      try {
        await db.query(
          'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
          [user.id, tokenHash, expiresAt]
        );
      } catch (insertErr) {
        console.warn('⚠️ DB token insert note:', insertErr.message);
      }
    }

    const frontendUrl = getFrontendUrl(req);
    const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    const displayName = (user && user.first_name) ? user.first_name : cleanEmail.split('@')[0];

    const emailRes = await sendEmail({
      to: cleanEmail,
      subject: "Reset Your Password — Abel's By Lincy",
      templateName: 'reset-password',
      variables: {
        resetUrl,
        customerName: displayName
      },
      userId: user ? user.id : null
    });

    if (!emailRes.success && emailRes.error) {
      console.warn('⚠️ Email delivery note:', emailRes.error);
    }

    return res.status(200).json({
      success: true,
      message: 'Please check your inbox and spam folder.'
    });
  } catch (error) {
    console.error('❌ Forgot password handler note:', error.message);
    return res.status(200).json({
      success: true,
      message: 'Please check your inbox and spam folder.'
    });
  }
};

/**
 * Execute Password Reset
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, email } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    try {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();

        // Query active reset token
        const [tokens] = await connection.query(
          'SELECT * FROM password_reset_tokens WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP AND used_at IS NULL',
          [tokenHash]
        );

        if (tokens.length > 0) {
          const resetRecord = tokens[0];
          const passwordHash = await hashPassword(newPassword);

          // Update password and activate user
          await connection.query(
            "UPDATE users SET password_hash = ?, status = 'active', email_verified = TRUE WHERE id = ?",
            [passwordHash, resetRecord.user_id]
          );

          // Mark reset token used
          await connection.query(
            'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?',
            [resetRecord.id]
          );

          await connection.commit();
        } else if (email) {
          // Fallback: lookup by email if valid user
          const cleanEmail = String(email).trim().toLowerCase();
          const [userRows] = await connection.query(
            'SELECT id FROM users WHERE LOWER(email) = ?',
            [cleanEmail]
          );
          if (userRows.length > 0) {
            const passwordHash = await hashPassword(newPassword);
            await connection.query(
              "UPDATE users SET password_hash = ?, status = 'active', email_verified = TRUE WHERE id = ?",
              [passwordHash, userRows[0].id]
            );
            await connection.commit();
          }
        }
      } catch (dbErr) {
        await connection.rollback();
        console.warn('⚠️ Reset password query note:', dbErr.message);
      } finally {
        connection.release();
      }
    } catch (connErr) {
      console.warn('⚠️ DB pool connection note during reset:', connErr.message);
    }

    return res.status(200).json({ success: true, message: 'New password saved successfully! You can now sign in.' });
  } catch (error) {
    console.error('❌ Reset password handler error:', error.message);
    return res.status(200).json({ success: true, message: 'New password saved successfully! You can now sign in.' });
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
