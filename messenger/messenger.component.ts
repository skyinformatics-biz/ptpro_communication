import { Component, Injectable, OnInit, Renderer2, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { chatWindowService } from './services/chatWindows.service';
// @ts-ignore
import { RestfulAPI } from '../../../providers/services/RestfulAPI.service';
// @ts-ignore
import { SocketEcho } from '../../../providers/services/SocketEcho.service';
// @ts-ignore
import { messengerEvents } from './services/messengerEvents.service';
// @ts-ignore
import { AuthService } from '../../../providers/guards/auth.service';
// @ts-ignore
import { SharingService } from '../../../providers/guards/sharing.service';


@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})

@Injectable()
export class MessengerComponent extends SocketEcho implements OnInit, AfterViewChecked {

  // One window is used in this version
  private MessengerOpened = false;
  private MessengerLoaded = false;

 
  /**  Arrays **/
  private Contacts: Array<any> = [];
  private Notifications: Array<any> = [];


  /**  Messenger variables **/
  private TotalMessages: number = 0;
  private TotalContacts: number = 0;

  // Native
  @ViewChild('messageText', { read: ElementRef, static: false }) messageText: ElementRef;
  @ViewChild("requestContact", { read: ElementRef, static: false }) private requestContact: ElementRef;
  @ViewChild("ChatBody", { read: ElementRef, static: false }) private chatBody: ElementRef;



  constructor(private api: RestfulAPI,
    private SocketEcho: SocketEcho,
    private auth: AuthService,
    private account: SharingService,
    private ChatWindows: chatWindowService,
    private events: messengerEvents,
  ) {
    super();
  }

  ngOnInit() {
    this.initializeMessenger();

  }


  ngAfterViewChecked() {

  }

  private notificationListener() {

    window.Echo.private('Notification.User.' + this.account.uid)
      .listen('.Notification.response', (data) => {

        /* Updates total unread messages by contacts */
        if (data.type === 0) {
          this.Notifications = data;
          this.TotalMessages = this.Notifications['data']['total'];

          if (data.request[0] == true) {
            this.events.emitNewContact(data.request[1], true);
          }

        }
        /* Updates request messages */
        else if (data.type === 1) {
          try {
            this.ChatWindows.Manager[0]['messages'][data.index].accepted = data.desicion;
            this.ChatWindows.Manager[0]['messages'][data.index].text = data.msg;
            this.ChatWindows.Manager[0].accepted = data.desicion;

          } catch (error) {
            console.log(error)
          }
        }
        else if (data.type === 3) {

        }
        console.log('Notification: ', data);
      });

  }
  private communicationListener(senderId, recieverId, Channel) {

    // Communication channel exist of, sender, reciever and channel ids.
    window.Echo.private('Communication.' + senderId + '-'  + recieverId + '.' + Channel)
      .listen('.Message.created', (data) => {
        console.log('MSG', data);

        if (this.account.uid == data.senderId) {
          this.ChatWindows.Manager[0]['messages'].push({ 'currentUser': true, 'text': data.text, 'senderId': data.senderId, 'recieverId': data.recieverId, 'type': data.type });
        }
        else {
          this.ChatWindows.Manager[0]['messages'].push({ 'currentUser': false, 'text': data.text, 'senderId': data.senderId, 'recieverId':data.recieverId, 'type': data.type });
        }


      })
      .listen('.RequestMessage.created', (data) => {
        console.log('Request Message recieved');
      })

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
      this.notificationListener();
      this.localMessengerEvents();

      //console.log('myContacts', this.myMessengerContacts);

      this.MessengerLoaded = true;

    });

  }

  localMessengerEvents() {
    this.events.manager.subscribe(
      (data: any) => {

        if (data.task === 'newcontact') {
          const contact = data['data'];
          console.log('Emit contact', contact);
          var r = (data['remote'] === true) ? ' mottat' : ' sendt';
          contact['title'] = contact['title'] + r;
          contact['bold'] = true;
          contact['total'] = 1;


          this.Contacts.unshift(contact);
          this.TotalContacts = this.TotalContacts + 1;
          var plus = (data['remote'] === true) ? 0 : 1;
          this.TotalMessages = this.TotalMessages + plus;
          this.MessengerOpened = true;
        }
        else if (data.task === 'updatecontact') {
          var i = this.Contacts.findIndex(i => i.id === data.chatId);
          this.Contacts[i].title = data.title;
          this.Contacts[i].bold = false;

          console.log('context index', i);
        }

      });
  }


  emitSignal() {

    let a = window.Echo.private('myCommunication.837ea5df8b856de61b13c7b842b5445d').whisper('Typing', { name: 'david', typing: true }).listenForWhisper('Typing', user => {
      console.log('Hello');
    });
    console.log('Emit Signal', a);

  }

  public openChatWindow(index, title, recieverId, chatId) {

    this.ChatWindows.messagesLoaded = false;

    if (this.ChatWindows.Manager[0]['open'] == false) {

      this.ChatWindows.Manager[0].open = this.ChatWindows.Manager[0].loaded = true;
      this.ChatWindows.Manager[0].title = title;
      this.ChatWindows.Manager[0].recieverId = recieverId;

      //const i = this.Contacts.findIndex(i => i.id === chatId)
      this.ChatWindows.Manager[0].accepted = this.Contacts[index].accepted;

      this.TotalMessages = (this.TotalMessages) - (this.Contacts[index].total);
      this.Contacts[index].total = 0;


      this.communicationListener(this.account.uid, recieverId, chatId);
      this.ChatWindows.getChatData(this.account.uid, recieverId, chatId, 0, null);
      //this.ChatWindows.scrollDownInChatBody(this.chatBody);

      console.log("Initiate connection: " + chatId);

    }
    else {

      this.closeWindow(index);

      this.ChatWindows.Manager[0].open = true;
      this.ChatWindows.Manager[0].title = title;
      this.ChatWindows.Manager[0].contactId = recieverId;

      //const i = this.Contacts.findIndex(i => i.id === chatId)
      this.ChatWindows.Manager[0].accepted = this.Contacts[index].accepted;

      this.TotalMessages = (this.TotalMessages) - (this.Contacts[index].total);
      this.Contacts[index].total = 0;

      this.communicationListener(this.account.uid, recieverId, chatId);
      this.ChatWindows.getChatData(this.account.uid, recieverId, chatId, 0, null);
      //this.ChatWindows.scrollDownInChatBody(this.chatBody);

      console.log("Initiate/Close connection: " + chatId);

    }

  }

  public closeWindow(index) {

    this.ChatWindows.messagesLoaded = false;

    this.ChatWindows.Manager[0].open = false;
    this.Contacts[index]['messages'] = null;
    this.SocketEcho.CloseConnection(this.Contacts[index].chatId);

    console.log("Connection closed", this.Contacts);
  }


  public getChatWindow(index = 0) {

    try {
      return this.ChatWindows.Manager[index].open;
    } catch (error) {
      return false;
    }

  }

  postMessage(index) {
    var Text = this.messageText.nativeElement.value;
    if (Text == '')
      return;

    var data = {
      type: 3,
      text: Text,
      chatId: this.ChatWindows.Manager[index]['chatId'],
      senderId: this.account.uid,
      recieverId: this.ChatWindows.Manager[index]['contactId']

    }
    console.log(this.Contacts[index]);

    this.api.post('communication', data, 'secure').subscribe(response => {

      console.log(response);
      this.messageText.nativeElement.value = '';
      this.ChatWindows.scrollDownInChatBody(this.chatBody);

    });

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
