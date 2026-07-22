const fs = require('fs');
const path = require('path');

const dir = 'd:/WORK/sharpkode';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  let modified = false;

  // Replace social icons classes to improve visibility
  // Old: text-[#0a66c2] bg-white/5 hover:bg-[#0a66c2]
  // New: text-white bg-white/10 hover:bg-[#0a66c2]
  // There's linkedin, instagram, youtube, github.
  const socialReplacements = [
    {
      oldStr: 'text-[#0a66c2] bg-white/5 hover:bg-[#0a66c2]',
      newStr: 'text-white bg-white/10 hover:bg-[#0a66c2]'
    },
    {
      oldStr: 'text-[#e1306c] bg-white/5 hover:bg-[#e1306c]',
      newStr: 'text-white bg-white/10 hover:bg-[#e1306c]'
    },
    {
      oldStr: 'text-[#fe0000] bg-white/5 hover:bg-[#fe0000]',
      newStr: 'text-white bg-white/10 hover:bg-[#fe0000]'
    },
    {
      oldStr: 'text-white bg-white/5 hover:bg-slate-700',
      newStr: 'text-white bg-white/10 hover:bg-slate-700'
    }
  ];

  for (const rep of socialReplacements) {
    if (content.includes(rep.oldStr)) {
      content = content.replace(new RegExp(rep.oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), rep.newStr);
      modified = true;
    }
  }

  // Also fix "Who We Are" image cropping in about.html and index.html
  // In index.html: <img ... class="w-full h-full object-cover rounded-lg border border-gray-200 min-h-[520px]" src="./assets/images/who-we-are-1.f2993e31.png"
  // And: <img ... class="w-full h-full object-cover rounded-lg border border-gray-200 h-[280px]" src="./assets/images/who-we-are-2.dbeea073.png"
  // Plus absolute positioning: <div class="image absolute bottom-0 left-1/3"> ... </div>
  
  // Actually, I should just fix "Who We Are" images in index.html and about.html via regex.
  if (file === 'index.html') {
    // For index.html, we need to stack content vertically on mobile.
    // The container is: <div class="w-full relative">
    // Replace with: <div class="w-full relative flex flex-col gap-6 lg:block">
    content = content.replace('<div class="w-full relative">', '<div class="w-full relative flex flex-col gap-6 lg:block">');
    
    // Change absolute image container to be relative on mobile
    // Old: <div class="image absolute bottom-0 left-1/3">
    // New: <div class="image lg:absolute lg:bottom-0 lg:left-1/3 relative">
    content = content.replace('<div class="image absolute bottom-0 left-1/3">', '<div class="image lg:absolute lg:bottom-0 lg:left-1/3 relative w-[85%] mx-auto lg:w-auto">');
    
    // Change object-cover to lg:object-cover object-contain for both images
    content = content.replace(/object-cover/g, 'lg:object-cover object-contain');
    
    // Change min-h-[520px] to lg:min-h-[520px] min-h-[300px]
    content = content.replace(/min-h-\[520px\]/g, 'lg:min-h-[520px] min-h-[300px]');
    
    // Change h-[280px] to lg:h-[280px] h-auto aspect-video
    content = content.replace(/h-\[280px\]/g, 'lg:h-[280px] h-auto aspect-video');
    
    // Change stats box to be below images on mobile
    // Old: <div class="flex items-center gap-2 md:w-fit w-[70%] py-4 px-6 bg-primary absolute bottom-5 left-1/2 -translate-x-1/2 text-white rounded-md shadow-lg">
    // New: <div class="flex items-center gap-2 md:w-fit w-[70%] py-4 px-6 bg-primary lg:absolute lg:bottom-5 lg:left-1/2 lg:-translate-x-1/2 relative mx-auto text-white rounded-md shadow-lg z-10 -mt-8 lg:mt-0">
    content = content.replace('<div\n                class="flex items-center gap-2 md:w-fit w-[70%] py-4 px-6 bg-primary absolute bottom-5 left-1/2 -translate-x-1/2 text-white rounded-md shadow-lg"\n              >', '<div\n                class="flex items-center gap-2 md:w-fit w-[70%] py-4 px-6 bg-primary lg:absolute lg:bottom-5 lg:left-1/2 lg:-translate-x-1/2 relative mx-auto text-white rounded-md shadow-lg z-10 -mt-12 lg:mt-0"\n              >');

    modified = true;
  }
  
  if (file === 'about.html') {
    // In about.html: <img ... src="./assets/images/software-dev.42b00144.jpg" alt="..." class="w-full h-full object-cover" />
    content = content.replace('class="w-full h-full object-cover"', 'class="w-full h-full lg:object-cover object-contain"');
    
    // The image container: <div class="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
    // Add aspect ratio for mobile so it scales correctly
    content = content.replace('<div class="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">', '<div class="rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] lg:aspect-auto">');
    
    // Stats box: <div class="absolute -bottom-5 -left-5 p-5 rounded-2xl bg-primary border border-primary/30 shadow-xl">
    // Make it relative on mobile
    content = content.replace('<div class="absolute -bottom-5 -left-5 p-5 rounded-2xl bg-primary border border-primary/30 shadow-xl">', '<div class="lg:absolute relative lg:-bottom-5 lg:-left-5 p-5 rounded-2xl bg-primary border border-primary/30 shadow-xl w-[90%] mx-auto -mt-10 lg:mt-0 z-10 lg:w-auto">');

    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
