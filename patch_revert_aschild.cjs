const fs = require('fs');

function revert(file, replacePairs) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    for (let pair of replacePairs) {
        newContent = newContent.replace(pair[0], pair[1]);
    }
    if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log("Reverted", file);
    }
}

// base-ui button doesn't have asChild, it uses render={} prop.
// Or we can just use the standard button inside link pattern but fix the hydration error by NOT using a `<button>` inside an `<a>`.
// An `<a>` inside an `<a>` is invalid, a `<button>` inside an `<a>` is invalid.
// `Link` renders as an `<a>`. If `Button` from base-ui renders as a `<button>` by default, it will fail.
// So we should pass `render={<Link to="..." />}` to `Button`!
// wait, base-ui `Button` supports `render={<Link to="..."/>}`!

// Let's use `render` instead of `asChild`.

revert('src/components/common/PremiumCvSlider.tsx', [
  [/<Button asChild className="([^"]+)">\s*<Link to="([^"]+)">([^<]+)<\/Link>\s*<\/Button>/g, '<Button render={<Link to="$2" />} className="$1">$3</Button>']
]);

revert('src/components/common/SidebarWidgets.tsx', [
  [/<Button asChild variant="outline" className="([^"]+)">\s*<Link to="([^"]+)" className="([^"]+)">([^<]+)<\/Link>\s*<\/Button>/g, '<Button render={<Link to="$2" className="$3" />} variant="outline" className="$1">$4</Button>'],
  [/<Button asChild className="([^"]+)">\s*<Link to="([^"]+)" className="([^"]+)">([^<]+)<\/Link>\s*<\/Button>/g, '<Button render={<Link to="$2" className="$3" />} className="$1">$4</Button>'],
  [/<Button asChild className="([^"]+)">\s*<a href=\{([^}]+)\} target="_blank" rel="noopener noreferrer" className="([^"]+)">([^<]+)<\/a>\s*<\/Button>/g, '<Button render={<a href={$2} target="_blank" rel="noopener noreferrer" className="$3" />} className="$1">$4</Button>']
]);

revert('src/components/layout/Header.tsx', [
  [/<Button asChild size="sm" className="([^"]+)">\s*<Link to="([^"]+)">([^<]+)<\/Link>\s*<\/Button>/g, '<Button render={<Link to="$2" />} size="sm" className="$1">$3</Button>'],
  [/<Button asChild variant="ghost" size="sm" className="([^"]+)">\s*<Link to="([^"]+)">(.*?)<\/Link>\s*<\/Button>/g, '<Button render={<Link to="$2" />} variant="ghost" size="sm" className="$1">$3</Button>'],
  [/<Button asChild className="([^"]+)">\s*<Link to="([^"]+)" onClick=\{([^}]+)\}>([^<]+)<\/Link>\s*<\/Button>/g, '<Button render={<Link to="$2" onClick={$3} />} className="$1">$4</Button>']
]);

revert('src/pages/Home.tsx', [
  [/<Button asChild variant="outline" className="([^"]+)">\s*<Link to="([^"]+)" className="([^"]+)">([^<]+)<\/Link>\s*<\/Button>/g, '<Button render={<Link to="$2" className="$3" />} variant="outline" className="$1">$4</Button>'],
  [/<Button asChild className="([^"]+)">\s*<Link to="([^"]+)" className="([^"]+)">([^<]+)<\/Link>\s*<\/Button>/g, '<Button render={<Link to="$2" className="$3" />} className="$1">$4</Button>']
]);

revert('src/pages/CategoryPage.tsx', [
  [/<Button asChild variant="outline" className="([^"]+)">\s*<Link to=\{([^}]+)\}>([^<]+)<\/Link>\s*<\/Button>/g, '<Button render={<Link to={$2} />} variant="outline" className="$1">$3</Button>'],
  [/<Button asChild className="([^"]+)">\s*<Link to=\{([^}]+)\}>([^<]+)<\/Link>\s*<\/Button>/g, '<Button render={<Link to={$2} />} className="$1">$3</Button>']
]);

revert('src/pages/LocalOffreDetail.tsx', [
  [/<Button asChild className="([^"]+)">\s*<a href=\{([^}]+)\} target="_blank" rel="noopener noreferrer" className="([^"]+)">(.*?)<\/a>\s*<\/Button>/gs, '<Button render={<a href={$2} target="_blank" rel="noopener noreferrer" className="$3" />} className="$1">$4</Button>'],
  [/<Button asChild className="([^"]+)">\s*<Link to=\{([^}]+)\}>(.*?)<\/Link>\s*<\/Button>/gs, '<Button render={<Link to={$2} />} className="$1">$3</Button>']
]);

revert('src/components/article/SunucvBanner.tsx', [
  [/<Button asChild className="([^"]+)">\s*<a href="([^"]+)" target="_blank" rel="noopener noreferrer" className="([^"]+)">(.*?)<\/a>\s*<\/Button>/gs, '<Button render={<a href="$2" target="_blank" rel="noopener noreferrer" className="$3" />} className="$1">$4</Button>']
]);


