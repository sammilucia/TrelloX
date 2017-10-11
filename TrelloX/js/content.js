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
      if (!$cardDetails.data('trelloUXUpdate.initStyles')) {

        // Set card's left border to the label colour
        $cardDetails.css('border-left-width', '6px');
        $cardDetails.css('border-left-style', 'outset');
        $cardDetails.css('border-left-color', colorArray);
        
        // Remove left over padding after removing the label
        //$labelContainer.css('margin', '0px');
        //$labelContainer.data('trelloUXUpdate.initStyles', true);

        //Flag the card as processed
        $cardDetails.data('trelloUXUpdate.initStyles', true);
      } else {
      if ($card.data('trelloUXUpdate.bgColor')) {
      alert($card.data('trelloUXUpdate.bgColor'));
        $cardDetails.css('border-left-color', 'rgb(0,0,0)');
        
        $cardDetails.data('trelloUXUpdate.initStyles', true);
        }
      }
      
      //if (!$labelContainer.data('trelloUXUpdate.initStyles')) {
      //}

      if (showLabels()) {
        if (!$labels.data('trelloUXUpdate.hidden')) {
          $labels.hide();
          $cardDetails.css('border-left-color', colorArray);
          
          $cardDetails.data('trelloUXUpdate.initStyles', true);
          $labels.data('trelloUXUpdate.hidden', true);
        }
      } else {
        if ($labels.data('trelloUXUpdate.hidden')) {
          $labels.show();
          $cardDetails.css('border-left-color', 'rgb(255,255,255)');
          
          $cardDetails.data('trelloUXUpdate.initStyles', true);
          $labels.data('trelloUXUpdate.hidden', false);
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
    return (localStorage.getItem('trelloUXLabels') || 'true') === 'true';
}

function setLabelsStatus(state) {
  var $button = $('.trelloux-labels-toggle-btn > .board-header-btn-text');

  if (state) {
    localStorage.setItem('trelloUXLabels', "true");
    $button.text('Labels: Simple');
  } else {
    localStorage.setItem('trelloUXLabels', "false");
    $button.text('Labels: All');
  }
}

function createLabelsToggleButton() {
  // Wait until at least one list card has been rendered
  if (!$('.list-card').length) {
    setTimeout(createLabelsToggleButton, 1000);
    return;
  }
  var $toggleButton = $('<a class="board-header-btn trelloux-labels-toggle-btn" href="#">' +
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
