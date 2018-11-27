require('dotenv').config();

// Required Modules
const express = require('express');
const app = express();
const helmet = require('helmet');
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const db = require('./models/db');

app.use(
	session({
		store: new pgSession({
			pgPromise: db
		}),
		secret: 'bingbong0987654321234567890',
		saveUninitialized: false,
		cookie: {
			maxAge: 30 * 24 * 60 * 60 * 1000
		}
	})
);

// Views and CSS
app.use(express.static('public'));
const coverPage = require('./views/coverPage');
const page = require('./views/page');
const helper = require('./views/helper');
const registerForm = require('./views/registerForm');
const loginForm = require('./views/loginForm');
const homePage = require('./views/home');
const addReminder = require('./views/addReminder');
const editReminder = require('./views/editReminder');
const reminderList = require('./views/reminderList');
const mapList = require('./views/mapList');

// Model Variables
const User = require('./models/User');
const Location = require('./models/Location');
const Init_Reminder = require('./models/Init_Reminder');
const Reminder = require('./models/Reminder');

function protectRoute(req, res, next) {
	let isLoggedIn = req.session.user ? true : false;
	if (isLoggedIn) {
		next();
	} else {
		res.redirect('/login');
	}
}

app.use((req, res, next) => {
	let isLoggedIn = req.session.user ? true : false;
	console.log(req.session.user);
	console.log(`On ${req.path}, is a user logged in? ${isLoggedIn}`);

	next();
});

app.get('/', (req, res) => {
	const coverPg = coverPage();
	res.send(coverPg);
});

// ========================================================
// Register
// ========================================================
app.get('/register', (req, res) => {
	const theForm = registerForm();
	// const thePage = page(theForm);
	res.send(theForm);
});

app.post('/register', (req, res) => {
	console.log(req.body);
	const newName = req.body.name;
	const newUsername = req.body.username;
	const newPassword = req.body.password;
	const newPhone = req.body.phone_number;
	User.createUser(newName, newUsername, newPassword, newPhone)
		.catch((err) => {
			console.log(err);
			res.redirect('/register');
		})
		.then((newUser) => {
			req.session.user = newUser;
			res.redirect('/home');
		});
});

app.get('/home', protectRoute, (req, res) => {
	const theHome = homePage();
	const thePage = page(theHome);
	res.send(thePage);
});
// ========================================================
// Login (working)
// ========================================================

app.get('/login', (req, res) => {
	console.log(req.session.user);
	// Send login form
	const theLogin = loginForm();
	// const thePage = page(theLogin);
	res.send(theLogin);
});

app.post('/login/', (req, res) => {
	const theUserName = req.body.username;
	const thePassword = req.body.password;
	User.getByUserName(theUserName)
		.catch((err) => {
			console.log(err);
			res.redirect('/login');
		})
		.then((theUser) => {
			if (theUser.passwordDoesMatch(thePassword)) {
				req.session.user = theUser;
				res.redirect('/home');
			} else {
				res.redirect('/login');
			}
		});
});
// ========================================================

// ========================================================
// Create Reminders (working)
// ========================================================
app.post('/createreminder', (req, res) => {
	console.log(req.session.user);
	console.log(req.body);
	const newLatitude = req.body.latitude;
	const newLongitude = req.body.longitude;
	Location.createLocation(newLatitude, newLongitude)
		.then((result) => {
			return { locationID: result };
		})
		.then((result) => {
			console.log(User.from);
			const r = User.from(req.session.user);
			console.log(r);
			const newReminder = req.body.reminder;
			const isPublic = Object.keys(req.body).includes('is_public');
			const locationID = result.locationID;
			const userID = r.id;
			Reminder.createReminder(newReminder, isPublic, locationID, userID).then((reminder) => {
				// console.log(reminder);
				// res.send(reminder);
				res.redirect(`/mylist`);
			});
		});
});

app.get('/create', (req, res) => {
	res.send(page(addReminder()));
});

