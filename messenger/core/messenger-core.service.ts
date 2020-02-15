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
    public Chat: ChatWindows,
    public events: Events) {
    super();
  }

  public remoteNotificationListener() {

    window.Echo.private('Notification.User.' + this.account.uid)
      .listen('.Notification.response', (data) => {

        console.log("recieved", data);

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
            this.Chat.Window[0]['messages'][data.index].accepted = data.desicion;
            this.Chat.Window[0]['messages'][data.index].text = data.msg;
            this.Chat.Window[0].accepted = data.desicion;

          } catch (error) {
            console.log(error)
          }
        }
        else if (data.type === 3) {

        }
        console.log('Notification: ', data);
      });

  }

  public remoteCommunicationListener(senderId, recieverId, Channel) {

    // Communication channel exist of, sender, reciever and channel ids.
    window.Echo.private('COM.' + senderId + '-' + recieverId + '.' + Channel)
      .listen('.Message.created', (data) => {

        console.log('MSG', data);

        if (this.account.uid == data.senderId) {
          this.Chat.Window[0]['messages'].push({ 'currentUser': true, 'text': data.text, 'senderId': data.senderId, 'recieverId': data.recieverId, 'type': data.type });
        }
        else {
          this.Chat.Window[0]['messages'].push({ 'currentUser': false, 'text': data.text, 'senderId': data.senderId, 'recieverId': data.recieverId, 'type': data.type });
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
          const contactPlan = messengerEvent['data'];
          var remote = (messengerEvent['remote'] === true) ? ' mottat' : ' sendt';
          contactPlan['title'] = contactPlan['title'] + remote;
          contactPlan['bold'] = true;
          contactPlan['unread'] = 1;

          console.log("New Contact");

          this.Contacts.unshift(contactPlan);
          this.TotalContacts = this.TotalContacts + 1;
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

    this.Chat.messagesLoaded = false;

    if (this.Chat.Window[0]['open'] == false) {

      this.Chat.Window[0].open = this.Chat.Window[0].loaded = true;
      this.Chat.Window[0].title = title;
      this.Chat.Window[0].recieverId = recieverId;

      //const i = this.Contacts.findIndex(i => i.id === chatId)
      this.Chat.Window[0].accepted = this.Contacts[index].accepted;

      this.TotalMessages = (this.TotalMessages) - (this.Contacts[index].unread);
      this.Contacts[index].unread = 0;


      this.remoteCommunicationListener(this.account.uid, recieverId, chatId);
      this.Chat.getCommunicationData(this.account.uid, recieverId, chatId, 0, null);
      //this.ChatWindows.scrollDownInChatBody(this.chatBody);

      console.log("Initiate connection: " + chatId);

    }
    else {

      this.Chat.close(index);

      this.Chat.Window[0].open = true;
      this.Chat.Window[0].title = title;
      this.Chat.Window[0].contactId = recieverId;

      //const i = this.Contacts.findIndex(i => i.id === chatId)
      this.Chat.Window[0].accepted = this.Contacts[index].accepted;

      this.TotalMessages = (this.TotalMessages) - (this.Contacts[index].unread);
      this.Contacts[index].unread = 0;

      this.remoteCommunicationListener(this.account.uid, recieverId, chatId);
      this.Chat.getCommunicationData(this.account.uid, recieverId, chatId, 0, null);
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
      salesPlanId: this.Chat.Window[index].salesPlanId,
      chatId: this.Chat.Window[index]['chatId'],
      senderId: this.account.uid,
      recieverId: this.Chat.Window[index]['recieverId']

    }
    console.log(this.Contacts[index]);

    this.api.post('communication', data, 'secure').subscribe(response => {

      console.log(response);
      this.messageText.nativeElement.value = '';
      this.Chat.scrollDownInChatBody(this.chatBody);

    });

  }



}


