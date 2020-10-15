module.exports = function(app, passport, db, multer, ObjectId) {

  // show the home page (will also have our login links)
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  // PROFILE PAGES =========================

  // client portal where clients can see their therapist match

  app.get('/clientprofile', isLoggedIn, function(req, res) {

    // mango: client = req.session.passport.user (user logged in)
    var clientId = req.session.passport.user

    // mango: search through users collection for all therapists in order to find match
    db.collection('users').find({
      "local.profiletype": "therapist"
    }).toArray((err, alltherapists) => {
      // mango: search messages collection for all messages to or from client (clientId variable declared above)
      db.collection('messages').find({
        $or: [{
            "from": clientId
          },
          {
            "to": clientId
          },
        ]
      }).toArray((err, messages) => {
        const myTherapistId = req.user.local.clientInfo.therapist
         //provides id of the therapist
        const myTherapist = alltherapists.find(therapist => therapist._id + "" === myTherapistId + "")
        console.log("/clientProfile, My Therapist is", myTherapist)
        if (err) return console.log(err)
        res.render('clientprofile.ejs', {
          // mango: keys we can use on ejs pages: contains all messages and all therapist documents
          user: req.user,
          messages: messages,
          allusers: alltherapists,
          myTherapist: myTherapist,
          therapistId : myTherapistId

        })
      })
    })
  });

  app.get('/listoftherapists', isLoggedIn, function(req, res) {

    // mango: client = req.session.passport.user (user logged in)
    var clientId = req.session.passport.user

    // mango: search through users collection for all therapists in order to find match
    db.collection('users').find({
      "local.profiletype": "therapist"
    }).toArray((err, alltherapists) => {
      // mango: search messages collection for all messages to or from client (clientId variable declared above)
      db.collection('messages').find({
        $or: [{
            "from": clientId
          },
          {
            "to": clientId
          },
        ]
      }).toArray((err, messages) => {
        if (err) return console.log(err)
        res.render('listoftherapists.ejs', {
          // mango: keys we can use on ejs pages: contains all messages and all therapist documents
          user: req.user,
          messages: messages,
          allusers: alltherapists
        })
      })
    })
  });


  // app.put('/listOfTherapist', (req, res) => {
  //     db.collection('messages')
  //     .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
  //       $set: {
  //
  //       }
  //     }, {
  //       sort: {_id: -1},
  //       upsert: true
  //     }, (err, result) => {
  //       if (err) return res.send(err)
  //       res.send(result)
  //     })
  //   } else if((req.body.thumbDown == "yes") && (req.body.value!=0)){
  //     db.collection('messages')
  //     .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
  //     $set: {
  //       thumbUp: req.body.thumbUp,
  //       thumbDown: req.body.thumbDown,
  //       value: req.body.value -1
  //     }
  //   }, {
  //     sort: {_id: -1},
  //     upsert: true
  //   }, (err, result) => {
  //     if (err) return res.send(err)
  //     res.send(result)
  //     })
  //   }
  // })





  // mango: load therapist profile page where they can change info and view list of all their clients
  // mango: search users collection for local.profiletype: 'client' and return all documents as result
  // mango: in therapistprofile.ejs, we loop through all the client documents and check if client id is in therapistClients Array
  app.get('/therapistprofile', isLoggedIn, function(req, res) {
    db.collection('users').find({
      "local.profiletype": "client"
    }).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('therapistprofile.ejs', {
        user: req.user,
        clients: result
      })
    })
  });

  // mango: when therapist click on their client's names, they will each individually generate a page using their id as a parameter. it will load client's information and messages between them and client only

  app.get('/profile/:client', isLoggedIn, function(req, res) {

    var clientId = ObjectId(req.params.client)
    // mango: search through users collection for client document to access other info like their name, location, etc.
    db.collection('users').find({
      "_id": clientId
    }).toArray((err, clientInfo) => {
      // mango: search through messages collection for messages to or from client
      db.collection('messages').find({
        $or: [{
            "from": req.params.client
          },
          {
            "to": req.params.client
          },
        ]
      }).toArray((err, messages) => {
        if (err) return console.log(err)
        res.render('profile.ejs', {
          user: req.user,
          messages: messages,
          clientInfo: clientInfo
        })
      })
    })
  });

  // mango: updates therapist information when they edit info on therapistprofile.ejs (request body is coming from JSON in therapistprofile.js)
  app.put('/saveUserInfo', (req, res) => {
    db.collection('users')
      .findOneAndUpdate({
        'local.email': req.body.email
      }, {
        $set: {
          'local.name': req.body.name,
          'local.phone': req.body.phone,
          'local.therapistInfo.bio': req.body.bio,
          'local.therapistInfo.location': req.body.location
        }
      }, {
        sort: {
          _id: -1
        },
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  // mango: adds the therapist's id to CLIENT'S document stored as 'local.clientInfo.therapist' Object
  app.put('/addTherapist', (req, res) => {
    var uId = ObjectId(req.body.clientId)
    db.collection('users')
      .findOneAndUpdate({
        '_id': uId
      }, {
        $set: {
          'local.clientInfo.therapist': req.body.therapistId
        }
      }, {
        sort: {
          _id: -1
        },
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })


  app.put('/deleteClient', (req, res) => {
    var uId = req.body.clientId
    var therapistId = ObjectId(req.body.currentTherapistId)
    db.collection('users')
      .findOneAndUpdate({
        '_id': therapistId
      }, {
        $pull: {
          'local.therapistClients': uId
        }
      }, {
        sort: {
          _id: -1
        },
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  // mango: adds the clients's id to THERAPISTS'S document stored in 'local.therapistClients' Array
  app.put('/addClient', (req, res) => {
    var uId = ObjectId(req.body.therapistId)
    db.collection('users')
      .findOneAndUpdate({
        '_id': uId
      }, {
        $addToSet: {
          'local.therapistClients': req.body.clientId
        }
      }, {
        sort: {
          _id: -1
        },
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  // mango: date variables to send along with messages
  var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var today = new Date();
  var day = today.getDay()
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  var date = daysOfWeek[day] + " " + mm + '/' + dd + '/' + yyyy;
  var time = today.toLocaleTimeString('en-US')

  // mango: post when client sends messages to therapists
  // mango: datetime is stored to sort messages by date in ejs and display in order sent / received
  // mango: date and time is for nice display

  app.post('/clientMessage', (req, res) => {
    db.collection('messages').save({
      from: req.body.clientId,
      to: req.body.therapistId,
      dateTime: today,
      date: date,
      time: time,
      message: req.body.message
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('clientMessage saved to database', req.body.clientId, req.body.therapistId, req.body.message )
      res.redirect('/clientprofile')
    })
  })

  // mango: post when therapists sends messages to client

  app.post('/therapistMessage', (req, res) => {
    db.collection('messages').save({
      from: req.body.therapistId,
      to: req.body.clientId,
      dateTime: today,
      date: date,
      time: time,
      message: req.body.message
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database', req.body.clientId, req.body.therapistId, req.body.message )
      res.redirect(`/profile/${req.body.clientId}`)
    })
  })



  //---------------------------------------
  // IMAGE CODE
  //---------------------------------------

  // mango: utilizes npm package multer to upload photos

  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
  });
  var upload = multer({
    storage: storage
  });
  app.post('/uploadProPic', upload.single('file-to-upload'), (req, res, next) => {
    insertDocuments(db, req, 'images/uploads/' + req.file.filename, () => {
      res.redirect('/therapistprofile')
    });
  });
  var insertDocuments = function(db, req, filePath, callback) {
    var collection = db.collection('users');
    var uId = ObjectId(req.session.passport.user)
    collection.findOneAndUpdate({
      "_id": uId
    }, {
      $set: {
        "local.profileImg": filePath
      }
    }, {
      sort: {
        _id: -1
      },
      upsert: false
    }, (err, result) => {
      if (err) return res.send(err)
      callback(result)
    })
  }


  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // search query to find therapist by zipcode
  // app.get('/search?apple&oranges', function(req, res) { // ask soemone about proper search query
  //   let specialty = req.params.oranges
  //   let zipcode = req.params.apple
  //   db.collection('surveyAns').find({
  //     zipcode: req.body.zipcode,
  //     specialty: req.body.specialty,
  //     accountType: 'therapist'
  //   }).toArray((err, result) => {
  //     if (err) return console.log(err)
  //     res.render('search.ejs', {
  //       listOfTherapist: result
  //     })
  //   })
  // });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/clientprofile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));


  app.get('/index', function(req, res) {
    res.render('index.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  app.post('/index', passport.authenticate('local-login', {
    successRedirect: '/index.ejs', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.get('/therapistlogin', function(req, res) {
    res.render('therapistlogin.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  app.post('/therapistlogin', passport.authenticate('local-login', {
    successRedirect: '/therapistprofile', // redirect to the secure profile section
    failureRedirect: '/therapistlogin', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));


  // SIGNUP =================================
  // show the signup form
  app.get('/signupClient', function(req, res) {
    res.render('signupClient.ejs', {
      message: req.flash('signupMessage')
    });
  });

  app.get('/signupTherapist', function(req, res) {
    res.render('signupTherapist.ejs', {
      message: req.flash('signupMessage')
    });
  });



  // process the signup form
  app.post('/signupTherapist', passport.authenticate('local-signup', {
    successRedirect: '/therapistprofile', // redirect to the secure profile section
    failureRedirect: '/signupTherapist', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.post('/signupClient', passport.authenticate('local-signup', {
    successRedirect: '/clientprofile', // redirect to the secure profile section
    failureRedirect: '/signupClient', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));







  // check input type, name should be the same on the route.js question1 : req.body.question1 -->
  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });



  // route middleware to ensure user is logged in
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();

    res.redirect('/');
  }
}
