# TrelloX - Trello with focus.

https://trellox.io

A Chrome extension to give Trello a more up-to-date user experience, reducing clutter and increasing focus.

## Features and use
### Clearer cards
- If you use mainly one label per card, TrelloX now shows the label as a stripe down the left of each card
- This greatly reduces screen clutter especially with lots of cards
- Toggle showing all labels again by clicking "Labels: New/All"

### Show card numbers
- Toggle showing card numbers on and off by clicking "Numbers: On/Off"

### CPU/Battery friendly
- As fast as Trello and doesn't drain CPU or battery

### Tags in card titles
- Use @ in card titles to e.g. @mention (displayed as &lt;strong&rt;)
- Use # in card titles to e.g. #tag (displayed as &lt;em&rt;)
- Use ! in card titles to e.g. denote !09:45 time (displayed as &lt;code&rt;)

### Line breaks in card titles
- Use '/n' in a card title to add a line-break to the title. Use several per card if you like!

### Separator cards
- Use '---' in a card title to create a separator card

### Collapsible lists
- Collapse lists using the arrow at the top of each list
- Collapsed lists are maintained between sessions

### Header cards
- Prefix a card title with 'h.' to make it a header

### Mobile friendly
- Gracefully degrades on mobile Trello

## Planned features
- Show multiple labels in new style (maybe)
- Undo for archiving/deleting cards
- Undo for moving cards
- Global keyboard shortcut for adding cards
- Collapse/expand all lists button

## Project goals
1. Add focus
2. Elegant and fast

## History
### 2018-04-23 version 1.0.40
Formal beta release of v1.0 (build 40)
- Fixed regression - collapsed Lists were not auto-expanded when dropping cards into them
- Separator Cards now transparent and use a gripper icon to make them feel more tactile
- Fixed minor visual bugs & niceties

### 2018-04-23 version 1.0.39
- Added 10ms delay to prevent rare condition preventing install
- Reverted to jQuery UI 1.9.2 because 1.12.1 introduced bugs while dragging

### 2018-04-23 version 1.0.38
- Fixed problems with new labels not updating under various circumstances
- Performance improvements (about 10x faster)
- Further code cleanup, omg so cleane
- Updated jQuery-UI to 1.12.1
- Known issue: Can no longer toggle between New and Old style Labels
- Known issue: Adding too many labels overlaps text

### 2018-04-22 version 1.0.37
- Fixed visual bug when editing collapsed List titles
- Fixed a race condition causing TrelloX to be installed too early and not working
- Performance improvements
- Lists now only revealed after TrelloX is installed (looks much nicer)
- Further code optimisations & cleanups
- Upgraded to jQuery 3.3.1

### 2018-04-21 version 1.0.36
Major bug-fix release, preparing for launch
- Swapped position of Labels and Numbers buttons because Labels grows/shrinks in size moving Numbers button
- Changed load order to be more visually pleasing
- TrelloX now auto-reloads on Board change
- Now correctly waits for page to finish loading before installing
- Removed 0.5s pause when creating buttons
- Renove refreshing of #tags when using Numbers or Labels buttons
- Removed unnecessary reloads of TrelloX
- Separated replaceLabels into setLabels and setNumbers because it's expensive
- Removed dependence on mutation-summary.js
- Cleaned up code
- Added basic status logging to console

### 2018-04-21 version 1.0.35
- Updated manifest.json now Google has a clearly defined standard

### 2017-10-14 version 1.0.34
- Added header cards
- Fixed anti-aliasing on collapsed cards
- Fixed extension not loading without refresh

### 2017-10-13 version 1.0.33
Initial release. Freezing features, bugfixes only now
- Page now only redraws when something changes, uses only 5-10% CPU (and battery)
- ...So removed power-saving code (no longer required)
- Cosmetic fixes
- Optimised icons
- Fixed TrelloX icon was greyed out in Chrome bar
- Fixed regressions from new code
- Fixed duplication of collapse arrows
- Merged tagging code
- Merged list collapsing code
- Merged line breaking code
- Merged separator card code

### 2017-10-12 version 1.0.32
- Added power-saving mode when on battery
- Added display of card numbers (can be toggled on and off)
- Fixed new card labels respond properly to being added or removed
- Tidied up labels appearing when they shouldn't
- Optimised code to keep CPU low

### 2017-10-10 version 1.0.31
- Added support for new lines in card titles
- Added support for separator cards
- Optimised code
