/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    create: function(req, res) {
        group = req.param("group");
        Group.create(group).exec(function cb(err, g_cre) {
            if (err) console.log (err);
            else console.log ('group created!');
            return res.json (g_cre);
        });
    },
    /*
    debb: function (req, res) {
        groups = [{
            'name' : 'groupo2'
        }];
        Group.create(groups).exec(function cb(err, g_cre){ 
            return res.json (g_cre);
        });
    },
    */
    add_user_to_group: function (req, res) {
        uid=req.param("uid");
        gid=req.param("gid");
        User.findOne(uid).exec(function cb(err, user) {
            if (err)
                console.log('error');
            user.groups.add(gid);
        }); 
    },
    remove_user_from_group: function (req, res) {
        uid = req.param("uid");
        gid = req.param("gid");
        Group.findOne(gid).exec (function db(err, group) {
            group.users.remove(uid);
            group.save (function (err) {
                return res.ok(); 
            });
        });
    },
    test_rem: function (req, res) {
        uid=1;
        gid=1;
        Group.findOne(gid).exec(function cb(err, group) {
            if (err)
                console.log('error');
            group.users.remove(uid);
            group.save(function (err) {
                return res.ok(); 
            });
        }); 
    }


};

