# Spring Break Activity Tracker

A bright, drag-and-drop web app to plan spring break activities with time blocks.

## App Screenshot

![Spring Break Activity Tracker Screenshot](https://github.com/edilma/activity_tracker/blob/main/activity_tracker_app.png?raw=true)


## Date Range

- March 10 to March 19, 2026

## Daily Schedule Window

- 10:00 AM to 10:00 PM

## Features

- Drag-and-drop activity scheduling
- Time-block view for each day
- Category colors for:
  - Chores
  - Sports
  - Study
  - Friends
  - Fun
- Time-of-day color zones in each timeline:
  - Morning (yellow spectrum)
  - Afternoon (sunset spectrum)
  - Night (dark spectrum)
- Add custom activities
- Delete activities with the `x` button
- Auto-fill balanced two-week plan with one click
- Strict time bounds: activities stay inside 10 AM to 10 PM

## Project Files

- `index.html` - app structure
- `styles.css` - app design and colors
- `app.js` - planner logic and drag-and-drop behavior

## How To Run

### Option 1: Open directly

- Double-click `index.html`

### Option 2: From PowerShell

```powershell
Start-Process .\index.html
```

### Option 3: VS Code Live Server (optional)

- Install the Live Server extension
- Right-click `index.html`
- Select `Open with Live Server`

## How To Use

1. Drag an activity from **Activity Bank** into any day.
2. Move existing blocks by dragging them to another day/time.
3. Add your own activity with the custom activity form.
4. Click `Auto-Fill Balanced Plan` to generate a full starter plan.
5. Click `x` on a block to remove it.

## Notes

- The planner is optimized for both desktop and mobile layouts.
- Browser support: modern Chrome, Edge, Firefox, Safari.
