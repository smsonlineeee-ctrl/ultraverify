const fs = require('fs');
const files = [
  'app/admin/page.tsx',
  'app/admin/users/page.tsx',
  'app/admin/transactions/page.tsx',
  'app/admin/orders/page.tsx',
  'app/admin/settings/page.tsx'
];
for(let file of files) {
  if(!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  let newCode = code.replace(/<div className="flex [^>]+>[\s\S]*?<aside[\s\S]*?<\/aside>[\s\S]*?<main[^>]*>/, '<div className="w-full">');
  newCode = newCode.replace(/<\/main>\s*<\/div>\s*<\/div>/, '</div>\n    </div>');
  newCode = newCode.replace(/<\/main>\s*<\/div>\s*\)\;\s*\}/, '</div>\n  );\n}');
  if(code !== newCode) {
    fs.writeFileSync(file, newCode);
    console.log('Fixed:', file);
  } else {
    console.log('No changes needed:', file);
  }
}
