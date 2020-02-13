import { Injectable, ViewChild, ElementRef } from '@angular/core';

import { RestfulAPI } from '../../../../providers/services/RestfulAPI.service';
// @ts-ignore
import { SocketEcho } from '../../../../providers/services/SocketEcho.service';

import { Events } from './events.service';

import { AuthService } from '../../../../providers/guards/auth.service';

import { SharingService } from '../../../../providers/guards/sharing.service';

import { ChatWindows } from './chat-windows.service';

@Injectable({
  providedIn: 'root'
})
export class MessengerCore extends SocketEcho {

  // One window is used in this version
  public MessengerOpened = false;
  public MessengerLoaded = false;


  /**  Arrays **/
  public Contacts: Array<any> = [];
  public Notifications: Array<any> = [];


  /**  Messenger variables **/
  public TotalMessages: number = 0;
  public TotalContacts: number = 0;

  // Native
  @ViewChild('messageText', { read: ElementRef, static: false }) messageText: ElementRef;
  @ViewChild("requestContact", { read: ElementRef, static: false }) private requestContact: ElementRef;
  @ViewChild("ChatBody", { read: ElementRef, static: false }) private chatBody: ElementRef;

  constructor(public api: RestfulAPI,
    public SocketEcho: SocketEcho,
    public auth: AuthService,
    public account: SharingService,
    public Windows: ChatWindows,
    public events: Events) {
    super();
  }

  public notificationListener() {

    window.Echo.private('Notification.User.' + this.account.uid)
      .listen('.Notification.response', (data) => {

        /* Updates unread messages for contacts */
        if (data.type === 0) {
          this.Notifications = data;
          this.TotalMessages = this.Notifications['data']['total'];

          if (data.request[0] == true) {
            this.events.emitNewContact(data.request[1], true);
          }

        }
        /* Updates option/type request messages */
        else if (data.type === 1) {
          try {
            this.Windows.Manager[0]['messages'][data.index].accepted = data.desicion;
            this.Windows.Manager[0]['messages'][data.index].text = data.msg;
            this.Windows.Manager[0].accepted = data.desicion;

          } catch (error) {
            console.log(error)
          }
        }
        else if (data.type === 3) {

        }
        console.log('Notification: ', data);
      });

  }

  public communicationListener(senderId, recieverId, Channel) {

    // Communication channel exist of, sender, reciever and channel ids.
    window.Echo.private('Communication.' + senderId + '-' + recieverId + '.' + Channel)
      .listen('.Message.created', (data) => {
        console.log('MSG', data);

        if (this.account.uid == data.senderId) {
          this.Windows.Manager[0]['messages'].push({ 'currentUser': true, 'text': data.text, 'senderId': data.senderId, 'recieverId': data.recieverId, 'type': data.type });
        }
        else {
          this.Windows.Manager[0]['messages'].push({ 'currentUser': false, 'text': data.text, 'senderId': data.senderId, 'recieverId': data.recieverId, 'type': data.type });
        }


      })
      .listen('.RequestMessage.created', (data) => {
        console.log('Request Message recieved');
      })

  }

  public localMessengerEventsListener() {
    this.events.Manager.subscribe(
      (messengerEvent: any) => {

        if (messengerEvent.task === 'newcontact') {
          const contact = messengerEvent['data'];
          console.log('Emit contact', contact);
          var remote = (messengerEvent['remote'] === true) ? ' mottat' : ' sendt';
          contact['title'] = contact['title'] + remote;
          contact['bold'] = true;
          contact['total'] = 1;

          console.log("New Contact");
          console.log(contact)


          this.Contacts.unshift(contact);
          this.TotalContacts = this.TotalContacts + 1;
          var plus = (messengerEvent['remote'] === true) ? 0 : 1;
          this.TotalMessages = this.TotalMessages + plus;
          this.MessengerOpened = true;
        }
        else if (messengerEvent.task === 'updatecontact') {
          var i = this.Contacts.findIndex(i => i.id === messengerEvent.chatId);
          this.Contacts[i].title = messengerEvent.title;
          this.Contacts[i].bold = false;

          console.log('context index', i);
        }

      });
  }

  public openChatWindow(index, title, recieverId, chatId) {

    this.Windows.messagesLoaded = false;

    if (this.Windows.Manager[0]['open'] == false) {

      this.Windows.Manager[0].open = this.Windows.Manager[0].loaded = true;
      this.Windows.Manager[0].title = title;
      this.Windows.Manager[0].recieverId = recieverId;

      //const i = this.Contacts.findIndex(i => i.id === chatId)
      this.Windows.Manager[0].accepted = this.Contacts[index].accepted;

      this.TotalMessages = (this.TotalMessages) - (this.Contacts[index].unread);
      this.Contacts[index].unread = 0;


      this.communicationListener(this.account.uid, recieverId, chatId);
      this.Windows.getChatData(this.account.uid, recieverId, chatId, 0, null);
      //this.ChatWindows.scrollDownInChatBody(this.chatBody);

      console.log("Initiate connection: " + chatId);

    }
    else {

      this.Windows.close(index);

      this.Windows.Manager[0].open = true;
      this.Windows.Manager[0].title = title;
      this.Windows.Manager[0].contactId = recieverId;

      //const i = this.Contacts.findIndex(i => i.id === chatId)
      this.Windows.Manager[0].accepted = this.Contacts[index].accepted;

      this.TotalMessages = (this.TotalMessages) - (this.Contacts[index].unread);
      this.Contacts[index].unread = 0;

      this.communicationListener(this.account.uid, recieverId, chatId);
      this.Windows.getChatData(this.account.uid, recieverId, chatId, 0, null);
      //this.ChatWindows.scrollDownInChatBody(this.chatBody);

      console.log("Initiate/Close connection: " + chatId);

    }

  }

  public postMessage(index) {
    var Text = this.messageText.nativeElement.value;
    if (Text == '')
      return;

    var data = {
      type: 3,
      text: Text,
      chatId: this.Windows.Manager[index]['chatId'],
      senderId: this.account.uid,
      recieverId: this.Windows.Manager[index]['contactId']

    }
    console.log(this.Contacts[index]);

    this.api.post('communication', data, 'secure').subscribe(response => {

      console.log(response);
      this.messageText.nativeElement.value = '';
      this.Windows.scrollDownInChatBody(this.chatBody);

    });

  }



}


