const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const configPath = path.join(rootDir, 'template.config.json');

if (!fs.existsSync(configPath)) {
  console.error("❌ template.config.json tidak ditemukan!");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
console.log(`\n⏳ Mengaplikasikan Re-branding: "${config.brandName} - ${config.modelName}"...`);

// Helper to preserve pristine template base
function getBaseContent(filePath, templatePath) {
  if (!fs.existsSync(templatePath)) {
    fs.copyFileSync(filePath, templatePath);
  }
  return fs.readFileSync(templatePath, 'utf-8');
}

// 1. UPDATE public/thewatch.html
const htmlPath = path.join(rootDir, 'public', 'thewatch.html');
const htmlTemplatePath = path.join(rootDir, 'public', 'thewatch.template.html');
if (fs.existsSync(htmlPath)) {
  let htmlContent = getBaseContent(htmlPath, htmlTemplatePath);
  htmlContent = htmlContent.replace(/<title>.*?<\/title>/, `<title>${config.brandName} - ${config.modelName} | ${config.tagline}</title>`);
  htmlContent = htmlContent.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${config.brandName} - ${config.modelName}" />`);
  htmlContent = htmlContent.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${config.brandName} - ${config.modelName}" />`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log("✅ public/thewatch.html diperbarui.");
}

// 2. UPDATE public/assets/en_GB.CAgLt01W.js
const enGbPath = path.join(rootDir, 'public', 'assets', 'en_GB.CAgLt01W.js');
const enGbTemplatePath = path.join(rootDir, 'public', 'assets', 'en_GB.template.js');
if (fs.existsSync(enGbPath)) {
  let enGbContent = getBaseContent(enGbPath, enGbTemplatePath);

  enGbContent = enGbContent.replaceAll('PROMPTED SITE', config.brandName.toUpperCase());
  enGbContent = enGbContent.replaceAll('promptedsite', config.brandName);
  enGbContent = enGbContent.replaceAll('Prompted', config.brandName);
  enGbContent = enGbContent.replaceAll('PROMPTED', config.modelName.toUpperCase());

  if (config.weight) {
    enGbContent = enGbContent.replace(/a="[0-9]+gr"/, `a="${config.weight}"`);
  }
  if (config.diameter) {
    enGbContent = enGbContent.replace(/[0-9]+<span>mm<\/span/, `${config.diameter.replace(/mm/i, '')}<span>mm</span`);
  }

  if (config.materials) {
    const colorsObj = {
      silver: config.materials.silver?.label || "Silver Steel",
      black: config.materials.black?.label || "Deep black",
      gold: config.materials.gold?.label || "Pure Gold",
      rose: config.materials.roseGold?.label || "Rose Gold"
    };
    enGbContent = enGbContent.replace(/o=\{silver:".*?",black:".*?",gold:".*?",rose:".*?"\}/, 
      `o={silver:"${colorsObj.silver}",black:"${colorsObj.black}",gold:"${colorsObj.gold}",rose:"${colorsObj.rose}"}`);
  }

  fs.writeFileSync(enGbPath, enGbContent, 'utf-8');
  console.log("✅ public/assets/en_GB.CAgLt01W.js diperbarui.");
}

// 3. UPDATE public/assets/default-Bo472-CV.json
const matJsonPath = path.join(rootDir, 'public', 'assets', 'default-Bo472-CV.json');
const matJsonTemplatePath = path.join(rootDir, 'public', 'assets', 'default-Bo472-CV.template.json');
if (fs.existsSync(matJsonPath)) {
  let matJsonContent = getBaseContent(matJsonPath, matJsonTemplatePath);
  let matJson = JSON.parse(matJsonContent);

  if (config.materials) {
    const m = config.materials;
    if (m.silver) {
      if (matJson.materials['metal-glossy']) matJson.materials['metal-glossy'].color = m.silver.glossy;
      if (matJson.materials['metal-brushed']) matJson.materials['metal-brushed'].color = m.silver.brushed;
    }
    if (m.black) {
      if (matJson.materials['secondmetal-glossy-ext']) matJson.materials['secondmetal-glossy-ext'].color = m.black.glossy;
      if (matJson.materials['secondmetal-brushed-ext']) matJson.materials['secondmetal-brushed-ext'].color = m.black.brushed;
      if (matJson.materials['secondsingle-metal-glossy']) matJson.materials['secondsingle-metal-glossy'].color = m.black.glossy;
      if (matJson.materials['secondsingle-metal-brushed']) matJson.materials['secondsingle-metal-brushed'].color = m.black.brushed;
    }
    if (m.gold) {
      if (matJson.materials['thirdmetal-glossy-ext']) matJson.materials['thirdmetal-glossy-ext'].color = m.gold.glossy;
      if (matJson.materials['thirdmetal-brushed-ext']) matJson.materials['thirdmetal-brushed-ext'].color = m.gold.brushed;
      if (matJson.materials['thirdsingle-metal-glossy']) matJson.materials['thirdsingle-metal-glossy'].color = m.gold.glossy;
      if (matJson.materials['thirdsingle-metal-brushed']) matJson.materials['thirdsingle-metal-brushed'].color = m.gold.brushed;
    }
    if (m.roseGold) {
      if (matJson.materials['fourthmetal-glossy-ext']) matJson.materials['fourthmetal-glossy-ext'].color = m.roseGold.glossy;
      if (matJson.materials['fourthmetal-brushed-ext']) matJson.materials['fourthmetal-brushed-ext'].color = m.roseGold.brushed;
      if (matJson.materials['fourthsingle-metal-glossy']) matJson.materials['fourthsingle-metal-glossy'].color = m.roseGold.glossy;
      if (matJson.materials['fourthsingle-metal-brushed']) matJson.materials['fourthsingle-metal-brushed'].color = m.roseGold.brushed;
    }
  }

  fs.writeFileSync(matJsonPath, JSON.stringify(matJson, null, '\t'), 'utf-8');
  console.log("✅ public/assets/default-Bo472-CV.json diperbarui.");
}

console.log(`\n🎉 SELESAI! Re-branding template Next.js berhasil diaplikasikan.`);
console.log(`👉 Jalankan: npm run dev lalu buka http://localhost:3000`);
