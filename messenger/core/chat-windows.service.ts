import { Injectable, ViewChild, ElementRef } from '@angular/core';
// @ts-ignore
import { RestfulAPI } from '../../../../providers/services/RestfulAPI.service';
import { SharingService } from '../../../../providers/guards/sharing.service';
import { MessengerCore } from './messenger-core.service'
import { SocketEcho } from '../../../../providers/services/SocketEcho.service'

@Injectable({
  providedIn: 'root'
})
export class ChatWindows {

  // Chat window manager
  public Manager: Array<any> = [];

  //
  public messagesLoaded = false;

  constructor(public api: RestfulAPI, public account: SharingService, public SocketEcho:SocketEcho) {

    // Windows allow 3
    this.Manager[0] = { 'chatId': null, 'title': null, 'open': false, 'loaded': false, 'recieverId': null, 'messages': [], accepted: 2 };
    this.Manager[1] = { 'chatId': null, 'title': null, 'open': false, 'loaded': false, 'recieverId': null, 'messages': [], accepted: 2 };
    this.Manager[2] = { 'chatId': null, 'title': null, 'open': false, 'loaded': false, 'recieverId': null, 'messages': [], accepted: 2 };

  }

  public getChatData(userId, recieverId, chatId, reset = 0, content = null) {
    var data = { type: 1, chatId: chatId, userId: userId, contactId: recieverId, data: content };

    // put user chat data in the chat windows
    this.api.post('communication', data, 'secure').subscribe(response => {

      var messages = this.Manager[0]['messages'] = [];
      this.Manager[0]['chatId'] = chatId;

      response.forEach((element, index) => {

        if (element.senderId != this.account.uid) {
          var currentUser = false;
          this.Manager[0]['messages'][index] = { 'currentUser': currentUser, 'recieverId': element.recieverId, 'text': element.text, 'type': element.type, 'memberType': element.memberType, 'accepted': element.accepted };
        }
        else {
          var currentUser = true;
          this.Manager[0]['messages'][index] = { 'currentUser': currentUser, 'recieverId': element.recieverId, 'text': element.text, 'type': element.type, 'memberType': element.memberType, 'accepted': element.accepted };
        }
      });

      this.messagesLoaded = true;


    });
  }

  public close(index) {

    this.messagesLoaded = false;

    this.Manager[0].open = false;
    //this.Contacts[index]['messages'] = null;
    this.SocketEcho.CloseConnection(this.Manager[index].chatId);

    console.log("Connection closed", this.Manager);
  }


  scrollDownInChatBody(chatBody) {
    try {
      chatBody.nativeElement.lastChild.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });

    } catch (error) {
      console.log(error);
    }
  }

}
