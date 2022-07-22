import { environment } from './../../environments/environment.prod';



import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from './../user.service';
import { Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import jsQR from 'jsqr';

import { ToastController, Platform, AlertController } from '@ionic/angular';


import { Network } from '@capacitor/network';
import { CookieService } from "ngx-cookie-service";


/*
interface User {
  name: string;

  userId: string;
  phone: string;
  email: string;
  purpose: string;
  status: string;
  visitor: string;
  department: string;
  id?: string;
}

interface Logs {
  userId: string;
  name: string;
  timeIn: string;
  timeOut: string;
  date: string;
  loggedIn: boolean;
  id: string
}
*/

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('video', { static: false }) video: ElementRef | undefined;
  @ViewChild('canvas', { static: false }) canvas: ElementRef | undefined;

  canvasElement: any;
  videoElement: any;
  canvasContext: any;
  scanActive = false;
  scanResult: any = null;



  selectedSlide: any;
  segment = 0;


  sliderOptions = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 300,
  };

  formPage = false;
  loggedIn = false;
  isUser = false;
  clockedIn = 'Status';
  message = 'You\'ve clocked in';
  persona = '';
  loginTime = '';
  timer: any = '';
  hoursSpent = 0;
  minsSpent = 0;
  timeIn = "";
  loginTimer: any = false;




  userForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required, Validators.minLength(9)]),
    email: new FormControl(''),
    purpose: new FormControl(''),
    status: new FormControl(''),
    userId: new FormControl(''),
    visitor: new FormControl(''),
    department: new FormControl('')
  });

  activateOptions = false;
  activatestatus = false;

  code: string = '';
  manualClockout = false;

  socialLinks = [
    {
      name: 'Facebook',
      link: 'https://www.facebook.com/umathub',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png'
    },
    {
      name: 'Twitter',
      link: 'https://twitter.com/UMaTHub',
      img: 'https://cpng.pikpng.com/pngl/s/327-3272328_twitter-logo-2017-png-clipart.png'
    },
    {
      name: 'LinkedIn',
      link: 'https://www.linkedin.com/company/umat-business-incubator',
      img: 'data:image/png;base64,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'
    },
    {
      name: 'Instagram',
      link: 'https://www.instagram.com/umathub/',
      img: 'data:image/jpeg;base64,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'
    },
    {
      name: 'Whatsaap',
      link: ' https://chat.whatsapp.com/Fus3zZm5J0aEcPzj3UWXnd',
      img: 'data:image/jpeg;base64,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'
    },


  ]

  purpose: any = [
    {
      title: 'Visit',
      id: 1,
      active: false
    },
    {
      title: 'Work',
      id: 2,
      active: false
    },

    {
      title: 'Project Work',
      id: 3,
      active: false,
    },
    {
      title: 'Official',
      id: 4,
      active: false
    },
    {
      title: 'Meeting',
      id: 5,
      active: false
    }
  ];



  function: any = [
    {
      title: 'Visit',
      id: 1,
      active: false
    },
    {
      title: 'Work',
      id: 2,
      active: false
    },
  ];

  status: any = [
    {
      title: 'Student',
      id: 1,
      active: false
    },
    {
      title: 'Lecturer',
      id: 2,
      active: false
    },

    {
      title: 'Engineer',
      id: 3,
      active: false,
    },
    {
      title: 'Doctor',
      id: 4,
      active: false
    },
    {
      title: 'Miner',
      id: 5,
      active: false
    },


  ];

  personaOptions: any = [];
  scanCodes = true;
  // users: Logs[] = []


  constructor(private router: Router, private userService: UserService,
    private toastCtrl: ToastController, private platform: Platform, private alertController: AlertController, private cookie: CookieService) {

  }

  ngOnInit() {


    this.userService.userStatus().then(async user => {
      this.isUser = user == 'true' ? true : false;

    });


    this.userService.getUser().then(async user => {
      this.userForm.patchValue(JSON.parse(typeof (user) == 'string' ? user : '{}'));
    })


    this.loginTime = '0 min';

    this.componentDidLoad();


    Network.addListener('networkStatusChange', status => {

    });


  }





  ngOnDestroy() {
    Network.removeAllListeners()
  }

  ngAfterViewInit() {
    this.canvasElement = this.canvas?.nativeElement;
    this.canvasContext = this.canvasElement.getContext('2d');
    this.videoElement = this.video?.nativeElement;


    window.onfocus = () => {
      this.refreshDate();
    }

  }


  refreshDate() {

    this.userService.loginStatus().then(async user => {

      if (user == 'true') {


        const isCooked = this.cookie.check('timeIn')

        if (isCooked) {
          this.setOptions(this.cookie.get('timeIn'))
        } else {

          this.userService.getString('timeIn').then(async time => {
            this.setOptions(time)
          });

        }


        this.loginTimer = window.setInterval(() => {

          this.loggedIn = true;
          this.formPage = false
          this.segmentChange(1);

        }, 100)
      }
    })
  }


  isLoggedInSlide() {

  }


  setOptions(time: string) {
    this.timeIn = time;
    const ltime = this.timeIn.split(' ');
    let ctime: any = this.userService.localTimeFormat();
    ctime = ctime.split(' ');



    const hour = Number(ltime[0]);
    const min = Math.abs(Number(ltime[2]));
    const cmin = Number(ctime[2]);
    const chour = Number(ctime[0]);

    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const day = new Date().getDay();



    let startDate = new Date(
      year, month, day,
      hour,
      min
    );

    let endDate = new Date(year, month, day,
      chour,
      cmin
    );

    let difference = endDate.getTime() - startDate.getTime();

    difference = difference / 1000;
    this.hoursSpent = Math.floor(difference / 3600);
    difference -= this.hoursSpent * 3600;
    this.minsSpent = Math.floor(difference / 60);
    difference -= this.minsSpent * 60;



    this.startTimer(this.hoursSpent, this.minsSpent);
  }


  startTimer(h: number = 0, m: number = 0) {

    this.minsSpent = m;
    this.hoursSpent = h;


    if (this.hoursSpent >= 1) {
      // eslint-disable-next-line max-len
      this.loginTime = `${this.hoursSpent} ${this.hoursSpent > 1 ? 'hrs' : 'hr'} ${this.minsSpent} ${this.minsSpent > 1 ? 'mins' : 'min'} `;

    } else {
      this.loginTime = `${this.minsSpent} ${this.minsSpent > 1 ? 'mins' : 'min'} `;

    }


    // this.timer = window.setInterval(() => {
    //   if (this.loggedIn) {
    //     this.minsSpent += 1;
    //     if (this.minsSpent == 60) {
    //       this.hoursSpent += 1;
    //       this.minsSpent = 0;
    //     }
    //     if (this.hoursSpent >= 1) {
    //       // eslint-disable-next-line max-len
    //       this.loginTime = `${this.hoursSpent} ${this.hoursSpent > 1 ? 'hrs' : 'hr'} ${this.minsSpent} ${this.minsSpent > 1 ? 'mins' : 'min'} `;
    //     } else {
    //       this.loginTime = `${this.minsSpent} ${this.minsSpent > 1 ? 'mins' : 'min'} `;
    //     }
    //   }

    // }, 60000);
  }



  async componentDidLoad() {

  }



  purposeSelection(id: number, title: string) {
    this.purpose.forEach(p => {
      if (p.id === id) {
        p.active = true;
        this.userForm.patchValue({ purpose: title });
      } else {
        p.active = false;
      }
    });
  }


  statusSelection(id: number, title: string) {
    this.personaOptions.forEach(p => {
      if (p.id === id) {
        p.active = true;
        this.userForm.patchValue({ status: title });
      } else {
        p.active = false;
      }
    });
  }



  async login() {

    const status = await Network.getStatus();
    if (this.userForm.valid) {
      if (status.connected) {
        this.scanCode();
      } else {
        this.presentToast('Please turn on your data or Connect to a wifi to log in', 6000, 'wifi');
      }

    } else {
      this.presentToast('Validation failed, please make sure all fields are accuratly filled', 3000, 'key');
    }
  }


  scanCode() {
    this.formPage = false
    this.loggedIn = true;
    this.scanCodes = false;

    this.segmentChange(1);
    this.userService.registerUser(this.userForm.value)

    this.timeIn = this.userService.localTimeFormat();
    this.userService.setString('timeIn', this.timeIn)
    this.cookie.set('timeIn', this.timeIn)
    this.startTimer();
    this.presentToast('Login Succesfull, you are welcomed', 3000, 'key')
  }



  async logOut() {
    const status = await Network.getStatus();
    window.clearInterval(this.loginTimer)
    if (status.connected) {

      this.scanCodes = true;
      this.segmentChange(3);
      this.startScan();
    } else {
      this.presentToast('Please turn on your data or Connect to a wifi to log out', 6000, 'wifi');
    }
  }



  toLoginSlide(persona: string) {


    this.persona = persona;
    this.userForm.patchValue({ userId: 'user-'.concat(String(1 + Math.random() * 100000)), visitor: persona, department: 'Uhub' });
    persona !== 'Staff' ? this.personaOptions = this.status : this.personaOptions = this.function;
    this.formPage = true;
    this.segmentChange(1);



  }
  toScanSlide() {

  }

  toLogOutSlide() {

  }


  toClockedInpage() {


    this.segmentChange(1);
    this.loginTimer = window.setInterval(() => {

      this.loggedIn = true;
      this.formPage = false
      this.segmentChange(1);

    }, 100)
  }


  toHomeSlide() {
    this.formPage = false;

    this.segmentChange(0);
  }


  slideChanged(slides) {
    slides.getActiveIndex().then((selectedIndex) => {
      this.segment = selectedIndex;
      this.selectedSlide = slides;
      if (selectedIndex !== 1) {
        this.formPage = false;
      }
    });
  }

  async segmentChange(slide: number) {
    await this.selectedSlide.slideTo(slide);

  }

  async presentToast(msg: string, dur, ic) {
    const toast = await this.toastCtrl.create({
      message: msg,
      mode: 'ios',
      duration: dur,
      position: 'top',
      color: 'primary',

    });

    await toast.present();
  }





  openLink(externalUrl: string) {
    window.open(externalUrl, '_external')
  }




  reset() {
    this.scanResult = null;
  }

  stopScan() {
    this.scanActive = false;
  }



  async startScan() {
    this.scanActive = true;
    // Not working on iOS standalone mode!
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });

    this.videoElement.srcObject = stream;
    // Required for Safari
    this.videoElement.setAttribute('playsinline', true);


    this.videoElement.play();
    requestAnimationFrame(this.scan.bind(this));
  }

  async scan() {
    if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {


      this.canvasElement.height = this.videoElement.videoHeight;
      this.canvasElement.width = this.videoElement.videoWidth;

      this.canvasContext.drawImage(
        this.videoElement,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
      const imageData = this.canvasContext.getImageData(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code) {
        this.scanActive = false;
        this.scanResult = code.data;

        if (this.scanResult == environment.qrKey) {
          this.loggedIn = false;
          this.userService.LogOutUser();
          this.segmentChange(0);
         // window.clearInterval(this.timer);
          this.loginTime = '0 min';
          this.timeIn = ''
          this.minsSpent = 0;
          this.hoursSpent = 0;
          window.clearInterval(this.loginTimer);
          this.userService.removeItem('timeIn');
          this.cookie.delete('timeIn')
          this.reset();
          this.stopScan();
        }
        this.reset();
        this.stopScan();
      } else {
        if (this.scanActive) {
          requestAnimationFrame(this.scan.bind(this));
        }
      }
    } else {
      requestAnimationFrame(this.scan.bind(this));
    }
  }


  manualClockOut() {
    if (this.code.length > 0 && this.code == environment.qrcode) {
      this.scanActive = false;


      this.loggedIn = false;
      this.userService.LogOutUser();
      this.segmentChange(0);
      window.clearInterval(this.timer);
      this.loginTime = '0 min';
      this.timeIn = ''
      this.minsSpent = 0;
      this.hoursSpent = 0;
      window.clearInterval(this.loginTimer);
      this.userService.removeItem('timeIn');
      this.cookie.delete('timeIn')
      this.code = '';
      this.reset();
      this.stopScan();
    }
  }

}
