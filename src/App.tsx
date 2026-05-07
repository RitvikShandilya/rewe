import { useCallback, useEffect, useMemo, useState } from 'react';
import customizeBasketCleanImage from './assets/customize-basket-clean.png';
import customizeBasketImage from './assets/customize-basket.png';
import homeImage from './assets/home.png';
import homeCleanImage from './assets/home-clean.png';
import homeNavPill from './assets/home-nav-pill.png';
import matchLocationCleanImage from './assets/match-location-clean.png';
import matchLocationImage from './assets/match-location.png';
import readyBasketCleanImage from './assets/ready-basket-clean.png';
import readyBasketImage from './assets/ready-basket.png';

type ScreenId = 'home' | 'match-location' | 'customize-basket' | 'ready-basket';
type PrototypeMode = 'browser' | 'pwa';

const designWidth = 393;
const designHeight = 804;

type Hotspot = {
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  to?: ScreenId;
};

type Screen = {
  id: ScreenId;
  title: string;
  image: string;
  cleanImage?: string;
  fixedControl?: FixedControl;
  hotspots: Hotspot[];
};

type FixedControl =
  | {
      kind: 'navigation';
    }
  | {
      kind: 'cta';
      label: string;
      to?: ScreenId;
    };

type ViewportDebugInfo = {
  browser: string;
  dpr: number;
  visual: {
    width: number;
    height: number;
    offsetTop: number;
    pageTop: number;
  };
  inner: {
    width: number;
    height: number;
  };
  documentElement: {
    clientWidth: number;
    clientHeight: number;
    scrollWidth: number;
    scrollHeight: number;
  };
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
  };
  cssViewportUnits: {
    svh: number;
    dvh: number;
    lvh: number;
  };
  safeArea: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

const screens: Screen[] = [
  {
    id: 'home',
    title: 'Home',
    image: homeImage,
    cleanImage: homeCleanImage,
    fixedControl: {
      kind: 'navigation',
    },
    hotspots: [
      {
        label: 'Open match day card',
        left: 20,
        top: 189,
        width: 353,
        height: 310,
        to: 'match-location',
      },
      {
        label: 'Open match day planner',
        left: 40,
        top: 425,
        width: 313,
        height: 54,
        to: 'match-location',
      },
    ],
  },
  {
    id: 'match-location',
    title: 'Match location',
    image: matchLocationImage,
    cleanImage: matchLocationCleanImage,
    fixedControl: {
      kind: 'cta',
      label: 'Continue',
      to: 'customize-basket',
    },
    hotspots: [
      {
        label: 'Back to home',
        left: 16,
        top: 17,
        width: 36,
        height: 36,
        to: 'home',
      },
      {
        label: 'Watching at home',
        left: 21,
        top: 205,
        width: 351,
        height: 151,
      },
      {
        label: 'Going to the stadium',
        left: 20,
        top: 375,
        width: 352,
        height: 151,
      },
      {
        label: 'Continue',
        left: 28,
        top: 725,
        width: 337,
        height: 48,
        to: 'customize-basket',
      },
    ],
  },
  {
    id: 'customize-basket',
    title: 'Customize basket',
    image: customizeBasketImage,
    cleanImage: customizeBasketCleanImage,
    fixedControl: {
      kind: 'cta',
      label: 'Add to shopping list',
      to: 'ready-basket',
    },
    hotspots: [
      {
        label: 'Back to match location',
        left: 16,
        top: 17,
        width: 36,
        height: 36,
        to: 'match-location',
      },
      {
        label: 'Add to shopping list',
        left: 28,
        top: 725,
        width: 337,
        height: 48,
        to: 'ready-basket',
      },
    ],
  },
  {
    id: 'ready-basket',
    title: 'Ready basket',
    image: readyBasketImage,
    cleanImage: readyBasketCleanImage,
    fixedControl: {
      kind: 'cta',
      label: 'shop your way',
    },
    hotspots: [
      {
        label: 'Back to customize basket',
        left: 16,
        top: 17,
        width: 36,
        height: 36,
        to: 'customize-basket',
      },
      {
        label: 'Shop your way',
        left: 28,
        top: 725,
        width: 337,
        height: 48,
      },
    ],
  },
];

const screenById = Object.fromEntries(screens.map((screen) => [screen.id, screen])) as Record<
  ScreenId,
  Screen
>;
const preloadImageSources = Array.from(
  new Set(screens.flatMap((screen) => [screen.image, screen.cleanImage]).concat(homeNavPill).filter(Boolean)),
) as string[];

function getPrototypeMode(): PrototypeMode {
  const path = window.location.pathname.replace(/\/+$/, '');
  return path.endsWith('/pwa') ? 'pwa' : 'browser';
}

function rounded(value: number | undefined): number {
  return Math.round((value ?? 0) * 100) / 100;
}

