// ==UserScript==
// @name Trello Tags
// @version 1.0.0.20
// @description Support for @bold, #italic, !09:30, '/n'=newline, '---'=separator in card titles.
// @match https://trello.com/b/*
// @match http://trello.com/b/*
// ==/UserScript==

function markdownAll() {
	var cards = document.getElementsByClassName('list-card-title');
	for (var i = 0; i < cards.length; i++) {
		cards[i].innerHTML = cards[i].innerHTML
		    .replace(/@(\w*)/g, '<strong>@</strong><strong>$1</strong>')
		    .replace(/#(\w*)/g, '<em>#</em><em>$1</em>')
		    .replace(/!(\S*){1}/g, '<code>$1</code>')
		    .replace(/\-{3}/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•••')
		    .replace(/\/n/g, '</br>')
	}
	setTimeout(markdownAll, 500);
}

markdownAll();