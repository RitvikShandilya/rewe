# REWE Loyalty Click Prototype

React/Vite dummy click prototype based on the Figma selection:

`https://www.figma.com/design/XIiPagYAEkq2gtLIkqWiwV/Rewe-App-Loyalty--Future-Concept?node-id=62-5242`

The visible phone screens are direct PNG exports from the selected Figma section, kept at the original 393 x 852 frame size. Invisible hotspots sit on top of the exported screens for click-through behavior.

## Run

```bash
npm install
npm run dev
```

## Implemented Flow

- `Home` -> `Match location`
- `Match location` -> `Customize basket`
- `Customize basket` -> `Ready basket`
- Back arrows return to the previous state

The selected Figma section currently contains no configured navigation prototype actions. The only detected reaction is an empty `ON_CLICK` on the slider handle, so the click path follows the visible screen order and visible CTA/back controls.
