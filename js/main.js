// Set up global variables
var lastURL = document.URL;

// Watch for Board changes
const boardObserver = new MutationSummary({
	callback: boardChange, // function to run on observing change
	queries: [{ element: '.list-card-title' }]
});

// Watch for new list-card changes
const listCardObserver = new MutationSummary({
	callback: cardChange,
	queries: [{ element: '.list-card[href]' }]
});

// Watch for when a card is opened
const cardOpenedObserver = new MutationSummary({
	callback: cardOpen,
	rootNode: $('window-overlay')[0],
	queries: [{ attribute: 'style' }]
});

// Entry point into TrelloX extension
$(document).ready( function() {
	// Install TrelloX on page load
	installTrelloX();

	// Watch for potential Card changes
	$('body').on('mouseup keyup', function() {
		setTimeout(function() {
			// Update formatting
			refreshTrelloX();

			// Checks to see if a card was closed, in order to refresh the UI correctly.
			// This can happen when a user refresh a card
			if (lastURL.includes('/c') && document.URL.includes('/b')) {
				//console.log('Card was closed');
				//installTrelloX();
				
				// Update lastUrl
				window.lastUrl = document.URL;
			}
		}, 20);
	});
});

// Installer function for TrelloX extension
function installTrelloX() {
	
	// Update Lists to TrelloX format
	addCardNumbers();
	collapseLists();
	createButtons();
	
	// Update Cards to TrelloX format
	refreshTrelloX();
}

function refreshTrelloX() {
	
	replaceTags();
	
	// Failsafe to display Board if animate has failed
	$('#board').delay(10).animate({ opacity: 1 }, 1);
}

// Create TrelloX buttons
function createButtons() {
	// We want to run this function exactly twice...
	let		buttonDrawCount = 0,
			isHiddenNumbers = (localStorage.getItem('trelloXNumbers') === 'true') ? 'On' : 'Off';

	// This refers to the "Numbers: On/Off" button in the top RHS of the screen
	let buttonNumbers = $('<a class="board-header-btn trellox-numbers-btn" href="#">' +
	'<span class="board-header-btn-icon icon-sm icon-number"></span>' +
	'<span class="board-header-btn-text u-text-underline" title="Show or hide card numbers.">Numbers ' + isHiddenNumbers + '</span>' +
	'</a>');

	if ($('.trellox-numbers-btn').length === 0 ) {
		// Add an event handler to toggle displaying the numbers on cards
		buttonNumbers.on('click', function() {
			replaceNumbers(!getNumbersState());
		});

		//console.log('Add button to board header now');
		//console.log('Board header is:', $('.board-header-btns.mod-right'));

		// Prepend this to the board-header-btns.mod-right body (it appears on LHS due to prepend)
		$(buttonNumbers).insertBefore('.sub-btn');
		if (buttonDrawCount === 0) {
			buttonDrawCount = 1;
		}
	}
	
	// Wait in case .board-header is redrawn...
	if (buttonDrawCount === 1) {
		setTimeout( function() {
			createButtons();
		}, 200); 
	}
}

