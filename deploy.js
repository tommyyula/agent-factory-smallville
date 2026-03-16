import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Deploying Agent Factory Smallville to GitHub Pages');

try {
  // Build shared package
  console.log('📦 Building shared package...');
  execSync('npm run build', { cwd: 'packages/shared', stdio: 'inherit' });
  
  // Build client
  console.log('🎨 Building client...');
  process.env.NODE_ENV = 'production';
  execSync('npm run build', { cwd: 'packages/client', stdio: 'inherit' });
  
  // Create .nojekyll file to prevent GitHub from processing the site with Jekyll
  console.log('📝 Creating .nojekyll file...');
  writeFileSync('packages/client/dist/.nojekyll', '');
  
  // Create CNAME file if needed (optional)
  // writeFileSync('packages/client/dist/CNAME', 'your-domain.com');
  
  // Deploy to GitHub Pages using gh-pages
  console.log('🌐 Deploying to GitHub Pages...');
  
  try {
    execSync('npx gh-pages -d packages/client/dist --dotfiles', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ Deployment successful!');
    console.log('🔗 Your site will be available at: https://tommyyula.github.io/agent-factory-smallville/');
    console.log('');
    console.log('🎭 The app will run in mock mode on GitHub Pages (no backend required)');
    console.log('🤖 You can see 4 sample agents with simulated behavior');
    console.log('💭 Thought bubbles and communications are simulated');
    console.log('📊 All dashboard features work in mock mode');
    
  } catch (deployError) {
    console.error('❌ GitHub Pages deployment failed:', deployError.message);
    console.log('');
    console.log('🔧 Manual deployment steps:');
    console.log('1. Install gh-pages: npm install -g gh-pages');
    console.log('2. Run: npx gh-pages -d packages/client/dist --dotfiles');
    console.log('3. Or manually copy packages/client/dist/* to gh-pages branch');
  }
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}