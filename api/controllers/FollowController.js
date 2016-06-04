/**
 * FollowController
 *
 * @description :: Server-side logic for managing follows
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    create: function(req, res) {
        follow = {
            'follower': req.params['follower'],
            'follows': req.params['follows']
        };
        Follow.create(follow).exec(function callback(err, follow_created) {
            if (err)
                console.log (err);
            else 
                console.log('follow done!');
            return res.json (follow_created);
        });
    },
    remove: function (req, res) {
        follow = {
            'follower': req.params['follower'],
            'follows': req.params['follows']
        };
        Follow.destroy(follow).exec(function callback (err, follow_destroyed) {
            if (err)
                console.log (err);
            else
                console.log ('');
            return res.json (follow_destroyed);
        });
    },
    get_followers_by_id: function(user_id) {
        Follow.find({'follower':user_id}).exec(function cb(err, ret) {
            if (err)
                console.log(err); 
            console.log(ret);
            return res.json(ret);
        });
    },
    get_followers: function (req, res) {
        var user_id = parseInt(req.params['query_str']);

        if (isNaN(user_id)) {
            User.findOne({'login':req.params['query_str']}).exec(function cb(err, ret) {
                if (err)
                    console.log (err);
                if (!ret)
                    return res.ok();
                user_id = parseInt(ret['id']); 
                return get_followers_by_id (user_id);
            }); 
        }
        else {
            console.log (user_id);
            return get_followers_by_id (user_id);
        }
    },
    get_follows: function (req, res) {
        return res.send('b');
    }
};

