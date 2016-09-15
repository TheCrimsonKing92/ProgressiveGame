(function () {
    angular.module("app")
    .factory("storeService", storeService);

    

    function storeService() {
        var Constants =
        {
            PriceIncrement: 1.15
        };
        
        var self = this;

        self.range = new Array(5000);        

        self.storage =
        {
            Class: '',
            Classes: [
                {
                    name: 'Builder',
                    description: 'Increases the rate at which Consumers produce blocks.'
                },
                {
                    name: 'Master',
                    description: 'Increases score gain from the button and AutoClickers.'
                },
                {
                    name: 'Mechanic',
                    description: 'Enhances the Cybernetic Synergy and Efficient Operations upgrades.'
                },
                {
                    name: 'Thief',
                    description: 'Reduces the price of all items in the store.'
                }
                ],
            clicks: 0,
            score: 0,
            toxicity: 0,
            greenBlocks: 0,
            greenBlocksBuild: 0,
            blueBlocks: 0,
            blueBlocksBuild: 0,
            operationsBonus: 0,
            Helpers: {},
            Towers: {},
            Specials: {},
            Upgrades: {}
        };

        self.ButtonClick = function () {
            if (self.storage.toxicity > 0) self.storage.toxicity--;
            self.storage.clicks++;
            var buttonScore = Math.floor(self.clickOutput());
            self.storage.score += buttonScore;
            self.clickDiff = 1;
        };

        self.buy = function (purchaseable) {
            if (!self.deduct(purchaseable.price())) return 'Could not afford to buy ' + purchaseable.name;

            if (purchaseable.type === 'Special') purchaseable.buyFunc();

            purchaseable.purchased++;

            self.evalUnlocksAll(purchaseable.name);
        };

        self.clickDiff = 0;

        self.clickModifier = function () {
            var total = 1;
            return total;
        };

        self.clickOutput = function () {
            return self.clickModifier() * self.clickValue();
        };

        self.clickValue = function () {
            var total = 1;
            if (self.storage.Class === 'Master') total++;
            if (self.storage.Upgrades['Helping Hand'].purchased) total++;
            if (self.storage.Upgrades['Helping Handsier'].purchased) total += 4;
            if (self.storage.Upgrades['Helping Handsiest'].purchased) total += 15;
            if (self.storage.Towers['Mouse'].purchased) total += (Math.floor(self.getScore()/100)) + (Math.floor(self.storage.clicks / 200));
            return total;
        }

        self.deduct = function (priceObject) {
            var amount = priceObject.price;
            if (self.storage[priceObject.currency] - amount >= 0) {
                self.storage[priceObject.currency] -= amount;
                return true;
            }

            return false;
        };

        self.evalClickReq = function (purchaseable) {
            var checks = purchaseable.reqKeys;
            var index = checks.indexOf('clicks');
            if (index > -1) {
                var vals = purchaseable.reqVals;
                if (self.storage.clicks >= vals[index]) self.unlock(purchaseable);
            }
        }

        self.evalClickUps = function () {
            if (self.clickDiff === 1) {
                for (var i in self.storage.Helpers) {
                    var current = self.storage.Helpers[i];
                    if (!current.unlocked) {
                        self.evalClickReq(current);
                    }
                }

                for (var i in self.storage.Upgrades) {
                    var current = self.storage.Upgrades[i];
                    if (!current.unlocked) {
                        self.evalUnlock(current);
                    }
                }

                self.clickDiff = 0;
            }
        };

        self.evalUnlock = function(purchaseable){
            var checks = purchaseable.reqKeys;
            var len = checks.length;

            for (var i = 0; i < len; i++) {
                var current = checks[i];

                var checkVal;
                switch (current) {
                    case 'clicks':
                        checkVal = self.storage.clicks;
                        break;

                    case 'score':
                        checkVal = self.storage.score;
                        break;

                    case 'AutoClicker':
                    case 'Hammer':
                    case 'Robot':
                    case 'Airplane':
                    case 'Cloner':
                    case 'Djinn':
                    case 'Consumer':
                        checkVal = self.storage.Helpers[current].purchased;
                        break;
                }

                var reqVal = purchaseable.reqVals[i];

                if (checkVal < reqVal) return false;
            }

            self.unlock(purchaseable);
            
        };

        self.evalUnlocks = function (type, purchasedName) {
            var target;
            if (type === 'Helper') target = self.storage.Helpers;
            else if (type === 'Upgrade') target = self.storage.Upgrades;
            else if (type === 'Tower') target = self.storage.Towers;
            else if (type === 'Special') target = self.storage.Specials;

            for (var i in target) {
                var purchaseable = target[i];
                if (!purchaseable.unlocked) {
                    var reqIndex = purchaseable.reqKeys.indexOf(purchasedName);
                    if (reqIndex > -1) self.evalUnlock(purchaseable);
                }
            }
        };

        self.evalUnlocksAll = function (purchasedName) {
            var targets = ['Helper', 'Special', 'Tower', 'Upgrade'];
            for (var i in targets) self.evalUnlocks(targets[i], purchasedName);
        };
        
        self.gainCurrency = function (ob) {
            var amount = ob.price;
            self.storage[ob.currency] += amount;
        };

        self.getCyberneticBonus = function () {
            return self.getCyberneticCount() * (self.storage.Helpers['Hammer'].basePower + self.storage.Helpers['Robot'].basePower);
        };

        self.getCyberneticCount = function () {
            return Math.min(self.storage.Helpers['Hammer'].purchased, self.storage.Helpers['Robot'].purchased);
        };

        self.getScore = function () {
            var local = self.storage.Helpers;

            var total = 0;
            for (var i in local) {
                var current = local[i];
                total += current.output();
            }

            return total;
        };

        self.getToxicity = function () {
            var local = self.storage.Helpers;

            var total = 0;
            for (var i in local) {
                var current = local[i];
                total += current.toxicity;
            }

            return total;
        };

        self.hasMessage = 0;

        self.load = function (storage) {
            self.storage = storage;
            /*
            var classes = ['Master', 'Thief', 'Builder', 'Mechanic'];

            var toCapitalized = function (string) {
                string = string.toLowerCase();
                return string.charAt(0).toUpperCase() + string.slice(1);
            };

            while (self.storage.Class === '') {
                
                var answer = prompt('Choose your class: Master, Thief, Builder, or Mechanic');
                var capitalized = toCapitalized(answer);
                if (classes.indexOf(capitalized) > -1) self.storage.Class = capitalized;                
            }
            if (self.storage.Class === '') self.storage.Class = prompt('What class would you like to play?');
            */

            self.repairAll();
        };

        self.Message = '';

        self.namePush = function (array) {
            var items = Array.prototype.slice.call(arguments, 1);
            for (var item in items) {
                var store = self.storage[array];
                var current = items[item];
                store[current.name] = current;
            }
        };

        self.repair = function (item, type) {
            console.log('Received: ' + item.name);
            if (type === 'Helper') {
                var replace = self[item.name];
                replace.unlocked = item.unlocked;
                replace.purchased = item.purchased;

                switch (item.name) {
                    case 'Djinn':
                        replace.gatheringPower = item.gatheringPower;
                };

                self.namePush('Helpers', replace);
            }

            else if (type === 'Upgrade') {
                var up = new self.Upgrade(item.name, item.description, item.basePrice, item.reqKeys, item.reqVals);
                up.unlocked = item.unlocked;
                up.purchased = item.purchased;
                self.namePush('Upgrades', up);
            }

            else if (type === 'Tower') {
                var name = item.name + 'Tower';
                var replace = self[name];
                replace.unlocked = item.unlocked;
                replace.purchased = item.purchased;
                self.namePush('Towers', replace);
            }
            else if (type === 'Special') {
                var name = item.name.replace(' ', '') + 'Special';
                var replace = self[name];
                replace.unlocked = item.unlocked;
                replace.purchased = item.purchased;
                self.namePush('Specials', replace);
            }
        };

        self.repairAll = function () {
            for (var i in self.storage.Helpers) {
                var current = self.storage.Helpers[i];
                self.repair(current, 'Helper');
            }

            for (var i in self.storage.Upgrades) {
                var current = self.storage.Upgrades[i];
                self.repair(current, 'Upgrade');
            }

            for (var i in self.storage.Towers) {
                var current = self.storage.Towers[i];
                self.repair(current, 'Tower');
            }

            for (var i in self.storage.Specials) {
                var current = self.storage.Specials[i];
                self.repair(current, 'Special');
            }
        };

        self.SetMessage = function (string) {
            self.hasMessage = 1;
            self.Message = string;
        };

        self.sell = function (name) {
            var purchaseable = self.storage.Helpers[name];
            console.log('Sell price: ' + JSON.stringify(purchaseable.sellPrice()));
            self.gainCurrency(purchaseable.sellPrice());

            //Re-evaluate unlocks? Re-lock upgrades?
            purchaseable.purchased--;
        };

        self.unlock = function (purchaseable) {
            purchaseable.unlocked = true;
        };

        self.Purchaseable = function (name, description, basePrice, priceIncrement, reqKeys, reqVals) {
            var func = this;

            func.name = name;
            func.description = description;
            func.basePrice = basePrice;
            func.priceIncrement = priceIncrement;
            func.purchased = 0;
            func.unlocked = 0;

            func.reqKeys = new Array();
            loadReq(func.reqKeys, reqKeys);
            func.reqVals = new Array();
            loadReq(func.reqVals, reqVals);

            function loadReq(array, input) {
                if (array === false && input === false) {
                    func.unlocked = 1;
                }

                else {
                    if (typeof input === 'string' || typeof input === 'number') {
                        array.push(input);
                    }

                    else {
                        var len = input.length;
                        for (var i = 0; i < len; i++) array.push(input[i]);
                    }
                }                
            }
        };

        self.Purchaseable.prototype.logMe = function () {
            console.log('My name is ' + this.name);
        }

        self.Purchaseable.prototype.costModifier = function () {
            return 1;
        };

        self.Purchaseable.prototype.isPurchased = function () {
            var func = this;
            return func.purchased > 0;
        };

        self.Purchaseable.prototype.price = function () {
            var func = this;
            var calcPrice = parseInt(func.basePrice * Math.pow(func.priceIncrement, (func.purchased)) * func.costModifier());
            if (self.storage.Class === 'Thief') calcPrice = Math.floor(calcPrice *= .9);
            if (self.storage.Towers['Cost'].purchased > 0) calcPrice = Math.floor(calcPrice *= .9);
            return {
                currency: 'score',
                price: calcPrice
            };
        };

        self.Purchaseable.prototype.sellPrice = function () {
            var func = this;
            var calcPrice = parseInt(func.basePrice * Math.pow(func.priceIncrement, (func.purchased - 1)) * func.costModifier());
            if (self.storage.Class === 'Thief') calcPrice = Math.floor(calcPrice *= .9);
            if (self.storage.Towers['Cost'].purchased > 0) calcPrice = Math.floor(calcPrice *= .9);
            calcPrice = Math.floor(calcPrice / 2);

            return {
                currency: 'score',
                price: calcPrice
            };
        };

        self.Purchaseable.prototype.type = 'Purchaseable';

        self.Upgrade = function (name, description, price, reqKeys, reqVals) {
            var func = this;
            self.Purchaseable.call(func, name, description, price, 1, reqKeys, reqVals);
        }

        self.Upgrade.prototype = Object.create(self.Purchaseable.prototype);
        self.Upgrade.prototype.constructor = self.Upgrade;

        self.Upgrade.prototype.costModifier = function () {
            var func = this;
            var original = self.Purchaseable.prototype.costModifier.call(func);
            // intervening code for upgrades modifying original function call
            return original;
        };

        self.Upgrade.prototype.type = 'Upgrade';

        self.HelpingHand = new self.Upgrade('Helping Hand', 'Increases score production from clicks by 1.', 200, 'clicks', '150');
        self.ClickEfficiency = new self.Upgrade('Click Efficiency', 'Doubles the efficiency of the mouse and AutoClickers.', 1000, ['clicks', 'AutoClicker'], [250, 10]);
        self.HeavierHammers = new self.Upgrade('Heavier Hammers', 'Doubles the weight and base production of Hammers.', 1500, 'Hammer', 10); // 10 hammers
        self.HelpingHandsier = new self.Upgrade('Helping Handsier', 'Further increases score production from clicks by 4.', 2500, 'clicks', 550);
        self.GreenMan = new self.Upgrade('Green Man', 'Robots go green, becoming toxicity-neutral.', 500, 'Robot', 5);
        self.GreenMan.price = function () {
            var func = this;
            var original = self.Upgrade.prototype.price.call(func);
            original.currency = 'greenBlocks';
        };
        self.CyberneticSynergy = new self.Upgrade('Cybernetic Synergy', 'Each robot which can pick up a hammer gains additional score per second.', 9500, ['Hammer', 'Robot'], [1, 1]); // 1 robot and 1 hammer
        self.HelpingHandsiest = new self.Upgrade('Helping Handsiest', 'Increases score production from clicks by an additional 15.', 11000, 'clicks', 700);
        self.ExtendedCargo = new self.Upgrade('Extended Cargo', 'Airplane cargo storage is increased by 25%, dropping more score each airlift.', 22000, 'Airplane', 5); // 5 airplanes
        self.BuddySystem = new self.Upgrade('Buddy System', 'Each airplane has a partner join to drop another supply crate.', 110000, 'Airplane', 15); // 15 airplanes
        self.ReducedEmissions = new self.Upgrade('Reduced Emissions', 'The airplane fleet uses a bio-diesel fuel, cutting toxicity in half.', 1500, 'Airplane', 20);
        self.ReducedEmissions.price = function () {
            var func = this;
            var original = self.Upgrade.prototype.price.call(func);
            original.currency = 'greenBlocks';
        };
        self.ClonerOverdrive = new self.Upgrade('Cloner Overdrive', 'Cloners produce 40% greater output.', 300000, 'Cloner', 5);  // 5 cloners
        self.EfficientOperations = new self.Upgrade('Efficient Operations', 'A robot will continually upgrade the Cloner, improving its output.', 900000, ['Robot', 'Cloner'], [1, 10]); // 10 cloners, 1 robot
        self.GatheringPower = new self.Upgrade('Gathering Power', 'The Djinn sacrifice part of their current power to begin reaching their full potential.', 2500000, 'Djinn', 1); // 1 djinn
        self.AudibleMotivation = new self.Upgrade('Audible Motivation', 'Each AutoClicker annoys the Djinn into outputting more score, consequently growing stronger.', 5000000, ['AutoClicker', 'Djinn'], [15, 1]); // 15 clickers and 1 or more djinn

        self.namePush('Upgrades', self.HelpingHand, self.ClickEfficiency, self.HeavierHammers, self.HelpingHandsier, self.GreenMan,
                                  self.CyberneticSynergy, self.HelpingHandsiest, self.ExtendedCargo, self.BuddySystem, self.ReducedEmissions,
                                  self.ClonerOverdrive, self.EfficientOperations, self.GatheringPower, self.AudibleMotivation);

        self.Helper = function (name, description, basePrice, priceIncrement, basePower, toxicity, reqKeys, reqVals) {
            var func = this;
            self.Purchaseable.call(func, name, description, basePrice, priceIncrement, reqKeys, reqVals);
            func.unlocked = 1;
            func.basePower = basePower;
            func.toxicity = toxicity;
        };

        self.Helper.prototype = Object.create(self.Purchaseable.prototype);
        self.Helper.prototype.constructor = self.Helper;

        self.Helper.prototype.costModifier = function () {
            var func = this;
            var original = self.Purchaseable.prototype.costModifier.call(func);
            // intervening code for helpers modifying original function call
            return original;
        };

        self.Helper.prototype.type = 'Helper';

        self.Helper.prototype.output = function () {
            var func = this;
            return Math.floor(func.basePower * func.purchased * func.outputModifier());
        };

        self.Helper.prototype.outputModifier = function () {
            return 1;
        };

        self.AutoClicker = new self.Helper('AutoClicker', 'A bit of code to click the button for score.', 50, Constants.PriceIncrement, 1, 2, false, false);
        self.AutoClicker.output = function () {
            var func = this;

            var total = 0;

            var base = func.basePower;
            if (self.storage.Class === 'Master') base++;
            if (self.storage.Towers['Power'].isPurchased()) base++;
            total += base;
            if (self.storage.Upgrades['Audible Motivation'].isPurchased()) total++;
            if (self.storage.Upgrades['Click Efficiency'].isPurchased()) total *= 2;

            total *= func.purchased;
            return total;
        };


        self.Hammer = new self.Helper('Hammer', 'A hammer to smash the button for score.', 500, Constants.PriceIncrement, 4, 4, 'clicks', 100);
        self.Hammer.output = function () {
            var func = this;

            var total = 0;

            var base = func.basePower;
            if (self.storage.Towers['Power'].isPurchased()) base += func.basePower;
            if (self.storage.Upgrades['Heavier Hammers'].isPurchased()) base += func.basePower;
            if (self.storage.Upgrades['Cybernetic Synergy'].isPurchased()) {
                var count = self.getCyberneticCount();
                var val = count * func.basePower;
                if (self.storage.Class === 'Mechanic') val = Math.floor(val * 1.5);
                total += val;
            }

            total += (base * func.purchased);

            return total;
        };

        self.Robot = new self.Helper('Robot', 'An efficient robot worker to produce clicks.', 1000, Constants.PriceIncrement, 16, 6, 'clicks', 300);
        self.Robot.output = function () {
            var func = this;

            var total = 0;

            var base = func.basePower;
            if (self.storage.Towers['Power'].isPurchased()) base += Math.floor(func.basePower/2);
            if (self.storage.Upgrades['Cybernetic Synergy'].isPurchased()) {
                var count = self.getCyberneticCount();
                var val = count * func.basePower;
                if (self.storage.Class === 'Mechanic') val = Math.floor(val * 1.5);
                total += val;
            }

            total += (base * func.purchased);

            return total;
        };

        self.Airplane = new self.Helper('Airplane', 'A plane to airdrop score.', 17000, Constants.PriceIncrement, 48, 10, 'clicks', 500);
        self.Airplane.output = function () {
            var func = this;

            var total = 0;

            var base = func.basePower;
            if (self.storage.Towers['Power'].isPurchased()) base += Math.floor(func.basePower/4);
            if (self.storage.Upgrades['Extended Cargo'].isPurchased()) base *= 1.25;
            total += base;
            if (self.storage.Upgrades['Buddy System'].isPurchased()) total *= 2;
            total *= func.purchased;

            return total;
        };

        self.Cloner = new self.Helper('Cloner', 'A machine to clone more clicks.', 80000, Constants.PriceIncrement, 70, 15, 'clicks', 1000);
        self.Cloner.output = function () {
            var func = this;

            var total = 0;

            var base = func.basePower;
            if (self.storage.Upgrades['Efficient Operations'].isPurchased()) {
                if (self.storage.Class === 'Mechanic') {
                    if ((Math.random() * 100) < 2) self.storage.operationsBonus++;
                }

                else {
                    if ((Math.random() * 100) < 1) self.storage.operationsBonus++;
                }
                
                base += self.storage.operationsBonus;
            }
            
            if (self.storage.Towers['Power'].isPurchased()) base += Math.floor(func.basePower / 4);
            if (self.storage.Upgrades['Cloner Overdrive'].isPurchased()) base += (base / 2.5);

            total += func.purchased * base;
            total = Math.floor(total);
            return total;
        };

        self.Djinn = new self.Helper('Djinn', 'A fire spirit to magically create score.', 275000, Constants.PriceIncrement, 700, 50, 'clicks', 1500);
        self.Djinn.evalPower = function () {
            var func = this;

            var total = func.basePower;

            if (self.storage.Upgrades['Gathering Power'].isPurchased()) {
                
                total -= 200;
                total += Math.floor(func.gatheringPower / 16);
            }
            
            return total;
        };

        self.Djinn.gatheringPower = 0;
        self.Djinn.output = function () {
            var func = this;

            var total = 0;

            if (self.storage.Upgrades['Gathering Power'].isPurchased() && func.gatheringPower < 9600) func.gatheringPower++;

            var base = func.evalPower();
            if (self.storage.Towers['Power'].isPurchased()) base += Math.floor(func.basePower / 4);
            total += base * func.purchased;
            if (self.storage.Upgrades['Audible Motivation'].isPurchased()) total = Math.floor(total *= 1 + (self.storage.Helpers['AutoClicker'].purchased / 150));
            return total;
        };

        self.Consumer = new self.Helper('Consumer', 'An anti-helper to consumer score and create tower blocks. Warning! Consumers can lead to negative score gain.', 100, Constants.PriceIncrement, 50, 'clicks', 2000);
        self.Consumer.buildBlocks = function () {
            var func = this;
            var addition = func.purchased;
            if (self.storage.Class === 'Builder') addition *= 1.5;

            var rand = Math.random() * 100;
            if (rand < 50) {
                self.storage.blueBlocksBuild += addition;

                while (self.storage.blueBlocksBuild >= 200) {
                    self.storage.blueBlocksBuild -= 200;
                    self.storage.blueBlocks++;
                }
            }

            else {
                self.storage.greenBlocksBuild += addition;

                while (self.storage.greenBlocksBuild >= 200) {
                    self.storage.greenBlocksBuild -= 200;
                    self.storage.greenBlocks++;
                }
            }
        };

        self.Consumer.output = function () {
            var func = this;

            func.buildBlocks();

            var total = 0;

            var base = func.basePower;
            var current = Math.floor(base * Math.pow(1.1, func.purchased));
            total -= current * func.purchased;
            // if tamers exist, reduce by 8% per, floor it again
            if (self.storage.Specials['Tamer'].isPurchased()) {
                var len = self.storage.Specials['Tamer'].purchased;

                for (var i = 0; i < len; i++) {
                    total *= .92;
                }

                total = Math.ceil(total);
            }

            return total;
        };

        self.namePush('Helpers', self.AutoClicker, self.Hammer, self.Robot, self.Airplane, self.Cloner, self.Djinn, self.Consumer);

        self.Tower = function (name, description, price, reqKeys, reqVals) {
            var func = this;
            self.Upgrade.call(func, name, description, price, reqKeys, reqVals);
            console.log(func.name);
            console.log(func.basePrice);
        }

        self.Tower.prototype = Object.create(self.Upgrade.prototype);
        self.Tower.prototype.constructor = self.Tower;

        self.Tower.prototype.price = function () {
            var func = this;
            return {
                currency: 'blueBlocks',
                price: func.basePrice
            };
        };

        self.Tower.prototype.type = 'Tower';

        self.PowerTower = new self.Tower('Power', 'Increases score gained from helpers.', 800, 'Consumer', 1);
        self.CostTower = new self.Tower('Cost', 'Decreases the score cost of helpers.', 1000, 'Consumer', 1);
        self.MouseTower = new self.Tower('Mouse', 'Dramatically increases the score gained by clicking the button.', 1500, 'Consumer', 1);
        self.SanitationTower = self.Tower('Sanitation', 'Converts latent toxicity into score.', 2000, 'Consumer', 1);

        self.namePush('Towers', self.PowerTower, self.CostTower, self.MouseTower);

        self.Special = function (name, description, price, reqKeys, reqVals) {
            var func = this;
            self.Purchaseable.call(func, name, description, price, Constants.PriceIncrement, reqKeys, reqVals);
        }

        self.Special.prototype = Object.create(self.Purchaseable.prototype);
        self.Special.prototype.constructor = self.Special;

        self.Special.prototype.price = function () {
            var func = this;
            var original = self.Purchaseable.prototype.price.call(func);
            return {
                currency: 'greenBlocks',
                price: original.price
            };
        };

        self.Special.prototype.type = 'Special';

        self.CleanseSpecial = new self.Special('Cleanse', 'Eliminates some toxicity.', 50, false, false);
        self.CleanseSpecial.unlocked = 1;
        self.CleanseSpecial.price = function () {
            var func = this;
            var original = self.Special.prototype.price.call(func);
            original.currency = 'score';
            return original;
        };

        self.ScoreSpecial = new self.Special('Score', 'Buy some score.', 5, 'Consumer', 1);
        self.ScoreSpecial.buyFunc = function () {
            var func = this;
            var val = 1000 + (200 * func.purchased);
            self.storage.score += val;
            //self.SetMessage("Bought " + val + " score.");
        };

        self.BlueBlockSpecial = new self.Special('Blue Block', 'Buy a blue block.', 5, 'Consumer', 1);
        self.BlueBlockSpecial.buyFunc = function () {
            var func = this;
            var val = 1 + Math.floor(func.purchased / 20);
            self.storage.blueBlocks += val;
        };

        self.TamerSpecial = new self.Special('Tamer', 'Tames a consumer\'s hunger, reducing its score cost.', 200, 'Consumer', 1);
        self.TamerSpecial.buyFunc = function () { };

        self.namePush('Specials', self.ScoreSpecial, self.BlueBlockSpecial, self.TamerSpecial, self.CleanseSpecial);

        return self;
    };
})();