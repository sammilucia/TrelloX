// Looking up background-colour is expensive, so cache it
var colorCache = {};
function getLabelColor(label) {
  var classes = label.className;
  if (!colorCache[classes]) {
    colorCache[classes] = $(label).css("background-color");
  }
  return colorCache[classes];
}

function colorizeCards($cards) {
  $cards.each(function (i, card) {
  
    var $card = $(card);
    var $labels = $card.find('span.card-label');
    var $labelContainer = $card.find('.list-card-labels');
    
    var $cardDetails = $card.find('.list-card-details');

    // If there are label(s) make the side bar colour of the first label (0)
    if ($labels.size()) {

      var colorArray = getLabelColor($labels[0]);
      
      // If the card is not already processed
      if (!$cardDetails.data('TrelloX.initStyles')) {

        // Set card's left border to the label colour
        $cardDetails.css('border-left-width', '6px');
        $cardDetails.css('border-left-style', 'outset');
        $cardDetails.css('border-left-color', colorArray);
        
        // When Labels: Simple, hide the legacy labels
        $labelContainer.addClass('hide');

        // Flag card as processed
        $cardDetails.data('TrelloX.initStyles', true);
      } 

      if (showLabels()) {
        $labelContainer.addClass('hide');
        $cardDetails.css('border-left-color', colorArray);
      } else {
        $labelContainer.removeClass('hide');
        $cardDetails.css('border-left-color', 'transparent');
      }
    
    // Else if there is no label make side bar transparent
    } else {
      $cardDetails.css('border-left-width', '6px');
      $cardDetails.css('border-left-style', 'outset');
      $cardDetails.css('border-left-color', 'transparent');
    }
  });
}

var iteration = 0;
function colorize() {
  // Only process "pirate-aged" cards every 10th iteration
  // When a label is applied, the card should become de-pirated anyway and get processed immediately
  if (iteration % 10 === 0) {
    colorizeCards($('a.list-card'));
  } else {
    colorizeCards($('a.list-card:not(.aging-pirate), a.list-card.aging-level-0'));
  }
  
  iteration++;
  
  // Update cards every half a second (this is biggest impact on CPU)
  // A kinder way to do it would be requestAnimationFrame(), but Trello seems to redraw all the time??
  // Perhaps run on an iteration of requestAnimationFrame()s?
  setTimeout(colorize, 500);
};

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
    $button.text('Labels: Simple');
  } else {
    localStorage.setItem('trelloXLabels', "false");
    $button.text('Labels: All');
  }
}

function setNumbersStatus(state) {
  var $button = $('.trellox-numbers-btn > .board-header-btn-text');

  if (state) {
    localStorage.setItem('trelloXNumbers', "true");
    $button.text('Numbers: On');
  } else {
    localStorage.setItem('trelloXNumbers', "false");
    $button.text('Numbers: Off');
  }
}

function createButtons() {
  // Wait until at least one card has been rendered
  if (!$('.list-card').length) {
    setTimeout(createButtons, 300);
    return;
  }

  // Set up Labels button
  var $buttonLabels = $('<a class="board-header-btn trellox-labels-btn" href="#">' +
    '<span class="board-header-btn-icon icon-sm icon-card-cover"></span>' +
    '<span class="board-header-btn-text" title="Show all labels, or use the first label as card color">Labels: Simple</span>' +
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
};

$(document).ready(function() {
  createButtons();
  colorize();
});
