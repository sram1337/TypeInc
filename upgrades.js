initUpgrades = function(){
    upgrades = {
        'AutoType-Professional': {
                        'cost':1,
                        'levelUp': function(){
                            this.owned++;
                            this.cost = (1.5*(this.cost)).toFixed(2);
                        },
                        'cooldown':1000,
                        'owned':0,
                        'requires':[],
                        'description':'Software that re-types the last letter you typed on your keyboard. Subsequent versions offer an eerily consistent, linear speed increase. Coded by your good friends over at Microscale-Software(tm).',
                        'benefit':'+1 lps'
        }
    }
    return upgrades;
}
