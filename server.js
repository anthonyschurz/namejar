// require express and other modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    hbs = require('hbs'),
    mongoose = require('mongoose'),
    auth = require('./resources/auth'),
    User = require('./models/user'),
    Post = require('./models/post'),
    google = require('google'),
    request = require('request'),
    cheerio = require('cheerio')

// require and load dotenv
require('dotenv').load();


// configure bodyParser (for receiving form data)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serve static files from public folder
app.use(express.static(__dirname + '/public'));

// set view engine to hbs (handlebars)
app.set('view engine', 'hbs');

// set up models
var db = require('./models');


/*
 * API Routes
 */

app.get('/api/me', auth.ensureAuthenticated, function (req, res) {
  User.findById(req.user, function (err, user) {
    res.send(user.populate('posts'));
  });
});


app.put('/api/me', auth.ensureAuthenticated, function (req, res) {
  User.findById(req.user, function (err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found.' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.save(function(err) {
      res.send(user.populate('posts'));
    });
  });
});


app.post('/api/leads', function (req, response) {
    console.log("posting to leads API")
    var linkedinarray = [];
    req.body.leads.forEach(function(lead){
      console.log(linkedinarray.length)
      // Google Scraper
      google.resultsPerPage = 5

      // var sites = ['linkedin', 'facebook', 'twitter']

      var query = "linkedin " + lead.firstName + " " + lead.lastName + " " + lead.location
      console.log(query)



      // request code
      sites = ['linkedin', 'facebook', 'twitter'];

      sites.forEach(function(entry) {
        console.log(entry);

        var requestQuery = "site%3A" + sites.this + "%20" + lead.firstName + "%20" + lead.lastName + "%20" + encodeURI(lead.location);

        request('http://www.bing.com/search?q=' + requestQuery, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            console.log(requestQuery);
            //scraper code here
          }
        });
      });





      google(query, function (err, res){
        if (err) console.error(err)

        var link = res.links[0];

        lead.linkedin = link.href

        var nameData = "<tr>" + "<td>" + lead.firstName + "</td>" + "<td>" + lead.lastName + "</td>" + "<td>" + lead.email + "</td>" + "<td>" + lead.location + "</td>" + "<td class='animated rubberBand'>" + "<a href='"+ lead.linkedin + "'>" + lead.linkedin + "</a>" + "</td>" + "</tr>";

        linkedinarray.push(nameData);


        if(req.body.leads.length == linkedinarray.length){
          response.send(linkedinarray);

        }
      });


      var newLead = new db.Lead({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        location: lead.location,
        linkedin: lead.linkedin
      });


      newLead.save(function(err){
        if(err) {
          res.status(500).send({message: err.message})
        }
      });

    });

  });


app.get('/api/leads', auth.ensureAuthenticated, function (req, res) {
    console.log("getting from leads API")
});

request('http://www.bing.com/search?q=anthony%20schurz%20linkedin', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(body);

       $(".b_factrownosep").each(function() {
           var link = $(this);
           var text = link.text();

           console.log(text);
       });
  }
});



/*
 * Auth Routes
 */

app.post('/auth/signup', function (req, res) {
  User.findOne({ email: req.body.email }, function (err, existingUser) {
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken.' });
    }
    var user = new User({
      displayName: req.body.displayName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    user.save(function (err, result) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.send({ token: auth.createJWT(result) });
    });
  });
});



app.post('/auth/login', function (req, res) {
  User.findOne({ email: req.body.email }, '+password', function (err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Invalid email or password.' });
    }
    user.comparePassword(req.body.password, function (err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Invalid email or password.' });
      }
      res.send({ token: auth.createJWT(user) });
    });
  });
});



/*
 * Catch All Route
 */
app.get('*', function (req, res) {
  res.render('index');
});


/*
 * Listen on localhost:3000
 */
app.listen(9000, function() {
  console.log('server started');
});
