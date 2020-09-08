cc.Class({
    extends: require('UI-PanelWindow'),

    properties: {
        coin: cc.Label,
        friendlyLinksNode: cc.Node,
    },

    setOptions(options) {
        this.coin.string = options.coin;
        this.cb = options.cb;
        this.checkHaveFriendlyLink();
    },
    onClickDouble() {
        global.gaming = false;
        var self = this;
        global.Platform.showVideo('adunit-3272773a885b41c6', function (finish) {
            if (finish) {
                global.EJMgr.popUI();
                global.GameLoop.enterSelectPlane();
                self.cb(2);
                global.EJMgr.showToast('金币加倍成功')
            }
        })
    },
    onClickSignle() {
        global.gaming = false;
        global.EJMgr.popUI();
        global.GameLoop.enterSelectPlane();
        this.cb(1);
    },
    checkHaveFriendlyLink() {
        let friendlyLinks = [];
        global.Data.friendlyLinks.forEach(element => {
            if (element.sceneName == 'GameOver') friendlyLinks.push(element);
        });
        let childrenArr = this.friendlyLinksNode.children;
        for (let i = 0; i < childrenArr.length; i++) {
            childrenArr[i].active = false;
        }
        for (let i = 0; i < friendlyLinks.length; i++) {
            childrenArr[i].getComponent('FriendlyLink').setOptions(friendlyLinks[i]);
        };
    },

});
