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
    // Used invisible space between $1 to prevent regex iterating endlessly...
    // Need a more elegant solution
    card.innerHTML = card.innerHTML
    .replace(/@(\S+)/, '<strong>@$1</strong>')
    .replace(/#([a-zA-Z]+)/, '<span class="card-tag">#$1</span>')
    .replace(/!([^\s]*)/, '<code>!$1</code>')
    .replace(/\-{3}/, '☰')
    .replace(/h\.(.+)/, '<h3 style="margin: 0;">$1</h3>')
    .replace(/{/, '</br>')
  });
  
  // Make separator Cards transparent
  $(function(){ $('.list-card:contains(☰)', '#board').addClass('separator'); });
  $(function(){ $('.list-card-title:contains(☰)', '#board').addClass('separator'); });
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
  if (document.URL.includes('/b/') && lastURL !== document.URL) {
    lastURL = document.URL;
    installTrelloX();
  } else {
    replaceTags();
    replaceNumbers(showNumbers());
  }
}

function installTrelloX() {
  createButtons();
  collapseLists();
  // Reveal Lists once they're collapsed
  $('#board').delay(10).animate({ opacity: 1 }, 1);
  replaceNumbers(showNumbers());
  replaceTags();
  // Failsafe display Board if animate has failed
  $('#board').css({ 'opacity' : '' });
}

$(window).on('load', function() {
  // As soon as the page is loaded, install TrelloX. Can't use on ready because of race condition
  installTrelloX();
  
  // Observe changes to Trello HTML
  var observer = new MutationSummary({
    // Send summary of observed changes
    callback: refreshTrelloX,
    queries: [{
      // Watch Cards only
      element: '.list-card-title, #board'
    }]
  });
});