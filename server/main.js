//server/main.js

//внес изменения
//new changes in main.js
//новые изменения in main.js


//0301_List Users.mp4
Meteor.publish('users', function(){
    return Meteor.users.find({}, { username : 1, profile : 1});
});

//0401_Waiting for Data.mp4
Meteor.publish('games', function(){
    //this.userId - пользователь который запрашивает список игр
    //сервер выдает список игр в котором участвует данный пользователь
    //если он играет черными или белыми
    return Games.find({ $or: [ {black : this.userId} , {white : this.userId} ]});
});

//0501_Get the Game Date.mp4 
Meteor.publish('game', function(gameId){
    return Games.find({ _id: gameId});
});

//0508_Chat Between Users.mp4
Meteor.publish('chat', function(gameId){
    return Conversations.find({ game: gameId});
});