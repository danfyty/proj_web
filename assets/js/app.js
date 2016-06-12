var app = angular.module('app', ['ngRoute']); 
function put_links (str, users_cited, subject_cited) {
    var strsp = str.split(" ");
    var ret = '';
    for (i = 0; i<strsp.length; ++i) {
        if (i>0)
            ret += ' ';
        if (strsp[i][0]=='@') {
            user_login = strsp[i].substr(1);
            var id = -1;
            for (k = 0; k < users_cited.length; k++)
                if (users_cited[k].login == user_login)
                    id = users_cited[k].id;
            if (id!=-1)
                ret += '<a href="#/profile/' + id + '">';   
            ret += strsp[i];
            if (id != -1)
                ret += '</a>';
        }
        else
            ret += strsp[i];
    }
    return ret;
}

app.factory('user_service', function($http, $q) {
    return {
        user_logged: undefined,
        follows: {list:[]}, 
        'create': function(user) {
            return $http.post('/user/create', {"user": user});
        },
        'login': function (login, password) {
            return $http.post('/user/set_user_logged', {'login':login, 'password': password});
        },
        'get_user_logged': function() {
            return $http.post('/user/get_user_logged');
        },
        'get_follows': function(user_id) {
            return $http.get('/user/'+user_id+'/follows');
        },
        'get_user': function (user_id) {
            return $http.get('/user/'+user_id);
        },
        'follow': function (usera_id, userb_id) {
            return $http.get('/follow/create/'+usera_id+'/'+userb_id);
        },
        'unfollow': function (usera_id, userb_id) {
            return $http.get('/unfollow/'+usera_id+'/'+userb_id);
        },
        'update': function (vals) {
            return $http.post('/user/update', {'user':vals});
        },
        'remove': function (user_id) {
            return $http.post ('/user/remove', {'user_id': user_id});
        },
        'create_users': function (users) {
            var defer = $q.defer();
            var users_created = [];
            for (var i = 0; i<users.length; i++) {
                this.create (users[i]).success (function (user_created) {
                    users_created.push (user_created);
                    if (users_created.length == users.length)
                        defer.resolve (users_created);
                });
            }
            return defer.promise;
        }
    }
});

app.factory('post_service', function($http) {
    return {
        'create': function(text, user_id) {
            return $http.post('/post/create', {'text':text, 'user_id': user_id});
        },
        'getit': function (post_id) {
            return $http.get ('/post/' + post_id);
        },
        'remove': function (post_id) {
            return $http.get ('/post/remove/' + post_id);
        }
    };
});



get_user_logged_before = function ($q, $sce, user_service, post_service) {
    var defer = $q.defer();
    user_service.get_user_logged ().then ( function(user) {
        if (user.data == '')
            defer.resolve (undefined);
        user = user.data;
        user_service.get_user (user.id).success (function (data) {
            user = data;
            user_service.get_follows (user.id) .then( function (follows) {
                user['follows'] = follows.data;

                if (user.posts_authored.length == 0)
                    defer.resolve (user);

                var nposts=[];
                for (var i = 0; i<user.posts_authored.length; i++) {
                    post_service.getit (user.posts_authored[i].id).success (function (post) {
                        post.text = $sce.trustAsHtml (put_links (post.text, post.users_cited, post.subjects));
                        nposts.push (post);
                        if (nposts.length == user.posts_authored.length) {
                            user.posts_authored = nposts;
                            defer.resolve (user);
                        }
                    });
                }
            });
        });
    });
    return defer.promise;
};

get_curr_user_before = function ($q, $route, $sce, user_service, post_service) {
    var user_id = ($route.current.params.userid);
    var defer = $q.defer();
    user_service.get_user (user_id).then (function (user) {
        user = user.data;

        user_service.get_follows (user_id).then (function (follows) {
            user['follows'] = follows.data;

            var nposts_authored =[];
            var nposts_cited =[];

            if (user.posts_authored.length == 0 && user.posts_cited.length == 0)
                defer.resolve (user);
            for (var i = 0; i<user.posts_authored.length; i++) {
                post_service.getit (user.posts_authored[i].id).success (function (post) {
                    post.text = $sce.trustAsHtml(put_links (post.text, post.users_cited, post.subjects));
                    nposts_authored.push (post);
                    if (nposts_authored.length == user.posts_authored.length && nposts_cited.length == user.posts_cited.length) {
                        user.posts_authored = nposts_authored;
                        user.posts_cited = nposts_cited;
                        defer.resolve (user);
                    }
                });
            }
            for (var i = 0; i<user.posts_cited.length; i++) {
                post_service.getit (user.posts_cited[i].id).success (function (post) {
                    post.text = $sce.trustAsHtml(put_links (post.text, post.users_cited, post.subjects));
                    nposts_cited.push (post);
                    if (nposts_authored.length == user.posts_authored.length && nposts_cited.length == user.posts_cited.length) {
                        user.posts_authored = nposts_authored;
                        user.posts_cited = nposts_cited;
                        defer.resolve (user);
                    }
                });
            }

        });
    });
    return defer.promise;
};

