import { ToastController } from '@ionic/angular';
import { Component } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private appUpdates: SwUpdate, private toastCtrl: ToastController) {

    const updatesAvailable = appUpdates.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      map( evt => ({
        type: 'UPDATE_AVAILABLE',
        current: evt.currentVersion,
        available: evt.latestVersion
      }))
    );

    updatesAvailable.subscribe((available) => {
      if(available.available !== available.current){
        this.presentToast();
      }
    });

    appUpdates.unrecoverable.subscribe( event => {
      this.unrecoverableUpdate('An error occurred that we cannot recover from:\n' + 
      event.reason + ' \n\nPlease reload the page.')
    })
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
     header: 'New updates are available',
     icon: 'information-circle',
     position: 'bottom',
     buttons: [
       {
         icon: 'download',
         text: 'Install',
         handler: () => {
           this.appUpdates.activateUpdate().then( () => {
              document.location.reload();
              toast.onDidDismiss();
            }
           )
         }
       }
     ]
    })
  }

  async unrecoverableUpdate(msg: string){
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'top'
    })

    toast.present();
  }
}