function measureCssHeight(unit: 'svh' | 'dvh' | 'lvh'): number {
  const probe = document.createElement('div');
  probe.style.position = 'fixed';
  probe.style.left = '-1px';
  probe.style.top = '0';
  probe.style.width = '1px';
  probe.style.height = `100${unit}`;
  probe.style.pointerEvents = 'none';
  probe.style.visibility = 'hidden';
  document.body.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return rounded(height);
}

function measureSafeArea(): ViewportDebugInfo['safeArea'] {
  const probe = document.createElement('div');
  probe.style.position = 'fixed';
  probe.style.inset = '0';
  probe.style.paddingTop = 'env(safe-area-inset-top)';
  probe.style.paddingRight = 'env(safe-area-inset-right)';
  probe.style.paddingBottom = 'env(safe-area-inset-bottom)';
  probe.style.paddingLeft = 'env(safe-area-inset-left)';
  probe.style.pointerEvents = 'none';
  probe.style.visibility = 'hidden';
  document.body.appendChild(probe);
  const styles = window.getComputedStyle(probe);
  const safeArea = {
    top: rounded(parseFloat(styles.paddingTop)),
    right: rounded(parseFloat(styles.paddingRight)),
    bottom: rounded(parseFloat(styles.paddingBottom)),
    left: rounded(parseFloat(styles.paddingLeft)),
  };
  probe.remove();
  return safeArea;
}

function getBrowserLabel(): string {
  const userAgent = navigator.userAgent;

  if (/CriOS/i.test(userAgent)) {
    return 'Chrome iOS';
  }

  if (/FxiOS/i.test(userAgent)) {
    return 'Firefox iOS';
  }

  if (/EdgiOS/i.test(userAgent)) {
    return 'Edge iOS';
  }

  if (/Chrome|Chromium|CriOS/i.test(userAgent)) {
    return 'Chrome';
  }

  if (/Safari/i.test(userAgent)) {
    return 'Safari';
  }

  return 'Unknown browser';
}

function getViewportDebugInfo(): ViewportDebugInfo {
  const viewport = window.visualViewport;

  return {
    browser: getBrowserLabel(),
    dpr: rounded(window.devicePixelRatio),
    visual: {
      width: rounded(viewport?.width ?? window.innerWidth),
      height: rounded(viewport?.height ?? window.innerHeight),
      offsetTop: rounded(viewport?.offsetTop ?? 0),
      pageTop: rounded(viewport?.pageTop ?? window.scrollY),
    },
    inner: {
      width: rounded(window.innerWidth),
      height: rounded(window.innerHeight),
    },
    documentElement: {
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
    },
    cssViewportUnits: {
      svh: measureCssHeight('svh'),
      dvh: measureCssHeight('dvh'),
      lvh: measureCssHeight('lvh'),
    },
    safeArea: measureSafeArea(),
  };
}

