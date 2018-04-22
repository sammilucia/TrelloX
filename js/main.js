// Set up variables
var colorCache = {};
var targetNode = document.getElementById('content'); // Watch for Board changes
var config = { childList: true }; // Set counter to workaround duplicate mutation event
var duplicateCount = 2; // Reinstall TrelloX when Board change detected

var callback = function(mutationsList) {
  for(var mutation of mutationsList) {
    if (mutation.type == 'childList') {
    duplicateCount--;
      if (!duplicateCount) {
        duplicateCount = 2;
        console.log('TrelloX: Detected Board change');
        setTimeout(installTrelloX, 50);
      }
    }
  }
};

// Create observer instance, start observing
var observer = new MutationObserver(callback);
observer.observe(targetNode, config);

function getLabelColor(label) {
  // Cache background colors to reduce refreshLabels() overhead
  var classes = label.className;
  if (!colorCache[classes]) {
    colorCache[classes] = $(label).css('background-color');
  }
  return colorCache[classes];
}

function installTrelloX() {
  console.log('TrelloX: Installing TrelloX');
  createButtons();
  collapseLists();
  setNumbersState(showNumbers());
  setLabelsState(showLabels());
  addTags($('a.list-card'));
  console.log('TrelloX: Ready');
}

/*function refreshLabels($cards) {
  // Replace old labels with color side bar on all cards
  console.log('TrelloX: Refreshing Card Labels');

  for (var card of $cards) {
  
  // 1. Need to add '.new' to CSS, and toggle between adding and removing '.new'
  // 2. Need to check for how many labels on card, and shrink .list-card-details width dynamically
  
    // card is the URL of each Card
    // $card is the Card properties
    var $card = $(card);

    var $labels = $card.find('span.card-label');
    var $labelContainer = $card.find('.list-card-labels');
    var $cardDetails = $card.find('.list-card-details');
    var $cardNumber = $card.find('.card-short-id');
    
    // Pre-set CSS to make TrelloX appear as seamless as possible
    $cardDetails.css('border-left-width', '6px');
    $cardDetails.css('border-left-style', 'outset');
    $labelContainer.addClass('hide');

    // If there are label(s) make the side bar color of the first label (0)
    if ($labels.length) {

      var colorArray = getLabelColor($labels[0]);
      
      // If the card is not already processed
      if (!$cardDetails.data('TrelloX.initStyles')) {

        // Set card's left border to the label color
        $cardDetails.css('border-left-color', colorArray);

        // Flag card as processed
        $cardDetails.data('TrelloX.initStyles', true);
      } 

      if (showLabels()) {
        $labelContainer.addClass('hide');
        $cardDetails.css('border-left-color', colorArray);
      } else {
        $labelContainer.removeClass('hide');
        $cardDetails.css('border-left-width', '0px');
      }
    
    // Or if there was no label make side bar transparent
    } else {
      // When Labels: New, hide the legacy labels
      $cardDetails.css('border-left-color', 'transparent');
    }
  //}; 
} */

function refreshNumbers($cards) {
// Replace old labels with color side bar on all cards

  console.log('TrelloX: Refreshing Card Numbers');

  for (var card of $cards) {
  
    // card is URL of card
    // $card is an object
    var $card = $(card);
    //var $labels = $card.find('span.card-label');
    //var $labelContainer = $card.find('.list-card-labels');
    //var $cardDetails = $card.find('.list-card-details');
    var $cardNumber = $card.find('.card-short-id');

    // If Numbers: On show card numbers
    if (showNumbers()) {
      $cardNumber.removeClass('hide');
    } else {
      $cardNumber.addClass('hide');
    }
  };
}

function collapseLists() {
  if (!document.querySelector('.collapse-toggle')) {
      // Which Board are we on?
      var boardID = window.location.href.substring(window.location.href.indexOf('/b/') + 3, window.location.href.indexOf('/b/') + 11);
      console.log('TrelloX: Board is \x27' + boardID + '\x27');
      // Get all Lists
      document.querySelectorAll('.list-header-name').forEach( e => {
        // Encode List title for unique ID
        var columnName = encodeURI(e.textContent);
        // Get isClosed value from chrome extension storage
        chrome.storage.local.get(boardID+':'+columnName, isClosed => {
          // If this list is closed, add the 'collapsed' class
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
              // Toggle the collapsed class on successful save
              evt.target.parentNode.parentNode.parentNode.classList.toggle('collapsed');
            });
          })
          e.parentNode.parentNode.parentNode.setAttribute('draggable', true);
          // Insert collapse icon
          e.parentNode.insertBefore(toggle, e);
        });
      });
      // Open List after a short delay if a Card is dragged over it. Trello uses jQuery draggable,
      // but we have to create new events since a Content Script can't access JS on the parent page.
      var isClosed, openList;
      // Make all Cards draggable. Put Cards back immediately on unsuccessful drop
      $('.list-card').draggable({revert: true, revertDuration: 0});
      // Make all Lists droppable
      $('.js-list').droppable({
        // Watching the area below the pointer
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
        // When we leave a previously closed List, clear the timeout and re-close it
        // When we drop a Card on it, clear the timeout and re-close it
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
  // Fade in once Lists are collapsed
  $('#board').delay(50).animate({ opacity: 1 }, 80);
}

function addTags($cards) {
// Add #tag formatting to all cards

  console.log('TrelloX: Formatting Card #tags');

  var cards = document.getElementsByClassName('list-card-title');
  
  $cards.each(function (i, card) {
  
    cards[i].innerHTML = cards[i].innerHTML
    // Needed to use invisible space between $1 to prevent regex iterating endlessly...???
    // Need a more elegant solution
    .replace(/@(\S+)/, '<strong>@﻿$1</strong>')
    .replace(/#([a-zA-Z]+)/, '<span class="card-tag">#﻿$1</span>')
    .replace(/!(\S+)/, '<code>﻿$1</code>')
    .replace(/\-{3}/, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•••')
    .replace(/h\.(.+)/, '<h3 style="margin: 0;">$1</h3>')
    .replace(/{/, '</br>')
  });
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
  refreshNumbers($('a.list-card'));
}

function createButtons() {
  // Set up Labels button
  // Add back when Labels New/Old toggling is working again using css '.new'
  /*var $buttonLabels = $('<a class="board-header-btn trellox-labels-btn" href="#">' +
    '<span class="board-header-btn-icon icon-sm icon-card-cover"></span>' +
    '<span class="board-header-btn-text" title="Show all labels, or use the first label as card color">Labels: New</span>' +
    '</a>');
  $buttonLabels.on('click', function() {
    setLabelsState(!showLabels());
  });*/
  
  var $buttonNumbers = $('<a class="board-header-btn trellox-numbers-btn" href="#">' +
  '<span class="board-header-btn-icon icon-sm icon-number"></span>' +
  '<span class="board-header-btn-text" title="Show or hide card numbers.">Numbers: On</span>' +
  '</a>');
  $buttonNumbers.on('click', function() {
    setNumbersState(!showNumbers());
  });

  $('.board-header-btns.mod-left').append($buttonNumbers);
  //$('.board-header-btns.mod-left').append($buttonLabels);
}

$(window).on('load', function() {
  // As soon as the page is loaded, install TrelloX. Can't use on ready because of race condition
  setTimeout(installTrelloX(),10);
});
