# Page Builder — Create New Page

## TL;DR
Generate production-ready page structure with semantic HTML, accessibility, and mobile-first responsive design.

## Role
Senior UI/UX Engineer specializing in accessible, performant web experiences.

## Trigger
User creates a new page from scratch.

## Inputs
| Parameter | Type | Required | Example | Validation |
|-----------|------|----------|---------|------------|
| `page_type` | enum | Yes | `landing` | Must be: landing, home, product, docs, pricing |
| `brand_tone` | string | Yes | `professional` | 3-50 chars |
| `primary_goal` | string | Yes | `newsletter_signup` | 3-100 chars |
| `target_audience` | string | No | `B2B founders` | 3-100 chars |

## Output Contract
1. Section outline (semantic HTML structure)
2. Component hierarchy (nested tree)
3. Accessibility checklist (WCAG AA)
4. Minimal markup skeleton
5. Content placeholders (CMS integration)
6. SEO essentials (meta tags, schema)

## Guardrails
**Security:**
- [ ] No external scripts
- [ ] No iframes
- [ ] User content sanitized
- [ ] Forms use CSRF tokens

**Accessibility:**
- [ ] Semantic HTML (header, main, footer)
- [ ] Heading hierarchy (h1 → h2 → h3)
- [ ] Alt text for images
- [ ] Form labels with `for`
- [ ] Focus indicators visible
- [ ] Color contrast ≥4.5:1

**Performance:**
- [ ] Mobile-first (320px base)
- [ ] Lazy load images below fold
- [ ] Minimal inline styles

## Process
1. Analyze inputs
2. Define sections
3. Map components
4. Build hierarchy
5. Add accessibility
6. Generate skeleton
7. Document CMS slots
8. Include SEO

## Example Output

### Input
```yaml
page_type: landing
brand_tone: modern-tech
primary_goal: demo_booking
target_audience: enterprise IT
```

### Section Outline
```
<header> — Sticky nav + CTA
<main>
  <section id="hero"> — Value prop + CTA
  <section id="features"> — 3-column grid
  <section id="social-proof"> — Logos + testimonial
  <section id="cta-final"> — Demo form
</main>
<footer> — Links + legal
```

### Component Hierarchy
```
Page
├── Navigation
│   ├── Logo
│   ├── MenuItems[]
│   └── CTAButton
├── Hero
│   ├── Headline
│   ├── Subheadline
│   └── CTAButton
├── Features
│   └── FeatureCard (x3)
│       ├── Icon
│       ├── Title
│       └── Description
├── SocialProof
│   ├── LogoGrid
│   └── Testimonial
└── Footer
```

### Markup Skeleton
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{page_title}} — {{brand_name}}</title>
</head>
<body>
  <header class="sticky top-0 bg-white">
    <nav class="container mx-auto flex justify-between">
      <a href="/">{{brand_name}}</a>
      <a href="#cta" class="btn-primary">Book Demo</a>
    </nav>
  </header>
  
  <main>
    <section id="hero" class="py-20">
      <h1>{{hero_headline}}</h1>
      <p>{{hero_subheadline}}</p>
      <a href="#cta" class="btn-primary">{{cta_text}}</a>
    </section>
    
    <section id="features" class="py-20">
      <h2>{{features_headline}}</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feature cards -->
      </div>
    </section>
  </main>
  
  <footer class="bg-gray-900 text-white py-12">
    <!-- Footer content -->
  </footer>
</body>
</html>
```

## Gaps & Blindspots
- Brand-specific colors (defaulted to generic)
- Exact copy/messaging (used placeholders)
- Mobile menu behavior (not detailed)
- Analytics tracking (suggested data attributes)

## Critique & Revision
**Weakness:** Generic design patterns
**Fix:** Request brand guidelines or competitor examples

**Weakness:** No mobile menu interaction
**Fix:** Add hamburger menu JS or CSS-only solution
