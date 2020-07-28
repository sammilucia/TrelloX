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
### 2020-02-01 version 1.7.2 beta
- This is the start of the a code tidy-up and performance improvements

### 2020-02-01 version 1.7.1 beta
- Restored TrelloX style Separator Cards (now Trello has implemented their own)

### 2020-02-01 version 1.7 beta
- Fixed position inconsistencies between Chrome versions

### 2019-10-29 version 1.6 beta
- Sped up initial injection
- Fixed non-responsive problem after initialising on large Boards
- Foxed buttons disappearing

### 2019-03-20 version 1.5 beta
- Changed Trello's new fonts back to Helvetica Neue / Helvetica / Arial
- Removed underline from TrelloX toggle buttons

### 2019-03-20 version 1.4 beta
- Fixed: Workaround due to Trello update

### 2019-03-12 version 1.3 beta
This is a maintenance release, focusing on performance and robustness
- Added framework to connect TrelloX to the Trello API (for future)
- Further performance increases of common functions should make TrelloX feel more lightweight
- Fixed: TrelloX should now always install correctly after a page refresh (please let me know)
- Fixed: New Cards now get a Number if Numbers:On
- Fixed: All Cards now display Numbers on page refresh if Numbers:On
- Fixed: A Card now keeps its Number after being dragged
- Fixed: Subtasks are now hidden on page refresh if Subtasks:Off
- Fixed: Card Numbers are no longer repeatedly redrawn

### 2019-03-06 version 1.2 beta
- Fixed slowdown when updating Card description/Comments

### 2018-10-03 version 1.1 beta
- Added a button to hide Subtasks

### 2018-08-13 version 1.0
Initial Release
- Added JSHint
- Code cleanup, disabled debug/console
- Known Issue: Adding a new Card with Numbers: On, Card is not numbered

### 2018-06-23 version 1.0.51
Release Candidate 3 of v1.0
- Fixed: Card titles are no longer resizable
- Fixed: Numbers Button was being overdrawn
- Fixed: Numbers on/off is now remembered on page reload
- Fixed: Numbers button required 2 clicks to disable

### 2018-06-21 version 1.0.50
- Several styling fixes to address underlying changes to Trello
- Fixed: Sometimes collapsed List didn't stay collapsed on reload
- Fixed: Dragging a previously dragged Card didn't open collapsed Lists
- Fixed: Adding a new Card with Numbers On now numbers the new Card

### 2018-05-16 version 1.0.49
- Fixed height of collapsed Card Title text boxes when editing them
- Moved Numbers button to right hand side to accommodate change in Trello
- Removed transparency from header Cards

### 2018-05-16 version 1.0.48
Release Candidate 2 of v1.0
- Collapse Lists are now sync'd between browser sessions
- Fixed collapsed Lists not always being remembering their state
- Fixed performance issue with # and @ tags redrawing repeatedly
- Card number is now displayed on Card Detail View if Numbers is on
- Transparency is now removed when a Card is edited to no longer be a header or separator Card

### 2018-05-09 version 1.0.47
Release Candidate 1 of v1.0
- Cards no longer dropped into wrong position when dragging to same List
- Fixed regression in v1.0.46

### 2018-05-08 version 1.0.46
Beta 5 of v1.0 - Feature freeze
- !, #, and @ now update correctly as soon as any Card title is edited

### 2018-05-06 version 1.0.45
Beta 4 of v1.0
- Use '##' to create a header card instead of 'h.' (feels more natural)
- Use '\' to create a new line instead of '{' (feels more natural)
- Header cards are now transparent for clarity (like separator cards)
- Further optimisations to card tagging logic

### 2018-05-06 version 1.0.44
Beta 3 of v1.0
- Fixed: Separator gripper shifted when turning Numbers on and off
- Tidied up 24 and 32px icons
- Removes limitations of !hh:mm tag so that '!' can now be used with a !word, !h:mm, !hh.mm or !! (to put a red '!' by itself)
- Removed workaround ('﻿' character) used for #, !, and @ logic
- #tags now work with '-' and '_' symbols so you can use e.g. #my_project
- !, #, and @ now work for multiple instances in Card titles
- !, #, and @ logic is now much more robust
- Now only replaces '---' if it's the _only_ contents in a Card title

### 2018-04-29 version 1.0.43
- Added 24 and 32px icons for Chrome on high DPI screens
- Performance optimisation (approx 20x lighter)
- Further code cleanup
- Prevented #tags, @mentions, !hh:mm, etc. being redrawn unnecessarily
- // Fixed: Card numbers weren't added to new Cards (if enabled)
- Added failsafe to reveal Board if CSS animate fails (WebKit bug?)

### 2018-04-29 version 1.0.42
Beta 2 of v1.0
- TrelloX now properly updates #tags @mentions and !hh:mm times in real-time
- Re-implemented mutation-summary library
- Removed redundant code
- Removed debug code

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
