angular
  .module('AuthSampleApp', [
    'ui.router',
    'satellizer'
  ])
  .controller('MainController', MainController)
  .controller('DataController', DataController)
  .controller('HomeController', HomeController)
  .controller('LoginController', LoginController)
  .controller('SignupController', SignupController)
  .controller('LogoutController', LogoutController)
  .controller('ProfileController', ProfileController)
  .service('Account', Account)
  .config(configRoutes)
  ;



////////////
// ROUTES //
////////////

configRoutes.$inject = ["$stateProvider", "$urlRouterProvider", "$locationProvider"]; // minification protection
function configRoutes($stateProvider, $urlRouterProvider, $locationProvider) {

  //this allows us to use routes without hash params!
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

  // for any unmatched URL redirect to /
  $urlRouterProvider.otherwise("/");

  // user states

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/home.html',
      controller: 'HomeController',
      controllerAs: 'home'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'SignupController',
      controllerAs: 'sc',
      resolve: {
        skipIfLoggedIn: skipIfLoggedIn
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginController',
      controllerAs: 'lc',
      resolve: {
        skipIfLoggedIn: skipIfLoggedIn
      }
    })
    .state('logout', {
      url: '/logout',
      template: null,
      controller: 'LogoutController',
      resolve: {
        loginRequired: loginRequired
      }
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'templates/profile.html',
      controller: 'ProfileController',
      controllerAs: 'profile',
      resolve: {
        loginRequired: loginRequired
      }
    })


    function skipIfLoggedIn($q, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.reject();
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    function loginRequired($q, $location, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.resolve();
      } else {
        $location.path('/login');
      }
      return deferred.promise;
    }

}

/////////////////
// CONTROLLERS //
/////////////////

MainController.$inject = ["Account"]; // minification protection
function MainController (Account) {
  var vm = this;

  vm.currentUser = function() {
   return Account.currentUser();
  }

}


// ADD CSV DATA TO TABLE


function DataController($scope) {
  angular.element(document).ready(function () {

  var getTableAsArray = function(){
    var csvdata=[];
      $('#csv-table tr').each(function(indx,val){

        var rowdata={};
        csvdata.push(rowdata);
        $(this).children('td').each(function(i,v){
          var id = $('table th').eq($(this).index()).attr('id');
          if(id){
            rowdata[id] = $(v).html();
          }
        })
      })
    return csvdata;
    }


  var download = function(data){
    var csvContent = "data:text/csv;charset=utf-8,";

    data.forEach(function(infoArray, index){

      var array = $.map(infoArray, function(value, index) {
            return [value];
      });

      window.dataString = array;
      csvContent += index < data.length ? dataString+ "\n" : dataString;

      });

      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "data.csv");
      link.click();
    }

  $('#csv-file').on('change',function(){
     if (this.files.length) {
       Papa.parse(this.files[0], {
         complete: function(results) {

            $.each(results.data, function( index, value ) {
                var row = $('<tr>');

                $('#csv-table').append(row);
                $.each(value,function(i,v){
                    var col = $('<td>');
                    col.html(v);
                    row.append(col);
                   });
              });

              $('#csv-table').editableTableWidget();

          }
        });
      }
    })


  $('#export').click(function(){
    console.log("download");
    download(getTableAsArray());
  })


  $('#upload').click(function(){

    var csvdata = getTableAsArray();
    var data = {};
    data['leads'] = csvdata
    console.log(data);

    $.ajax({
     method: 'POST',
     url: '/api/leads',
     data: data,
     success: function(msg){
       $("table").find("tr:gt(0)").remove();
       for(i=0; i < msg.length; i++)
       $('table').append( msg[i] );
     }
    });


      $('#notification').html(csvdata.toString());

      });
    });

// SUPER LONG CODE THAT ALLOWS TABLE EDITS
$.fn.editableTableWidget=function(e){"use strict";return $(this).each(function(){var t,i=function(){var e=$.extend({},$.fn.editableTableWidget.defaultOptions);return e.editor=e.editor.clone(),e},n=$.extend(i(),e),o=37,r=38,s=39,d=40,a=13,h=27,l=9,f=$(this),c=n.editor.css("position","absolute").hide().appendTo(f.parent()),p=function(e){t=f.find("td:focus"),t.length&&(c.val(t.text()).removeClass("error").show().offset(t.offset()).css(t.css(n.cloneProperties)).width(t.width()).height(t.height()).focus(),e&&c.select())},u=function(){var e,i=c.val(),n=$.Event("change");return t.text()===i||c.hasClass("error")?!0:(e=t.html(),t.text(i).trigger(n,i),void(n.result===!1&&t.html(e)))},g=function(e,t){return t===s?e.next("td"):t===o?e.prev("td"):t===r?e.parent().prev().children().eq(e.index()):t===d?e.parent().next().children().eq(e.index()):[]};c.blur(function(){u(),c.hide()}).keydown(function(e){if(e.which===a)u(),c.hide(),t.focus(),e.preventDefault(),e.stopPropagation();else if(e.which===h)c.val(t.text()),e.preventDefault(),e.stopPropagation(),c.hide(),t.focus();else if(e.which===l)t.focus();else if(this.selectionEnd-this.selectionStart===this.value.length){var i=g(t,e.which);i.length>0&&(i.focus(),e.preventDefault(),e.stopPropagation())}}).on("input paste",function(){var e=$.Event("validate");t.trigger(e,c.val()),e.result===!1?c.addClass("error"):c.removeClass("error")}),f.on("click keypress dblclick",p).css("cursor","pointer").keydown(function(e){var t=!0,i=g($(e.target),e.which);i.length>0?i.focus():e.which===a?p(!1):17===e.which||91===e.which||93===e.which?(p(!0),t=!1):t=!1,t&&(e.stopPropagation(),e.preventDefault())}),f.find("td").prop("tabindex",1),$(window).on("resize",function(){c.is(":visible")&&c.offset(t.offset()).width(t.width()).height(t.height())})})},$.fn.editableTableWidget.defaultOptions={cloneProperties:["padding","padding-top","padding-bottom","padding-left","padding-right","text-align","font","font-size","font-family","font-weight","border","border-top","border-bottom","border-left","border-right"],editor:$("<input>")};

}




