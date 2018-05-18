// Set up variables
var lastURL = document.URL;
var chrome;

function collapseLists() {
  // Handle collapsing/uncollapsing of lists, and dragging cards over collapsed lists
  
  // If there are no collapsed Lists...
  if (!document.querySelector('.collapse-icon', '#board')) {
    
    // Use URL to find the boardID
    var
      afterFirstDelimiter = document.URL.indexOf('/b/') + 3,
      beforeLastDelimiter = document.URL.lastIndexOf('/'),
      boardID = document.URL.substring(afterFirstDelimiter, beforeLastDelimiter);

    // For each List on the Board
    document.querySelectorAll('.list-header-name', '#board').forEach(function (thisList) {
    
      // Create a safe listID from boardID + List Name
      var listName = boardID + '-' + encodeURI(thisList.textContent);
      // Get listClosed value from chrome extension storage
      chrome.storage.sync.get(listName, function (listClosed) {

        // If this List is closed, collapse it
        if (listClosed[listName]) {
          thisList.parentNode.parentNode.parentNode.classList.add('collapsed');
        }

        // Create a collapse icon
        var collapseIcon = document.createElement('div');
        collapseIcon.className = 'collapse-icon';
        // Add a click handler for the icon
        collapseIcon.addEventListener('click', function (event) {
          // Get column name from event target
          //var listName = boardID + '-' + encodeURI(event.target.nextSibling.textContent);

          // Toggle the listClosed value on click
          console.log(listClosed[listName]);
          chrome.storage.sync.set({[listName]: listClosed[listName] ? false : true}, function () {
            // Toggle the 'collapsed' class on successful save
            console.log(listClosed[listName]);
            event.target.parentNode.parentNode.parentNode.classList.toggle('collapsed');
          });

        });
        thisList.parentNode.parentNode.parentNode.setAttribute('draggable', true);
        // Insert collapse icon
        thisList.parentNode.insertBefore(collapseIcon, thisList);
      });
    });

    // Open List after a short delay when a Card dragged over it
    // Create a new event since a Content Script can't access JS on the parent page.
    var listClosed, openList;
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
            listClosed = true;
          }, 200);
        } else {
          listClosed = false;
        }
      },
      // When leaving a previously closed List, clear the timeout and re-close it
      out: (event, ui) => {
        clearTimeout(openList);
        if (listClosed) {
          event.target.classList.add('collapsed');
        }
      },
      // When dropping the Card on that List, clear the timeout and re-close it
      drop: (event, ui) => {
        clearTimeout(openList);
        if (listClosed) {
          event.target.classList.add('collapsed');
        }
      }
    });
  }
}

function replaceTags() {
  // Add #tag, @mention, !hh:mm, header, and newline formatting to all Cards
  document.querySelectorAll('.list-card-title', '#board').forEach (function(card) {

    if (card.innerText.substring(0,2) === '##' || card.innerHTML.includes('</h3>')) { // If Card is a header Card
      card.innerHTML = card.innerHTML.replace(/#{2}(.+)/, '<h3 style="margin: 0;">$1</h3>') // Format title as a <h3>
      card.parentNode.parentNode.classList.add('clear');                  // Make background transparent
    } else {
      if (card.innerText === '---' || card.innerText.includes('☰')) {    // If Card is a separator Card
        card.innerHTML = card.innerHTML.replace(/\-{3}/, '☰')            // Replace '---' with gripper symbol '☰'
        card.parentNode.parentNode.classList.add('clear');                // Make background transparent
        card.classList.add('clear');                                      // Make text transparent
      } else {                                                            // For all other cards...
        card.parentNode.parentNode.classList.remove('clear');             // Remove background transparency
        card.classList.remove('clear');                                   // Remove text transparency
        card.innerHTML = card.innerHTML
          .replace(/\\{1}/, '</br>')                                      // Replace new lines first
          .replace(/#{1}([a-zA-Z-_]+)/g, '<span class="card-tag">#﻿$1</span>') // Replace # followed by any character until a space
          .replace(/@([a-zA-Z-_]+)/g, '<strong>@﻿$1</strong>')            // Replace @ followed by any character until a space
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
  document.querySelectorAll('.window-header-inline-content', '#board').forEach (function(currentListDivElement) {
    if (!currentListDivElement.querySelector('.card-short-id', '#board')) {
      // Use the URL to determine Card number
      var afterFirstDelimiter = document.URL.lastIndexOf('/') + 1,
        beforeLastDelimiter = document.URL.indexOf('-'),
        cardNumber = document.URL.substring(afterFirstDelimiter, beforeLastDelimiter);

      currentListDivElement.innerHTML = "<span class='card-short-id'>#" + cardNumber + "</span>" + currentListDivElement.innerHTML;
    }
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
  replaceCardDetailsView();
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
