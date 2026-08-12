// ============================================================
// SETUP CLOUDINARY FOLDERS
// Creates the folder structure for Abels By Lincy
// Run once: node setup-cloudinary-folders.js
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const cloudinary = require('cloudinary').v2;

// ── Cloudinary Config ───────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Folder Structure (based on DB schema) ───────────────────
// Root: abels_by_lincy  (keeps it separate from mariyam_fashions)
const ROOT = 'abels_by_lincy';

const folders = [
  // Product images  → product_images table
  `${ROOT}/products`,

  // Category images → categories.image_url / cloudinary_public_id
  `${ROOT}/categories`,

  // User profile images → users.profile_image_url
  `${ROOT}/users/profiles`,

  // Homepage / marketing banners
  `${ROOT}/banners`,

  // Review images (future-proof)
  `${ROOT}/reviews`,
];

// ── Create Folders ──────────────────────────────────────────
async function createFolders() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Abels By Lincy — Cloudinary Folder Setup  ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // Verify connection first
  try {
    const pingResult = await cloudinary.api.ping();
    console.log('✅ Connected to Cloudinary:', pingResult.status);
    console.log('');
  } catch (err) {
    console.error('❌ Failed to connect to Cloudinary:', err.message);
    process.exit(1);
  }

  // Create each folder
  for (const folder of folders) {
    try {
      const result = await cloudinary.api.create_folder(folder);
      console.log(`📁 Created: ${folder}`);
    } catch (err) {
      if (err.error && err.error.message && err.error.message.includes('already exists')) {
        console.log(`📂 Already exists: ${folder}`);
      } else {
        console.error(`❌ Error creating ${folder}:`, err.message || err.error?.message);
      }
    }
  }

  console.log('');
  console.log('── Final Folder Structure ─────────────────────');

  // List all folders under root to confirm
  try {
    const result = await cloudinary.api.sub_folders(ROOT);
    console.log(`📦 ${ROOT}/`);
    for (const f of result.folders) {
      console.log(`   ├── ${f.name}/`);
      // Check for sub-folders
      try {
        const subResult = await cloudinary.api.sub_folders(f.path);
        for (const sf of subResult.folders) {
          console.log(`   │   └── ${sf.name}/`);
        }
      } catch (_) {
        // No sub-folders
      }
    }
  } catch (err) {
    console.error('Could not list folders:', err.message);
  }

  console.log('');
  console.log('✅ Folder setup complete!');
  console.log('');
}

createFolders();
