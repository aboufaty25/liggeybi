const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace `<Header />` with `{(!location.pathname.startsWith('/recruteur') && !location.pathname.startsWith('/admin')) && <Header />}`
// Actually wait, does admin have a header? Admin dashboard probably doesn't want the header either, but let's just do it for recruteur for now. Or let's see.
