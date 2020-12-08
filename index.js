const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
// const {installMouseHelper} = require('./extras/install_mouse_helper');
puppeteer.use(pluginStealth())

// Debugging stuff
const html_path = 'htmls/bot_';
const screenshot_path = 'screenshots/bot_';
const SimpleNodeLogger = require('simple-node-logger'),
	opts = {
		logFilePath: 'logs/' + 'bot.log',
		timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
	};
let html = '';


// ####################################
// ####################################
// Parameters to set

// user/pass: the email/username for your Nike.com account
const user = 'hanszhang28@hotmail.com';
const pass = 'Xf2w!BWquj6Cr.u';

const url = 'https://myfit4less.gymmanager.com/portal/login.asp';

const hasTime = false;

// debug: Use debug/logging features?
// Includes writing updates to log file, writing html snapshots, and taking screenshots
const debug = false;


// ####################################
// ####################################
// main flow
(async () => { 

	const browser = await puppeteer.launch({
		ignoreHTTPSErrors: true,
		headless: false
	});

	const page = await browser.newPage();

	if (debug === true){
		// await installMouseHelper(page); // Makes mouse visible

		var dir = './htmls';
		if (!fs.existsSync(dir)){
			fs.mkdirSync(dir);
		}
		dir = './screenshots';
		if (!fs.existsSync(dir)){
			fs.mkdirSync(dir);
		}
		dir = './logs';
		if (!fs.existsSync(dir)){
			fs.mkdirSync(dir);
		}

		log = SimpleNodeLogger.createSimpleFileLogger( opts );
		log.setLevel('info');

	}

	await page.goto(url);
  page.waitForNavigation({ waitUntil: 'networkidle0' }); // Wait for page to finish loading

  // Login
	await page.waitForSelector('#emailaddress');
	await page.waitFor(100);

	// Username
	await page.focus('#emailaddress');
	await page.keyboard.type(user);
	await page.waitFor(200);

	// Password
	await page.focus('#password')
	await page.keyboard.type(pass);
	await page.waitFor(200);

	// Submit
	await page.evaluate(() =>
		document.querySelector('#loginButton').click()
	);

	//#### LOG / DEBUG
	if (debug === true) {
		log.info('1. Logged in');
		html = await page.content();
		fs.writeFileSync(html_path + '_1_logged_in__' + Math.floor(new Date() / 1000) + '.html', html);
		page.screenshot({path: screenshot_path + '_1_logged_in_' + Math.floor(new Date() / 1000) + '.png'});
	}
	//#### LOG / DEBUG END

	await page.waitFor(100);

	// Wait for club selector to appear, then select it
	await page.waitForSelector('#btn_club_select');
	await page.evaluate(() =>
    // document.querySelector('#club_2B31A274-170B-417E-A5E9-9DF8DA077331').click() for testing
    document.querySelector('#club_9C656DA0-B0CB-4CE1-AA1D-DB97BFF31B7F').click()
  );
  

	// #### LOG / DEBUG
	if (debug === true){	
		log.info('2. Clubs appeared');	
		fs.writeFileSync(html_path + '_2_clubs_appeared_' + Math.floor(new Date() / 1000) + '.html', html);
		page.screenshot({path: screenshot_path + '_2_clubs_appeared_' + Math.floor(new Date() / 1000) + '.png'});	
    await page.waitFor(100);
	}
	// //#### LOG / DEBUG END



  // Select the date
  // TODO: select the date that are expected
	await page.waitForSelector('#date_2020-12-10');
  await page.evaluate(() =>
    document.querySelector('#date_2020-12-10').click()
  );
  
  	// #### LOG / DEBUG
	if (debug === true){	
		log.info('3. Time slots appeared');	
		fs.writeFileSync(html_path + '_3_time_slots_appeared_' + Math.floor(new Date() / 1000) + '.html', html);
    page.screenshot({path: screenshot_path + '_3_time_slots_appeared_' + Math.floor(new Date() / 1000) + '.png'});	
    await page.waitFor(100);
	}
	// //#### LOG / DEBUG END

  // Wait for all the time slots to show up and then click the earliest one
  try {
    await page.waitForSelector('.available-slots>.time-slot');
  } catch (e) {
		console.log('No time left');
		await browser.close();
    return;
  }
  const timeSlotButton = await page.evaluateHandle(() => document.querySelector('.available-slots>.time-slot'));
  await timeSlotButton.click();
  // const latestTime = document.querySelector('.available-slots>.time-slot').dataset.slottime;
  // const regex = RegExp('at 7:00 AM');
  // hasTime = latestTime && regex.test(latestTime);
  // console.log('has Time');
  // console.log(hasTime);

  //#### LOG / DEBUG
  if (debug === true) {
    log.info('4. Found and clicked on time slot');
    fs.writeFileSync(html_path + '_4_time_slot_clicked__' + Math.floor(new Date() / 1000) + '.html', html);
    page.screenshot({path: screenshot_path + '_4_time_slot_clicked__' + Math.floor(new Date() / 1000) + '.png'});
    await page.waitFor(100);
  }
  // //#### LOG / DEBUG END

  // Click the Yes button in the confirmation window
	await page.waitForSelector('#dialog_book_yes')
	await page.evaluate(() =>
		document.querySelector('#dialog_book_yes').click()
	);
	console.log('Get it!!!');
	await browser.close();
})();