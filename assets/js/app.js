var app = angular.module('app', ['ngRoute']);


app.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: '/templates/index.html',
                controller: 'index_controller'
            }).when('/signup', {
                templateUrl: '/templates/signup.html',
                controller: 'signup_controller'
            })
        }]);

app.factory('user_service', function($http) {
    var users = [];
    return {
        'create': function(user) {
            return $http.post('/user/create', {"user": user});
        }
    }
});

app.controller('index_controller', ['$scope',function($scope) {
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
