//0303_Write a First Meteor Method.mp4
Meteor.methods({
    //вызывается от users.js при нажати кнопки Add
    setFriend: function(userId){
        var query = {};
        //query['$pull'] - если userId есть в списке друзей то удалить его 
        //query['$push'] - если userId нет в списке друзей то добавить
        query[ alreadyFriends(userId) ? '$pull' : '$push'] = {
            'profile.friends' : userId
        }; //добавить или удалить в массив profile.friends id друга
        //обновить запись в базе данных
        Meteor.users.update(this.userId, query);
    },
    
//0403_NewGameMethod.mp4
//from vikipedia "Forsyth-Edvards Notation" (FEN) - способ записи текущего состояния шахматного поля в одну линию символами ASCII
//для расшифровки fen-строки используется библиотека jhlywa/chess.js
//meteor add makalu:chess-js
    createGame: function(color, opponentId){
        
        var otherColor = (color === "white") ? "black" : "white"; 
        var game = {
            moves: '',
            //создать новое шахматное поле
            board: (new Chess).fen()
        };
        game[color] = this.userId;
        game[otherColor] = opponentId;
        game.needsConfirmation = opponentId;
        
        Games.insert(game, function(err, id){
            //callback функция при ошибке добавления игры в базу
            if (err) throw err;
            
            //создать базу данных - общения в текущей игре
            Conversations.insert({
                game: id,
                users: [this.userId, opponentId],
                messages: [{
                    name: 'system',
                    text: 'Game started ' +  (new Date).toString()
                }]
            });
        }.bind(this));// bind вызывается для того чтобы передать this в [this.userId]
    },
    
    acceptGame: function(gameId){
        Games.update(gameId, { $unset: {needsConfirmation: null} } );
    }, 
    
    declineGame: function(gameId){
        Games.remove(gameId)
    },
    
    makeMove : function(gameId, move){//переместить фигуру
        var game = Games.findOne(gameId);
        var chess = new Chess();
        
        chess.load_pgn(game.moves);
        chess.move(move);
        
        var result = null;
        //если игра после этого хода окончена, то
        if (chess.game_over()){
            //если Шах-и-Мат, то в результат зависать Id игрока который сделал этот ход
            //result = chess.in_checkmate() ? game[ (chess.turn() === 'w') ? 'black' : 'white'] : 'draw' //иначе ПАТ
            result = chess.in_checkmate() ? Meteor.userId() : 'draw' 
            
        };
        
        Games.update(gameId, {
            $set: {
                board: chess.fen(),
                moves: chess.pgn(),
                result: result
            }
        }, function(err){
            if (err) throw err;
            var message;
            if (result === 'draw') 
                message = 'Игра окончена, Пат.';
            else if (result)
                message = getUserName(result) + ' выиграл!';
            else if (chess.in_check())
                message = 'шах ' + Meteor.user().username; 
            else
                return;
        
        Conversations.update({game: gameId}, {
            $push: {
                messages : {
                    name: 'system',
                    text: message
                }
            }
        });
        
        });
    
    
    },
    
    addMessage : function(message, gameId){
         Conversations.update({game: gameId}, {
            $push: {
                messages : {
                    name: Meteor.user().username,
                    text: message
                }
            }
        });
    },
    
    
})