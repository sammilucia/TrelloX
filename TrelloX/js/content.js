// Set up listener to call doMutate() on any page content change
// *********** could just call only replaceLabels when labels change ...
// only addTags when title changes **********
var observer = new MutationSummary({
  callback: doMutate,
  queries: [{
    element: '*'
  }]
});

// Overwrite <head> CSS to improve UX
function setCSS() {
  $('head').append(
    '<style>' +
      '.card-short-id{ margin-right: 4px; margin-left:3px; color: #838c91; font-size: 12px; float: right; }' +
    '</style>');
}

// Cache background colors to reduce overhead of replaceLabels()
var colorCache = {};
function getLabelColor(label) {
  var classes = label.className;
  if (!colorCache[classes]) {
    colorCache[classes] = $(label).css("background-color");
  }
  return colorCache[classes];
}

// Main function that calls all mutations
function doMutate() {
  replaceLabels($('a.list-card'));
  addTags($('a.list-card'));
}

// Replace old labels with color side bar on all cards
function replaceLabels($cards) {
  $cards.each(function (i, card) {
  
    // card is URL of card
    // $card is an object
    var $card = $(card);
    var $labels = $card.find('span.card-label');
    var $labelContainer = $card.find('.list-card-labels');
    var $cardDetails = $card.find('.list-card-details');
    var $cardNumber = $card.find('.card-short-id');

    // ***** Stuff not related to this loop needs to go into its own function
    
    // Pre-set CSS to make TrelloX appear as seamless as possible
    $cardDetails.css('border-left-width', '6px');
    $cardDetails.css('border-left-style', 'outset');
    $labelContainer.addClass('hide');
    
    // If Numbers: On show card numbers
    if (showNumbers()) {
      $cardNumber.removeClass('hide');
    } else {
      $cardNumber.addClass('hide');
    }

    // If there are label(s) make the side bar color of the first label (0)
    if ($labels.size()) {

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
  });
}

// Add tag formatting to all cards  
function addTags($cards) {
  var cards = document.getElementsByClassName('list-card-title');
  $cards.each(function (i, card) {
    cards[i].innerHTML = cards[i].innerHTML
    .replace(/@(\S+)/g, '<strong>@﻿$1</strong>')
    .replace(/#([a-zA-Z]+)/g, '<span class="card-short-id">#﻿$1</span>')
    .replace(/!(\S+)/g, '<code>$1</code>')
    .replace(/\-{3}/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•••')
    .replace(/\/n/g, '</br>')
  });
}

function showLabels() {
    return (localStorage.getItem('trelloXLabels') || 'true') === 'true';
}

function showNumbers() {
    return (localStorage.getItem('trelloXNumbers') || 'true') === 'true';
}

function setLabelsStatus(state) {
  var $button = $('.trellox-labels-btn > .board-header-btn-text');

  if (state) {
    localStorage.setItem('trelloXLabels', "true");
    $button.text('Labels: New');
    doMutate();
  } else {
    localStorage.setItem('trelloXLabels', "false");
    $button.text('Labels: All');
    doMutate();
  }
}

function setNumbersStatus(state) {
  var $button = $('.trellox-numbers-btn > .board-header-btn-text');

  if (state) {
    localStorage.setItem('trelloXNumbers', "true");
    $button.text('Numbers: On');
    doMutate();
  } else {
    localStorage.setItem('trelloXNumbers', "false");
    $button.text('Numbers: Off');
    doMutate();
  }
}

function createButtons() {
  // Wait until at least one card has been rendered
  if (!$('.list-card').length) {
    setTimeout(createButtons, 500);
    return;
  }

  // Set up Labels button
  var $buttonLabels = $('<a class="board-header-btn trellox-labels-btn" href="#">' +
    '<span class="board-header-btn-icon icon-sm icon-card-cover"></span>' +
    '<span class="board-header-btn-text" title="Show all labels, or use the first label as card color">Labels: New</span>' +
    '</a>');
  $buttonLabels.on('click', function() {
    setLabelsStatus(!showLabels());
  });
  
  var $buttonNumbers = $('<a class="board-header-btn trellox-numbers-btn" href="#">' +
  '<span class="board-header-btn-icon icon-sm icon-number"></span>' +
  '<span class="board-header-btn-text" title="Show or hide card numbers.">Numbers: On</span>' +
  '</a>');
  $buttonNumbers.on('click', function() {
    setNumbersStatus(!showNumbers());
  });

  $('.board-header-btns.mod-left').append($buttonLabels);
  $('.board-header-btns.mod-left').append($buttonNumbers);
  
  setLabelsStatus(showLabels());
  setNumbersStatus(showNumbers());
}

function doNothing() {
  setTimeout(doNothing, 10000);
}

$(document).ready(function() {
  createButtons();
  setCSS();
  doMutate();
  doNothing();
});
