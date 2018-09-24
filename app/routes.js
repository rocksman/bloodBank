var User = require('../app/models/users');
var Blood = require('../app/models/blood');
var Donor = require('../app/models/donors');

module.exports = function (app, passport) {

    app.get('/getBlood', (req, res) => {
        Blood.find({}, { "blood": 1, "_id": 0 }).sort({ "blood.bloodType": 1 }).exec(
            function (err, data) {
                if (err)
                    res.send({ success: false, msg: "Database error" });
                console.log(data);
                res.send({ success: true, msg: data })
            })
    })

    app.get('/getUsers', (req, res) => {
        User.find({}, { "local.email": 1, "_id": 0 },
            function (err, result) {
                if (err)
                    res.send({ success: false, msg: "Database error" });
                res.send({ success: true, msg: result });
            })
    })

    app.post('/login', function (req, res) {
        console.log(req.body);
        User.findOne({
            "local.email": req.body.email
        }, function (err, user) {
            if (err) throw err;
            console.log(user);
            if (!user) {
                res.send({ success: false, msg: 'Authentication failed. User not found.' });
            } else {
                // check if password matches
                if (user.validPassword(req.body.password)) {
                    res.json({ success: true, msg: "successfully logged in", user: user.local });
                } else {
                    res.send({ success: false, msg: 'Authentication failed. Wrong password.' });
                }
            }
        });

    });

    app.post('/addUser', (req, res, next) => {
        console.log("Signup");
        var newUser = new User();
        newUser.local.name = req.body.name;
        newUser.local.email = req.body.email;
        newUser.local.password = newUser.generateHash(req.body.password);
        newUser.local.role = req.body.roles;
        // save the user
        newUser.save(function (err) {
            if (err) {
                return res.json({ success: false, msg: 'Username already exists.' });
            }
            res.json({ success: true, msg: 'Successful created new user.', user: newUser.local });
        });

    });
    app.post('/addDonors', (req, res) => {
        var donors = req.body;
        function forLoop(i) {
            var nDonor = new Donor();
            var newBlood = new Blood();
            nDonor.donor.name = donors[i].name;
            nDonor.donor.age = donors[i].age;
            nDonor.donor.height = donors[i].height;
            nDonor.donor.gender = donors[i].gender;
            nDonor.donor.bloodType = donors[i].bloodType;
            nDonor.save((err) => {
                if (err)
                    res.send({ success: false, msg: "Couldn't add data to database" });
                Blood.find({ "blood.bloodType": donors[i].bloodType },
                    function (error, result) {
                        if (error) {
                            res.send({ success: false, msg: "Couldn't add data to database" });
                        }
                        console.log(result.length);
                        if (result.length != 0) {
                            Blood.updateOne({ "blood.bloodType": donors[i].bloodType }, { $inc: { "blood.amount": 1 } },
                                function (err) {
                                    if (err) {
                                        res.send({ success: false, msg: "Couldn't add data to database" });
                                    }
                                })
                        }
                        else {
                            newBlood.blood.bloodType = donors[i].bloodType;
                            newBlood.blood.amount = 1;
                            newBlood.save((err) => {
                                if (err)
                                    res.send({ success: false, msg: "Couldn't add data to database" });
                            })
                        }
                    })
            });
            i++;
            if (i < donors.length-1) {
                forLoop(i);
            }
            else{
                res.send({ success: true, msg: "Successfully added to the database" });
            }
        }
        if(donors.length!=0)
            forLoop(0)
        else
            res.send({ success: false, msg: "No data to add" });
    })
    app.post('/newDonor', (req, res) => {
        var nDonor = new Donor();
        var newBlood = new Blood();
        nDonor.donor.name = req.body.name;
        nDonor.donor.age = req.body.age;
        nDonor.donor.height = req.body.height;
        nDonor.donor.gender = req.body.gender;
        nDonor.donor.bloodType = req.body.bloodType;
        nDonor.save((err) => {
            if (err)
                res.send({ success: false, msg: "Couldn't add data to database" });
            Blood.find({ "blood.bloodType": req.body.bloodType },
                function (error, result) {
                    if (error) {
                        res.send({ success: false, msg: "Couldn't add data to database" });
                    }
                    console.log(result.length);
                    if (result.length != 0) {
                        Blood.updateOne({ "blood.bloodType": req.body.bloodType }, { $inc: { "blood.amount": 1 } },
                            function (err) {
                                if (err) {
                                    res.send({ success: false, msg: "Couldn't add data to database" });
                                }
                                res.send({ succes: true, msg: "Successfully added" })
                            })
                    }
                    else {
                        console.log("Hello from blood")
                        newBlood.blood.bloodType = req.body.bloodType;
                        newBlood.blood.amount = 1;
                        newBlood.save((err) => {
                            if (err)
                                res.send({ success: false, msg: "Couldn't add data to database" });
                            res.send({ succes: true, msg: "Successfully added" })
                        })
                    }
                })
        });
    })
    app.post('/retrieve', (req, res) => {
        Blood.findOne({ "blood.bloodType": req.body.bloodType },
            function (error, result) {
                if (error) {
                    res.send({ success: false, msg: "Couldn't add data to database" });
                }
                else if(result.blood.amount<req.body.amount)
                    res.send({ success: false, msg: "Not enough blood" });
                else if (result.length != 0) {
                    Blood.updateOne({ "blood.bloodType": req.body.bloodType }, { $inc: { "blood.amount": -req.body.amount } },
                        function (err) {
                            if (err) {
                                res.send({ success: false, msg: "Couldn't add data to database" });
                            }
                            res.send({ succes: true, msg: "Successfully added" })
                        })
                }
                else {
                    res.send({ succes: false, msg: "No blood" })
                }
            })
    })
}