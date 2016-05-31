//0301_List Users.mp4
Template.users.onCreated(function(){
    this.subscribe('users'); //связывает /server/main.js c template.users и дает ему базу данных с сервера Meteor.users
    
});

Template.users.helpers({
    my_users: function(){
      //выдать из базы клиентов, которая была получена от сервера
      //список пользователь за исключением текущего пользователя
      //или всех если никто не был авторизирован    
      return Meteor.users.find({ username : {$not: (Meteor.user() || {}).username } });  
    },
});

Template.user.helpers({
    alreadyFriends : alreadyFriends, //true or false. Это ссылка на функцию которая лежит в /lib/helpers.js. 
});

Template.user.events({
    'click .add': function(evt){
        //console.log("id of users = ", this._id);
        Meteor.call('setFriend', this._id); //call - это метод Метеора, который я создаю самостоятельно. Это функция которая вызывается у клиента но выполняется на сервере
        //метод находится в lib/methods.js
        //так как мы удалили insequre package поэтому мы не можем делать операции с базами данных у клиента
    },
})