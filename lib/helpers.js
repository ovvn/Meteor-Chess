//0302_Making Friends.mp4

alreadyFriends = function (userId) {
    var user = Meteor.user();
    
    return  user &&
            user.profile &&
            user.profile.friends &&
            user.profile.friends.indexOf(userId) > -1;
};

getUserName = function (userId){
    return Meteor.users.findOne(userId).username
}