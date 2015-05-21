ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
LETTER_UPDATE_FREQUENCY = 50; //in miliseconds
INIT_LETTER_PRICE_VOLATILITY = .0006;
LETTER_PRICE_VOLATILITY = .0006;
LETTER_PRICE_MIN = 0.00;
MONEY_UPDATE_FREQUENCY = 15;
INIT_PRICE = .01;
INIT_PARTICLE_TOP_OFFSET = 0;
INIT_PARTICLE_LEFT_OFFSET = -15;
PARTICLE_UPDATE_FREQUENCY = 15;
PARTICLE_UPDATE_LEFT_OFFSET = -3;
PARTICLE_DISAPPEAR_CHANCE = 0.025;
UPGRADE_TAB_UPDATE_FREQUENCY = 500;
UPGRADE_PROC_FREQUENCY = 15;
PLAYER_VOLATILITY_MULTIPLIER = 0.7;

var abbreviate = function(number, maxPlaces, forcePlaces, forceLetter) {
  number = Number(number);
  forceLetter = forceLetter || false;
  if(forceLetter !== false) {
    return annotate(number, maxPlaces, forcePlaces, forceLetter);
  }
  if(number >= 1e12) {
    abbr = 'T';
  }
  else if(number >= 1e9) {
    abbr = 'B';
  }
  else if(number >= 1e6) {
    abbr = 'M';
  }
  else if(number >= 1e3) {
    abbr = 'K';
  }
  else {
    abbr = '';
  }
  return annotate(number, maxPlaces, forcePlaces, abbr);
}

function annotate(number, maxPlaces, forcePlaces, abbr) {
  // set places to false to not round
  var rounded = 0;
  switch(abbr) {
    case 'T':
      rounded = number / 1e12;
      break;
    case 'B':
      rounded = number / 1e9;
      break;
    case 'M':
      rounded = number / 1e6;
      break;
    case 'K':
      rounded = number / 1e3;
      break;
    case '':
      rounded = number;
      break;
  }
  if(maxPlaces !== false) {
    var test = new RegExp('\\.\\d{' + (maxPlaces + 1) + ',}$');
    if(test.test(('' + rounded))) {
      rounded = rounded.toFixed(maxPlaces);
    }
  }
  if(forcePlaces !== false) {
    rounded = Number(rounded).toFixed(forcePlaces);
  }
  return rounded + abbr;
}

var moveParticles = function(){
    var particles = document.getElementsByClassName('particle');
    for(var i=0; i<particles.length; i++){
        currParticle = particles[i];
        if(Math.random() < PARTICLE_DISAPPEAR_CHANCE || particles.length > 50){
            document.getElementsByTagName('body')[0].removeChild(currParticle);
            continue;
        }
        //console.log(currParticle);
        var currRect = currParticle.getBoundingClientRect();
        currParticle.style.left = currRect.left+PARTICLE_UPDATE_LEFT_OFFSET+'px';
    }
}
var updateMoney = function(){
    $('#money #cash').remove();
    $('#money').append('<div id=\'cash\'>$'+(abbreviate(_money,2,2,false))+'</div>');
    $('#money #lps').remove();
    $('#money').append('<div id=\'lps\'>+'+(abbreviate((_lps*_cores),2,2,false))+' lps</h4>');
}
var showLetters = function(){
    maxPrice = -1;
    highestPricedLetter = '#';
    for(letter in letters){
        newMaxPrice = Math.max(maxPrice, letters[letter].price);
        if(newMaxPrice > maxPrice){
            maxPrice = newMaxPrice;
            highestPricedLetter = letter;
        }
        bankContent = '<td id=\'banked'+letter+'\'>'+abbreviate(letters[letter].banked,0,false,false)+'</td>'; 
        priceContent = '<td id=\'price'+letter+'\'>'+letters[letter].price.toFixed(2)+'</td>'; 
        if(letters[letter].state.curr == 'increment'){
            //priceContent += '<td class=\'increment indicator\'>&utrif;&utrif;</td>';
            priceContent += '<td class=\'increment indicator\'><img src=\'upArrow.png\'></td>';
        }else if(letters[letter].state.curr == 'decrement'){
            //priceContent += '<td class=\'increment indicator\'>&dtrif;&dtrif;</td>';
            priceContent += '<td class=\'decrement indicator\'><img src=\'downArrow.png\'></td>';
        }
        $('#banked'+letter).remove();
        $('#bankedRow'+letter).append(bankContent);
        $('#priceRow'+letter+' td.indicator').remove();
        $('#price'+letter).remove()
        $('#priceRow'+letter).append(priceContent);
    }
    $('.maxPrice').removeClass('maxPrice');
    $('#priceRow'+highestPricedLetter).addClass('maxPrice');
}
var incrementPrice = function(letter){
    try{
        letters[letter].price += LETTER_PRICE_VOLATILITY;
    }catch(TypeError){}
}
var decrementPrice = function(letter, isPlayer){
    try{
        if(letters[letter].price > LETTER_PRICE_MIN){
            letters[letter].price = Math.max(letters[letter].price - (LETTER_PRICE_VOLATILITY*(isPlayer?PLAYER_VOLATILITY_MULTIPLIER:1.0)), LETTER_PRICE_MIN);
        }
    }catch(TypeError){}
}