// ========================================================
// Update Reminders (not working)
// ========================================================
app.post('/mylist/:id(\\d+)', (req, res) => {
	Reminder.getById(req.params.id).then((theReminder) => {
		theReminder
			.updateReminder(req.body.reminder, req.body.is_public, req.body.latitude, req.body.longitude)
			.then((reminderUpdated) => {
				res.redirect(`/mylist`);
			});
	});
});

app.get('/mylist/:id(\\d+)/edit', (req, res) => {
	Reminder.getReminderForUpdate(req.params.id).then((theReminder) => {
		console.log(theReminder);
		res.send(page(editReminder(theReminder)));
	});
});
// ========================================================

// ========================================================
// List Session User's Reminders (working)
// ========================================================
app.get('/mylist', protectRoute, (req, res) => {
	const theUser = User.from(req.session.user);

	// theUser.getReminders().then(allReminders => {
	//     res.send(page(reminderList(allReminders)));
	// });
	Reminder.getRemindersUser(theUser.id).then((UserReminders) => {
		res.send(page(reminderList(UserReminders)));
	});
});
// ========================================================

// ========================================================
// List Public Reminders (working)
// ========================================================
app.get('/publiclist', protectRoute, (req, res) => {
	//const publicList = Reminder.getRemindersPublic();
	// console.log('look at me!', publicList);
	//publicList.then(PublicReminders => {
	Reminder.getRemindersPublic().then((PublicReminders) => {
		res.send(page(mapList(PublicReminders)));
	});
});
// ========================================================

// ========================================================
// View Reminder by ID (working)
// ========================================================
app.get('/myreminders/:id([0-9]+)', (req, res) => {
	Reminder.getById(req.params.id).then((remind) => {
		res.send(remind);
	});
});
// ========================================================

// ========================================================
// View All Reminders (working)
// ========================================================
app.get('/myreminders/', (req, res) => {
	Reminder.getAll(req.params.id).then((allReminders) => {
		res.send(allReminders);
	});
});
// ========================================================

// ========================================================
// Delete Reminder by ID (working)
// ========================================================

app.get('/delete/:id(\\d+)', (req, res) => {
	Reminder.getById(req.params.id).then((theReminder) => {
		Location.deleteById(theReminder.location_id).then((delReminderByID) => {
			res.redirect(`/mylist`);
		});
	});
});
// ========================================================

// ========================================================
// Update Reminder by ID (working)
// ========================================================

app.post('/reminders/:id(\\d+)', (req, res) => {
	Reminder.getById(req.params.id).then((theReminder) => {
		theReminder.updateReminder(req.body.reminder).then((reminderUpdated) => {
			res.send(reminderUpdated);
		});
	});
});
// ========================================================

// ========================================================
// Signout / Kill User Session
// ========================================================
app.post('/logout', (req, res) => {
	// 1. destroy the session
	req.session.destroy(() => {
		req.session = null;
		res.redirect('/login');
	});
	// 2. redirect them to the home page
});
// ========================================================

// ========================================================
// Initiate and Receive Reminders via SMS (IFTTT & Twilio)
// ========================================================

