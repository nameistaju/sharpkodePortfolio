const fs = require('fs');
const path = require('path');

const dir = 'd:/WORK/sharpkode';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const progressBtnRegex = /[\t ]*<button[\s\S]*?id="progress"[\s\S]*?<\/button>\n?/g;

const aboutNavRegex = /<li class="flex flex-col items-start lg:items-center relative group lg:py-7 w-full lg:w-auto">\s*<span\s+class="flex flex-col items-start lg:items-center whitespace-nowrap nav-link relative cursor-pointer w-full lg:w-auto"[^>]*>\s*<span\s+class="flex items-center gap-1 font-medium hover:text-primary transition-all duration-500"\s*>About[\s\S]*?<\/ul>\s*<\/li>/g;

const aboutNavReplacement = `<li class="flex flex-col items-start lg:items-center relative group lg:py-7 w-full lg:w-auto">
                <a
                  class="flex flex-col items-start lg:items-center whitespace-nowrap nav-link relative w-full lg:w-auto"
                  href="./about.html"
                  ><span
                    class="flex items-center gap-1 font-medium hover:text-primary transition-all duration-500"
                    >About</span
                  ></a
                >
              </li>`;

// Fix for quotation marks encoding in testimonial
const testimonialLeftMarkRegex = /<span class="testimonial-mark testimonial-mark-left">â€œ<\/span>/g;
const testimonialRightMarkRegex = /<span class="testimonial-mark testimonial-mark-right">â€ <\/span>/g;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  let modified = false;

  if (progressBtnRegex.test(content)) {
    content = content.replace(progressBtnRegex, '');
    modified = true;
  }

  if (aboutNavRegex.test(content)) {
    content = content.replace(aboutNavRegex, aboutNavReplacement);
    modified = true;
  }
  
  if (testimonialLeftMarkRegex.test(content)) {
    content = content.replace(testimonialLeftMarkRegex, '<span class="testimonial-mark testimonial-mark-left">&ldquo;</span>');
    modified = true;
  }
  
  if (testimonialRightMarkRegex.test(content)) {
    content = content.replace(testimonialRightMarkRegex, '<span class="testimonial-mark testimonial-mark-right">&rdquo;</span>');
    modified = true;
  }

  // Footer Social Icons Contrast fix
  // Replace `text-[#0a66c2] bg-white/5` with `text-white bg-white/10` and adjust hover so the icon takes the brand color and bg goes white?
  // Original prompt: Increase contrast, Better hover effects, Better icon colors, Better visibility on dark background.
  // Actually, let's just make the base `text-white bg-white/10` and on hover make `bg-brand_color text-white`
  // Wait, I can do this with another regex or manual multi_replace. Let's do it in the script safely.
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
