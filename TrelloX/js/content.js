// Looking up background-colours is expensive, so we cache them
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

    if ($labels.size()) {

      var colorArray = getLabelColor($labels[0]);
      var $cardDetails = $card.find('.list-card-details');

      // If the card isn't already flagged as processed
      if (!$cardDetails.data('TrelloX.initStyles')) {

        // Set card's left border to the label colour
        $cardDetails.css('border-left-width', '6px');
        $cardDetails.css('border-left-style', 'outset');
        $cardDetails.css('border-left-color', colorArray);
        
        // Remove left over padding after removing the label
        //$labelContainer.css('margin', '0px');
        //$labelContainer.data('TrelloX.initStyles', true);

        //Flag the card as processed
        $cardDetails.data('TrelloX.initStyles', true);
      } else {
      if ($card.data('TrelloX.bgColor')) {
      alert($card.data('TrelloX.bgColor'));
        $cardDetails.css('border-left-color', 'rgb(0,0,0)');
        
        $cardDetails.data('TrelloX.initStyles', true);
        }
      }
      
      //if (!$labelContainer.data('TrelloX.initStyles')) {
      //}

      if (showLabels()) {
        if (!$labels.data('TrelloX.hidden')) {
          $labels.hide();
          $cardDetails.css('border-left-color', colorArray);
          
          $cardDetails.data('TrelloX.initStyles', true);
          $labels.data('TrelloX.hidden', true);
        }
      } else {
        if ($labels.data('TrelloX.hidden')) {
          $labels.show();
          $cardDetails.css('border-left-color', 'rgb(255,255,255)');
          
          $cardDetails.data('TrelloX.initStyles', true);
          $labels.data('TrelloX.hidden', false);
        }
      }
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
  
  setTimeout(colorize, 500);
};

function showLabels() {
    return (localStorage.getItem('trelloXLabels') || 'true') === 'true';
}

function setLabelsStatus(state) {
  var $button = $('.trelloX-labels-toggle-btn > .board-header-btn-text');

  if (state) {
    localStorage.setItem('trelloXLabels', "true");
    $button.text('Labels: Simple');
  } else {
    localStorage.setItem('trelloXLabels', "false");
    $button.text('Labels: All');
  }
}

function createLabelsToggleButton() {
  // Wait until at least one list card has been rendered
  if (!$('.list-card').length) {
    setTimeout(createLabelsToggleButton, 1000);
    return;
  }
  var $toggleButton = $('<a class="board-header-btn trelloX-labels-toggle-btn" href="#">' +
    '<span class="board-header-btn-icon icon-sm icon-card-cover"></span>' +
    '<span class="board-header-btn-text" title="Show all labels, or use the first label as card color">Labels: Simple</span>' +
    '</a>');

  $toggleButton.on('click', function() {
    setLabelsStatus(!showLabels());
  });

  $('.board-header-btns.mod-left').append($toggleButton);

  setLabelsStatus(showLabels());
};

$(document).ready(function() {
  createLabelsToggleButton();
  colorize();
});
