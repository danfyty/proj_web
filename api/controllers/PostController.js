/**
 * PostController
 *
 * @description :: Server-side logic for managing posts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    create: function (req, res) {
        text = req.param("text");
        user_id = req.param("user_id");

        PostService.create_subjects(text, function(subjects) {

            PostService.get_all_users_cited (text, 
                    function (users_cited) {
                        Post.create ({'text': text,'user': user_id}).exec (
                                function cb (err, post) {
                                    var subjects_names = [], users_cited_id = [];
                                    for (i=0;i<users_cited.length; ++i)
                                        users_cited_id.push (users_cited[i].id);
                                    post.users_cited.add (users_cited_id);
                                    post.subjects.add (subjects);
                                    post.save(function (err) {
                                        if (err)
                                           console.log(err);
                                       res.json (post); 
                                    });
                                }
                                );
            });
        });
    },
    remove: function (req, res) {
        post_id = req.param("post_id");
        Post.destroy ({'id': post_id}).exec (function cb (err, post) {
            if (err)
                console.log (err);
            return res.json (post);
        });
    } 
};