app.post('/sms', (req, res) => {
	const twiml = new MessagingResponse();

	console.log('===body.BODY=== :', req.body.Body);

	// check if this is the initial message or a reply message
	if (req.body.Body.startsWith('{"task":"')) {
		// initial message from IFTTT
		// Body will be a JSON obj in a string, so need to parse it
		let bod = JSON.parse(req.body.Body); // bod is an object of key/val pairs
		console.log(bod);
		twiml.message(
			{ to: `${bod.phone}` },
			`${bod.task} GeoMindr for lat/lon ${bod.lat}/${bod.lon}.\nWhat is your GeoMindr?`
		);

		let timeStamp = new Date().getTime();
		// insert the new request in init_reminders while awaiting the reminder text
		Init_Reminder.createInit(bod.phone, bod.lat, bod.lon, timeStamp).then((init_rem) => {
			//console.log('INSERTED: ', init_rem);
			console.log('=======TWIML=========');
			console.log(twiml.toString());
			res.writeHead(200, { 'Content-Type': 'text/xml' });
			res.end(twiml.toString());
		});
	} else {
		// This is a reply message.
		// Search for the phone number in init_reminders.
		// If it exists and hasn't expired, then append the geomindr text to that info and insert in reminders table.
		// If it doesn't exist, then reply telling user to click the IFTTT button to trigger new request.
		const phone = req.body.From.replace('+1', ''); //need to correct this to handle intl phones
		Init_Reminder.getByPhone(phone).then((result) => {
			// check if phone number was not found or entry is expired
			let minTimeStamp = new Date().getTime() - 300000;
			if (result.id === 'not initiated' || result.time_stamp < minTimeStamp) {
				// IFTTT button wasn't pressed or it timed out
				twiml.message(`Request expired or does not exist - Please tap the IFTTT Button to restart`);
				res.writeHead(200, { 'Content-Type': 'text/xml' });
				res.end(twiml.toString());
			} else {
				//phone exists in init_reminders, so delete the entry from init_reminders
				result.deleteInit();

				// then, insert the new Geomindr into the reminders table
				Location.createLocation(result.lat, result.lon)
					.then((a) => {
						return { locationID: a };
					})
					.then((b) => {
						User.getByPhone(phone)
							.then((c) => {
								b.userID = Number(c);
								return b;
							})
							.then((d) => {
								//console.log(d);
								const newReminder = req.body.Body;
								Reminder.createReminder(newReminder, true, d.locationID, d.userID).then((geomindr) => {
									console.log('+++GEOMINDR+++: ', geomindr.reminder);
									// reply message received with Geomindr body
									twiml.message(`New GeoMindr recorded: ${geomindr.reminder}`);
									res.writeHead(200, {
										'Content-Type': 'text/xml'
									});
									res.end(twiml.toString());
								});
							});
					});
			}
		});
	}
});

// ========================================================

// ========================================================
// Delete Init_Reminder after 5min (working)
// ========================================================

// app.delete('/init_reminders/:id(\\d+)', (req, res) => {
//     Init_Reminder.deleteAfterNoResponse(req.params.id, () => {
//         res.send('there was no response.');
//     });
// });

// ========================================================

// ========================================================
// View Location by ID (working)
// ========================================================
// app.get('/locations/:id([0-9]+)', (req, res) => {
//     Location.getById(req.params.id).then(location => {
//         res.send(location);
//     });
// });
// ========================================================

// ========================================================
// Delete Location by ID (working)
// ========================================================
// app.delete('/locations/:id(\\d+)', (req, res) => {
//     Location.getById(req.params.id).then(theLocation => {
//         theLocation.deleteById(req.params.id).then(delLocationByID => {
//             res.send(delLocationByID);
//         });
//     });
// });
// ========================================================

// ========================================================
// Get All Users (working)
// ========================================================

// app.get('/users', (req, res) => {
//     User.getAll().then(allUsers => {
//         res.send(allUsers);
//     });
// });

// ========================================================

// ========================================================
// Get User by Phone (working)
// ========================================================

// app.get('/phone/:phone_number', (req, res) => {
//     User.getByPhone(req.params.phone_number).then(name => {
//         res.send(name);
//     });
// });

// ========================================================

// ========================================================
// Get User by ID (working)
// ========================================================

// app.get('/users/:id(\\d+)', (req, res) => {
//     User.getById(req.params.id).then(user => {
//         res.send(user);
//     });
// });

// ========================================================

// ========================================================
// Get User by Username (working)
// ========================================================

// app.get('/users/:username', (req, res) => {
//     User.getByUserName(req.params.username).then(username => {
//         res.send(username);
//     });
// });
// ========================================================

// ========================================================
// Update User's Name (working)
// ========================================================

// app.post('/users/:id(\\d+)', (req, res) => {
//     User.getById(req.params.id).then(theUser => {
//         theUser.updateName(req.body.name).then(nameUpdated => {
//             res.send(nameUpdated);
//         });
//     });
// });

// ========================================================

// ========================================================
// Delete User (working)
// ========================================================

// app.delete('/users/:id(\\d+)', (req, res) => {
//     User.getById(req.params.id).then(theUser => {
//         theUser.delete().then(delUser => {
//             res.send(delUser);
//         });
//     });
// });

// ========================================================

app.listen(3000, () => {
	console.log('express app is ready.');
});
