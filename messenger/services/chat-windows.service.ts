import { Injectable, ViewChild, ElementRef } from '@angular/core';
// @ts-ignore
import { RestfulAPI } from '../../../../providers/services/RestfulAPI.service';
import { SharingService } from '../../../../providers/guards/sharing.service';
import { MessengerCore } from '../core/messenger-core.service'
import { SocketEcho } from '../../../../providers/services/SocketEcho.service'

@Injectable({
  providedIn: 'root'
})
export class ChatWindows {

  // Chat window manager
  public Window: Array<any> = [];

  //
  public messagesLoaded = false;

  constructor(public api: RestfulAPI, public account: SharingService, public SocketEcho: SocketEcho) {

    // Windows allow 3
    this.Window[0] = { 'chatId': null, 'title': null, 'salesPlanId':null, 'recieverId': null, 'messages': [], accepted: 2, 'open': false, 'loaded': false };
    this.Window[1] = { 'chatId': null, 'title': null, 'salesPlanId':null, 'recieverId': null, 'messages': [], accepted: 2, 'open': false, 'loaded': false };
    this.Window[2] = { 'chatId': null, 'title': null, 'salesPlanId':null, 'recieverId': null, 'messages': [], accepted: 2, 'open': false, 'loaded': false };

  }

  public getCommunicationData(accountId, initiatorId, recieverId, chatId, reset = 0, content = null) {
    var data = { type: 1, 'userId': accountId, 'contactId': recieverId, 'chatId': chatId, 'data': content };

    // put user chat data in the chat windows
    this.api.post('communication', data, 'secure').subscribe(response => {

      console.log("response: ", response);

      this.Window[0]['messages'] = response;
      this.Window[0]['chatId'] = chatId;
      this.Window[0]['recieverId'] = (this.account.uid == recieverId) ? initiatorId : recieverId;


      response.forEach((user, index) => {

        // First initial message
        if (this.Window[0].accepted == 2) {
          this.Window[0].accepted = user.accepted;
        }

        if (user.senderId != this.account.uid) {
          var currentUser = false;
          this.Window[0]['messages'][index] = { 'currentUser': currentUser, 'senderId': user.senderId, 'recieverId': user.recieverId, 'text': user.text, 'type': user.type, 'memberType': user.memberType, 'accepted': user.accepted };
        }
        else {
          var currentUser = true;
          this.Window[0]['messages'][index] = { 'currentUser': currentUser, 'senderId': user.senderId, 'recieverId': user.recieverId, 'text': user.text, 'type': user.type, 'memberType': user.memberType, 'accepted': user.accepted };
        }
      });

      this.Window[0].salesPlanId = response.salesPlanId;
      this.Window[0].loaded = true;

    });
  }

  public close(index) {

    //this.messagesLoaded = false;

    this.Window[0].open = false;
    this.Window[0].loaded = false;
    this.Window[0].messages = null;
    //this.Contacts[index]['messages'] = null;
    this.SocketEcho.CloseConnection('COM.' + this.Window[0].chatId);

    
  }

  



}
