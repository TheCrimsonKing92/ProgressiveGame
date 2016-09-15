(function () {
    function GameController(storeService, $rootScope, $interval, $modal) {
        var self = this;

        self.Autosave = 30;

        self.Store = storeService;

        self.load = function () {
            if (localStorage.length === 0) self.save();
            else {
                var storage = JSON.parse(localStorage.getItem('ProgressiveGame'));
                if (storage == null || storage['Store'] == null || storage['Store'] == 'null') self.save();
                var ob = storage['Store'];
                console.log(JSON.stringify(ob.Helpers));
                console.log('ob.Helpers["AutoClicker"]');
                console.log(JSON.stringify(ob.Helpers['AutoClicker']));
                self.Store.load(storage['Store']);
            }
        };

        self.save = function () {
            var store = self.Store.storage;

            var storage =
            {
                Store: store
            };
            localStorage.setItem('ProgressiveGame', JSON.stringify(storage));
            self.load();
        };

        self.slimSave = function () {
            var store = self.Store.storage;

            var storage =
            {
                Store: store
            };

            localStorage.setItem('ProgressiveGame', JSON.stringify(storage));
            console.log('game saved');
        };

        self.reset = function () {
            window.localStorage.clear();
            self.Store.storage.Class = '';
            self.Store.storage.clicks = 0;
            self.Store.storage.score = 0;
            self.Store.storage.greenBlocks = 0;
            self.Store.storage.greenBlocksBuild = 0;
            self.Store.storage.blueBlocks = 0;
            self.Store.storage.blueBlocksBuild = 0;
            self.Store.storage.operationsBonus = 0;

            for (var i in self.Store.storage.Helpers) {
                var current = self.Store.storage.Helpers[i];
                current.purchased = 0;
            }

            for (var i in self.Store.storage.Upgrades) {
                var current = self.Store.storage.Upgrades[i];
                current.purchased = 0;
                current.unlocked = 0;
            }

            for (var i in self.Store.storage.Towers) {
                var current = self.Store.storage.Towers[i];
                current.purchased = 0;
                current.unlocked = 0;
            }

            for (var i in self.Store.storage.Specials) {
                var current = self.Store.storage.Specials[i];
                current.purchased = 0;
                current.unlocked = 0;
            }

            self.load();
        };


        self.ButtonClick = function () {
            self.Store.ButtonClick();
        };

        self.CheckMessage = function () {
            if (self.Store.hasMessage === 1) {
                // display message
                self.DisplayMessage(self.Store.Message);
                self.Store.Message = '';
                self.Store.hasMessage = 0;
            }
        };

        self.DisplayMessage = function (string) {
            var modal = $('#messageModal');
            var el = modal[0];
            var par = $('#modalText');
            
            var tWid = window.outerWidth;
            var modWid = modal.outerWidth();
            var difWid = (tWid / 2) - (modWid / 2);

            par[0].innerHTML = string;

            var props = { left: difWid, display: 'inline-block' };
            modal.css(props);

            modal.animate({ bottom: '40%' }, 800);

            //modal.fadeOut(3000, function () {
             //   el.innerHtml = '';
            //});
        };

        self.Earn = function () {
            self.Store.storage.score += self.EarnVal();
            self.Store.storage.toxicity += self.ToxicVal();
            if (self.Store.Towers['Sanitation'].isPurchased()) {
                if (self.Store.storage.toxicity >= 20) {
                    self.Store.storage.toxicity -= 20;
                    self.Store.score += 500;
                }
            }
        };

        self.EarnVal = function () {
            var localVal = self.Store.getScore();
            localVal /= 2;
            return localVal;
        };

        self.Tooltip = function ($event, show) {
            var jqEl = $($event.currentTarget);
            var target = jqEl.next('.store-tooltip');

            if (show) {
                target.show().position({ my: "left top", at: "right top", of: jqEl });
            }
            
            else {
                target.hide();
            }
            
        };

        self.ToxicVal = function () {

        };

        self.SetClass = function (className) {
            $('.classPicker')[0].remove();
            self.Store.storage.Class = className;
        };

        self.activate = function () {
            self.load();
            var autoSave = $interval(self.slimSave, 30000);
            var earn = $interval(self.Earn, 500);
            var evalClickUps = $interval(self.Store.evalClickUps, 250);
            var checkMessage = $interval(self.CheckMessage, 100);
        };

        self.activate();
    };
    GameController.$inject = ['storeService', '$rootScope', '$interval', '$modal'];
    angular.module('app').controller('GameController', GameController);
})();