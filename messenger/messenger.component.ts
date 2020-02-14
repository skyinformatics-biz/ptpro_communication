import { Component, Injectable, OnInit, Renderer2, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { MessengerCore } from './core/messenger-core.service'

import { RestfulAPI } from '../../../providers/services/RestfulAPI.service';
// @ts-ignore
import { SocketEcho } from '../../../providers/services/SocketEcho.service';
// @ts-ignore
import { Events } from './core/events.service';
// @ts-ignore
import { AuthService } from '../../../providers/guards/auth.service';
// @ts-ignore
import { SharingService } from '../../../providers/guards/sharing.service';

import { ChatWindows } from './core/chat-windows.service';


@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})

@Injectable()
export class MessengerComponent extends MessengerCore implements OnInit {

  constructor(public api: RestfulAPI,
    public SocketEcho: SocketEcho,
    public auth: AuthService,
    public account: SharingService,
    public Chat: ChatWindows,
    public events: Events) {
    super(api, SocketEcho, auth, account, Chat, events);
  }

  ngOnInit() {
    this.initializeMessenger();
  }




  private initializeMessenger() {
    this.api.get('communication', 'secure').subscribe(response => {


      this.Contacts = response['contacts'];
      this.TotalMessages = response['total_unread'];
      this.TotalContacts = this.Contacts.length;

      console.log(this.Contacts);

      // 1. Finally initiate authentication and connection with socket server
      this.SocketEcho.initiateConnection(this.auth.Token());

      window.Echo.connector.socket.on('connect', function () {
        console.log('On connect');
      });

      // 2. Listen for notification
      this.localMessengerEventsListener();
      this.remoteNotificationListener();
      

      //console.log('myContacts', this.myMessengerContacts);

      this.MessengerLoaded = true;

    });

  }



  emitSignal() {

    let a = window.Echo.private('myCommunication.837ea5df8b856de61b13c7b842b5445d').whisper('Typing', { name: 'david', typing: true }).listenForWhisper('Typing', user => {
      console.log('Hello');
    });
    console.log('Emit Signal', a);

  }


  public getChatWindow(index = 0) {

    try {
      return this.Chat.Window[index].open;
    } catch (error) {
      return false;
    }

  }

  private toggleMessenger() {
    if (this.MessengerOpened)
      this.MessengerOpened = false
    else
      this.MessengerOpened = true;
  }

  private toggleChatWindow(index) {

  }



}