app.config(['$routeProvider',
        function($routeProvider, $routeParams) {
            $routeProvider.when('/', {
                templateUrl: '/templates/index.html',
                controller: 'index_controller',
                resolve: {
                    user_logged: get_user_logged_before
                }
            }).when('/signup', {
                templateUrl: '/templates/signup.html',
                controller: 'signup_controller'
            }).when('/signin', {
                templateUrl: '/templates/login.html',
                controller: 'signin_controller'
            }).when('/post', {
                templateUrl: '/templates/post.html',
                controller: 'post_controller'
            }).when('/search/:username', {
                templateUrl: '/templates/search.html',
                controller: 'search_controller'
            }).when('/search', {
                templateUrl: '/templates/search.html',
                controller: 'search_controller',
                resolve: {
                    user_logged: get_user_logged_before 
                }
            }).when('/profile/:userid', {
                templateUrl: '/templates/profile.html',
                controller: 'profile_controller',
                resolve: {
                    user_logged: get_user_logged_before,
                    curr_user: get_curr_user_before
                }
            }).when('/my_profile', {
                templateUrl: '/templates/my_profile.html',
                controller: 'my_profile_controller',
                resolve: {
                    user_logged: get_user_logged_before 
                }
            }).when('/importer', {
                templateUrl: '/templates/importer.html',
                controller: 'importer_controller',
            })
        }]);


app.controller ('search_controller', ['$scope', 'user_service','$routeParams','$http', 'user_logged', function ($scope, user_service, $routeParams, $http, user_logged) {
    var query_url = '/user/get_like_login/';
    $scope.user_logged = user_logged;
    $scope.users = [];
    if ($routeParams['username'])
        query_url = '/user/get_like_login/' + $routeParams['username'];
    else query_url = '/user/';

    $http.get (query_url).success (function (data) {
        $scope.users = data;
        for (var j = 0; j < data.length; ++j) {
            var fnd = false;
            for (var i = 0; i < $scope.user_logged.follows.length; i++)
                if ($scope.user_logged.follows[i].id == $scope.users[j].id)
                    fnd = true;
            $scope.users[j].isfollowed = fnd;
        }
    });

    $scope.follow = function (user_id) {
        user_service.follow ($scope.user_logged.id, user_id).success (function (data) {
            for (var i = 0; i<$scope.users.length; ++i) {
                if ($scope.users[i].id == user_id)
                    $scope.users[i].isfollowed = true;
            }
        }); 
    }
    $scope.unfollow = function (user_id) {
        user_service.unfollow ($scope.user_logged.id, user_id).success (function (data) {
            for (var i = 0; i<$scope.users.length; ++i) {
                if ($scope.users[i].id == user_id)
                    $scope.users[i].isfollowed = false;
            }
        });
    }

}]);

app.controller ('profile_controller', ['$scope', 'user_service','post_service', '$routeParams','$http','user_logged','curr_user',function ($scope, user_service, post_service, $routeParams, $http, user_logged, curr_user) {

    if (user_logged == undefined || curr_user == undefined)
        window.location.href = "#/signin";
    $scope.user_logged = user_logged;

    $scope.curr_user = curr_user;
    $scope.curr_user.isfollowed = false;
    for (var i =0; i < $scope.user_logged.follows.length; ++i)
        if ($scope.user_logged.follows[i].id == $scope.curr_user.id)
            $scope.curr_user.isfollowed = true;

    $scope.follow = function (user_id) {
        user_service.follow ($scope.user_logged.id, user_id).success (function (data) {
            $scope.curr_user.isfollowed = true;
        }); 
    }
    $scope.unfollow = function (user_id) {
        user_service.unfollow ($scope.user_logged.id, user_id).success (function (data) {
            $scope.curr_user.isfollowed = false;
        });
    }
}]);


app.controller('navbar_controller', ['$scope', 'user_service', function ($scope, user_service) {
    $scope.user_logged;
    user_service.get_user_logged().success (function(data) {
        if (data) {
            user_service.user_logged = data; 
            user_service.get_follows(user_service.user_logged.id).success (function (data) {
                user_service.follows.list = data;
            });
        }
        $scope.user_logged = user_service.user_logged;
        /*here it should start*/
    });

}]);

app.controller('index_controller', ['$scope', '$sce', 'user_service','post_service','user_logged',
        function($scope, $sce, user_service, post_service, user_logged) {

            if (angular.isUndefined (user_logged))
                window.location.href = "#/signin";
            $scope.user_logged = user_logged;
            $scope.posts_follows = [];

            for (var i = 0; i<$scope.user_logged.follows.length; ++i) {
                user_service.get_user ($scope.user_logged.follows[i].id).success (function (user) {
                    if (user) {
                        for (var j = 0; j < user.posts_authored.length; j++) {
                            post_service.getit (user.posts_authored[j].id).success (function (post) {
                                post.text = $sce.trustAsHtml (put_links (post.text, post.users_cited, post.subjects));
                                $scope.posts_follows.push (post);
                            });
                        }
                    }
                });
            }

            $scope.postit = function() {

                if ($scope.user_logged) {
                    post_service.create($scope.post_text, $scope.user_logged.id).success (
                            function(data) {
                                $scope.user_logged.posts_authored.push (data);
                                location.reload();
                            }
                            );
                }
                else 
                    window.location.href = "#/signin";
            };
            $scope.rem_post = function (post_id) {
                post_service.remove (post_id).success (function (data) {

                    $scope.user_logged.posts_authored = $scope.user_logged.posts_authored.filter(function (val) { return val.id != post_id; });
                });
            };


}]);

