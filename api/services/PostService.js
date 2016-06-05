module.exports = {
    create_subjects: function(text, callback) {
        var ntext = text.split(" ");
        var cnt = 0, rdata = [];

        for (i=0;i<ntext.length;++i) {
            if (ntext[i][0]=='#') 
                rdata.push (ntext[i].substring(1)); /*removes first char*/
        }
        if (rdata.length==0)
            callback ([]);
        for (i=0; i<rdata.length; ++i) {
            Subject.create ({'name': rdata[i]}).exec (
                function cb (err, data) {
                    if (err)
                        console.log (err);
                    cnt++;
                    if (cnt == rdata.length) {
                        callback (rdata);
                    }
                }
            );
        }
    },
    get_all_users_cited: function (text, callback) {
        var ntext = text.split (" ");
        var cnt = 0, rdata = [], rrdata = [];
        for (i=0;i<ntext.length; i++) {
            if (ntext[i][0]=='@')
                rdata.push (ntext[i].substring(1));
        }
        if (rdata.length == 0)
            callback ([]);

        for (i=0; i<rdata.length; ++i) {
            UserService.get_user_by_login (rdata[i], function cb (user) {
                if (user)
                    rrdata.push (user);
                cnt++;
                if (cnt == rdata.length)
                    callback (rrdata);
            });
        }
    }
};
