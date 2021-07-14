// Set up global variables
let lastURL = document.URL;

// Watch for Board changes
const config = { attributes: false, childList: true, subtree: true };

const TIMEOUT_DELAY = 1000;
const RETRY_COUNT = 20;

// Create an observer instance linked to the callback function
const observer = new MutationObserver( callback );


function getTargetNode()
{
	return document.querySelector( '#board' );
}

function readyFunction()
{
	console.log ( 'readyFunction' );

	let retries = RETRY_COUNT;

	const waitForTrello = () =>
	{
		const targetNode = getTargetNode();
		if ( !targetNode )
		{
			if ( !( retries-- ) ) return;
			return setTimeout( waitForTrello, TIMEOUT_DELAY );
		}
		// const thisBoard = getBoardId();
		installTrelloX();
		observer.observe( targetNode, config );
	};

	setTimeout( waitForTrello, TIMEOUT_DELAY );
}


$( document ).ready( readyFunction )

// TODO: Only look through cards in the change list ??'.list-card'

function callback( changes )
{
	if ( !getTargetNode().classList.contains( 'trellox' ) ) return readyFunction();

	observer.disconnect();

	for ( const change of changes )
	{
		if ( change.target ) {
			updateCardTags( change.target );
		}
	}

	// if ( document.URL.includes( '/b' ) ) // If we're not editing a Card, update formatting
	// {
	// 	// TODO: and if the board has changed
	// 	updateTrelloX(); // <=== problem
	// }
	// if ( lastURL.includes( '/c' ) && document.URL.includes( '/b' ) ) // When a Card is closed
	// {
	// 	window.lastUrl = document.URL; // Update last known URL
	// }
	observer.observe( getTargetNode(), config );
}

function installTrelloX()
{
	getTargetNode().classList.add( 'trellox');

	hideLists(); // Hide Lists that were previously hidden
	updateTrelloX(); // Update Cards with TrelloX formatting
}

function updateTrelloX()
{
	createButtons(); // Create toggle buttons in header
	updateCardTags( getTargetNode() );
	replaceSubtasks(getSubtasksHidingState());
	addCardNumbers();
	replaceNumbers(getNumbersShowingState());
}

function createButtons() // Create toggle buttons in header
{
	let buttonDrawCount = 0, // We want to run this function exactly twice...
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

function getBoardId()
{
	const match = window.location.href.match( /\/(.{8})\// );
	return match && match[ 1 ];
}

// Sets everything to allow the handling of list collapsing/uncollapsing
// And dragging cards over collapsed lists (TODO - Separate into own method too)
function hideLists()
{
	if ( !document.querySelector( '.collapse-icon', '#board' ) ) // If there are no collapsed Lists...
	{
		const thisBoard = getBoardId();

		let listIndex = 0;
			//willClose = false;

		chrome.storage.sync.get( 'trellox', function( listClosed ) // Get chrome data
		{
			let closedListData = listClosed.trellox ?? {};

			// For each list in board
			document.querySelectorAll('.list-header-name', '#board').forEach(function (thisList) {
				// Increment our naming index
				listIndex++;

				// Create a unique listID from boardID + List Name
				let listName = thisBoard + '-' + listIndex;

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

function addCardNumbers()
{
	if( $( this ).attr( 'href' ) !== undefined ) // If all new Cards have fully loaded
	{
		const
			isHiddenNumber = localStorage.getItem( 'trelloXNumbers' ) !== 'true' ? 'hide' : '',
			rxCard = /^.*\/(.*?)-.*/,
			span = cardNumber => {
				const span = document.createElement( 'span' );
				span.classList.add( 'card-short-id', isHiddenNumber );
				span.textContent = cardNumber;
				return span;
			};

		_( 'a[href]', '#board' )
			.filter( a => a.href )
			.filter( a => !_( 'span.card-short-id', a ) )
			.forEach( e =>
				_( '.list-card-title.js-card-name', el ).appendChild( span( e.href.replace( rxCardNum, '$1' ) ) ) );
	}
}


// function updateCardTag( theCard )
// {
// 	querySelector
// }


function updateCardTags( cardRoot ) {
	// Add #tag, @mention, !hh:mm, header, and newline formatting to all Cards
	
	let cards = cardRoot.querySelectorAll( '.list-card-title' );

		for( let i = 0,j = cards.length;i < j;i++ ) {
			if ( cards.item(i).innerText.substring(0,2) === '##' ) { //}|| cards.item(i).innerHTML.includes( '</h3>' )) { 	// If Card Title starts with '##'
				 cards.item(i).innerHTML = '<h3 style="margin: 0;">' + cards.item(i).innerText.substring(2,) + '</h3>'; 			// Format it as a Header Card
				 // cards.item(i).innerHTML.replace( /#{2}(.+)/, '<h3 style="margin: 0;">$1</h3>' );
			}
			else if ( cards.item(i).innerText.substring(0,1) === '+' ) { 													// If Card Title starts with '+'
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

// function cardChange(summaries) {
// 	// Get one and only summary that we should have
// 	let summary = summaries[0];

// 	// When a new card has been created, we must add its card number to it
// 	if (summary.added.length === 1 && summary.removed.length === 0) {
// 		for(let i = 0,listCard = summary.added;i < listCard;i++) {
// 			// If this is a list-card
// 			if (listCard.className.includes('list-card js-member-droppable')) {
// 				// Use the URL to determine Card number
// 				let 	afterFirstDelimiter = $(listCard).attr('href').lastIndexOf('/') + 1,
// 						beforeSecondDelimiter = $(listCard).attr('href').indexOf('-'),
// 						cardNumber = $(listCard).attr('href').slice(afterFirstDelimiter, beforeSecondDelimiter);

// 				// Get the section of html we want to add the card # to
// 				let numberHolder = $(listCard).find('.list-card-title.js-card-name');
// 				let isHiddenNumber = (localStorage.getItem('trelloXNumbers') !== 'true') ? 'hide' : '';
// 				// Add the card number span
// 				$(numberHolder).append("<span class='card-short-id " + isHiddenNumber + "'>#" + cardNumber + "</span>");


// 			}
// 		}
// 	}
// }

function handleCardClose() {
}

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
