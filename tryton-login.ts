import { Component } from '@angular/core';
import { Locker } from 'angular-safeguard';
import { SessionService } from 'angular2-tryton';
import { NavController } from 'ionic-angular';
import { TrytonProvider } from '../providers/tryton-provider'
import { EncodeJSONRead } from '../json/encode-json-read'
// Models
import { User, UserSession } from '../../models/interfaces/user';
import { Party } from '../../models/interfaces/party'
import { Location } from '../../models/interfaces/location'
// Pages
import { MainMenuPage} from '../../pages/main-menu/main-menu'

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

	constructor(
		public session_service : SessionService,
		public locker : Locker,
		public tryton_provider: TrytonProvider,
    	public navCtrl: NavController
		) {
    }

  /**
   * Initialize the login page
   */
	ionViewDidLoad() {
    	console.log('Login screen');
        if (this.session_service.isLoggedIn()){
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
		this.session_service.doLogin('mifarma_task', username, password)
		.subscribe(
  		data => {
  			console.log("Login correct", data);
  			this.user_session = data;
  			this.user_session.database = 'mifarma_task';
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
    // Tests
		//this.get_party_data()
    //this.set_party_data()

    let json_constructor = new EncodeJSONRead;
    let userId = Number(this.user_session.userId);
    let method = "res.user";
    let domain = "[" + json_constructor.createDomain('id', '=', userId) + "]";
    let fields = ["employee.rec_name", "employee.id", "employee.party.name",
    "employee.party.id", "language.code", "company.id"];

    json_constructor.addNode(method, domain, fields);
    let json = json_constructor.createJson();

    this.tryton_provider.search(json)
    .subscribe(
      data => {
        console.log("Recived data", data);
        this.user = data[method];
        this.driver.set('UserData', this.user);
        // Go to the menu
        this.navCtrl.push(MainMenuPage)
      },
      error => {
        console.log("An error was encountered", error)
      })
	}

}
