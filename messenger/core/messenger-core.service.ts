import { Injectable, ViewChild, ElementRef } from '@angular/core';

import { RestfulAPI } from '../../../../providers/services/RestfulAPI.service';
// @ts-ignore
import { SocketEcho } from '../../../../providers/services/SocketEcho.service';

import { Events } from '../services/events.service';

import { AuthService } from '../../../../providers/guards/auth.service';

import { SharingService } from '../../../../providers/guards/sharing.service';

import { ChatWindows } from '../services/chat-windows.service';

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
  @ViewChild("requestContact", { read: ElementRef, static: false }) private requestContact: ElementRef;


  constructor(public api: RestfulAPI,
    public SocketEcho: SocketEcho,
    public auth: AuthService,
    public account: SharingService,
    public Chat: ChatWindows,
    public events: Events) {
    super();
  }

  /**
   *  Listens to remote socket notification events
   */
  public remoteNotificationListener() {

    window.Echo.private('Notification.User.' + this.account.uid)
      .listen('.Notification.response', (response) => {
        
        console.log("Notification", response);

        /* Type 0 - Update Contact list and unread messages */
        if (response.type === 0) {

         

          this.TotalMessages = response['total_unread'];
          this.Contacts = response['contacts'];


        }
        /* Not set */
        else if (response.type === 1) {

        }
        else if (response.type === 2) {

        }
 
      });

  }

  /** Communication as chatting chhannel */
  public remoteCommunicationListener(senderId, recieverId, Channel) {

    // Communication channel exist of, sender, reciever and channel ids.
    window.Echo.private('COM.' + Channel)
      .listen('.message.created', (data) => {
        if (this.account.uid == data.senderId) {
          this.Chat.Window[0]['messages'].push({ 'currentUser': true, 'text': data.text, 'senderId': data.senderId, 'recieverId': data.recieverId, 'type': data.type });
        }
        else {
          this.Chat.Window[0]['messages'].push({ 'currentUser': false, 'text': data.text, 'senderId': data.senderId, 'recieverId': data.recieverId, 'type': data.type });
        }

        console.log("Sock MSG recieved", data);

      })
      .listen('.requestMessage.response', (response) => {
        try {
          this.Chat.Window[0]['messages'][response.index].accepted = response.desicion;
          this.Chat.Window[0]['messages'][response.index].text = response.msg;
          this.Chat.Window[0].accepted = response.desicion;

        } catch (error) {
          console.log(error)
        }
      })

  }

  public localEventsListener() {
    this.events.messenger.eventHandler.subscribe(
      (eventData: any) => {

        console.log(eventData);

        if (eventData.task === 'newContact') {
          // Local eventResponse for NewContact
          const responseData = eventData['data'];
          // Response data contact
          const contact = responseData['contact'];

          // Add more params to the response Contact
          var remote = (eventData['remote'] === true) ? ' mottat' : ' sendt';
          contact.title = contact.title + remote;
          contact.bold = true;
          contact.unread = 1;
          contact.accepted = 2;

          // response token equal chatId
          contact.requestId = responseData.url;

          // Place contact as first element
          this.Contacts.unshift(responseData['contact']);
          this.TotalContacts = this.TotalContacts + 1;
          this.MessengerOpened = true;
        }
        else if (eventData.task === 'updateContact') {

          this.Contacts[eventData.index].accepted = eventData.accepted;
          this.Contacts[eventData.index].bold = false;
        }

      });

      /* Local chatWindow listener **/
    this.events.chatWindow.eventHandler.subscribe(
      (eventData: any) => {

        if(eventData.task === 'newMessage'){
          
          this.Chat.Window[0]['messages'].push(eventData);
          
        }

      });
  }

  public openChatWindow(index, title, initiatorId, recieverId, chatId) {

    this.Chat.messagesLoaded = false;

    if (this.Chat.Window[0].open == false) {

      this.Chat.Window[0].open = this.Chat.Window[0].loaded = true;
      this.Chat.Window[0].title = title;
      this.Chat.Window[0].recieverId = recieverId;

      //const i = this.Contacts.findIndex(i => i.id === chatId)
      this.Chat.Window[0].accepted = this.Contacts[index].accepted;

      this.TotalMessages = (this.TotalMessages) - (this.Contacts[index].unread);
      this.Contacts[index].unread = 0;


      this.remoteCommunicationListener(this.account.uid, recieverId, chatId);
      this.Chat.getCommunicationData(this.account.uid, initiatorId, recieverId, chatId, 0, null);
      //this.ChatWindows.scrollDownInChatBody(this.chatBody);

      console.log("Initiate connection: " + chatId);

    }
    else {

      this.Chat.close(0);

      this.Chat.Window[0].open = true;
      this.Chat.Window[0].title = title;
      this.Chat.Window[0].contactId = recieverId;

      //const i = this.Contacts.findIndex(i => i.id === chatId)
      this.Chat.Window[0].accepted = this.Contacts[index].accepted;

      this.TotalMessages = (this.TotalMessages) - (this.Contacts[index].unread);
      this.Contacts[index].unread = 0;

      this.remoteCommunicationListener(this.account.uid, recieverId, chatId);
      this.Chat.getCommunicationData(this.account.uid, initiatorId, recieverId, chatId, 0, null);
      //this.ChatWindows.scrollDownInChatBody(this.chatBody);

      console.log("Initiate/Close connection: " + chatId);

    }

  }


}


