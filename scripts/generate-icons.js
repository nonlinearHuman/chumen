// 生成PWA图标
// 使用 sharp 或 canvas 生成图标
const fs = require('fs');
const path = require('path');

// 简单的SVG图标模板 - 楚门世界主题
const generateSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)" rx="${size * 0.15}"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold" fill="white">
    楚
  </text>
</svg>
`;

const publicDir = path.join(__dirname, '..', 'public');

// 生成SVG文件（浏览器和构建工具可以直接使用）
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), generateSVG(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), generateSVG(512));

console.log('Icons generated: icon-192.svg, icon-512.svg');
console.log('Note: For PNG icons, run: npx sharp-cli resize 192 -i public/icon-192.svg -o public/icon-192.png');
