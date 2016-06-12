/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
    get_user_logged: function (req, res) {
        if (req.session.user)
            return res.json (req.session.user);
        else 
            return res.json ();
    },
    logout: function (req, res) {
        delete req.session.user; 
        return res.redirect("/");
    },
    remove: function (req, res) {
        var user_id = req.param ("user_id");
        User.destroy ({'id': user_id}).exec (function cb (err, user_removed) {
            res.json (user_removed);
        });
    },
    set_user_logged: function (req, res) {
        user_login = req.param("login");

        user_password = req.param("password");
        var md5 = require ('md5');
        user_password = md5 (user_password);

        User.findOne({'login': user_login, 'password': user_password }).exec(
                function cb (err, user) {
                    if (err)
                        console.log ("error getting the user");

                    if (user) {
                        req.session.user = user;
                        delete req.session.user.password;
                        return res.json (req.session.user);
                    }
                    else 
                        return res.json ();
                });
    },
    create: function(req, res) {
        user = req.param("user"); 

        var md5 = require ('md5');
        if (user.password && !user.has_md5)
            user.password = md5 (user.password);
        if (user.has_md5)
            delete user.has_md5;

        User.create(user).exec(function callback(err, user_created) {
            if (err) 
                console.log(err);
            else
                console.log('User created successfully!');
            return res.json(user_created);
        });
    }, 
    remove: function(req, res) {
        user_id = req.param("user_id");
        UserService.remove_by_id(user_id, function cb(ret) {
            return res.json(ret); 
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
    get_like_login: function (req, res) {
        qx = {login: {'like' : req.params['query_login'] + '%'}};

        User.find (qx).exec(
                function callback (err, ret) {
                    if (err)
                        console.log (err);
                    else 
                        console.log ('users fetched successfuly');
                    return res.json (ret);
                }
                );
    },
    get_by_login: function (req, res) {
        var qx = {login: req.params['query_login']};


        User.find (qx).exec(
                function callback (err, ret) {
                    if (err)
                        console.log (err);
                    else 
                        console.log ('user fetched successfuly');
                    return res.json (ret);
                }
                );
    },
    update: function (req, res) {
        var upd_vals = req.param('user');
        var user_id = upd_vals.id;
        delete upd_vals.id;

        var md5 = require ('md5');
        if (upd_vals.password) {
            upd_vals.password = md5 (upd_vals.password);
        }

        User.update ({'id': user_id}, upd_vals).exec (function cb (err, user) {
            if (err)
                console.log (err);
            res.json (user);
        });
    }
};
