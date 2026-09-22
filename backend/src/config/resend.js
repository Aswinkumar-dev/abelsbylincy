const { Resend } = require('resend');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_1234567890abcdef');

module.exports = resend;