// Sets everything to allow the handling of list collapsing/uncollapsing
// And dragging cards over collapsed lists (TODO - Separate into own method too)
function collapseLists() {
	// If there are no collapsed Lists...
	if (!document.querySelector('.collapse-icon', '#board')) {
		//console.log('No collapsed lists, let us generate');

		// Use URL to find the boardID
		let		afterFirstDelimiter = document.URL.indexOf('/b/') + 3,
				beforeLastDelimiter = document.URL.lastIndexOf('/'),
				boardID = document.URL.substring(afterFirstDelimiter, beforeLastDelimiter);

		//console.log('Board ID is:', boardID);
		let listIndex = 0;
			//willClose = false;

		// First get our chrome data
		chrome.storage.sync.get('trellox', function (listClosed) {
			let closedListData = listClosed.trellox;


			// No storage at all, create empty object
			if (typeof closedListData === 'undefined') {
				closedListData = {};
			}

			// For each list in board
			document.querySelectorAll('.list-header-name', '#board').forEach(function (thisList) {
				// Increment our naming index
				listIndex++;

				// Create a unique listID from boardID + List Name
				let listName = boardID + '-' + listIndex;

				// If this List is closed, collapse it
				if (closedListData[listName]) {
					// Lol
					thisList.parentNode.parentNode.parentNode.classList.add('collapsed');
				}

				// Create a collapse icon
				let collapseIcon = document.createElement('div');
				collapseIcon.className = 'collapse-icon'; // Add a css class

				// Add a click handler for the icon
				collapseIcon.addEventListener('click', function (event) {
					// if we have an empty object, it means the list hasn't been handled before
					if (Object.keys(closedListData).length === 0) {
						//console.log('Have empty object, set listClosed to true');
						closedListData[listName] = true;
					}
					else {
						//console.log('Have result, fetching value');
						// If no value, set to true, else get inverse of current value
						closedListData[listName] = (typeof closedListData[listName] === 'undefined') ? true : !closedListData[listName];
					}

					// Set storage data
					chrome.storage.sync.set({'trellox': closedListData}, function () {
						if (chrome.runtime.error || chrome.runtime.lastError) {
							//console.log('Runtime error:', chrome.runtime.error);
							//console.log('Runtime last error:', chrome.runtime.lastError);
						}
						else {
							// Toggle the 'collapsed' class on successful save
							//console.log('Successfully saved:', closedListData);
							event.target.parentNode.parentNode.parentNode.classList.toggle('collapsed');
						}
					});
				});
				
				thisList.parentNode.parentNode.parentNode.setAttribute('draggable', true);
				// Insert collapse icon
				thisList.parentNode.insertBefore(collapseIcon, thisList);
			});
		});

		// Open List after a short delay when a Card dragged over it
		// Create a new event since a Content Script can't access JS on the parent page.
		let listClosed, openList;
		// Make all Cards draggable. Put Cards back immediately on unsuccessful drop
		$('.list-card', '#board').draggable({revert: true, revertDuration: 0 });
		// Make all Lists droppable
		$('.list-wrapper', '#board').droppable({
			// Watch the area below the pointer
			tolerance: 'pointer',
			// When dragging over a closed List, open it after a short period
			over: (event) => {
				if (event.target.classList.contains('collapsed')) {
					openList = setTimeout(() => {
						event.target.classList.remove('collapsed');
						listClosed = true;
					}, 200);
				} 
				else {
					listClosed = false;
				}
			},
			// When leaving a previously closed List, clear the timeout and re-close it
			out: (event) => {
				clearTimeout(openList);
				
				if (listClosed) {
					event.target.classList.add('collapsed');
				}
			},
			// When dropping the Card on that List, clear the timeout and re-close it
			drop: (event) => {
				clearTimeout(openList);
				if (listClosed) {
					event.target.classList.add('collapsed');
				}
			}
		});
	}
}

function addCardNumbers(reattempt) {
	// Remove old references to card #
	$('.card-short-id').remove();

	//console.log('Running add card members');

	let cards = $('.list-card.js-member-droppable.ui-draggable');

	//console.log('Cards are:', cards);

	if (cards.length === 0 && !reattempt) {
		//console.log('No cards found on first try, attempt again in 150ms');

		// Wait a bit then try again. If still nothing, assume the user has no Cards at all
		setTimeout( function() {
			addCardNumbers(true);
		}, 150);
	}

	cards.each( function() {
		//console.log('In card numbers loop:', this);
		if (typeof $(this).attr('href') !== 'undefined') {
			// Use the URL to determine Card number
			let 	afterFirstDelimiter = $(this).attr('href').lastIndexOf('/') + 1,
					beforeLastDelimiter = $(this).attr('href').indexOf('-'),
					cardNumber = $(this).attr('href').slice(afterFirstDelimiter, beforeLastDelimiter);

			//console.log('Card Number is:', cardNumber);
			// Get the section of html we want to add the card # to
			let		numberHolder = $(this).find('.list-card-title.js-card-name'),
					isHiddenNumber = (localStorage.getItem('trelloXNumbers') !== 'true') ? 'hide' : '';
			// Add the card number span
			//$(numberHolder).append("<span class='card-short-id'>#" + cardNumber + "</span>");
			$(numberHolder).append("<span class='card-short-id " + isHiddenNumber + "'>#" + cardNumber + "</span>");
		}
		else if (!reattempt) {
			//console.log('Re-attempt, no href found');

			setTimeout( function() {
				addCardNumbers(true);
			}, 100);
		}
	});
}

