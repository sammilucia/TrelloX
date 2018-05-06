// Set up variables
var lastURL = document.URL;

function collapseLists() {
  // Handle collapsing/uncollapsing of lists, and dragging cards over collapsed lists  
  if (!document.querySelector('.collapse-toggle', '#board')) {

    // Get the unique Board ID from the URL
    var boardID = document.URL.substring(document.URL.indexOf('/b/') + 3, document.URL.indexOf('/b/') + 11);

    // Get all Lists on this Board
    document.querySelectorAll('.list-header-name', '#board').forEach(function (list) {
    
      // Encode List title for unique ID
      var listName = boardID + ':' + encodeURI(list.textContent);

      // Get isClosed value from chrome extension storage
      chrome.storage.local.get(listName, function (isClosed) {
        // If this list was closed, add the 'collapsed' class
        if (isClosed[listName]) {
          list.parentNode.parentNode.parentNode.classList.add('collapsed');
        }
        // Create collapse icon
        var toggle = document.createElement('div');
        toggle.className = 'collapse-toggle';
        // Click handler for collapse icon
        toggle.addEventListener('click', function (event) {
          // Get column name from event target
          var thisList = boardID + ':' + encodeURI(event.target.nextSibling.textContent);
          // Set isClosed value in chrome storage to inverse value
          chrome.storage.local.set({[thisList]: isClosed[listName] ? null : true}, function() {
            // Toggle the 'collapsed' class on successful save
            event.target.parentNode.parentNode.parentNode.classList.toggle('collapsed');
          });
        });
        list.parentNode.parentNode.parentNode.setAttribute('draggable', true);
        // Insert collapse icon
        list.parentNode.insertBefore(toggle, list);
      });
    });
    // Open List after a short delay if a Card is dragged over it
    // Create a new event since a Content Script can't access JS on the parent page.
    var isClosed, openList;
    // Make all Cards draggable. Put Cards back immediately on unsuccessful drop
    $('.list-card', '#board').draggable({revert: true, revertDuration: 0 });
    // Make all Lists droppable
    $('.list-wrapper', '#board').droppable({
      // Watch the area below the pointer
      tolerance: 'pointer',
      // When dragging over a closed List, open it after a short period
      over: (event, ui) => {
        if (event.target.classList.contains('collapsed')) {
          openList = setTimeout(() => {
            event.target.classList.remove('collapsed');
            isClosed = true;
          }, 250);
        } else {
          isClosed = false;
        }
      },
      // When leaving a previously closed List, clear the timeout and re-close it
      out: (event, ui) => {
        clearTimeout(openList);
        if (isClosed) {
          event.target.classList.add('collapsed');
        }
      },
      // When dropping the Card on that List, clear the timeout and re-close it
      drop: (event, ui) => {
        clearTimeout(openList);
        if (isClosed) {
          event.target.classList.add('collapsed');
        }
      }
    });
  }
}

function replaceTags() {
  // Add #tag, @mention, !hh:mm, header, and newline formatting to all Cards
  document.querySelectorAll('.list-card-title', '#board').forEach (function(card) {

    if (card.innerText.substring(0,2) === '##') {                         // If Card title starts with '##'
      card.innerHTML = card.innerHTML.replace(/#{2}(.+)/, '<h3 style="margin: 0;">$1</h3>') // Format title as a <h3>
      card.parentNode.parentNode.classList.add('clear');                  // Make Card background transparent
    } else {
      if (card.innerText === '---') {                                     // If Card title contains only '---'
        card.innerHTML = card.innerHTML.replace(/\-{3}/, '☰')            // Replace '---' with gripper symbol '☰'
        card.parentNode.parentNode.classList.add('clear');                // Make Card background transparent
        card.classList.add('clear');                                      // Make Card text transparent
      } else {
        card.innerHTML = card.innerHTML                                   // For all other cards...
          .replace(/\\{1}/, '</br>')                                      // Replace new lines first
          .replace(/(#{1}[a-zA-Z-_]+)/g, '<span class="card-tag">$1</span>') // Replace # followed by any character until a space
          .replace(/(@[a-zA-Z-_]+)/g, '<strong>$1</strong>')              // Replace @ followed by any character until a space
          .replace(/!([a-zA-Z0-9-_!:.]+)/g, '<code>$1</code>')            // Replace ! followed by any character until a space
      }
    }
  });
}

function showNumbers() {
    return (localStorage.getItem('trelloXNumbers') || 'true') === 'true';
}

function refreshNumbers() {
    
  // Add Card #numbers
  if (showNumbers()) {
    $('.card-short-id').removeClass('hide');
  } else {
    $('.card-short-id').addClass('hide');
  }
}

function replaceNumbers(state) {
  var $button = $('.trellox-numbers-btn > .board-header-btn-text');

  if (state) {
    localStorage.setItem('trelloXNumbers', "true");
    $button.text('Numbers: On');
  } else {
    localStorage.setItem('trelloXNumbers', "false");
    $button.text('Numbers: Off');
  }
  refreshNumbers();
}

function createButtons() {
  var $buttonNumbers = $('<span class="board-header-btn-divider"></span><a class="board-header-btn trellox-numbers-btn" href="#">' +
  '<span class="board-header-btn-icon icon-sm icon-number"></span>' +
  '<span class="board-header-btn-text" title="Show or hide card numbers.">Numbers: On</span>' +
  '</a>');
  $buttonNumbers.on('click', function() {
    replaceNumbers(!showNumbers());
  });

  $('.board-header-btns.mod-left').append($buttonNumbers);
}

function refreshTrelloX() {
  if (document.URL.includes('/b/') && document.URL !== lastURL) {
    console.log('TrelloX: Board changed');
    // Stop watching for HTML changes while board is redrawn
    //observer.disconnect();
    lastURL = document.URL;
    //$(document).ready(function() {
      // As soon as the DOM is ready again, install TrelloX
      // ####################### probably need to wait until all cards are drawn first????????????
      installTrelloX();
    //});
  } else {
    console.log('TrelloX: Refreshing');
    replaceTags();
    replaceNumbers(showNumbers());
  }
}

function installTrelloX() {
  console.log('TrelloX: Installing');
  createButtons();
  collapseLists();
  // Reveal Lists once they're collapsed
  $('#board').delay(10).animate({ opacity: 1 }, 1);
  refreshTrelloX();
  // Failsafe to display Board if animate has failed
  $('#board').css({ 'opacity' : '' });
  // Watch for changes
  //observer.reconnect(); // Watch for HTML changes
}

$(window).on('load', function() {
  // Set up observation of changes to Trello HTML
  var observer = new MutationSummary({
    // Send summary of observed changes
    callback: refreshTrelloX,
    queries: [{
      element: '.list-card-title'
    }]
  });
  // Stop watching for HTML changes until TrelloX is installed
  //observer.disconnect();
  installTrelloX();
});
