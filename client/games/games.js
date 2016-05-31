//0401_Waiting for Data.mp4
Template.games.onCreated(function(){
    //получить с сервера данные для template.games
    this.subscribe('users'); 
    this.subscribe('games'); //база объявлена в /server/main.js
    
});


//0402_new Game Form.mp4
Template.games.helpers({
    possibleOpponents: function(){
        //возвращает список друзей с которыми нет незаконченной игры
        var user = Meteor.user();
        var friends = user.profile.friends || [];
        //найти игры у которые не окончены
        //console.log('possible friends Before Find is ', friends);
        Games.find({ result : null }).forEach(function(game){
            //определить каким цветом играет игрок
            var color = (game.white === user._id) ? 'black' : 'white';    
            var idx = friends.indexOf(game[color]);
            //удалить из массива найденный элемент
          
            if (idx > -1) friends.splice(idx, 1);
        });
        
        //console.log('possible friends is ', friends);
        //если список друзей не пуст то вернуть пользователей id которых в списке друзей
        return friends.length ? Meteor.users.find({ _id: { $in: friends} }) : null;
    },
    
    currentGames: function(){
        //вернуть те игры результат которых еще не определен
        return Games.find({ result : null });
    },
    
    archivedGames: function(){
        //уже сыгранные партии
        return Games.find({ result: {$not: null} }).map(function(game){
            //сформировать новый массив с именами победителей
            //если результат не ничья то вывести в поле result
            //имя игрока который выиграл в этой партии
            if (game.result !== "draw") game.result = getUserName(game.result) + " won";
            return game;
        })
    },
    
    username: getUserName, //from /lib/helpers.js
    
    byMe: function(){
        //мой ход?
        return this.needsConfirmation &&
               this.needsConfirmation === Meteor.userId()
    },
    
    opponent: function(){
        //если текущий пользователь играет белыми тогда оппонент наоборот
        return (this.white === Meteor.userId()) ? this.black : this.white;
    }
});

//0403_NewGameMethod.mp4
Template.games.events({
    'submit form': function(evt){
        evt.preventDefault();
        //вызов метода из /lib/methods.js
        //и передать ему из формы цвет фигур и имя игрока с которым я хочу сыграть
        Meteor.call('createGame', evt.target.color.value, evt.target.otherPlayer.value);
    },
    
    'click #accept': function(evt){
        //вызов метода из /lib/methods.js
        Meteor.call('acceptGame', this._id);
    },
    
    'click #decline': function(evt){
        //вызов метода из /lib/methods.js
        Meteor.call('declineGame', this._id);
    },
    
    
})