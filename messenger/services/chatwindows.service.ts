import { Injectable, ViewChild, ElementRef } from '@angular/core';
import { RestfulAPI } from '../../../../providers/services/RestfulAPI.service';


@Injectable({
  providedIn: 'root'
})
export class ChatwindowsService {


  // UserId
  public myUserId = null;

  // Chat window manager
  public Manager: Array<any> = [];

  //
  public messagesLoaded = false;

  constructor(public api: RestfulAPI) {

    // Windows allow 3
    this.Manager[0] = { 'chatId': null, 'title': null, 'open': false, 'loaded': false, 'recieverId': null, 'messages': [], accepted: 2 };
    this.Manager[1] = { 'chatId': null, 'title': null, 'open': false, 'loaded': false, 'recieverId': null, 'messages': [], accepted: 2 };
    this.Manager[2] = { 'chatId': null, 'title': null, 'open': false, 'loaded': false, 'recieverId': null, 'messages': [], accepted: 2 };

  }

  public getChatData(userId, contactId, chatId, reset = 0, content = null) {
    var data = { type: 1, chatId: chatId, userId: userId, contactId: contactId, data: content };

    // put user chat data in the chat windows
    this.api.post('comsocket', data, 'secure').subscribe(response => {

      var messages = this.Manager[0]['messages'] = [];
      this.Manager[0]['chatId'] = chatId;



      response.forEach((element, index) => {

        if (element.fromId != this.myUserId) {
          var currentUser = false;
          this.Manager[0]['messages'][index] = { 'currentUser': currentUser, 'fromId': element.fromId, 'text': element.text, 'type': element.type, 'memberType': element.memberType, 'accepted': element.accepted };
        }
        else {
          var currentUser = true;
          this.Manager[0]['messages'][index] = { 'currentUser': currentUser, 'fromId': element.fromId, 'text': element.text, 'type': element.type, 'memberType': element.memberType, 'accepted': element.accepted };
        }
      });

      this.messagesLoaded = true;
   

    });
  }



  scrollDownInChatBody(chatBody) {
    try {
      chatBody.nativeElement.lastChild.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });

    } catch (error) {
      console.log(error);
    }
  }

}
