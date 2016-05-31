//0501_Get the Game Date.mp4
//0502 Display the Qame Prep Work
//используем Portable Game Notation (png file format)from wiki
//используется конструктор Chess() from makalu:chess-js

Template.game.onCreated(function(){
    this.autorun(() => { 
        this.subscribe('users');
        this.subscribe('game', FlowRouter.getParam('id') );
    });
    Session.set('stepping', false);

});

function getGame(){
    //return Games.findOne({_id: FlowRouter.getParam('id')});
    return Games.findOne(FlowRouter.getParam('id'));
};

function getMoves(){
    var chess = new Chess();
    chess.load_pgn(getGame().moves);
    var moves = chess.history();
    //return chess.history() //возвращает массив ходов
    
    if (Session.get('stepping')) {
        if (moves.length < Session.get('moveIndex')){
            Session.set('moveIndex', moves.length)
        }
        
        moves = moves.slice(0, Session.get('moveIndex'));
    };
    
    return moves;
};

var selectedData = null,
    selectedNode = null;

Template.game.events({
    'click td': function(event){
        console.log(this.cell);//номер ячейки по которой кликнули
        
        var data = getGame();
        var w_or_b = data.board.split(' ')[1];
        
        (w_or_b === 'w') ? w_or_b = "white" : w_or_b = "black" ;
        
        if (data[w_or_b] !== Meteor.userId() ) {
            //console.log('не ваш ход!');
            return;
        }
        
        //-выбор ячейки начала хода
        //--проверить может ли фигура в данной ячейки передвинуться
        //---если да, то выбрать ее и запомнить
        //-выбор ячейки конца хода
        //--если это ячейка начала хода
        //--- если да, то отменить выбор, забыть ячейку
        //--- если нет, то
        //---- проверить, может ли фигура с исходной ячейки
        //     передвинуться в ячейку конца хода?
        //----- да, передвинуть фигуру.
        //----- нет, игнорировать команду
        
        var chess = new Chess(data.board);
        
        if (selectedData){
            if (selectedData.cell === this.cell) {
                deselect();
            } else {
                var move = canMove(selectedData.cell, this.cell);
                
                if (move) {
                    Meteor.call('makeMove', data._id, move); //lib/methods.js
                    deselect();
                }
            }
            
        } else {
            if (canMove(this.cell)){
                select(event.target, this)
            } else {
                console.log('незя')
            }
            
        };
        
        function canMove(from, to){
            //варианты возможных ходов с поля from
            var moves = chess.moves({ square: from });
                      
            return !to ? moves.length > 0 : moves.reduce(function(prev, curr){
                if (prev) return prev;
                return curr.indexOf(to) > -1 ? curr : false;
            }, false);
            //если конечная ячейка не задана то выдать число возможных ходов для данной ячейки иначе
            //оставить только один из возможных ходов из массиве moves , который соответствует ячейке to
        };
        
        
    },//end of 'click td': function(event)
    
});

Template.game.helpers({
    
    currentTurn : function(){//чей ход?
        var game = getGame();
        var w_or_b = game.board.split(' ')[1];
        
        (w_or_b === 'w') ? w_or_b = "white" : w_or_b = "black" ;
        
        return getUserName(game[w_or_b])
    },
    
    result : function(){
        var result = getGame().result;
        if (!result) return null;
        if (result === 'draw') return "Ничья!";
        return 'Игрок ' + getUserName(result) + ' выиграл!';
    },
    
    moves: function(){
        //расставить ходы по парам 1. e2 e4; 2. Nb1 Nc3 ...

        return pair(getMoves()).map(function(arr){
            return arr[0] + '   ' + (arr[1] || '');
        });
       
    },
    
    game : function(){
       return getGame();
    },
    username: getUserName, //from /lib/helpers.js
    
    rows: function(){
        var chess = new Chess();
        //chess.move('e4');
        //chess.move('Ne5'); //черный конь на e5
        getMoves().forEach(chess.move.bind(chess));
        return makeRows( chess.fen(), getGame().black );
    }
});

//расставить черные фигуры на поле
function makeRows( board, b){
    //board sample = chess.fen() = после ходов e2-e4; e7-e5; Nc3 =  "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2"
    //black in lowercase; white is upperCase leters
    //разбить fen-строку на 8 подстрок
   
    var rows = board.split(' ')[0].split('/');
    //для каждой подстроки
    var data = rows.map(function(row, i){
        var rank = 8 - i; //row number from 1 to 8
        var file = 0;  //column from 0 to 7
        //пример a = [].concat.apply([], [{A:'A'}, [{s1:1},{s2:2},{s3:3}], {B:'B'}]); => массив из пяти объектов
        return [].concat.apply([],row.split('').map(function(cell){
            var n = parseInt(cell);
            //если n не число, то это фигура на поле
            if (isNaN(n)) 
                return makeCell(cell, rank, file++);//return w -> piece
            //иначе return n empty cells
            return Array.apply(null, Array(n)).map(function(cell){
                return makeCell(cell, rank, file++);
            })
        }));
    });
  
    //если текущий user играет черными то
    if (b === Meteor.userId()){
        data.reverse();
        data = data.map(function(row){
            return row.reverse()
        });
    };
    return data;//если user играет белыми
};
                        
function makeCell(val, rank, file){
    return {
        piece: val,
        img: pieces[val] || '',
        //97 = "a"
        //если столбец(file)=2 и строка(rank)=2 то cell="c2"
        cell: String.fromCharCode(97 + file) + rank,
    }    
};

function select(node, data){
    selectedNode = node;
    selectedData = data;
    selectedNode.classList.add('selected');
};

function deselect(){
    selectedNode.classList.remove('selected');
    selectedNode = null;
    selectedData = null;
};

function pair(arr){
    var i = 0;
    var ret = [];
    while (i < arr.length) ret.push([arr[i++], arr[i++]]);
    return ret;
};

//0509_Reviewing the Game.mp4
Template.stepper.helpers({
    canStep : function(result){
        //true если игра окончена и кнопка не была еще нажата
        return result && !Session.get('stepping')
    },
    
    stepping : function(){
        return Session.get('stepping');
    },
});

Template.stepper.events({
    'click #step': function(){
        Session.set('stepping', true);    
        Session.set('moveIndex', 0);
    },
    'click #prev' : function(){
        var idx = Session.get('moveIndex');
        Session.set('moveIndex', idx - 1 < 0 ? 0 : idx - 1 );
        console.log(Session.get('moveIndex'))
    },
    'click #next' : function(){
        Session.set('moveIndex', Session.get('moveIndex') + 1);
        console.log(Session.get('moveIndex'))
    }
    
})