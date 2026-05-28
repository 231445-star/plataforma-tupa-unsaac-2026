---
name: Academic Heritage
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5a403c'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8e706b'
  outline-variant: '#e3beb8'
  surface-tint: '#b52619'
  primary: '#610000'
  on-primary: '#ffffff'
  primary-container: '#8b0000'
  on-primary-container: '#ff907f'
  inverse-primary: '#ffb4a8'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#2c2c28'
  on-tertiary: '#ffffff'
  tertiary-container: '#43423d'
  on-tertiary-container: '#b0aea8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#920703'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e5e2db'
  tertiary-fixed-dim: '#c9c6c0'
  on-tertiary-fixed: '#1c1c18'
  on-tertiary-fixed-variant: '#474742'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 20px
---

## Brand & Style

This design system is built for a modern university marketplace that bridges the historical prestige of UNSAAC with the efficiency of a contemporary digital ecosystem. The brand personality is **authoritative yet accessible**, combining the weight of academic tradition with the fluidity of modern commerce.

The visual style is **Minimalist with Cultural Accents**. It utilizes expansive white space and a clean, card-based architecture to ensure clarity. To differentiate the product, subtle Andean geometric patterns (inspired by Cusco’s textile and architectural heritage) are integrated as low-opacity background watermarks or decorative borders. This creates a "Institutional Premium" feel—reliable, grounded, and unmistakably local.

## Colors

The palette is rooted in the university's identity:
- **Primary (Deep Red):** Used for critical actions, navigation headers, and primary branding. It conveys power and institutional history.
- **Secondary (Gold):** Used for highlights, accents, and high-value status indicators. It adds a premium feel and provides warmth against the cool white surfaces.
- **Tertiary (Warm Bone):** A soft, off-white used for background surfaces to reduce eye strain compared to pure white, echoing the texture of stone or paper.
- **Neutral:** A deep charcoal rather than pure black is used for typography to maintain a sophisticated contrast ratio.

## Typography

The design system utilizes **Inter** exclusively to maintain a systematic, utilitarian aesthetic. The type scale is designed for high readability in a marketplace context, where price points and product titles must be scanned quickly. 

Headlines use tighter letter spacing and heavier weights to create a sense of importance. Body text is set with generous line heights to ensure long-form academic or service descriptions are comfortable to read. Labels utilize slight tracking (letter spacing) and a medium weight to distinguish them from standard body copy.

## Layout & Spacing

The layout follows a **12-column fluid grid** for desktop and a **4-column grid** for mobile devices. 

- **Grid Logic:** Content is housed in containers with a maximum width of 1280px to prevent excessive line lengths on ultra-wide monitors.
- **Rhythm:** An 8px base unit governs all padding and margins. 
- **Adaptation:** On mobile, margins shrink to 20px, and card-based items typically reflow to a single-column stack. Heavy use of "gap" properties in flex and grid layouts ensures consistent white space between marketplace items.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering**. 

1.  **Level 0 (Surface):** The Tertiary Warm Bone (#F4F1EA) serves as the base canvas.
2.  **Level 1 (Cards/Elements):** Pure White cards sit atop the surface with an extremely soft shadow (Offset 0px, 4px Blur, 20px Spread, 4% Black opacity).
3.  **Level 2 (Hover/Active):** On interaction, cards lift slightly with a more pronounced shadow and a 1px Gold border to signal focus.

This approach avoids heavy skueomorphism, opting instead for a "floating paper" feel that remains clean and modern.

## Shapes

The shape language is defined by **Large Rounded Corners**. 

The base radius is 0.5rem (8px), but container-level components like marketplace cards and main navigation blocks use `rounded-xl` (1.5rem / 24px) to evoke a friendly, contemporary feel. This softness contrasts with the geometric Andean patterns used in the background, creating a balance between organic approachability and structured tradition.

## Components

- **Buttons:** Primary buttons are solid Deep Red with White text. Secondary buttons use a Gold outline with Gold text. All buttons feature high-radius corners (pill-shaped or 12px) to match the friendly UI tone.
- **Cards:** The core of the marketplace. Cards are White with a 1px soft grey border. A "Gold Tab" (a 4px top border in Gold) is used to denote "Featured" items.
- **Input Fields:** Large, 16px padding with an 8px radius. The focus state transitions the border to Primary Red with a soft red outer glow.
- **Chips/Badges:** Small, rounded-full elements used for categories (e.g., "Academic," "Food," "Admin"). Backgrounds use 10% opacity of the Primary or Secondary colors to keep them subtle.
- **Andean Dividers:** Instead of simple grey lines, section breaks can optionally use a stylized, geometric "step" pattern at 5% opacity.
- **Navigation:** A clean top bar with a White background and a subtle shadow. The active link is indicated by a bold Primary Red underline.