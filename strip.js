const fs = require('fs');

const layoutCodeToRemoveRegex = /<div className="flex flex-col md:flex-row h-screen bg-gray-100.*?<main[^>]*>/s;

const closeTagsRegex = /<\/main>\s*<\/div>\s*\)\s*;\s*}/g;

const asideDesktopRegex = /<aside className="w-64 bg-white.*?\n\s*<\/aside>/s;
const alternativeCloseTagsRegex = /<\/div>\s*\)\s*;\s*}/g;
const mobileHeaderRegex = /\{\/\* Mobile Header \*\/\}.*?\{\/\* Mobile Menu Dropdown \*\/\}.*?\)\}/s;


function stripLayout(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');

    // Remove the wrapping tags entirely so we just return the inner content
    
    // First, let's remove the <header ../> with SMSAdmin from the top of the content that might be there
    content = content.replace(/<header className="flex justify-between[^>]*>.*?<\/header>/s, '');
    
    // the layout I just injected with previous tool call!
    content = content.replace(layoutCodeToRemoveRegex, '');
    content = content.replace(/<div className="flex flex-col md:flex-row h-screen bg-gray-[0-9]+[^>]*>/, '');
    content = content.replace(/<div className="flex h-screen bg-gray-[0-9]+[^>]*>/, '');
    
    content = content.replace(asideDesktopRegex, '');
    content = content.replace(mobileHeaderRegex, '');

    content = content.replace(/<main className="flex-1 p-8 overflow-y-auto">/, '<div className="p-8">');
    // Also change the flex h-screen wrapper into just <div className="p-8">
    
    // Remove closing tags properly
    content = content.replace(/<\/main>\s*<\/div>\s*(\);?)\s*\}/, '</div>$1}');
    content = content.replace(/<\/div>\s*<\/div>\s*(\);?)\s*\}/, '</div>$1}');


    // Remove isMobileMenuOpen useState since we no longer need it locally
    content = content.replace(/const \[isMobileMenuOpen, setIsMobileMenuOpen\] = React\.useState\(false\);/, '');
    content = content.replace(/const \[isMobileMenuOpen, setIsMobileMenuOpen\] = useState\(false\);/, '');


    fs.writeFileSync(filePath, content, 'utf-8');
}

stripLayout('./client/app/admin/page.tsx');
stripLayout('./client/app/admin/users/page.tsx');
stripLayout('./client/app/admin/transactions/page.tsx');
stripLayout('./client/app/admin/orders/page.tsx');
stripLayout('./client/app/admin/settings/page.tsx');
console.log('Finished stripping individual layouts');

