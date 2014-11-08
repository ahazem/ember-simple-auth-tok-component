(function(global) {
  var define = global.define;
  var require = global.require;
  var Ember = global.Ember;
  if (typeof Ember === 'undefined' && typeof require !== 'undefined') {
    Ember = require('ember');
  }

Ember.libraries.register('Ember Simple Auth Tok', '0.0.1-pre'); 

define("/simple-auth-tok/authenticators/tok", 
  ["simple-auth/authenticators/base","./../configuration","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Base = __dependency1__["default"];
    var Configuration = __dependency2__["default"];

    var Tok = Base.extend({
      serverAuthenticateEndpoint: '/login',
      serverInvalidateEndpoint: '/logout',
      modelName: 'user',
      tokenAttributeName: 'token',

      init: function() {
        this.serverAuthenticateEndpoint = Configuration.serverAuthenticateEndpoint;
        this.serverInvalidateEndpoint = Configuration.serverInvalidateEndpoint;
        this.modelName = Configuration.modelName;
        this.tokenAttributeName = Configuration.tokenAttributeName;
      },

      restore: function(properties) {
        var _this = this;
        var propertiesObject = Ember.Object.create(properties);

        return new Ember.RSVP.Promise(function(resolve, reject) {
          if(!Ember.isEmpty(propertiesObject.get(_this.tokenAttributeName))) {
            resolve(properties);
          } else {
            reject();
          }
        });
      },
      
      authenticate: function(credentials) {
        var _this = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
          var data = {};
          
          data[_this.modelName] = {
            email: credentials.identification,
            password: credentials.password
          };

          _this.executeRequest(data, 'POST', _this.serverAuthenticateEndpoint).then(function(response) {
            Ember.run(function() {
              resolve(response);
            });
          }, function(xhr, status, error) {
            Ember.run(function() {
              reject(xhr.responseJSON || xhr.responseText);
            });
          });
        });
      },

      invalidate: function(data) {
        var _this = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
          _this.executeRequest({}, 'DELETE', _this.serverInvalidateEndpoint).then(function(response) {
            Ember.run(function() {
              resolve(response);
            });
          }, function(xhr, status, error) {
            Ember.run(function() {
              reject(xhr.reponseJSON || xhr.responseText);
            });
          });
        });
      },

      executeRequest: function(data, type, url, resolve, reject) {
        return Ember.$.ajax({
          url: url,
          type: type, 
          data: data,
          dataType: 'json',
          beforeSend: function(xhr, settings) {
            xhr.setRequestHeader('Accept', settings.accepts.json);
          }
        });
      }
    });

    __exports__["default"] = Tok;
  });
define("/simple-auth-tok/authorizers/tok", 
  ["simple-auth/authorizers/base","./../configuration","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Base = __dependency1__["default"];
    var Configuration = __dependency2__["default"];

    var Tok = Base.extend({
      tokenAttributeName: 'token',

      init: function() {
        this.tokenAttributeName = Configuration.tokenAttributeName;
      },

      authorize: function(jqXHR, requestOptions) {
        var token = this.get('session').get(this.tokenAttributeName);

        if(this.get('session.isAuthenticated') && !Ember.isEmpty(token)) {
          jqXHR.setRequestHeader('Authorization', 'Token ' + this.tokenAttributeName + '="' + token + '"');
        }
      }
    });

    __exports__["default"] = Tok;
  });
define("/simple-auth-tok/configuration", 
  ["simple-auth/utils/load-config","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var loadConfig = __dependency1__["default"];

    var defaults = {
      serverAuthenticateEndpoint: '/login',
      serverInvalidateEndpoint: '/logout',
      modelName: 'user',
      tokenAttributeName: 'token'
    };

    var Configuration = {
      serverAuthenticateEndpoint: defaults.serverAuthenticateEndpoint,
      serverInvalidateEndpoint: defaults.serverInvalidateEndpoint,
      modelName: defaults.modelName,
      tokenAttributeName: defaults.tokenAttributeName,

      load: loadConfig(defaults)
    };

    __exports__["default"] = Configuration;
  });
define("/simple-auth-tok/ember", 
  ["./initializer"],
  function(__dependency1__) {
    "use strict";
    var Initializer = __dependency1__["default"];

    Ember.onload('Ember.Application', function(Application) {
      Application.initializer(Initializer);
    });
  });
define("/simple-auth-tok/initializer", 
  ["/simple-auth-tok/authenticators/tok","/simple-auth-tok/authorizers/tok","./configuration","simple-auth/utils/get-global-config","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Authenticator = __dependency1__["default"];
    var Authorizer = __dependency2__["default"];
    var Configuration = __dependency3__["default"];

    var getGlobalConfig = __dependency4__["default"];

    var Initializer = {
      name: 'simple-auth-tok',
      before: 'simple-auth',
      initialize: function(container, application) {
        Configuration.load(container, getGlobalConfig('simple-auth-tok'));

        container.register('simple-auth-authorizer:tok', Authorizer);
        container.register('simple-auth-authenticator:tok', Authenticator);
      }
    };

    __exports__["default"] = Initializer;
  });
})((typeof global !== 'undefined') ? global : window);