HomeController.$inject = ["$http"]; // minification protection
function HomeController ($http) {
  var vm = this;
  vm.posts = [];
  vm.new_post = {}; // form data

  $http.get('/api/posts')
    .then(function (response) {
      vm.posts = response.data;
    });

  vm.createPost = function() {
    $http.post('/api/posts', vm.new_post)
      .then(function (response) {
        vm.new_post = {};
        vm.posts.push(response.data);
      });
  };
}



LoginController.$inject = ["$location", "Account"]; // minification protection
function LoginController ($location, Account) {
  var vm = this;
  vm.new_user = {}; // form data

  vm.login = function() {
    Account
      .login(vm.new_user)
      .then(function(){
        vm.new_user = {}; // clear sign up form
        $location.path('/profile'); // redirect to '/profile'
      })
  };
}



SignupController.$inject = ["$location", "Account"]; // minification protection
function SignupController ($location, Account) {
  var vm = this;
  vm.new_user = {}; // form data

  vm.signup = function() {
    Account
      .signup(vm.new_user)
      .then(
        function (response) {
          vm.new_user = {}; // clear sign up form
          $location.path('/profile'); // redirect to '/profile'
        }
      );
  };
}



LogoutController.$inject = ["$location", "Account"]; // minification protection
function LogoutController ($location, Account) {
  Account
    .logout()
    .then(function () {
        $location.path('/login');
    });
}



ProfileController.$inject = ["$location", "Account"]; // minification protection
function ProfileController ($location, Account) {
  var vm = this;
  vm.new_profile = {}; // form data

  vm.updateProfile = function() {
    Account
      .updateProfile(vm.new_profile)
      .then(function () {
        vm.showEditForm = false;
      });
  };
}

//////////////
// Services //
//////////////

Account.$inject = ["$http", "$q", "$auth"]; // minification protection
function Account($http, $q, $auth) {
  var self = this;
  self.user = null;

  self.signup = signup;
  self.login = login;
  self.logout = logout;
  self.currentUser = currentUser;
  self.getProfile = getProfile;
  self.updateProfile = updateProfile;


// SIGNUP


  function signup(userData) {
    return (
      $auth
        .signup(userData) // signup (https://github.com/sahat/satellizer#authsignupuser-options)
        .then(
          function onSuccess(response) {
            $auth.setToken(response.data.token); // set token (https://github.com/sahat/satellizer#authsettokentoken)
          },

          function onError(error) {
            console.error(error);
          }
        )
    );
  }


  // LOGIN


  function login(userData) {
    return (
      $auth
        .login(userData) // login (https://github.com/sahat/satellizer#authloginuser-options)
        .then(
          function onSuccess(response) {
            $auth.setToken(response.data.token); // set token (https://github.com/sahat/satellizer#authsettokentoken)
          },

          function onError(error) {
            console.error(error);
          }
        )
    );
  }


  // LOGOUT


  function logout() {
    return (
      $auth
        .logout() // delete token (https://github.com/sahat/satellizer#authlogout)
        .then(function() {
          self.user = null;
        })
    );
  }

  function currentUser() {
    if ( self.user ) { return self.user; }
    if ( !$auth.isAuthenticated() ) { return null; }

    var deferred = $q.defer();
    getProfile().then(
      function onSuccess(response) {
        self.user = response.data;
        deferred.resolve(self.user);
      },

      function onError() {
        $auth.logout();
        self.user = null;
        deferred.reject();
      }
    )
    self.user = promise = deferred.promise;
    return promise;

  }

  function getProfile() {
    return $http.get('/api/me');
  }

  function updateProfile(profileData) {
    return (
      $http
        .put('/api/me', profileData)
        .then(
          function (response) {
            self.user = response.data;
          }
        )
    );
  }

}
