const fs = require('fs');

const files = [
  'd:/Github/notion-clone/frontend/src/pages/PageView.tsx',
  'd:/Github/notion-clone/frontend/src/components/sidebar/Sidebar.tsx',
  'd:/Github/notion-clone/frontend/src/components/page/BlockRenderer.tsx',
  'd:/Github/notion-clone/frontend/src/components/blocks/TableBlock.tsx',
  'd:/Github/notion-clone/frontend/src/components/page/PageHeader.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove import
    content = content.replace(/import\s+\{\s*ScifiTooltip\s*\}\s+from\s+["']@\/components\/ui\/scifi-tooltip["'];?\r?\n?/g, '');
    
    // Remove <ScifiTooltip ...> and </ScifiTooltip> wrappers
    content = content.replace(/<ScifiTooltip[^>]*>\s*([\s\S]*?)\s*<\/ScifiTooltip>/g, '$1');
    
    fs.writeFileSync(file, content);
    console.log('Processed ' + file);
  } else {
    console.log('File not found: ' + file);
  }
});

try {
  fs.unlinkSync('d:/Github/notion-clone/frontend/src/components/ui/scifi-tooltip.tsx');
  console.log('Deleted scifi-tooltip.tsx');
} catch(e) {
  console.log('Could not delete scifi-tooltip.tsx:', e.message);
}
