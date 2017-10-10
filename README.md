# TrelloUX Update

A Chrome extension to give Trello a more up-to-date user experience – reducing clutter and increasing scanability – especially for power users.

I haven't regression tested this extension for all situations—it works well for my use cases, if you need something fixed feel free to contribue. :) 

## Features and usage:

### Simplified label colours
- If you use mainly one label per card, TrelloUX now shows the label as a stripe down the left of each card
- This greatly reduces screen clutter especially with lots of cards
- Toggle showing all labels again by clicking "Labels: Hide/Show"

### Collapsible lists
- Collapse lists using the arrow at the top of each list
- Collapsed lists are maintained between sessions

### Tags in card titles
- Use @ in card titles to e.g. @Mention (displayed as &lt;strong&rt;)
- Use # in card titles to e.g. #Tag (displayed as &lt;em&rt;)
- Use ! in card titles to e.g. denote !09:45 time (displayed as &lt;code&rt;)

### Line breaks in card titles
- Use /n in a card title to add a line-break. Add as many as you like :)

### Separator cards
- Use --- in a card title to create a separator card

## Goals of this project
1. Only elegant solutions
2. Fast

## History

### 2017-10-10
+ Added support for new lines in card titles
+ Added support for separator cards
! Optimised code

## Known issues
- Regex for card titles uses too much CPU
- New side labels don't update
- Haven't thought of an elegant way to show multiple labels on side
