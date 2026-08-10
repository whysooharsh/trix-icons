import React, { useRef, useState } from 'react';
import type { AnimatedIconHandle } from '@trix/core';
import type { GeneratedRegistry, RegistryEntry } from '@trix/registry';
import {
  CallIcon,
  CheckIcon,
  DownloadIcon,
  LeetcodeIcon,
  MailIcon,
  MediumIcon,
  RefreshIcon,
} from '@trix/icons';
import { LogoMark } from './components/LogoMark';

// Import generated registry source of truth (3 levels up to root)
import registryDataRaw from '../../../registry/icons.json';

const registryData = registryDataRaw as unknown as GeneratedRegistry;

// Component map linking registry entry slugs to React component implementations
const COMPONENT_MAP: Record<
  string,
  React.ForwardRefExoticComponent<
    import('@trix/core').AnimatedIconProps &
      React.RefAttributes<AnimatedIconHandle>
  >
> = {
  call: CallIcon,
  check: CheckIcon,
  download: DownloadIcon,
  leetcode: LeetcodeIcon,
  mail: MailIcon,
  medium: MediumIcon,
  refresh: RefreshIcon,
};

export function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<RegistryEntry | null>(null);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [modalCliCopied, setModalCliCopied] = useState<boolean>(false);

  // Standalone feature refs for interactive demonstration
  const mediumFeatureRef = useRef<AnimatedIconHandle>(null);
  const leetcodeFeatureRef = useRef<AnimatedIconHandle>(null);
  const callFeatureRef = useRef<AnimatedIconHandle>(null);
  const mailFeatureRef = useRef<AnimatedIconHandle>(null);
  const downloadFeatureRef = useRef<AnimatedIconHandle>(null);
  const checkFeatureRef = useRef<AnimatedIconHandle>(null);

  // Modal inspection ref
  const modalIconRef = useRef<AnimatedIconHandle>(null);

  // Copy helper
  const handleCopy = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  // Filter icons based on category & search
  const filteredIcons = registryData.icons.filter((icon) => {
    const matchesCategory =
      selectedCategory === 'all' || icon.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.keywords.some((k) =>
        k.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const categories = [
    'all',
    ...Array.from(new Set(registryData.icons.map((i) => i.category))),
  ];

  const codeExample = `// 1. Install component source code into your project
$ npx trix add call

// 2. Import and use the component with standard props or imperative handle
import { useRef } from 'react';
import { CallIcon } from '@/components/icons/CallIcon';
import type { AnimatedIconHandle } from '@trix/core';

export function DialButton() {
  const iconRef = useRef<AnimatedIconHandle>(null);

  return (
    <CallIcon
      ref={iconRef}
      size={32}
      color="currentColor"
      trigger="hover"
      aria-label="Call"
    />
  );
}`;

  const SelectedComponent = selectedIcon ? COMPONENT_MAP[selectedIcon.slug] : null;

  return (
    <>
      {/* Header */}
      <header>
        <div className="container nav-row">
          <a href="#" className="brand-title">
            <LogoMark size={30} gradientId="headerLogo" />
            <span>trix-icons</span>
          </a>
          <nav className="nav-menu">
            <a href="#showcase" className="nav-link">
              Showcase
            </a>
            <a href="#developer" className="nav-link">
              Developer API
            </a>
            <a href="#browser" className="nav-link">
              Icon Browser
            </a>
            <a href="#provenance" className="nav-link">
              Provenance
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="nav-cta"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Editorial Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-editorial-tag">Source-Distributed Icon System</div>
          <h1 className="hero-heading">
            Animated icons for interfaces that move with intention.
          </h1>
          <p className="hero-description">
            A React icon component library built on source distribution. Small SVG icons with meaningful motion, predictable APIs, and source code developers own.
          </p>

          {/* Quick CLI copy */}
          <div className="cli-bar">
            <span className="cli-prefix">$</span>
            <span>npx trix add call</span>
            <button
              className="cli-copy-btn"
              onClick={() => handleCopy('npx trix add call', setCopiedCli)}
            >
              {copiedCli ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Hero Live Icon Ribbon Banner */}
          <div className="hero-stage-banner">
            <div className="hero-banner-item" title="Call (Hover to animate)">
              <CallIcon size={52} trigger="hover" color="#1e293b" />
              <span className="hero-banner-label">call</span>
            </div>
            <div className="hero-banner-item" title="Mail (Hover to animate)">
              <MailIcon size={52} trigger="hover" color="#1e293b" />
              <span className="hero-banner-label">mail</span>
            </div>
            <div className="hero-banner-item" title="Medium (Hover to animate)">
              <MediumIcon size={52} trigger="hover" color="#1e293b" />
              <span className="hero-banner-label">medium</span>
            </div>
            <div className="hero-banner-item" title="LeetCode (Hover to animate)">
              <LeetcodeIcon size={52} trigger="hover" color="#1e293b" />
              <span className="hero-banner-label">leetcode</span>
            </div>
            <div className="hero-banner-item" title="Download (Hover to animate)">
              <DownloadIcon size={52} trigger="hover" color="#1e293b" />
              <span className="hero-banner-label">download</span>
            </div>
            <div className="hero-banner-item" title="Check (Hover to animate)">
              <CheckIcon size={52} trigger="hover" color="#1e293b" />
              <span className="hero-banner-label">check</span>
            </div>
            <div className="hero-banner-item" title="Refresh (Hover to animate)">
              <RefreshIcon size={52} trigger="hover" color="#1e293b" />
              <span className="hero-banner-label">refresh</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 1: Decaying Jitter (Call Icon) */}
      <section className="section" id="showcase">
        <div className="container">
          <div className="split-feature">
            <div>
              <div className="feature-meta-num">01 / PHYSICAL SWING</div>
              <h2 className="feature-heading">
                Decaying ring vibration returning to rest.
              </h2>
              <p className="feature-desc">
                The call handset jiggles with a 9-step decaying oscillation (±10°→0° rotation, ±0.6px horizontal buzz) looping continuously while hovered — simulating the physical sensation of an incoming ring. Snaps to rest the instant the cursor leaves.
              </p>
              <div className="cli-bar" style={{ marginBottom: 0 }}>
                <span className="cli-prefix">$</span>
                <span>npx trix add call</span>
              </div>
            </div>

            <div
              className="feature-stage-large"
              onClick={() => callFeatureRef.current?.startAnimation()}
            >
              <CallIcon
                ref={callFeatureRef}
                size={120}
                trigger="hover"
                color="#1e293b"
              />
              <span className="stage-caption">Hover or tap to ring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Path Morph (Mail Icon) */}
      <section className="section">
        <div className="container">
          <div className="split-feature">
            <div
              className="feature-stage-large"
              onClick={() => mailFeatureRef.current?.startAnimation()}
            >
              <MailIcon
                ref={mailFeatureRef}
                size={120}
                trigger="hover"
                color="#1e293b"
              />
              <span className="stage-caption">Hover or tap to open</span>
            </div>

            <div>
              <div className="feature-meta-num">02 / PATH MORPH</div>
              <h2 className="feature-heading">
                Envelope flap lifts on hover, closes on leave.
              </h2>
              <p className="feature-desc">
                The outline and inner crease share identical SVG command structures so the browser interpolates coordinates — not shapes. On hover the flap peak rises 5 units above the rim (0.35s, cubic-bezier 0.65/0/0.35/1) and reverses on hover-leave.
              </p>
              <div className="cli-bar" style={{ marginBottom: 0 }}>
                <span className="cli-prefix">$</span>
                <span>npx trix add mail</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Staggered Assembly (Medium Icon) */}
      <section className="section">
        <div className="container">
          <div className="split-feature">
            <div>
              <div className="feature-meta-num">03 / STAGGERED ASSEMBLY</div>
              <h2 className="feature-heading">
                Sequential path draw following natural reading direction.
              </h2>
              <p className="feature-desc">
                The Medium mark demonstrates staggered assembly. Three shapes—circle, ellipse, pill—draw in sequentially from left to right (0ms / 150ms / 280ms), dissolving into fill 50ms before stroke completion.
              </p>
              <div className="cli-bar" style={{ marginBottom: 0 }}>
                <span className="cli-prefix">$</span>
                <span>npx trix add medium</span>
              </div>
            </div>

            <div
              className="feature-stage-large"
              onClick={() => mediumFeatureRef.current?.startAnimation()}
            >
              <MediumIcon
                ref={mediumFeatureRef}
                size={120}
                trigger="hover"
                color="#1e293b"
              />
              <span className="stage-caption">Hover or tap to replay assembly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Continuous Gesture (LeetCode Icon) */}
      <section className="section">
        <div className="container">
          <div className="split-feature">
            <div
              className="feature-stage-large"
              onClick={() => leetcodeFeatureRef.current?.startAnimation()}
            >
              <LeetcodeIcon
                ref={leetcodeFeatureRef}
                size={120}
                trigger="hover"
                color="#1e293b"
              />
              <span className="stage-caption">Hover or tap to trace gesture</span>
            </div>

            <div>
              <div className="feature-meta-num">04 / CONTINUOUS TRACING</div>
              <h2 className="feature-heading">
                One continuous gesture drawn in unhurried motion.
              </h2>
              <p className="feature-desc">
                The LeetCode mark traces its complex angular bracket and intersecting bar in a single 1.1s stroke using a weighted cubic-bezier (0.65, 0, 0.35, 1), crossfading smoothly into fill.
              </p>
              <div className="cli-bar" style={{ marginBottom: 0 }}>
                <span className="cli-prefix">$</span>
                <span>npx trix add leetcode</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 5: Action Primitives (Wide Showcase Row) */}
      <section className="section">
        <div className="container">
          <div className="feature-meta-num" style={{ marginBottom: '12px' }}>
            05 / MOTION PRIMITIVES
          </div>
          <h2 className="feature-heading" style={{ marginBottom: '48px' }}>
            Directional translation and stroke completion.
          </h2>

          <div className="wide-showcase-row">
            <div className="wide-stage-card">
              <div
                className="wide-stage-box"
                onClick={() => downloadFeatureRef.current?.startAnimation()}
              >
                <DownloadIcon
                  ref={downloadFeatureRef}
                  size={64}
                  trigger="hover"
                  color="#1e293b"
                />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Directional Translation
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  The download arrow shaft translates downward toward the baseline, physically enacting the act of receiving data.
                </p>
              </div>
            </div>

            <div className="wide-stage-card">
              <div
                className="wide-stage-box"
                onClick={() => checkFeatureRef.current?.startAnimation()}
              >
                <CheckIcon
                  ref={checkFeatureRef}
                  size={64}
                  trigger="hover"
                  color="#1e293b"
                />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Stroke Path Completion
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  A checkmark stroke drawing from start to finish visually communicates instant confirmation and success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Experience & Code */}
      <section className="section" id="developer">
        <div className="container">
          <div className="dev-section-grid">
            <div>
              <div className="feature-meta-num">06 / DEVELOPER API</div>
              <h2 className="feature-heading">
                Source code developers can own.
              </h2>
              <p className="feature-desc">
                Install component source code directly into your repository via CLI. Predictable AnimatedIconProps and imperative AnimatedIconHandle control.
              </p>
              <div className="cli-bar" style={{ marginBottom: 0 }}>
                <span className="cli-prefix">$</span>
                <span>npx trix add call</span>
              </div>
            </div>

            <div className="code-container">
              <div className="code-header">
                <span className="code-title">Terminal &amp; React Usage</span>
                <span className="code-title">TypeScript Contract</span>
              </div>
              <div className="code-body">
                <pre>
                  <code>{codeExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Icon Gallery Browser */}
      <section className="section" id="browser">
        <div className="container">
          <div className="feature-meta-num" style={{ marginBottom: '12px' }}>
            07 / REGISTRY GALLERY
          </div>
          <h2 className="feature-heading" style={{ marginBottom: '40px' }}>
            Browse canonical icon definitions.
          </h2>

          <div className="browser-header-row">
            <div className="filter-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search icons or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="icon-gallery-grid">
            {filteredIcons.map((icon) => {
              const Component = COMPONENT_MAP[icon.slug];
              return (
                <div
                  key={icon.slug}
                  className="gallery-card"
                  onClick={() => setSelectedIcon(icon)}
                >
                  <div className="gallery-card-stage">
                    {Component ? (
                      <Component size={44} trigger="hover" color="#1e293b" />
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        No preview
                      </span>
                    )}
                  </div>
                  <div className="gallery-card-info">
                    <span className="gallery-card-name">{icon.name}</span>
                    <span className="gallery-card-cat">{icon.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Provenance Section */}
      <section className="section" id="provenance">
        <div className="container">
          <div className="feature-meta-num" style={{ marginBottom: '12px' }}>
            08 / PROVENANCE &amp; TRADEMARK
          </div>
          <h2 className="feature-heading" style={{ marginBottom: '40px' }}>
            Strict legal provenance and attribution.
          </h2>

          <div className="provenance-card">
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Original Artwork vs. Brand Marks
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Original UI icons are licensed under MIT. Third-party brand icons (e.g. Medium, LeetCode) carry strict provenance flags (`trademark: true`, `reviewRequired: true`). The animation code is covered by MIT, but trademark permissions remain with the brand owners.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                No Silently Swallowed Licenses
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Every brand entry in `registry/icons.json` is gated by validation scripts. An icon with unresolved licensing cannot reach `stable` status or be silently marked as free to redistribute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container footer-row">
          <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LogoMark size={32} gradientId="footerLogo" />
            <span>trix-icons</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            Built with React 18+ &amp; motion/react. Source code owned by developers.
          </div>
        </div>
      </footer>

      {/* Inspector Modal */}
      {selectedIcon && (
        <div className="inspector-backdrop" onClick={() => setSelectedIcon(null)}>
          <div
            className="inspector-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedIcon(null)}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedIcon.name}
                </h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {selectedIcon.category} • v{selectedIcon.version} • {selectedIcon.status}
                </span>
              </div>
              <div className="cli-bar" style={{ margin: 0 }}>
                <span className="cli-prefix">$</span>
                <span>npx trix add {selectedIcon.slug}</span>
                <button
                  className="cli-copy-btn"
                  onClick={() =>
                    handleCopy(
                      `npx trix add ${selectedIcon.slug}`,
                      setModalCliCopied
                    )
                  }
                >
                  {modalCliCopied ? '✓' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Stage */}
            <div className="modal-stage">
              {SelectedComponent && (
                <SelectedComponent
                  ref={modalIconRef}
                  size={72}
                  trigger="hover"
                  color="#1e293b"
                />
              )}
            </div>

            {/* Imperative Controls */}
            <div className="modal-controls">
              <button
                className="btn-ctrl"
                onClick={() => modalIconRef.current?.startAnimation()}
              >
                ▶ startAnimation()
              </button>
              <button
                className="btn-ctrl"
                onClick={() => modalIconRef.current?.stopAnimation()}
              >
                ⏸ stopAnimation()
              </button>
              <button
                className="btn-ctrl"
                onClick={() => modalIconRef.current?.resetAnimation()}
              >
                ↺ resetAnimation()
              </button>
            </div>

            {/* Description */}
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {selectedIcon.description}
            </p>

            {/* Metadata Grid */}
            <div className="modal-meta-grid">
              <div>
                <div className="meta-field-label">Provenance Source</div>
                <div className="meta-field-val">{selectedIcon.provenance.source}</div>
              </div>
              <div>
                <div className="meta-field-label">Trademark</div>
                <div className="meta-field-val">
                  {selectedIcon.provenance.trademark ? `Yes (${selectedIcon.provenance.trademarkOwner})` : 'No'}
                </div>
              </div>
              <div>
                <div className="meta-field-label">Animation Technique</div>
                <div className="meta-field-val">{selectedIcon.animation.technique}</div>
              </div>
              <div>
                <div className="meta-field-label">Reduced Motion</div>
                <div className="meta-field-val">{selectedIcon.animation.reducedMotion}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
