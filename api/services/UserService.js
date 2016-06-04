module.exports = {
    get_user_by_id: function(user_id, callback) {
    },
    get_follows_by_id: function(user_id, callback) {
        Follow.find({'follower':user_id}).populate('follows').exec(function cb(err, ret) {
            if (err)
                console.log(err); 
            rret = [];
            for (i = 0; i < ret.length; i++)
                rret.push(ret[i].follows);
            callback (rret);
        });
    },
    get_followers_by_id: function(user_id, callback) {
        Follow.find({'follows':user_id}).populate('follower').exec(function cb(err, ret) {
            if (err)
                console.log(err); 
            rret = [];
            for (i = 0; i < ret.length; i++)
                rret.push(ret[i].follower);
            callback (rret);
        });
    },
    remove_by_id: function(id, callback) {
        User.destroy({'id':id}).exec(function cb(err, ret) {
            callback (ret);
        });
    },
    /*
       user atual, nuser -> user updatiado
     */
    update_user: function (user, nuser, callback) {

    }
};
