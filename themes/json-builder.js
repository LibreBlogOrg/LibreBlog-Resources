const fs = require('fs');
const path = require('path');

function processTheme(folderPath) {
    const themeUriPath = path.join(folderPath, 'theme_uri.txt');
    const imagePath = path.join(folderPath, 'image.txt');
    const configPath = path.join(folderPath, 'config.json');

    if (!fs.existsSync(configPath)) {
        console.error(`config.json not found in ${folderPath}`);
        return;
    }
    if (!fs.existsSync(imagePath)) {
        console.error(`image.txt not found in ${imagePath}`);
        return;
    }
    if (!fs.existsSync(themeUriPath)) {
        console.error(`theme_uri.txt not found in ${themeUriPath}`);
        return;
    }

    let themeUri = fs.readFileSync(themeUriPath, 'utf-8');
    let image = fs.readFileSync(imagePath, 'utf-8');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    if (!config.pages || !Array.isArray(config.pages) || !config.page_components || !Array.isArray(config.page_components)) {
        console.error("Invalid config format: The 'pages' or 'page_components' attribute is missing or is not an array.");
        return;
    }

    const items = config.pages.concat(config.page_components);
    const templatesPath = path.join(folderPath, 'templates');
    let templates = [];

    // Process each page
    items.forEach(item => {
        const { name, label, type } = item;
        const htmlFilePath = path.join(templatesPath, type, name, 'html', `${name}_html.html`);
        const cssFilePath = path.join(templatesPath, type, name, 'css', `${name}_css.css`);
        const rssFilePath = path.join(templatesPath, type, name, 'rss', `${name}_rss.rss`);

        // Read HTML file
        if (fs.existsSync(htmlFilePath)) {
            const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
            templates.push({ template_uri: name + "_html", template_set: name, template_type: type, content_type: "html", contents: htmlContent });
        } else {
            console.warn(`HTML file not found: ${htmlFilePath}`);
        }

        // Read CSS file
        if (fs.existsSync(cssFilePath)) {
            const cssContent = fs.readFileSync(cssFilePath, 'utf-8');
            templates.push({ template_uri: name + "_css", template_set: name, template_type: type, content_type: "css", contents: cssContent });
        } else {
            console.warn(`CSS file not found: ${cssFilePath}`);
        }

        // Read RSS file
        if (fs.existsSync(rssFilePath)) {
            const rssContent = fs.readFileSync(rssFilePath, 'utf-8');
            templates.push({ template_uri: name + "_rss", template_set: name, template_type: type, content_type: "rss", contents: rssContent });
        } else {
            console.warn(`RSS file not found: ${rssFilePath}`);
        }
    });

    const theme = {
      theme_uri: themeUri,
      image: image,
      config: config,
      templates: templates
    }

    fs.writeFileSync(themeUri + '.json', JSON.stringify(theme, null, 2));
}

const folderPath = process.argv[2];

if (!folderPath) {
    console.error('Please provide a folder path as an argument.');
    process.exit(1);
}

processTheme(folderPath);