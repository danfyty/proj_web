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
            })
        }]);

app.factory('user_service', function($http) {
    var users = [];
    return {
        'create': function(user) {
            return $http.post('/user/create', {"user": user});
        },
        'login': function (login, password) {
            return $http.post('/user/set_user_logged', {'login':login, 'password': password});
        }
    }
});

app.controller('index_controller', ['$scope',function($scope) {
}]);

app.controller('signin_controller', ['$scope', 'user_service', function ($scope, user_service) {
    $scope.user_logged;
    $scope.err_message = '';
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
