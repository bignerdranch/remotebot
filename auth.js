var passport = require('passport');
var Session = require('express-session');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var CLIENT_ID = process.env.GOOGLE_OAUTH_ID;
var CLIENT_SECRET = process.env.GOOGLE_OAUTH_SECRET;
var CLIENT_CALLBACK = process.env.GOOGLE_OAUTH_CALLBACK;
var DOMAIN = process.env.GOOGLE_DOMAIN;
var SESSION_SECRET = process.env.SESSION_SECRET;
var API_TOKEN = process.env.API_TOKEN;

module.exports = (app) => {
  passport.use(new GoogleStrategy({
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CLIENT_CALLBACK
    },
    (accessToken, refreshToken, profile, done) => {
      var domain = profile._json.domain;
      if (domain === DOMAIN) {
        var email = profile.emails[0].value;
        done(null, { email });
      } else {
        done(new Error('Invalid host domain'));
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  var sessionParser = Session({
    name: 'remotebot.sid',
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  });

  app.verifyClient = ({ req }, done) => {
    sessionParser(req, {}, () => {
      var session = req.session.passport;
      var hasSession = session && session.user;

      var httpAuth = req.headers.authorization;
      var hasToken = false;
      if (httpAuth) {
        var [, token] = httpAuth.match(/^Token token="(\w+)"$/i);
        hasToken = token === API_TOKEN;
      }

      done(hasSession || hasToken);
    });
  };

  app.use(sessionParser);
  app.use(passport.initialize());
  app.use(passport.session());

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    res.redirect('/auth/google');
  }

  app.get('/', ensureAuthenticated);

  app.get('/auth/google',
      passport.authenticate('google', {
        scope: ['email', 'profile']
      }));

  app.get('/auth/google/callback',
      passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
      }));
};
