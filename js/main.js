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
      //card.parentNode.parentNode.classList.remove('clear');                // Make Card background not transparent initially
      //card.classList.remove('clear');                                      // Make Card text not transparent initially

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
          .replace(/#{1}([a-zA-Z-_]+)/g, '<span class="card-tag">#﻿$1</span>') // Replace # followed by any character until a space
          .replace(/@([a-zA-Z-_]+)/g, '<strong>@﻿$1</strong>')              // Replace @ followed by any character until a space
          .replace(/!([a-zA-Z0-9-_!:.]+)/g, '<code>$1</code>')            // Replace ! followed by any character until a space
          //.replace(/\[(\+?[0-9()-]{5,20})\]/g, '<a class="card-link" target="_blank" href="tel:$1">$1</a>')// Make phone numbers clickable
          //.replace(/\[https?:\/\/([\S]+)\]/g, '<a class="card-link" target="_blank" href="//$1">$1</a>')// Make HTTP(S) links clickable
      }
    }
  });
}

/*function refreshLinks() { 
  // Make Card links clickable
  $(".card-link").on("mouseover", function() {
    var rect = this.getBoundingClientRect(),
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

function replaceCardDetailsView(){
    document.querySelectorAll('.js-current-list', '#board').forEach (function(currentListDivElement) {
      // Use the url to determine what number the card is
        var urlID = document.URL.substr(document.URL.lastIndexOf('/') + 1);
        var cardNumber = urlID[0];

        currentListDivElement.innerHTML = "#"+ cardNumber +" " + currentListDivElement.innerHTML;
    });

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

function boardChange() {
  if (document.URL.includes('/b/') && document.URL !== lastURL) {
    console.log('TrelloX: Board changed');
    lastURL = document.URL;
    installTrelloX();
  }
}

function refreshTrelloX() {
  console.log('TrelloX: Refreshing');
  replaceTags();
  replaceNumbers(showNumbers());
  //refreshLinks();
  // Failsafe to display Board if animate has failed
  $('#board').delay(10).animate({ opacity: 1 }, 1);
}

function installTrelloX() {
  console.log('TrelloX: Installing');
  createButtons();
  collapseLists();
  // Reveal Lists once they're collapsed
  $('#board').delay(10).animate({ opacity: 1 }, 1);
  refreshTrelloX();
}

$(window).on('load', function() {
  // Set up observation for Board changes
  var observer = new MutationSummary({
    callback: boardChange,
    queries: [{ element: '.list-card-title' }]
  });
  
  installTrelloX();

  // Set up observation for Card changes
  $('body').on('mouseup keyup', function() {
    setTimeout(function() {
      refreshTrelloX();
    }, 20);
  })
});
