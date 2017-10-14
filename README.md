# TrelloX

A Chrome extension to give Trello a more up-to-date user experience – reducing clutter and increasing scanability – especially for power users.

I haven't regression tested this extension for all situations—it works well for my use cases, if you need something fixed feel free to contribue. :) 

## Features and usage:

### Simplified label colours
- If you use mainly one label per card, TrelloX now shows the label as a stripe down the left of each card
- This greatly reduces screen clutter especially with lots of cards
- Toggle showing all labels again by clicking "Labels: New/All"

### Show card numbers (optional)
- Toggle showing card numbers on and off by clicking "Numbers: On/Off"

### CPU/Battery friendly
- Doesn't use any CPU or battery when you're not using Trello extensions :)

### Tags in card titles
- Use @ in card titles to e.g. @Mention (displayed as &lt;strong&rt;)
- Use # in card titles to e.g. #Tag (displayed as &lt;em&rt;)
- Use ! in card titles to e.g. denote !09:45 time (displayed as &lt;code&rt;)

### Line breaks in card titles
- Use /n in a card title to add a line-break. Add as many as you like :)

### Separator cards
- Use --- in a card title to create a separator card

### Collapsible lists
- Collapse lists using the arrow at the top of each list
- Collapsed lists are maintained between sessions

### Header cards
- Prefix a card title with h. to make it a header

## Planned features

### Show multiple labels in new style
- When I work out an elegent way to show this

## Goals of this project
1. Only elegant solutions
2. Fast

## History

### 2017-10-14 version 1.0.34
+ Added header cards
! Fixed anti-aliasing on collapsed cards
! Fixed extension not loading without refresh

### 2017-10-13 version 1.0.33
? Initial release. Freezing features, bugfixed only now
+ Merged tagging code
+ Merged list collapsing code
+ Merged line breaking code
+ Merged separator card code
+ Page now only redraws when something changes, uses only 5-10% CPU (and battery)
- ...So removed power-saving, no longer required!
- Cosmetic tweaks
- Optimised icons
! Fixed TrelloX icon was greyed out in Chrome bar
! Fixed regressions from new code
! Fixed duplication of collapse arrows

### 2017-10-12 version 1.0.32
+ Added power-saving mode when on battery
+ Added display of card numbers (can be toggled on and off)
! Fixed new card labels respond properly to being added or removed
! Tidied up labels appearing when they shouldn't
! Optimised code to keep CPU low

### 2017-10-10 version 1.0.31
+ Added support for new lines in card titles
+ Added support for separator cards
! Optimised code
