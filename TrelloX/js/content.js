// Looking up background-colour is expensive, so cache it
var colorCache = {};
function getLabelColor(label) {
  var classes = label.className;
  if (!colorCache[classes]) {
    colorCache[classes] = $(label).css("background-color");
  }
  return colorCache[classes];
}

function setCSS() {
  $('head').append(
    '<style>' +
      '.card-short-id{ margin-right: 4px; color: #838c91; font-size: 12px; float: right; }' +
    '</style>');
}

function colorizeCards($cards) {
  $cards.each(function (i, card) {
  
    var $card = $(card);
    var $labels = $card.find('span.card-label');
    var $labelContainer = $card.find('.list-card-labels');
    var $cardDetails = $card.find('.list-card-details');
    var $cardNumber = $card.find('.card-short-id');

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

    // If there are label(s) make the side bar colour of the first label (0)
    if ($labels.size()) {

      var colorArray = getLabelColor($labels[0]);
      
      // If the card is not already processed
      if (!$cardDetails.data('TrelloX.initStyles')) {

        // Set card's left border to the label colour
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

var iteration = 0;
function colorize() {
  if (iteration % 10 === 0) {
    colorizeCards($('a.list-card'));

  // Only process "pirate-aged" cards every 10th iteration
  // ****** Probably not worth the CPU saving for extra code complexity need to test ****
  } else {
    colorizeCards($('a.list-card:not(.aging-pirate), a.list-card.aging-level-0'));
  }
  
  iteration++;
  
  // ****** Update cards every half a second (this is biggest impact on CPU) *****
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
    $button.text('Labels: New');
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
};

$(document).ready(function() {
  createButtons();
  setCSS();
  colorize();
});
