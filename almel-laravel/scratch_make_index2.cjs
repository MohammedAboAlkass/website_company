const fs = require('fs');

let html = fs.readFileSync('../index-navy.html', 'utf8');

// Replace relative assets to work cleanly in Laravel public directory
html = html.replace(/href="css\//g, 'href="/assets/site/css/');
html = html.replace(/src="js\//g, 'src="/assets/site/js/');
html = html.replace(/src="img\//g, 'src="/assets/site/img/');
html = html.replace(/poster="img\//g, 'poster="/assets/site/img/');
html = html.replace(/href="img\//g, 'href="/assets/site/img/');
html = html.replace(/href="admin\/login-2\.html"/g, 'href="/admin/login"');
html = html.replace(/href="admin\/login\.html"/g, 'href="/admin/login"');

fs.writeFileSync('public/index2.html', html, 'utf8');
console.log('Saved public/index2.html, size:', html.length);
