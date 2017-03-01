import { Component } from '@angular/core';
import { Locker } from 'angular-safeguard';
import { SessionService } from 'angular2-tryton';
import { NavController } from 'ionic-angular';

import { TranslateService } from 'ng2-translate';
import { TrytonProvider } from '../providers/tryton-provider'
import { EncodeJSONRead } from '../json/encode-json-read'
// Models
import { User, UserSession } from '../../models/interfaces/user';
import { Party } from '../../models/interfaces/party'
import { Location } from '../../models/interfaces/location'

@Component({
	selector: 'page-tryton-login',
	templateUrl: 'login.html',
})
/**
 * Login class for tryton.
 * This class will log the user in the system and store the necessary data to
 * continue working
 */
export class TrytonLoginPage {

    user: User;
    user_session: UserSession;
    party_response: Party[];
    location_response: Location[];
    driver = this.locker.useDriver(Locker.DRIVERS.LOCAL)
		database: string = ''
		title: string = '';

	constructor(
		public session_service : SessionService,
		public locker : Locker,
		public tryton_provider: TrytonProvider,
    public navCtrl: NavController,
		public translate: TranslateService,
		) {
      translate.setDefaultLang('en');
    }

  /**
   * Initialize the login page
   */
	ionViewDidLoad() {
    	console.log('Login screen');
			console.log()
        if (this.locker.get('sessionId')){
            this.user_session = {
                userId: this.locker.get('userId'),
                sessionId: this.locker.get('sessionId'),
            }
          	this.get_user_data();
        }
    }

  /**
   * Logs the user into the system
   * @param {event}  event    Name of the event (form submit in this case)
   * @param {string} username username of the user
   * @param {string} password password of the user
   */
	public login(event, username: string, password: string) {
		console.log("Starting loggin procedure")
		this.session_service.doLogin(this.database, username, password)
		.subscribe(
  		data => {
        if (data.constructor.name == "ErrorObservable"){
          alert("Incorrect username or password");
          console.log("An error ocurred");
          return;
        }
  			console.log("Login correct", data);
  			this.user_session = data;
  			this.user_session.database = this.database;
			  console.log("User session", this.user_session);
			  this.get_user_data();
		  },
		  err => {
			  alert("Incorrect username or password")
			  console.log("Incorrect username or password", err)
		  },
		  () => {
			  console.log("Completed!")
		  })
  }

  /**
   * Gets the following data from the current user:
   * name, employee, employee party and language
   */
	public get_user_data(){
		console.log("Getting user data for session")

    let json_constructor = new EncodeJSONRead;
    let userId = Number(this.user_session.userId);
    let method = "res.user";
    let domain = "[" + json_constructor.createDomain('id', '=', userId) + "]";
    let fields = ["employee.rec_name", "employee.id",
			"language.code", "company.id"];

    json_constructor.addNode(method, domain, fields);
    let json = json_constructor.createJson();

    this.tryton_provider.search(json)
    .subscribe(
      data => {
        console.log("Recived data", data);
        this.user = data[method];
				console.log("this.user", this.user)
        this.driver.set('UserData', this.user[0]);
				console.log("Using user language", this.user[0].language_code)
				if (this.user[0].language_code)
					this.translate.use(this.user[0].language_code);
      },
      error => {
				alert('Error al inciar session', )
        console.log("An error was encountered", error)
      })
	}

}
