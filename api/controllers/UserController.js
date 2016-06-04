/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
    create: function(req, res) {
        user = req.param("user"); 
        console.log(user);
        User.create(user).exec(function callback(err, user_created) {
            if (err) 
                console.log(err);
            else
                console.log('User created successfully!');
            return res.json(user_created);
        });
    }, 
    get_by_name: function(req, res) {
        User.find({name: req.params['query_name']}).exec(
                function callback (err, ret) {
                    if (err)
                        console.log (err);
                    else 
                        console.log ('user fetched successfuly');
                    return res.json (ret);
                }
                );
    },
    get_by_login: function (req, res) {
        User.find({login: req.params['query_login']}).exec(
                function callback (err, ret) {
                    if (err)
                        console.log (err);
                    else 
                        console.log ('user fetched successfuly');
                    return res.json (ret);
                }
                );
    },
};