app.controller('importer_controller', ['$scope', 'user_service','post_service', function ($scope, user_service, post_service) {
    $scope.err_message = '';
    $scope.succ_message = '';
    $scope.importit = function () {
        var obj;
        try {
            obj = angular.fromJson ($scope.json_input);
        }
        catch (err) {
            $scope.err_message = err;
        }

        if (!obj) {
            $scope.err_message = 'Syntax errada!';
            return false;
        }
        $scope.err_message = '';

        if (obj.users) {
            for (var i = 0; i<obj.users.length; ++i) {
                obj.users[i]['name'] = obj.users[i]['nome'];
                delete obj.users[i]['nome'];
                obj.users[i]['birth_date'] = obj.users[i]['birthday'];
                delete obj.users[i]['birthday'];
                obj.users[i]['has_md5'] = true;
            }
            user_service.create_users (obj.users).then(function (data) {
                console.log (data);
                if (obj.follow) {
                    for (var i = 0; i<obj.follow.length; ++i)
                        user_service.follow (obj.follow[i].follower, obj.follow[i].follows);
                }

                if (obj.tweets) {
                    for (var i = 0; i<obj.tweets.length; ++i) {
                        delete obj.tweets[i].title;
                        obj.tweets[i].createdAt = obj.tweets[i].timestamp;
                        delete obj.tweets[i].timestamp;

                        post_service.create (obj.tweets[i].text, obj.tweets[i].user);
                    }
                }
            });
        }

        $scope.succ_message = 'dados importados com sucesso!';
        $scope.json_input = '';

    }

}]);

app.controller('post_controller', ['$scope', 'user_service','post_service', function ($scope, user_service, post_service) {
    $scope.user_logged;
    $scope.err_message = '';

    user_service.get_user_logged().success (function(data) {
        if (data)  
            $scope.user_logged = data;
        else 
            window.location.href = '#/signin'
    });
    
}]);

app.controller('signin_controller', ['$scope', 'user_service', function ($scope, user_service) {
    $scope.user_logged;
    $scope.err_message = '';

    /*fazer isso sempre que quizer pegar o usuario que esta logado*/
    user_service.get_user_logged().success (function(data) {
        if (data) {
            $scope.user_logged = data;
            window.location.href = "/"; /*User is logged in no need to log in again*/
        }
    });

    $scope.login = function() {
        user_service.login ($scope.user_username, $scope.user_password).success (function(data) {
            if (data) {
                $scope.user_logged = data;
                window.location.href="/";
            }
            else 
                $scope.err_message = 'Wrong username or password!';
        });
    }
}]);

app.controller('signup_controller', ['$scope', 'user_service',function($scope, user_service) {
    $scope.err_message = '';
    $scope.create = function() {
        if ($scope.user_password != $scope.user_password2) {
            $scope.err_message = 'Confirme a senha corretamente!';
            return 0;
        }
        user_service.create( {
            'name': $scope.user_name, 
            'email': $scope.user_email, 
            'login': $scope.user_username, 
            'password': $scope.user_password, 
            'birth_date': $scope.user_birth_date 
        } ).then(
            function(response) {
                window.location.href = "/";
            },
            function(response) {
                $scope.err_message = response;
            } 
            );
    }
}]);

app.controller('my_profile_controller', ['$scope', 'user_service','user_logged',function($scope, user_service, user_logged) {
    $scope.err_message = '';

    $scope.user_logged = user_logged;
    if (angular.isUndefined (user_logged))
        window.location.href = "#/signin";

    $scope.update = function() {

        if ($scope.user_password != '' && $scope.user_password != $scope.user_password2) {
            $scope.err_message = 'Confirme a senha corretamente!';
            return 0;
        }
        var upd_vals = {'id': $scope.user_logged.id};


        if ($scope.user_password != '')
            upd_vals ['password'] = $scope.user_password;

        if ($scope.user_name != '')
            upd_vals ['name'] = $scope.user_name;

        if ($scope.user_email != '')
            upd_vals ['email'] = $scope.user_email;

        if ($scope.user_login != '')
            upd_vals ['login'] = $scope.user_login;

        if ($scope.user_birth_date != '')
            upd_vals ['birth_date'] = $scope.user_birth_date;

        if ($scope.user_bio != '')
            upd_vals ['bio'] = $scope.user_bio;

        user_service.update (upd_vals).then(
            function(response) {
                window.location.href = "#/";
            },
            function(response) {
                $scope.err_message = response;
            } 
            );
    };

    $scope.remove = function () {
        user_service.remove ($scope.user_logged.id).then (
                function (response) {
                    window.location.href ="#/";
                });
    };
}]);
