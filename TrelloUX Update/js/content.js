// Looking up the css background color is expensive, so cache the results
var colorCache = {};
function getColor(label) {
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

    if ($labels.size()) {

	  var colorArray = getColor($labels[0]);
      var $cardDetails = $card.find('.list-card-details');
      if (!$cardDetails.data('trelloUXUpdate.initStyles')) {
        $cardDetails.css("border-left-width", "6px");
        $cardDetails.css("border-left-style", "outset");
        $cardDetails.css("border-left-color", colorArray);

        $cardDetails.data('trelloUXUpdate.initStyles', true);
      }
      
      var $cardLabels = $card.find('.list-card-labels');
      if (!$cardLabels.data('trelloUXUpdate.initStyles')) {
        $cardLabels.css("margin", "0px");

        $cardLabels.data('trelloUXUpdate.initStyles', true);
      }

      if (shouldMerge()) {
        if (!$labels.data('trelloUXUpdate.hidden')) {
          $labels.hide();
          $cardDetails.css("border-left-style", "outset");
          
          $labels.data('trelloUXUpdate.hidden', true);
        }
      } else {
        if ($labels.data('trelloUXUpdate.hidden')) {
          $labels.show();
          $cardDetails.css("border-left-style", "none");
          
          $labels.data('trelloUXUpdate.hidden', false);
        }
      }
    } else {
      if ($card.data('trelloUXUpdate.bgColor')) {
        $card.css("background-color", "");
        
        $card.data('trelloUXUpdate.bgColor', null);
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

function shouldMerge() {
    return (localStorage.getItem('cardColorsMerge') || 'true') === 'true';
}

function setMergeStatus(state) {
  var $button = $('.card-colors-merge-toggle-btn > .board-header-btn-text');

  if (state) {
    localStorage.setItem('cardColorsMerge', "true");
    $button.text('Labels: Hide');
  } else {
    localStorage.setItem('cardColorsMerge', "false");
    $button.text('Labels: Show');
  }
}

function createMergeToggleButton() {
  // Wait until at least one list card has been rendered
  if (!$('.list-card').length) {
    setTimeout(createMergeToggleButton, 1000);
    return;
  }
  var $toggleButton = $('<a class="board-header-btn card-colors-merge-toggle-btn" href="#">' +
    '<span class="board-header-btn-icon icon-sm icon-card-cover"></span>' +
    '<span class="board-header-btn-text" title="Show all labels, or use the first label as card color">Card Colors: Merge</span>' +
    '</a>');

  $toggleButton.on('click', function() {
    setMergeStatus(!shouldMerge());
  });

  $('.board-header-btns.mod-left').append($toggleButton);

  setMergeStatus(shouldMerge());
};

$(document).ready(function() {
  createMergeToggleButton();
  colorize();
});
