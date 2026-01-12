
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// In CommonJS, __filename and __dirname are already available globally

console.log('Building TypeScript files...');

try {
  // Create dist directory if it doesn't exist
  const distDir: string = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Compile TypeScript
  execSync('npx tsc', { stdio: 'inherit' });

  // Copy assets to dist directory
  console.log('Copying assets...');
  const assetsSrcDir: string = path.join(__dirname, '..', 'src', 'assets');
  const assetsDistDir: string = path.join(distDir, 'assets');
  console.log(`Source assets directory: ${assetsSrcDir}`);
  console.log(`Destination assets directory: ${assetsDistDir}`);
  
  if (!fs.existsSync(assetsSrcDir)) {
    console.error(`Source assets directory does not exist: ${assetsSrcDir}`);
    process.exit(1);
  }
  
  // Create assets directory in dist if it doesn't exist
  if (!fs.existsSync(assetsDistDir)) {
    fs.mkdirSync(assetsDistDir, { recursive: true });
  }
  
  // Copy all files from src/assets to dist/assets
  try {
    console.log(`Starting to copy from ${assetsSrcDir} to ${assetsDistDir}`);
    copyRecursiveSync(assetsSrcDir, assetsDistDir);
    console.log('Assets copied successfully');
    
    // Verify the images were copied
    const imagesDir = path.join(assetsDistDir, 'images');
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir);
      console.log(`Images copied: ${imageFiles.join(', ')}`);
    } else {
      console.log('Images directory not found in destination');
    }
  } catch (error: any) {
    console.error('Error copying assets:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
  
  // Copy other necessary files
  const filesToCopy = ['index.html', 'manifest.json', 'sw.js'];
  for (const file of filesToCopy) {
    let srcFile: string = path.join(__dirname, '..', file);
    
    // Special handling for sw.js
    if (file === 'sw.js') {
      srcFile = path.join(distDir, file);
    }
    
    if (fs.existsSync(srcFile)) {
      const destFile: string = path.join(distDir, file);
      fs.copyFileSync(srcFile, destFile);
    }
  }
  
  // Compile sw.ts separately
  try {
    const swSrcFile: string = path.join(__dirname, '..', 'sw.ts');
    const swDestFile: string = path.join(distDir, 'sw.js');
    if (fs.existsSync(swSrcFile)) {
      console.log(`Compiling ${swSrcFile} to ${swDestFile}`);
      execSync(`npx tsc ${swSrcFile} --outFile ${swDestFile} --target ES2020 --module amd --skipLibCheck`, { stdio: 'inherit' });
    }
    
    // Also copy the compiled src/sw.ts file
    const swSrcFile2: string = path.join(__dirname, '..', 'src', 'sw.ts');
    const swDestFile2: string = path.join(distDir, 'sw.js');
    if (fs.existsSync(swSrcFile2)) {
      console.log(`Compiling ${swSrcFile2} to ${swDestFile2}`);
      execSync(`npx tsc ${swSrcFile2} --outFile ${swDestFile2} --target ES2020 --module amd --skipLibCheck`, { stdio: 'inherit' });
    }
  } catch (error: any) {
    console.error('Error compiling Service Worker:', error.message);
    process.exit(1);
  }
  
  console.log('TypeScript compilation and asset copying completed successfully!');
} catch (error: any) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

// Helper function to recursively copy directories
function copyRecursiveSync(src: string, dest: string): void {
  try {
    const exists: boolean = fs.existsSync(src);
    if (!exists) {
      throw new Error(`Source does not exist: ${src}`);
    }
    
    const stats = fs.statSync(src);
    const isDirectory: boolean = stats.isDirectory();
    
    if (isDirectory) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const items = fs.readdirSync(src);
      console.log(`Copying directory ${src} with ${items.length} items to ${dest}`);
      
      items.forEach((childItemName: string) => {
        copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        );
      });
    } else {
      console.log(`Copying file ${src} to ${dest}`);
      fs.copyFileSync(src, dest);
    }
  } catch (error: any) {
    throw new Error(`Error copying from ${src} to ${dest}: ${error.message}`);
  }
}
