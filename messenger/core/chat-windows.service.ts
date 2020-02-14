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
  public Window: Array<any> = [];

  //
  public messagesLoaded = false;

  constructor(public api: RestfulAPI, public account: SharingService, public SocketEcho:SocketEcho) {

    // Windows allow 3
    this.Window[0] = { 'chatId': null, 'title': null, 'open': false, 'loaded': true, 'recieverId': null, 'messages': [], accepted: 2 };
    this.Window[1] = { 'chatId': null, 'title': null, 'open': false, 'loaded': false, 'recieverId': null, 'messages': [], accepted: 2 };
    this.Window[2] = { 'chatId': null, 'title': null, 'open': false, 'loaded': false, 'recieverId': null, 'messages': [], accepted: 2 };

  }

  public getChatData(userId, recieverId, chatId, reset = 0, content = null) {
    var data = { type: 1, chatId: chatId, userId: userId, contactId: recieverId, data: content };

    // put user chat data in the chat windows
    this.api.post('communication', data, 'secure').subscribe(response => {

      var messages = this.Window[0]['messages'] = [];
      this.Window[0]['chatId'] = chatId;

      response.forEach((element, index) => {

        if (element.senderId != this.account.uid) {
          var currentUser = false;
          this.Window[0]['messages'][index] = { 'currentUser': currentUser, 'recieverId': element.recieverId, 'text': element.text, 'type': element.type, 'memberType': element.memberType, 'accepted': element.accepted };
        }
        else {
          var currentUser = true;
          this.Window[0]['messages'][index] = { 'currentUser': currentUser, 'recieverId': element.recieverId, 'text': element.text, 'type': element.type, 'memberType': element.memberType, 'accepted': element.accepted };
        }
      });

      this.Window[0].loaded = true;


    });
  }

  public close(index) {

    this.messagesLoaded = false;

    this.Window[0].open = false;
    //this.Contacts[index]['messages'] = null;
    this.SocketEcho.CloseConnection(this.Window[index].chatId);

    console.log("Connection closed", this.Window);
  }


  scrollDownInChatBody(chatBody) {
    try {
      chatBody.nativeElement.lastChild.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });

    } catch (error) {
      console.log(error);
    }
  }

}
