// Set up variables
var lastURL = document.URL;

  /*var trelloChanges = summaries[0];
  trelloChanges.added.forEach(function(newEl) {
    console.log(newEl);
  });*/

function refreshNumbers($cards) {
  // Replace old labels with color side bar on all cards
  if (showNumbers()) {
    $('.card-short-id').removeClass('hide');
  } else {
    $('.card-short-id').addClass('hide');
  }
}

function collapseLists() {
  // Handle collapsing/uncollapsing of lists, and dragging cards over collapsed lists
  
  if (!document.querySelector('.collapse-toggle')) {

    // Parse the unique Board ID from the URL
    var boardID = document.URL.substring(document.URL.indexOf('/b/') + 3, document.URL.indexOf('/b/') + 11);

    // Get all Lists on this Board
    document.querySelectorAll('.list-header-name').forEach(e => {
    
      // Encode List title for unique ID
      var columnName = encodeURI(e.textContent);

      // Get isClosed value from chrome extension storage
      chrome.storage.local.get(boardID+':'+columnName, isClosed => {
        // If this list was closed, add the 'collapsed' class
        if (isClosed[boardID+':'+columnName])
          e.parentNode.parentNode.parentNode.classList.add('collapsed');
        // Create collapse icon
        var toggle = document.createElement('div');
        toggle.className = 'collapse-toggle';
        // Click handler for collapse icon
        toggle.addEventListener('click', evt => {
          // Get column name from event target
          var thisColumn = encodeURI(evt.target.nextSibling.textContent);
          // Set isClosed value in chrome storage to inverse value
          chrome.storage.local.set({[boardID+':'+thisColumn]: isClosed[boardID+':'+columnName] ? null : true}, res => {
            // Toggle the 'collapsed' class on successful save
            evt.target.parentNode.parentNode.parentNode.classList.toggle('collapsed');
          });
        })
        e.parentNode.parentNode.parentNode.setAttribute('draggable', true);
        // Insert collapse icon
        e.parentNode.insertBefore(toggle, e);
      });
    });
    // Open List after a short delay if a Card is dragged over it
    // Create a new event since a Content Script can't access JS on the parent page.
    var isClosed, openList;
    // Make all Cards draggable. Put Cards back immediately on unsuccessful drop
    // ########### need to add #board context
    $('.list-card').draggable({revert: true, revertDuration: 0});
    // Make all Lists droppable
    // Add #board context???
    $('.list-wrapper').droppable({
      // Watch the area below the pointer
      tolerance: 'pointer',
      // When dragging over a closed List, open it after a short period
      over: (evt, ui) => {
        if (evt.target.classList.contains('collapsed')) {
          openList = setTimeout(() => {
            evt.target.classList.remove('collapsed');
            isClosed = true;
          }, 250);
        } else {
          isClosed = false;
        }
      },
      // When leaving a previously closed List, clear the timeout and re-close it
      // When dropping a Card on it, clear the timeout and re-close it
      out: (evt, ui) => {
        clearTimeout(openList);
        if (isClosed) {
          evt.target.classList.add('collapsed');
        }
      },
      drop: (evt, ui) => {
        clearTimeout(openList);
        if (isClosed) {
          evt.target.classList.add('collapsed');
        }
      }
    });
  }
  // Reveal Lists only once they're collapsed
  $('#board').delay(10).animate({ opacity: 1 }, 1);
}

function addTags($cards) {
  // Add #tag formatting to all cards
  var cards = document.getElementsByClassName('list-card-title');
  
  for (var i = 0; i < $cards.length; i++) {
    // Used invisible space between $1 to prevent regex iterating endlessly...
    // Need a more elegant solution 
    cards[i].innerHTML = cards[i].innerHTML
    .replace(/@(\S+)/, '<strong>@﻿$1</strong>')
    .replace(/#([a-zA-Z]+)/, '<span class="card-tag">#﻿$1</span>')
    .replace(/!(\S+)/, '<code>﻿$1</code>')
    .replace(/\-{3}/, '☰')
    .replace(/h\.(.+)/, '<h3 style="margin: 0;">$1</h3>')
    .replace(/{/, '</br>')
  };
  
  // Make separator Cards transparent
  $(function(){ $('.list-card:contains(☰)').addClass('separator'); });
  $(function(){ $('.list-card-title:contains(☰)').addClass('separator'); });
}

function showLabels() {
    return (localStorage.getItem('trelloXLabels') || 'true') === 'true';
}

function showNumbers() {
    return (localStorage.getItem('trelloXNumbers') || 'true') === 'true';
}

function setLabelsState(state) {
  var $button = $('.trellox-labels-btn > .board-header-btn-text');

  if (state) {
    localStorage.setItem('trelloXLabels', 'true');
    $button.text('Labels: New');
  } else {
    localStorage.setItem('trelloXLabels', 'false');
    $button.text('Labels: Old');
  }
  // Put back when able to toggle between old labels and '.new'
  //refreshLabels($('a.list-card'));
}

function setNumbersState(state) {
  var $button = $('.trellox-numbers-btn > .board-header-btn-text');

  if (state) {
    localStorage.setItem('trelloXNumbers', "true");
    $button.text('Numbers: On');
  } else {
    localStorage.setItem('trelloXNumbers', "false");
    $button.text('Numbers: Off');
  }
  refreshNumbers($('.list-card-title'));
}

function createButtons() {
  var $buttonNumbers = $('<span class="board-header-btn-divider"></span><a class="board-header-btn trellox-numbers-btn" href="#">' +
  '<span class="board-header-btn-icon icon-sm icon-number"></span>' +
  '<span class="board-header-btn-text" title="Show or hide card numbers.">Numbers: On</span>' +
  '</a>');
  $buttonNumbers.on('click', function() {
    setNumbersState(!showNumbers());
  });

  $('.board-header-btns.mod-left').append($buttonNumbers);
  //$('.board-header-btns.mod-left').append($buttonLabels);
}

function refreshTrelloX(summaries) {
  if (document.URL.includes('/b/') && lastURL !== document.URL) {
    lastURL = document.URL;
    installTrelloX();
  } else {
    addTags($('.list-card-title'));
  }
}

function installTrelloX() {
  createButtons();
  collapseLists();
  setNumbersState(showNumbers());
  //setLabelsState(showLabels());
  addTags($('.list-card-title'));
}

$(window).on('load', function() {
  // As soon as the page is loaded, install TrelloX. Can't use on ready because of race condition
  setTimeout(installTrelloX(),10);
});


// Observe high-level changes to Trello
var observer = new MutationSummary({
  // Send summary of observed changes
  callback: refreshTrelloX,
  queries: [{
    // Watch everything
    element: '*'
  }]
});
