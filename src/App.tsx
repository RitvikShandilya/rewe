import { useCallback, useEffect, useMemo, useState } from 'react';
import customizeBasketCleanImage from './assets/customize-basket-clean.png';
import customizeBasketImage from './assets/customize-basket.png';
import homeImage from './assets/home.png';
import homeCleanImage from './assets/home-clean.png';
import homeNavForeground from './assets/home-nav-foreground.png';
import matchLocationCleanImage from './assets/match-location-clean.png';
import matchLocationImage from './assets/match-location.png';
import readyBasketCleanImage from './assets/ready-basket-clean.png';
import readyBasketImage from './assets/ready-basket.png';

type ScreenId = 'home' | 'match-location' | 'customize-basket' | 'ready-basket';

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
        <img className="bottom-navigation-foreground" src={homeNavForeground} alt="" draggable={false} />
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

export function App() {
  const [screenId, setScreenId] = useState<ScreenId>('home');
  const [fixedControlNeeded, setFixedControlNeeded] = useState(true);
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
  const visibleImage =
    screen.fixedControl && fixedControlNeeded && screen.cleanImage ? screen.cleanImage : screen.image;

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
      const scale = Math.min(width / 393, 1);

      document.documentElement.style.setProperty('--visible-width', `${width}px`);
      document.documentElement.style.setProperty('--visible-height', `${height}px`);
      document.documentElement.style.setProperty('--fit-scale', `${scale}`);
      document.documentElement.style.setProperty('--frame-width', `${393 * scale}px`);
      document.documentElement.style.setProperty('--frame-height', `${804 * scale}px`);
      setFixedControlNeeded(height < 804 * scale);
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
  }, []);

  return (
    <main className="prototype-stage" aria-label="REWE loyalty click prototype">
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

      {screen.fixedControl?.kind === 'navigation' && fixedControlNeeded ? <BottomNavigation /> : null}

      {screen.fixedControl?.kind === 'cta' && fixedControlNeeded ? (
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
        {screens.map((item) => (
          <img alt="" key={item.id} src={item.image} />
        ))}
      </div>
    </main>
  );
}