function ViewportDebugOverlay() {
  const [info, setInfo] = useState<ViewportDebugInfo>(() => getViewportDebugInfo());

  useEffect(() => {
    const update = () => setInfo(getViewportDebugInfo());

    update();
    const interval = window.setInterval(update, 500);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      window.clearInterval(interval);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return (
    <div className="viewport-debug" aria-label="Viewport diagnostics">
      <div className="viewport-debug-outline" />
      <div className="viewport-debug-width-marker">
        visualViewport.width: {info.visual.width}px
      </div>
      <div className="viewport-debug-height-marker">
        visualViewport.height: {info.visual.height}px
      </div>
      <div className="viewport-debug-panel">
        <strong>{info.browser} viewport marker</strong>
        <span>visualViewport: {info.visual.width} x {info.visual.height}</span>
        <span>inner: {info.inner.width} x {info.inner.height}</span>
        <span>client: {info.documentElement.clientWidth} x {info.documentElement.clientHeight}</span>
        <span>screen CSS: {info.screen.width} x {info.screen.height} @ {info.dpr}x</span>
        <span>svh/dvh/lvh: {info.cssViewportUnits.svh} / {info.cssViewportUnits.dvh} / {info.cssViewportUnits.lvh}</span>
        <span>safe bottom/top: {info.safeArea.bottom} / {info.safeArea.top}</span>
        <span>scroll width: {info.documentElement.scrollWidth}</span>
      </div>
    </div>
  );
}

function getPreviousScreen(id: ScreenId): ScreenId {
  const index = screens.findIndex((screen) => screen.id === id);
  return screens[Math.max(index - 1, 0)].id;
}

function getNextScreen(id: ScreenId): ScreenId {
  const index = screens.findIndex((screen) => screen.id === id);
  return screens[Math.min(index + 1, screens.length - 1)].id;
}

function BottomNavigation() {
  const items = [
    { label: 'Start', left: 6, width: 83 },
    { label: 'Angebote', left: 89, width: 66 },
    { label: 'Bonus', left: 166, width: 58 },
    { label: 'Bestellen', left: 236, width: 64 },
    { label: 'Rezepte', left: 301, width: 46 },
  ];

  return (
    <div className="fixed-control-layer fixed-navigation-layer">
      <nav className="bottom-navigation" aria-label="Primary">
        <img className="bottom-navigation-image" src={homeNavPill} alt="" draggable={false} />
        {items.map((item) => (
          <button
            className="bottom-navigation-hit"
            key={item.label}
            type="button"
            aria-label={item.label}
            style={{ left: `${item.left}px`, width: `${item.width}px` }}
          />
        ))}
      </nav>
    </div>
  );
}

function FixedCta({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="fixed-control-layer fixed-cta-layer">
      <button className="fixed-cta" type="button" aria-label={label} onClick={onClick}>
        {label}
      </button>
    </div>
  );
}

function Prototype({ mode }: { mode: PrototypeMode }) {
  const isPwaMode = mode === 'pwa';
  const [screenId, setScreenId] = useState<ScreenId>('home');
  const [fixedControlNeeded, setFixedControlNeeded] = useState(!isPwaMode);
  const [viewportDebugEnabled] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('vp') || params.get('debug') === 'viewport';
  });
  const screen = screenById[screenId];

  const navigate = useCallback((nextScreenId?: ScreenId) => {
    if (nextScreenId) {
      setScreenId(nextScreenId);
    }
  }, []);

  const activeIndex = useMemo(
    () => screens.findIndex((item) => item.id === screenId),
    [screenId],
  );
  const visibleImage = isPwaMode
    ? screen.image
    : screen.fixedControl && fixedControlNeeded && screen.cleanImage
      ? screen.cleanImage
      : screen.image;

  useEffect(() => {
    document.body.dataset.prototypeMode = mode;
    return () => {
      delete document.body.dataset.prototypeMode;
    };
  }, [mode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setScreenId((current) => getPreviousScreen(current));
      }

      if (event.key === 'ArrowRight') {
        setScreenId((current) => getNextScreen(current));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screenId]);

  useEffect(() => {
    const updateViewportSize = () => {
      const viewport = window.visualViewport;
      const width = viewport?.width ?? window.innerWidth;
      const height = viewport?.height ?? window.innerHeight;
      const scale = isPwaMode
        ? Math.min(width / designWidth, height / designHeight, 1)
        : Math.min(width / designWidth, 1);

      document.documentElement.style.setProperty('--visible-width', `${width}px`);
      document.documentElement.style.setProperty('--visible-height', `${height}px`);
      document.documentElement.style.setProperty('--fit-scale', `${scale}`);
      document.documentElement.style.setProperty('--frame-width', `${designWidth * scale}px`);
      document.documentElement.style.setProperty('--frame-height', `${designHeight * scale}px`);
      setFixedControlNeeded(!isPwaMode && height < designHeight * scale);
    };

    updateViewportSize();

    window.visualViewport?.addEventListener('resize', updateViewportSize);
    window.visualViewport?.addEventListener('scroll', updateViewportSize);
    window.addEventListener('resize', updateViewportSize);
    window.addEventListener('orientationchange', updateViewportSize);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewportSize);
      window.visualViewport?.removeEventListener('scroll', updateViewportSize);
      window.removeEventListener('resize', updateViewportSize);
      window.removeEventListener('orientationchange', updateViewportSize);
    };
  }, [isPwaMode]);

  return (
    <main className={`prototype-stage prototype-stage--${mode}`} aria-label="REWE loyalty click prototype">
      <div className="phone-frame">
        <div className="phone-shell" aria-live="polite">
          <img className="screen-image" src={visibleImage} alt={screen.title} draggable={false} />

          {screen.hotspots.map((hotspot) => (
            <button
              className="hotspot"
              key={hotspot.label}
              type="button"
              aria-label={hotspot.label}
              onClick={() => navigate(hotspot.to)}
              style={{
                left: `${hotspot.left}px`,
                top: `${hotspot.top}px`,
                width: `${hotspot.width}px`,
                height: `${hotspot.height}px`,
              }}
            />
          ))}
        </div>
      </div>

      {!isPwaMode && screen.fixedControl?.kind === 'navigation' && fixedControlNeeded ? (
        <BottomNavigation />
      ) : null}

      {!isPwaMode && screen.fixedControl?.kind === 'cta' && fixedControlNeeded ? (
        <FixedCta
          label={screen.fixedControl.label}
          onClick={() => navigate(screen.fixedControl?.kind === 'cta' ? screen.fixedControl.to : undefined)}
        />
      ) : null}

      <div className="step-dots" aria-hidden="true">
        {screens.map((item, index) => (
          <span className={index === activeIndex ? 'active' : ''} key={item.id} />
        ))}
      </div>

      <div className="preload-images" aria-hidden="true">
        {preloadImageSources.map((src) => (
          <img alt="" key={src} src={src} />
        ))}
      </div>

      {viewportDebugEnabled ? <ViewportDebugOverlay /> : null}
    </main>
  );
}

export function App() {
  return <Prototype mode={getPrototypeMode()} />;
}