function replaceTags() {
	// Add #tag, @mention, !hh:mm, header, and newline formatting to all Cards
	document.querySelectorAll('.list-card-title', '#board').forEach (function(card) {
		if (card.innerText.substring(0,2) === '##' || card.innerHTML.includes('</h3>')) { // If Card is a header Card
			card.innerHTML = card.innerHTML.replace(/#{2}(.+)/, '<h3 style="margin: 0;">$1</h3>'); // Format title as a <h3>
		} 
		else if (card.innerText.substring(0,3) === 'NA ') {
			card.parentNode.parentNode.classList.add('subtask');				// Make subtask
		} 
		else {
			if (card.innerText === '---' || card.innerText.includes('☰')) {		// If Card is a separator Card
				card.innerHTML = card.innerHTML.replace(/\-{3}/, '☰');			// Replace '---' with gripper symbol '☰'
				card.parentNode.parentNode.classList.add('clear');				// Make background transparent
				card.classList.add('clear');									// Make text transparent
			} 
			else {																// For all other cards...
				card.parentNode.parentNode.classList.remove('clear');			// Remove background transparency
				card.classList.remove('clear');									// Remove text transparency
				card.parentNode.parentNode.classList.remove('subtask');			// Remove subtask
				card.innerHTML = card.innerHTML
				.replace(/\\{1}/, '</br>')										// Replace new lines first
				.replace(/#{1}([a-z-_]+)/gi, '<span class="card-tag">#﻿$1</span>') // Replace # followed by any character until a space
				.replace(/@([a-z-_]+)/gi, '<strong>@﻿$1</strong>')				// Replace @ followed by any character until a space
				.replace(/!([a-z0-9-_!:.]+)/gi, '<code>$1</code>');				// Replace ! followed by any character until a space
				//.replace(/\[(\+?[0-9() -]{5,20})\]/g, '<a class="card-link" target="_blank" href="tel:$1">$1</a>')// Make phone numbers clickable
				//.replace(/\[https?:\/\/([\S]+)\]/g, '<a class="card-link" target="_blank" href="//$1">$1</a>')// Make HTTP(S) links clickable
			}
		}
	});
}

// showNumbers() below is used to determine state
function replaceNumbers(state) {
	let $button = $('.trellox-numbers-btn > .board-header-btn-text');

	if (state) {
		localStorage.setItem('trelloXNumbers', 'true');
		$button.text('Numbers On');
	} 
	else {
		localStorage.setItem('trelloXNumbers', 'false');
		$button.text('Numbers Off');
	}

	refreshNumbers(state);
}

function getNumbersState() {
	// If Numbers button hasn't been used before, assume Card Numbers are Off
	if (localStorage.getItem('trelloXNumbers') === null) {
		//console.log('trelloXNumbers is null');
		return true;
	}
	else {
		//console.log('localStorage trelloxNum equal true?:', localStorage.getItem('trelloXNumbers') === 'true');
		return (localStorage.getItem('trelloXNumbers') === 'true');
	}
}

function refreshNumbers(state) {
	// Add Card #numbers
	if (state) {
		//console.log('Remove class .hide');
		$('.card-short-id').removeClass('hide');
	} 
	else {
		//console.log('Add class .hide');
		$('.card-short-id').addClass('hide');
	}
}

// MUTATIONSUMMARY HANDLERS

function cardChange(summaries) {
	// Get one and only summary that we should have
	let summary = summaries[0];

	// When a new card has been created, we must add its card number to it
	if (summary.added.length === 1 && summary.removed.length === 0) {
		summary.added.forEach(function(listCard) {
			// If this is a list-card
			if (listCard.className.includes('list-card js-member-droppable')) {
				// Use the URL to determine Card number
				let 	afterFirstDelimiter = $(listCard).attr('href').lastIndexOf('/') + 1,
						beforeSecondDelimiter = $(listCard).attr('href').indexOf('-'),
						cardNumber = $(listCard).attr('href').slice(afterFirstDelimiter, beforeSecondDelimiter);

				//console.log('Card Number is:', cardNumber);
				// Get the section of html we want to add the card # to
				let numberHolder = $(listCard).find('.list-card-title.js-card-name');
				//console.log('numberHolder is:', numberHolder);
				let isHiddenNumber = (localStorage.getItem('trelloXNumbers') !== 'true') ? 'hide' : '';
				// Add the card number span
				$(numberHolder).append("<span class='card-short-id " + isHiddenNumber + "'>#" + cardNumber + "</span>");


			}
		});
	}
}

function listChange() {
	// TODO - Handle when a new list is created for collapse icon to be added
	/*// Use URL to find the boardID
	var		afterFirstDelimiter = document.URL.indexOf('/b/') + 3,
			beforeLastDelimiter = document.URL.lastIndexOf('/'),
			boardID = document.URL.substring(afterFirstDelimiter, beforeLastDelimiter);

	

	// First get our chrome data
	chrome.storage.sync.get('trellox', function (listClosed) {
		let closedListData = listClosed.trellox;


		// No storage at all, create empty object
		if (typeof closedListData === 'undefined') {
			closedListData = {};
		}

		// Create a collapse icon
		var collapseIcon = document.createElement('div');
		collapseIcon.className = 'collapse-icon'; // Add a css class

		// Add a click handler for the icon
		collapseIcon.addEventListener('click', function (event) {
			// if we have an empty object, it means the list hasn't been handled before
			if (Object.keys(closedListData).length === 0) {
				console.log('Have empty object, set listClosed to true')
				closedListData[listName] = true;
			}
			else {
				console.log('Have result, fetching value');
				// If no value, set to true, else get inverse of current value
				closedListData[listName] = (typeof closedListData[listName] === 'undefined') ? true : !closedListData[listName];
			}

			// Set storage data
			chrome.storage.sync.set({'trellox': closedListData}, function () {
				if (chrome.runtime.error || chrome.runtime.lastError) {
					console.log('Runtime error:', chrome.runtime.error);
					console.log('Runtime last error:', chrome.runtime.lastError);
				}
				else {
					// Toggle the 'collapsed' class on successful save
					console.log('Successfully saved:', closedListData);
					event.target.parentNode.parentNode.parentNode.classList.toggle('collapsed');
				}
			});
		});
	});*/
}

function boardChange(summaries) {

	// If we're still on a url that is a /b/ (board) url, and it's different to the last url...
	if (document.URL.includes('/b/') && document.URL !== lastURL) {
		//console.log('TrelloX: Board changed');
		lastURL = document.URL;

		// Run installer function
		installTrelloX();
	}

	// Handle when a Card moves across to a new location, and refresh number state
	if (summaries[0].added.length > 0) {
		summaries[0].added.forEach(function(card) {
			// Target the className of the span inside the Card
			if (card.innerHTML.includes('card-short-id hide')) {
				// Check if we should show it or not
				/*if (!localStorage.getItem('trelloXNumbers')) {
					$('.card-short-id').removeClass('hide');
				}*/

				// Refresh draggable Card
				$('.list-card', '#board').draggable({revert: true, revertDuration: 0 });
			}
		});
	}

	// Reveal TrelloX board
	$('#board').delay(10).animate({ opacity: 1 }, 1);
}

function handleCardClose() {
	//console.log('handle card close summary:', summaries[0]);
}

/*function refreshLinks() { 
	// Make Card links clickable
	$(".card-link").on("mouseover", function() {
		let		rect = this.getBoundingClientRect(),
				top = rect.top,
				left = rect.left;

	$(this)
		.clone().appendTo('body')
		.removeClass('card-link')
		.addClass('card-link-hover')
		.css({
			'position': 'fixed',
			'top': top + 'px',
			'left': left + 'px',
			'display': 'block',
			'z-index': '1000'
		});
	});

	// Remove Card links
	$(".list-card").scroll(function() {
		$(".card-link-hover").remove();
	});

	$(".list-card, #board").mousedown(function() {
		$(".card-link-hover").remove();
	});

	$(".list-card, #board").mouseenter(function() {
		$(".card-link-hover").remove();
	});
}*/

function cardOpen(summaries) {
	//console.log('Checking card status');
	//console.log('Summary is:', summaries[0]);

	// Run replaceCardViewDetails()
	if (summaries[0].added.length > 0) {
		//console.log('Replace card detail view');
		replaceCardDetailsView();
	}
}

function replaceCardDetailsView() {
	document.querySelectorAll('.window-header-inline-content', '#board').forEach (function(currentListDivElement) {
		if (!currentListDivElement.querySelector('.card-short-id', '#board')) {
			// Use the URL to determine Card number
			let		afterFirstDelimiter = document.URL.lastIndexOf('/') + 1,
					beforeLastDelimiter = document.URL.indexOf('-'),
					cardNumber = document.URL.substring(afterFirstDelimiter, beforeLastDelimiter);

			currentListDivElement.innerHTML = "<span class='card-short-id'>#" + cardNumber + "</span>" + currentListDivElement.innerHTML;
		}
	});
}