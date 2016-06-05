var app = angular.module('app', ['ngRoute']);


app.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: '/templates/index.html',
                controller: 'index_controller'
            }).when('/signup', {
                templateUrl: '/templates/signup.html',
                controller: 'signup_controller'
            }).when('/signin', {
                templateUrl: '/templates/login.html',
                controller: 'signin_controller'
            }).when('/post', {
                templateUrl: '/templates/post.html',
                controller: 'post_controller'
            })
        }]);

app.factory('post_service', function($http) {
    return {
        'create': function(text, user_id) {
            return $http.post('/post/create', {'text':text, 'user_id': user_id});
        }
    };
});

app.factory('user_service', function($http) {
    var users = [];
    return {
        'create': function(user) {
            return $http.post('/user/create', {"user": user});
        },
        'login': function (login, password) {
            return $http.post('/user/set_user_logged', {'login':login, 'password': password});
        },
        'get_user_logged': function() {
            return $http.post('/user/get_user_logged');
        }
    }
});

app.controller('index_controller', ['$scope',function($scope) {
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


    $scope.postit = function() {
        if ($scope.user_logged) {
            post_service.create($scope.post_text, $scope.user_logged.id).success (
                    function(data) {
                        console.log (data);
                    }
                    );
        }
    }

}]);

app.controller('signin_controller', ['$scope', 'user_service', function ($scope, user_service) {
    $scope.user_logged;
    $scope.err_message = '';

    /*fazer isso sempre que quizer pegar o usuario que esta logado*/
    user_service.get_user_logged().success (function(data) {
        if (data) 
            $scope.user_logged = data;
    });

    $scope.login = function() {
        user_service.login ($scope.user_username, $scope.user_password).success (function(data) {
            if (data)
                $scope.user_logged = data;
            else 
                $scope.err_message = 'Wrong username or password!';
        });
    }
}]);

app.controller('signup_controller', ['$scope', 'user_service',function($scope, user_service) {
    $scope.create = function() {
        user_service.create( {
            'name': $scope.user_name, 
            'email': $scope.user_email, 
            'login': $scope.user_username, 
            'password': $scope.user_password, 
            'birth_date': $scope.user_birth_date 
        } ).then(
           function(response) {
               console.log(response);
           },
          function(response) {
                console.log(response); 
          } 
          );
    }
}]);
