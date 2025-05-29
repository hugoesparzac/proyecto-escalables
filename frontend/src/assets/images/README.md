# Images Directory Structure

This directory contains all the images used in the Cafetera de Ingeniería application.

## Directory Structure

```
assets/images/
├── logo/
│   ├── logo.png                 # Main logo (currently: 150x50px or similar) ✅ PRESENT
│   ├── logo.svg                 # SVG version (fallback) ✅ PRESENT  
│   ├── logo-white.png          # White version for dark backgrounds (TODO)
│   └── favicon.ico             # Favicon for browser tab (TODO)
├── hero/
│   ├── hero-coffee.svg         # Hero section placeholder ✅ PRESENT
│   └── hero-coffee.jpg         # Hero section background image (TODO)
├── products/
│   ├── default-product.svg     # Default product placeholder ✅ PRESENT
│   └── default-product.jpg     # Default product image (TODO)
└── categories/
    └── (category-specific images if needed)
```

## Logo Requirements

For the main logo (`logo.png`):
- Recommended size: 150x50px or 120x40px
- Format: PNG with transparent background
- Should work well on red background (#BD4B45)

For the white logo (`logo-white.png`):
- Same dimensions as main logo
- White/light colored version for dark backgrounds
- Format: PNG with transparent background

## Image Optimization Tips

1. Compress images to reduce file size
2. Use appropriate formats:
   - PNG for logos and images with transparency
   - JPG for photos and complex images
   - SVG for simple graphics and icons
3. Provide retina/high-DPI versions if needed (@2x)
