import { useCallback, useEffect, useMemo, useState } from 'react';
import homeImage from './assets/home.png';
import matchLocationImage from './assets/match-location.png';
import customizeBasketImage from './assets/customize-basket.png';
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
  hotspots: Hotspot[];
};

const screens: Screen[] = [
  {
    id: 'home',
    title: 'Home',
    image: homeImage,
    hotspots: [
      {
        label: 'Open match day card',
        left: 20,
        top: 237,
        width: 353,
        height: 310,
        to: 'match-location',
      },
      {
        label: 'Open match day planner',
        left: 40,
        top: 473,
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
    hotspots: [
      {
        label: 'Back to home',
        left: 16,
        top: 65,
        width: 36,
        height: 36,
        to: 'home',
      },
      {
        label: 'Watching at home',
        left: 21,
        top: 253,
        width: 351,
        height: 151,
      },
      {
        label: 'Going to the stadium',
        left: 20,
        top: 423,
        width: 352,
        height: 151,
      },
      {
        label: 'Continue',
        left: 28,
        top: 773,
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
    hotspots: [
      {
        label: 'Back to match location',
        left: 16,
        top: 65,
        width: 36,
        height: 36,
        to: 'match-location',
      },
      {
        label: 'Add to shopping list',
        left: 28,
        top: 773,
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
    hotspots: [
      {
        label: 'Back to customize basket',
        left: 16,
        top: 65,
        width: 36,
        height: 36,
        to: 'customize-basket',
      },
      {
        label: 'Shop your way',
        left: 28,
        top: 773,
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

export function App() {
  const [screenId, setScreenId] = useState<ScreenId>('home');
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

  return (
    <main className="prototype-stage" aria-label="REWE loyalty click prototype">
      <div className="phone-shell" aria-live="polite">
        <img className="screen-image" src={screen.image} alt={screen.title} draggable={false} />

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

      <div className="step-dots" aria-hidden="true">
        {screens.map((item, index) => (
          <span className={index === activeIndex ? 'active' : ''} key={item.id} />
        ))}
      </div>
    </main>
  );
}