var updateLetters = function(){
    for(letter in letters){
        letters[letter].state.next();
        if(letters[letter].state.curr == 'increment'){
            incrementPrice(letter);
        }else if(letters[letter].state.curr == 'decrement'){
            decrementPrice(letter, false);
        }
    }
    showLetters();
}
var canAffordPrice = function(p){
    if(_money >= p){
        return true;
    }
    return false;
}
var canAffordUpgrade = function(upgrade){
    if(_money >= upgrades[upgrade].cost){
        return true;
    }
    return false;
}
var addSellButtonsToDOM = function(){
    for(letter in letters){
        buttonContent = '<div class=\'ui-button sellButton insert\' id=\'sellButton'+letter+'\'>Sell</div>';
        $('#sellButtonTray').append(buttonContent);
        $('#sellButton'+letter).click( {'letter':letter}, clickTryToSell);
    }
}
var addUpgradeRowsToDOM = function(){
    for(upgrade in upgrades){
        upgradeContent = '<div class=\'upgrade ui-button\' id=\'upgrade'+upgrade+'\'>';
        $('#upgradeTab').append(upgradeContent);
    }
}
var updateUpgradeTab = function(){
    for(upgrade in upgrades){
        if(canAffordUpgrade(upgrade)){
            $('#upgrade'+upgrade).removeClass('unaffordable');
            $('#upgrade'+upgrade).addClass('affordable');
        }else{
            $('#upgrade'+upgrade).removeClass('affordable');
            $('#upgrade'+upgrade).addClass('unaffordable');
        }
        if(upgrades[upgrade].visible == 'no' && totalMoneyEarned > upgrades[upgrade].cost/10){
            upgrades[upgrade].visible = 'yes';
        }
        if(upgrades[upgrade].visible == 'yes'){
            upgradeContent = '<div class=\'upgradeName\'>'+upgrade+'</div>';
            upgradeContent += '<div class=\'upgradeCost\'>Cost: $'+abbreviate(upgrades[upgrade].cost,2,2,false)+'</div>';
            upgradeContent += '<div class=\'upgradeBenefit\'>'+upgrades[upgrade].benefit+'</div>';
            upgradeContent += '<div class=\'upgradeDescription\'>'+upgrades[upgrade].description+'</div>';
            upgradeContent += '</div>';
            $('#upgrade'+upgrade).empty();
            $('#upgrade'+upgrade).append(upgradeContent);
        }
    }
}
var autoType = function(){
    typeLetter(lastPress);
}
var setCores= function(n){
    _cores = n;
    updateAutoTypeInterval();
}
var setLps= function(n){
    _lps = n;
    updateAutoTypeInterval();
}
var increaseMoney = function(n){
    totalMoneyEarned += n;
    _money += n;
}
var decreaseMoney = function(n){
    _money -= n;
}
var updateAutoTypeInterval = function(){
    if(typeof autoTypeIntervalID != 'undefined'){
        clearInterval(autoTypeIntervalID);
    }
    if(_lps > 0){
        autoTypeIntervalID = setInterval(autoType, 1000.0/(_lps*_cores));
    }
}
var handleKeyUp = function(keyboardEvent){
    lastPress = String.fromCharCode(keyboardEvent.which);
    var ch = String.fromCharCode(keyboardEvent.which);
    typeLetter(ch);
}
var typeLetter = function(ch){
    try{
        var currPrice = letters[ch].price;
        if(isBanking){
            if(!canAffordPrice(currPrice)){
                return;
            }
            decreaseMoney((currPrice));
            letters[ch].banked++;
            incrementPrice(ch);
        }else{
            increaseMoney((currPrice));
            decrementPrice(ch, true);
        }
        if(currPrice > 0 || isBanking){
            var rect = document.getElementById('priceRow'+ch).getBoundingClientRect();
            particleDiv = '<div class=\'particle\' style=\'position: absolute; top:'+(rect.top+INIT_PARTICLE_TOP_OFFSET+window.scrollY)+'px; left:'+(rect.left+INIT_PARTICLE_LEFT_OFFSET+window.scrollX)+'px;\'>+'+(isBanking?ch:'$')+'</div>';
            $('body').append(particleDiv);
        }
    }catch(TypeError){
    }
}
var clickTryToSell = function(event){
   var currPrice = letters[event.data.letter].price;
   numBanked = letters[event.data.letter].banked;
   numLettersToSell = numBanked;
   finalPrice = (currPrice-(numLettersToSell*LETTER_PRICE_VOLATILITY))*PLAYER_VOLATILITY_MULTIPLIER;
   console.log('final price before: '+finalPrice);
   if(finalPrice < 0){
       numLessLettersToSell = ((-1.0)*finalPrice/(LETTER_PRICE_VOLATILITY*PLAYER_VOLATILITY_MULTIPLIER));
       numLettersToSell -= Math.ceil(numLessLettersToSell);
       if(numLettersToSell < 1){
           return;
       }
       finalPrice = (currPrice-(numLettersToSell*LETTER_PRICE_VOLATILITY))*PLAYER_VOLATILITY_MULTIPLIER;
       console.log('final price after: '+finalPrice);
   }
   profit = (currPrice + (currPrice-(numLettersToSell*LETTER_PRICE_VOLATILITY)) + LETTER_PRICE_VOLATILITY)*(numLettersToSell/2.0);
   letters[event.data.letter].banked -= numLettersToSell;
   increaseMoney(profit);
   letters[event.data.letter].price = finalPrice; 
   console.log('currPrice: '+currPrice);
   console.log('finalPrice: '+finalPrice);
   console.log('numBanked: '+numBanked);
   console.log('numLettersToSell: '+numLettersToSell);
   console.log('profit: '+profit);
}
var clickTryToBuy = function(event){
    tryToBuy(event.data.upgrade);
}
var tryToBuy = function(upgrade){
   if(canAffordUpgrade(upgrade)){
        decreaseMoney(upgrades[upgrade].cost);
        upgrades[upgrade].levelUp();
   } 
}
var toggleBanking = function(){
    isBanking = !isBanking;
}
var registerMouseListeners = function(){
    //Register Upgrade Buttons
    for(up in upgrades){
        $('#upgrade'+up).click( {'upgrade':up}, clickTryToBuy);
    }
    $('#bankToggle').click(toggleBanking);
}
var hideUnlockables = function(){
    $('#volatilitySlideTray .insert').hide();
    $('#bankToggle').hide();
    $('#letterBank').hide();
}
var init = function(){
    _money = 0;
    totalMoneyEarned = 0;
    _lps = 0;
    _cores = 1;
    isBanking = false;
    a_state_data = {
                        'stay':[ ['increment',0.001] , ['decrement',0.001] ],
                        'increment':[['stay',0.01]],
                        'decrement':[['stay',0.01]]
                   }
    letters = {};
    for(var i in ALPHABET){
        letters[ALPHABET[i]] = {
            state: new markovChain(a_state_data, 'stay'),
            price:INIT_PRICE,
            banked:0
        }
    }
    upgrades = {
        'AutoType': {
            'visible':'yes',
            'cost':9.99,
            'levelUp': function(){
                this.owned++;
                this.cost = (1.05*(this.cost)).toFixed(2);
                setLps((_lps+1));
            },
            'owned':0,
            'requires':[],
            'description':'Software that re-types the last letter you typed on your keyboard. Each purchase is for the latest version of AutoType.',
            'benefit':'+1 lps'
        },
        'Volatility': {
          'visible':'yes',
          'cost':30,
          'levelUp': function(){
                this.owned++;
                this.cost =(10*(this.cost)).toFixed(2);
                $('#volatilitySlide').slider({
                    value:(this.owned+1)*INIT_LETTER_PRICE_VOLATILITY,
                    min:INIT_LETTER_PRICE_VOLATILITY,
                    max:(this.owned+1)*INIT_LETTER_PRICE_VOLATILITY,
                    step:0.0001,
                    slide: function(event,ui){
                        LETTER_PRICE_VOLATILITY = ui.value;
                        console.log(ui.value);
                    }
                });
                $('#volatilitySlideTray .insert').show();
          }, 
          'owned':0,
          'requires':[],
          'description':'By spreading false information about the current supply and demand for letters, you are able to increase the volatility of the letter market. Letter prices will rise and fall at a faster rate, your sale of letters will lower the price faster, and your purchasing of letters will raise the price faster.',
          'benefit':'x2 price change per tick'
        },
        'Banking': {
          'visible':'yes',
          'cost':60,
          'levelUp': function(){
                this.owned++;
                $('#bankToggle').show();
                $('#letterBank').show();
                this.visible = 'never';
                $('#upgradeBanking').hide();
          }, 
          'owned':1,
          'requires':[],
          'description':'Allows you to start buying letters at market price and store them in a bank account.  This raises the price as much as selling letters lowers the price',
          'benefit':'+1 Bank Account'
        },
        'Core': {
          'visible':'no',
          'cost':2000,
          'levelUp': function(){
                this.owned++;
                this.cost =(10*(this.cost)).toFixed(2);
                setCores((_cores+1));
          }, 
          'owned':1,
          'requires':[],
          'description':'Another core for your computer.  Allows you to run another AutoType program in parallel.',
          'benefit':'+1 lps multiplier'
        }
    }
    hideUnlockables();
    addUpgradeRowsToDOM();
    addSellButtonsToDOM();
    updateLetters();
    setInterval(updateLetters, LETTER_UPDATE_FREQUENCY);
    updateMoney();
    setInterval(updateMoney, MONEY_UPDATE_FREQUENCY);
    moveParticles();
    setInterval(moveParticles,PARTICLE_UPDATE_FREQUENCY);
    updateUpgradeTab();
    setInterval(updateUpgradeTab, UPGRADE_TAB_UPDATE_FREQUENCY);
    //setInterval(updateAutoTypeInterval, AUTO_TYPE_INTERVAL_UPDATE_FREQUENCY);
    registerMouseListeners();
    $(window).keyup(handleKeyUp);
}

$(document).ready(function(){
    init();
});

