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

const expectedDate = '2020-12-14';

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

	// Username
	await page.focus('#emailaddress');
	await page.keyboard.type(user);

	// Password
	await page.focus('#password')
	await page.keyboard.type(pass);

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

	// Wait for club selector to appear, then select it
	try {
		await page.waitForSelector('#btn_club_select', { timeout: 3000 });
	} catch (e) {
		console.log('Club options are not available yet');
		await browser.close();
    return;
	}
	await page.evaluate(() =>
		// document.querySelector('#club_2B31A274-170B-417E-A5E9-9DF8DA077331').click() // for testing
    document.querySelector('#club_9C656DA0-B0CB-4CE1-AA1D-DB97BFF31B7F').click()
  );
  

	// #### LOG / DEBUG
	if (debug === true){	
		log.info('2. Clubs appeared');	
		fs.writeFileSync(html_path + '_2_clubs_appeared_' + Math.floor(new Date() / 1000) + '.html', html);
		page.screenshot({path: screenshot_path + '_2_clubs_appeared_' + Math.floor(new Date() / 1000) + '.png'});	
	}
	// //#### LOG / DEBUG END


  // Select the date
	// const dateToday = new Date().toLocaleDateString('fr-CA'); // YYYY-MM-DD	
	try {
		await page.waitForSelector(`#date_${expectedDate}`, { timeout: 2000 });
	} catch (e) {
		console.log('Date expected is not available yet');
		await browser.close();
    return;
	}
  await page.evaluate((expectedDate) =>
    document.querySelector(`#date_${expectedDate}`).click()
  , expectedDate);
  
  	// #### LOG / DEBUG
	if (debug === true){	
		log.info('3. Time slots appeared');	
		fs.writeFileSync(html_path + '_3_time_slots_appeared_' + Math.floor(new Date() / 1000) + '.html', html);
    page.screenshot({path: screenshot_path + '_3_time_slots_appeared_' + Math.floor(new Date() / 1000) + '.png'});	
	}
	// //#### LOG / DEBUG END

  // Wait for all the time slots to show up and then click the earliest one
  try {
    await page.waitForSelector('.available-slots>.time-slot', { timeout: 2000 });
  } catch (e) {
		console.log('No time left');
		await browser.close();
    return;
  }
	const timeSlotButton = await page.evaluateHandle(() => document.querySelector('.available-slots>.time-slot'));
  const latestTime = await page.evaluateHandle(() => document.querySelector('.available-slots>.time-slot').dataset.slottime);
  const regex = RegExp(/at [7|8]:[0|3]0 AM/);
	if (!regex.test(latestTime)) {
		console.log('No time matched');
		await browser.close();
		return;
	}
	await timeSlotButton.click();

  //#### LOG / DEBUG
  if (debug === true) {
    log.info('4. Found and clicked on time slot');
    fs.writeFileSync(html_path + '_4_time_slot_clicked__' + Math.floor(new Date() / 1000) + '.html', html);
    page.screenshot({path: screenshot_path + '_4_time_slot_clicked__' + Math.floor(new Date() / 1000) + '.png'});
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