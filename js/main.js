// Set up global variables
let lastURL = document.URL;

// Watch for Board changes
const boardObserver = new MutationSummary({ // jshint ignore:line
	callback: boardChange, // function to run on observing change
	queries: [{ element: '.list-card-title' }]
});

// Watch for new list-card changes
const listCardObserver = new MutationSummary({ // jshint ignore:line
	callback: cardChange,
	queries: [{ element: '.list-card[href]' }]
});

// Watch for when a card is opened
const cardOpenedObserver = new MutationSummary({ // jshint ignore:line
	callback: cardOpen,
	rootNode: $('window-overlay')[0],
	queries: [{ attribute: 'style' }]
});

// Entry point into TrelloX extension
$(document).ready(function() {
    let matches = window.location.href.match(/\/(.{8})\//);
    if (matches && matches.length > 1) boardId = matches[1];
        // Install TrelloX on page load
        setTimeout( function() {
            installTrelloX();
        },2000);

        // Watch for potential Card changes
        $('body').on('mouseup keyup', function() {
            setTimeout(function() {
                // If we're not editing a Card, update formatting
                if (document.URL.includes('/b')) {
                    updateTrelloX();
                }
                // When a Card is closed
                if (lastURL.includes('/c') && document.URL.includes('/b')) {

                    // Update lastUrl
                    window.lastUrl = document.URL;
                }
            },2000);
        });



});

// Installer function for TrelloX extension
function installTrelloX() {

  // Hide Lists that were previously hidden
  hideLists();

	// Update Cards with TrelloX formatting
	updateTrelloX();

  // Reveal the Board once TrelloX is drawn
	$('#board').delay(10).animate({ opacity: 1 }, 100);
}

function updateTrelloX() {
  // Create toggle buttons in header
	createButtons();

	updateCardTags();
  replaceSubtasks(getSubtasksHidingState());
	addCardNumbers();
  replaceNumbers(getNumbersShowingState());
}

// Create TrelloX buttons
function createButtons() {

	// We want to run this function exactly twice...
	let buttonDrawCount = 0,
			isHiddenNumbers = (localStorage.getItem('trelloXNumbers') === 'true') ? 'On' : 'Off',
			isHiddenSubtasks = (localStorage.getItem('trelloXSubtasks') === 'true') ? 'On' : 'Off';

	// Draw the "Subtasks: On/Off" button in the top RHS of the screen
	let buttonSubtasks = $('<a class="board-header-btn trellox-subtasks-btn" href="#">' +
	'<span class="board-header-btn-icon icon-sm icon-add"></span>' +
	'<span class="board-header-btn-text" title="Show or hide subtask cards.">Subtasks ' + isHiddenSubtasks + '</span>' +
	'</a>');

	// Draw the "Numbers: On/Off" button in the top RHS of the screen
	let buttonNumbers = $('<a class="board-header-btn trellox-numbers-btn" href="#">' +
	'<span class="board-header-btn-icon icon-sm icon-number"></span>' +
	'<span class="board-header-btn-text" title="Show or hide card numbers.">Numbers ' + isHiddenNumbers + '</span>' +
	'</a>');

	if ($('.trellox-numbers-btn').length === 0 ) {
		// Add an event handler to toggle displaying the numbers on cards
		buttonSubtasks.on( 'click', () => replaceSubtasks( !getSubtasksHidingState() ) );
		buttonNumbers.on( 'click', () => replaceNumbers( !getNumbersShowingState() ) );

		// Prepend this to the board-header-btns.mod-right body (it appears on LHS due to prepend)
		$(buttonSubtasks).insertBefore('.sub-btn');
		$(buttonNumbers).insertBefore('.sub-btn');

		if (buttonDrawCount === 0) {
			buttonDrawCount = 1; }
	}
}

// Sets everything to allow the handling of list collapsing/uncollapsing
// And dragging cards over collapsed lists (TODO - Separate into own method too)
function hideLists() {
	// If there are no collapsed Lists...
	if (!document.querySelector('.collapse-icon', '#board')) {

		// Use URL to find the boardID
		let	afterFirstDelimiter = document.URL.indexOf('/b/') + 3,
			beforeLastDelimiter = document.URL.lastIndexOf('/'),
			boardID = document.URL.substring(afterFirstDelimiter, beforeLastDelimiter);

		let listIndex = 0;
			//willClose = false;

		// First get our chrome data
		chrome.storage.sync.get('trellox', function (listClosed) {
			let closedListData = listClosed.trellox ?? {};

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
						closedListData[listName] = true;
					}
					else {
						// If no value, set to true, else get inverse of current value
						closedListData[listName] = (typeof closedListData[listName] === 'undefined') ? true : !closedListData[listName];
					}

					// Set storage data
					chrome.storage.sync.set({'trellox': closedListData}, function () {
						if (chrome.runtime.error || chrome.runtime.lastError) {
						}
						else {
							// Toggle the 'collapsed' class on successful save
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

function addCardNumbers() {
    // Find all Cards by URL
    let cards = $( 'a', '#board' );

	cards.each( function() {
        // If all new Cards have fully loaded
        if( $( this ).attr( 'href' ) !== undefined ) {

            // If the Card doesn't yet have a Number
            if( $( this ).find( 'span.card-short-id' ).length === 0 ) {

                // Find the Card's Number from its URL
                let cardURL = $( this ).attr( 'href' ),
                    afterFirstDelimiter = cardURL.lastIndexOf( '/' ) + 1,
                    beforeLastDelimiter = cardURL.indexOf( '-' ),
                    cardNumber = cardURL.slice( afterFirstDelimiter, beforeLastDelimiter );

                    // Find the html we want to add the Card Number to
                    let	numberHolder = $( this ).find( '.list-card-title.js-card-name' ),
                        // Retrieve if Numbers are showing or not
                        isHiddenNumber = ( localStorage.getItem( 'trelloXNumbers' ) !== 'true') ? 'hide' : '';

                    // Then add the Card Number as either hidden or shown
                    $( numberHolder ).append( '<span class="card-short-id ' + isHiddenNumber + '">#' + cardNumber + '</span>' );
            }
        //} else {
            // CAUSING MASSIVE PERFORMANCE HIT
        //    // Otherwise wait until all new Cards have loaded
        //    setTimeout( function() {
        //        addCardNumbers();
        //    },1000);
        }
        //}
	});
}

function updateCardTags() {
	// Add #tag, @mention, !hh:mm, header, and newline formatting to all Cards
    let cards = document.querySelectorAll( '.list-card-title', '#board' );

    for( let i = 0,j = cards.length;i < j;i++ ) {
			if ( cards.item(i).innerText.substring(0,2) === '##' ) { //}|| cards.item(i).innerHTML.includes( '</h3>' )) { 	// If Card Title starts with '##'
				 cards.item(i).innerHTML = '<h3 style="margin: 0;">' + cards.item(i).innerText.substring(2,) + '</h3>'; 			// Format it as a Header Card
				 // cards.item(i).innerHTML.replace( /#{2}(.+)/, '<h3 style="margin: 0;">$1</h3>' );
			}
			else if ( cards.item(i).innerText.substring(0,1) === '+' ) { 												  // If Card Title starts with '+'
	      cards.item(i).parentNode.parentNode.classList.add( 'subtask' );											// Convert to Subtask Card
			}
			else {
				if ( cards.item(i).innerText === '' || cards.item(i).innerText.includes( '☰' ) ) { 	// If Card is a Trello or TrelloX Separator Card...
					 cards.item(i).innerHTML = ( '☰' );																								// Replace Trello's default blank separator with gripper symbol '☰'
					 cards.item(i).parentNode.parentNode.classList.add( 'clear' );										// Make background transparent
					 cards.item(i).classList.add( 'clear' );																					// Make text transparent
				}
				else {																// For all other cards...
					 cards.item(i).parentNode.parentNode.classList.remove( 'clear' );			// Remove background transparency
					 cards.item(i).classList.remove( 'clear' );									// Remove text transparency
					 //cards.item(i).parentNode.parentNode.classList.remove( 'subtask' );			// Remove subtask
					 cards.item(i).innerHTML = cards.item(i).innerHTML
					 .replace( /\\{1}/, '</br>' )										// Replace new lines first
					 .replace( /#{1}([a-z-_]+)/gi, '<span class="card-tag">#﻿$1</span>' ) // Replace # followed by any character until a space
					 .replace( /@([a-z-_]+)/gi, '<strong>@﻿$1</strong>' )				// Replace @ followed by any character until a space
					 .replace( /!([a-z0-9-_!:.]+)/gi, '<code>$1</code>' );				// Replace ! followed by any character until a space
	                 //.replace( /\[([+:\/.\-%?=#_&@0-9a-z]+)\]/gi, '<a href="$1">$1</>' ); // Replace [] with hyperlink
					 //.replace(/\[(\+?[0-9() -]{5,20})\]/g, '<a class="card-link" tasrget="_blank" href="tel:$1">$1</a>')// Make phone numbers clickable
					 //.replace(/\[https?:\/\/([\S]+)\]/g, '<a class="card-link" target="_blank" href="//$1">$1</a>')// Make HTTP(S) links clickable
			}
		}
	}
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

function getNumbersShowingState() {
    // Return if showing Numbers is On or Off

	if( localStorage.getItem( 'trelloXNumbers' ) === null ) {
        // If Numbers haven't been used before, assume showing Numbers is Off
		return true;
	}
	else {
        return( localStorage.getItem( 'trelloXNumbers' ) === 'true' );
	}
}

function getSubtasksHidingState() {
    // Return if Subtask hiding is On or Off

	if( localStorage.getItem( 'trelloXSubtasks' ) === null ) {
		// If Subtasks haven't been used before, turn Subtasks ar On
		return true;
	}
	else {
		return( localStorage.getItem( 'trelloXSubtasks' ) === 'true' );
	}
}

function replaceSubtasks(state) {
	let $button = $('.trellox-subtasks-btn > .board-header-btn-text');

	if (state) {
		localStorage.setItem('trelloXSubtasks', 'true');
		$button.text('Subtasks On');
	}
	else {
		localStorage.setItem('trelloXSubtasks', 'false');
		$button.text('Subtasks Off');
	}

	refreshSubtasks(state);
}

function refreshNumbers(state) {
	// Add Card #numbers
	if (state) {
		$('.card-short-id').removeClass('hide');
	}
	else {
		$('.card-short-id').addClass('hide');
	}
}

function refreshSubtasks(state) {
	// Add Card #Subtasks
	if (state) {
		$('.subtask').removeClass('hide');
	}
	else {
		$('.subtask').addClass('hide');
	}
}

function cardChange(summaries) {
	// Get one and only summary that we should have
	let summary = summaries[0];

	// When a new card has been created, we must add its card number to it
	if (summary.added.length === 1 && summary.removed.length === 0) {
		for(let i = 0,listCard = summary.added;i < listCard;i++) {
			// If this is a list-card
			if (listCard.className.includes('list-card js-member-droppable')) {
				// Use the URL to determine Card number
				let 	afterFirstDelimiter = $(listCard).attr('href').lastIndexOf('/') + 1,
						beforeSecondDelimiter = $(listCard).attr('href').indexOf('-'),
						cardNumber = $(listCard).attr('href').slice(afterFirstDelimiter, beforeSecondDelimiter);

				// Get the section of html we want to add the card # to
				let numberHolder = $(listCard).find('.list-card-title.js-card-name');
				let isHiddenNumber = (localStorage.getItem('trelloXNumbers') !== 'true') ? 'hide' : '';
				// Add the card number span
				$(numberHolder).append("<span class='card-short-id " + isHiddenNumber + "'>#" + cardNumber + "</span>");


			}
		}
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
				closedListData[listName] = true;
			}
			else {
				// If no value, set to true, else get inverse of current value
				closedListData[listName] = (typeof closedListData[listName] === 'undefined') ? true : !closedListData[listName];
			}

			// Set storage data
			chrome.storage.sync.set({'trellox': closedListData}, function () {
				if (chrome.runtime.error || chrome.runtime.lastError) {
				}
				else {
					// Toggle the 'collapsed' class on successful save
					event.target.parentNode.parentNode.parentNode.classList.toggle('collapsed');
				}
			});
		});
	});*/
}

function boardChange(summaries) {

	// If we're still on a url that is a /b/ (board) url, and it's different to the last url...
	if (document.URL.includes('/b/') && document.URL !== lastURL) {
		lastURL = document.URL;

        // Workaround for Trello dropping data connection on DOM change
        location.reload();

		// Run installer function
		installTrelloX();
	}

    /////***********************************************************
    /////***********************************************************
    /////***********************************************************
    /////******************SHOULD THIS BE HERE ???******************
    /////***********************************************************
    /////***********************************************************
    /////***********************************************************
	// Handle when a Card moves across to a new location, and refresh number state
	if (summaries[0].added.length > 0) {
		for(let i = 0,card = summaries[0].added;i < card;i++) {
			// Target the className of the span inside the Card
			if (card.innerHTML.includes('card-short-id hide')) {

				// Refresh draggable Card
				$('.list-card', '#board').draggable({revert: true, revertDuration: 0 });
			}
		}
	}

	// Reveal TrelloX board
	//$('#board').delay(10).animate({ opacity: 1 }, 1);
}

function handleCardClose() {
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

	// Run replaceCardViewDetails()
	if (summaries[0].added.length > 0) {
		replaceCardDetailsView();
	}
}

function replaceCardDetailsView() {
	for(let i = 0,currentListDivElement = document.querySelectorAll('.window-header-inline-content', '#board');i < currentListDivElement;i++) {
		if (!currentListDivElement.querySelector('.card-short-id', '#board')) {
			// Use the URL to determine Card number
			let		afterFirstDelimiter = document.URL.lastIndexOf('/') + 1,
					beforeLastDelimiter = document.URL.indexOf('-'),
					cardNumber = document.URL.substring(afterFirstDelimiter, beforeLastDelimiter);

			currentListDivElement.innerHTML = "<span class='card-short-id'>#" + cardNumber + "</span>" + currentListDivElement.innerHTML;
		}
	}
}
